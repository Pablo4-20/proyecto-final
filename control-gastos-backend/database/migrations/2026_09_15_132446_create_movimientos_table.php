<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('movimientos', function (Blueprint $table) {
            $table->id();
            // Relacionamos el movimiento con el usuario que lo creó
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            
            // Los campos que definimos para tu control de gastos
            $table->enum('tipo', ['ingreso', 'gasto']);
            $table->decimal('monto', 10, 2);
            $table->string('categoria');
            $table->date('fecha');
            $table->string('descripcion')->nullable(); // nullable significa que es opcional
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('movimientos');
    }
};
