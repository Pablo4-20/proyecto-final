<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Movimiento;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. CREAMOS al usuario y lo GUARDAMOS en la variable $user
        $user = User::factory()->create([
            'name' => 'Test User',
            'email' => 'admin@test.com',
            'password' => bcrypt('password'),
        ]);

        // 2. Ahora sí, usamos el id de ese $user para los 20 movimientos
        Movimiento::factory(20)->create([
            'user_id' => $user->id
        ]);
    }
}