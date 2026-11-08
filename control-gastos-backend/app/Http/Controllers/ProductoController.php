<?php

namespace App\Http\Controllers;

use App\Models\Producto;
use Illuminate\Http\Request;

class ProductoController extends Controller
{
    // 1. Obtener todos los productos del usuario autenticado
    public function index(Request $request)
    {
        $productos = $request->user()->productos()->orderBy('nombre', 'asc')->get();
        return response()->json($productos);
    }

    // 2. Crear un nuevo producto
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'precio' => 'required|numeric|min:0',
            'icono' => 'nullable|string|max:50',
        ]);

        $producto = $request->user()->productos()->create($validated);

        return response()->json($producto, 201);
    }

    // 3. Actualizar un producto existente
    public function update(Request $request, $id)
    {
        $producto = $request->user()->productos()->findOrFail($id);
        
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'precio' => 'required|numeric|min:0',
            'icono' => 'nullable|string|max:50',
        ]);

        $producto->update($validated);
        
        return response()->json($producto, 200);
    }

    // 4. Eliminar un producto
    public function destroy(Request $request, $id)
    {
        $producto = $request->user()->productos()->findOrFail($id);
        $producto->delete();
        
        return response()->json(null, 204);
    }
}