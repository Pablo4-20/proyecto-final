<?php

namespace App\Observers;

use App\Models\Movimiento;
use Illuminate\Support\Facades\Log;

class MovimientoObserver
{
    public function created(Movimiento $movimiento): void
    {
        // Esto se ejecuta automáticamente DESPUÉS de guardar en la base de datos
        Log::info("¡Nuevo registro detectado! Se agregó un {$movimiento->tipo} por el valor de \${$movimiento->monto} en la categoría {$movimiento->categoria}.");
    }

    public function deleted(Movimiento $movimiento): void
    {
        // Esto se ejecuta automáticamente DESPUÉS de eliminar de la base de datos
        Log::warning("Registro eliminado: Se borró el movimiento con ID {$movimiento->id}.");
    }
}