<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\User;

class MovimientoFactory extends Factory
{
    public function definition(): array
    {
        // Elegimos aleatoriamente si será un ingreso o un gasto
        $tipo = $this->faker->randomElement(['ingreso', 'gasto']);
        
        // Categorías lógicas dependiendo del tipo
        $categoria = $tipo === 'ingreso' 
            ? $this->faker->randomElement(['Sueldo', 'Venta', 'Bono', 'Inversión'])
            : $this->faker->randomElement(['Comida', 'Transporte', 'Arriendo', 'Servicios', 'Ocio']);

        return [
            'user_id' => User::factory(),
            'tipo' => $tipo,
            'monto' => $this->faker->randomFloat(2, 5, 1000), // Montos entre $5.00 y $1000.00
            'categoria' => $categoria,
            'fecha' => $this->faker->date('Y-m-d'),
            'descripcion' => $this->faker->sentence(3) // Una descripción corta de 3 palabras
        ];
    }
}