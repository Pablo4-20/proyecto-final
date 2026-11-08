<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MovimientoController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductoController;

// ==========================================
// Rutas Públicas (Cualquiera puede entrar)
// ==========================================
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// ==========================================
// Rutas Privadas (Requieren token de Sanctum)
// ==========================================
Route::middleware('auth:sanctum')->group(function () {
    
    // 🟢 1. PRIMERO LA RUTA ESPECÍFICA DE CIERRE
    Route::get('/movimientos/cierre', [MovimientoController::class, 'cierreDiario']);
    
    // 🔴 2. LUEGO EL CRUD GENERAL DE MOVIMIENTOS
    Route::apiResource('movimientos', MovimientoController::class);
    
    Route::apiResource('productos', ProductoController::class);
    
    // Ruta para cerrar sesión
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Ruta para obtener los datos del usuario logueado
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
});