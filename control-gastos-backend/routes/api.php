<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MovimientoController;
use App\Http\Controllers\AuthController;

// Rutas Públicas (Cualquiera puede entrar)
Route::post('/login', [AuthController::class, 'login']);

// Rutas Privadas (Requieren token de Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    // Al meter el apiResource aquí, automáticamente todo el CRUD queda protegido
    Route::apiResource('movimientos', MovimientoController::class);
    
    // Ruta para cerrar sesión
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Ruta para obtener los datos del usuario logueado
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
});