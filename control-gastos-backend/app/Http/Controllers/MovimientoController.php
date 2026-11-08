<?php

namespace App\Http\Controllers;

use App\Models\Movimiento;
use Illuminate\Http\Request;

class MovimientoController extends Controller
{
    // 1. Obtener todos los movimientos
    public function index(Request $request)
    {
        // Reemplazamos Movimiento::all() para filtrar solo por el usuario autenticado
        $movimientos = $request->user()->movimientos()->orderBy('fecha', 'desc')->get();
        
        return response()->json($movimientos);
    }

    // 2. Crear un nuevo registro
    public function store(Request $request)
    {
        $validated = $request->validate([
            'tipo' => 'required|in:ingreso,gasto',
            'monto' => 'required|numeric|min:0.01',
            'categoria' => 'required|string|max:255',
            'fecha' => 'required|date',
            // 'descripcion' => 'nullable|string' // Descomenta si usas este campo en BD
        ]);

        // Ya no "quemamos" el user_id, lo asignamos dinámicamente mediante la relación
        $movimiento = $request->user()->movimientos()->create($validated);

        return response()->json($movimiento, 201);
    }

    // 3. Actualizar un registro
    public function update(Request $request, $id)
    {
        // Buscamos explícitamente dentro de los registros del usuario actual
        $movimiento = $request->user()->movimientos()->findOrFail($id);
        
        $movimiento->update($request->all());
        
        return response()->json($movimiento, 200);
    }

    // 4. Eliminar un registro
    public function destroy(Request $request, $id)
    {
        // Si el ID pertenece a otro usuario, Laravel no lo encontrará aquí y devolverá 404
        $movimiento = $request->user()->movimientos()->findOrFail($id);
        
        $movimiento->delete();
        
        return response()->json(null, 204);
    }

    // 5. Obtener el cierre de caja diario
    public function cierreDiario(Request $request)
    {
        // Obtener la fecha de la consulta o usar la fecha de hoy
        $fecha = $request->query('fecha', now()->toDateString());

        // Obtener los movimientos del usuario autenticado para esa fecha
        $movimientos = $request->user()->movimientos()
            ->whereDate('fecha', $fecha)
            ->get();

        $ingresos = $movimientos->where('tipo', 'ingreso')->sum('monto');
        $gastos = $movimientos->where('tipo', 'gasto')->sum('monto');

        return response()->json([
            'fecha' => $fecha,
            'total_ingresos' => $ingresos,
            'total_gastos' => $gastos,
            'balance_diario' => $ingresos - $gastos,
            'total_movimientos' => $movimientos->count(),
        ]);
    }
}