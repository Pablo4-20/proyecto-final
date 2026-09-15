<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Movimiento;

class MovimientoApiTest extends TestCase
{
    // Este trait es magia pura: limpia la base de datos de pruebas cada vez que termina
    use RefreshDatabase; 

    public function test_usuario_no_autenticado_no_puede_ver_movimientos()
    {
        // Simulamos una petición GET a la API sin token
        $response = $this->getJson('/api/movimientos');

        // Esperamos un error 401 (No autorizado)
        $response->assertStatus(401); 
    }

    public function test_usuario_autenticado_puede_obtener_movimientos()
    {
        // 1. Fabricamos un usuario de prueba
        $user = User::factory()->create();

        // 2. Le fabricamos 3 movimientos a ese usuario
        Movimiento::factory(3)->create(['user_id' => $user->id]);

        // 3. Simulamos que el usuario inicia sesión y hace la petición GET
        $response = $this->actingAs($user)->getJson('/api/movimientos');

        // 4. Verificamos que devuelva status 200 (OK) y exactamente 3 registros
        $response->assertStatus(200);
        $response->assertJsonCount(3);
    }

    public function test_usuario_autenticado_puede_crear_un_movimiento()
    {
        // 1. Fabricamos un usuario
        $user = User::factory()->create();

        // 2. Preparamos los datos del formulario (como si vinieran de React)
        $datosFormulario = [
            'tipo' => 'gasto',
            'monto' => 150.50,
            'categoria' => 'Transporte',
            'fecha' => '2026-09-15',
            'descripcion' => 'Taxi al centro'
        ];

        // 3. Simulamos el envío por POST
        $response = $this->actingAs($user)->postJson('/api/movimientos', $datosFormulario);

        // 4. Verificamos que se haya creado (Status 201)
        $response->assertStatus(201);
        
        // 5. Verificamos que realmente exista en la base de datos
        $this->assertDatabaseHas('movimientos', [
            'monto' => 150.50,
            'categoria' => 'Transporte'
        ]);
    }
}