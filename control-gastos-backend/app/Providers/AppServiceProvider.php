<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\Movimiento;
use App\Observers\MovimientoObserver;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // Aquí conectamos el Patrón Observer con nuestro modelo
        Movimiento::observe(MovimientoObserver::class);
    }
}