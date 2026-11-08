<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Producto extends Model
{
    use HasFactory;

    protected $fillable = [
        'nombre',
        'precio',
        'icono'
    ];

    // Relación: Un producto pertenece a un usuario
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}