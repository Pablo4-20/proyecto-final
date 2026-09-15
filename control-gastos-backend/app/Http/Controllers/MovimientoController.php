<?php

namespace App\Http\Controllers;

use App\Models\Movimiento;
use Illuminate\Http\Request;

class MovimientoController extends Controller
{
    // 1. Obtener todos los movimientos
    public function index()
    {
        // Más adelante, filtraremos esto por el usuario autenticado
        return response()->json(Movimiento::all());
    }

    // 2. Crear un nuevo registro
    public function store(Request $request)
    {
        $request->validate([
            'tipo' => 'required|in:ingreso,gasto',
            'monto' => 'required|numeric|min:0.01',
            'categoria' => 'required|string|max:255',
            'fecha' => 'required|date',
        ]);

        // Por ahora "quemamos" el user_id en 1 hasta que implementemos el login real
        $data = $request->all();
        $data['user_id'] = 1; 

        $movimiento = Movimiento::create($data);

        return response()->json($movimiento, 201);
    }

    // 3. Actualizar un registro
    public function update(Request $request, Movimiento $movimiento)
    {
        $movimiento->update($request->all());
        return response()->json($movimiento, 200);
    }

    // 4. Eliminar un registro
    public function destroy(Movimiento $movimiento)
    {
        $movimiento->delete();
        return response()->json(null, 204);
    }
}