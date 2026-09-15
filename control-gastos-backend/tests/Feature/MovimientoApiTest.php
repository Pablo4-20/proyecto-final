<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Movimiento;
use Laravel\Sanctum\Sanctum; // Importamos Sanctum para simular sesiones[cite: 3]

class MovimientoApiTest extends TestCase
{
    use RefreshDatabase; 

    public function test_usuario_no_autenticado_no_puede_ver_movimientos()
    {
        $response = $this->getJson('/api/movimientos');
        $response->assertStatus(401); 
    }

    public function test_usuario_autenticado_solo_ve_sus_propios_movimientos()
    {
        $user = User::factory()->create();
        Movimiento::factory(3)->create(['user_id' => $user->id]);

        // Autenticamos al usuario simuladamente[cite: 3]
        Sanctum::actingAs($user); 

        $response = $this->getJson('/api/movimientos');

        $response->assertStatus(200);
        $response->assertJsonCount(3);
    }

    public function test_usuario_autenticado_puede_crear_un_movimiento()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $datosFormulario = [
            'tipo' => 'gasto',
            'monto' => 150.50,
            'categoria' => 'Transporte',
            'fecha' => '2026-09-15',
            'descripcion' => 'Taxi'
        ];

        $response = $this->postJson('/api/movimientos', $datosFormulario);

        $response->assertStatus(201);
        $this->assertDatabaseHas('movimientos', [
            'monto' => 150.50,
            'user_id' => $user->id // Confirmamos que se guardó con su ID
        ]);
    }

    // Nuevo test de aislamiento: Un usuario no puede borrar/ver datos de otro[cite: 3]
    public function test_un_usuario_no_puede_borrar_el_movimiento_de_otro()
    {
        // Creamos dos usuarios distintos[cite: 3]
        $userA = User::factory()->create();
        $userB = User::factory()->create();

        // Le creamos un movimiento al Usuario B[cite: 3]
        $movimientoDeB = Movimiento::factory()->create(['user_id' => $userB->id]);

        // Iniciamos sesión como el Usuario A[cite: 3]
        Sanctum::actingAs($userA);

        // El Usuario A intenta eliminar el movimiento del Usuario B
        $response = $this->deleteJson("/api/movimientos/{$movimientoDeB->id}");

        // Verificamos que el sistema lo rechace con un 404 (No Encontrado)[cite: 3]
        $response->assertStatus(404);
    }
}