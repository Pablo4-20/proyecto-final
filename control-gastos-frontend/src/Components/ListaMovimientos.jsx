import React from 'react';

export default function ListaMovimientos({ movimientos, onEliminar, onEditar }) {
    
    if (!movimientos || movimientos.length === 0) {
        return null; 
    }

    return (
        <div className="space-y-4">
            {movimientos.map((mov) => (
                <div 
                    key={mov.id} 
                    className={`p-4 rounded-xl border-l-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm transition-colors ${
                        mov.tipo === 'ingreso' 
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/10' 
                            : 'border-red-500 bg-red-50 dark:bg-red-900/10'
                    }`}
                >
                    <div className="flex-1 w-full">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xl">
                                {mov.tipo === 'ingreso' ? '📈' : '📉'}
                            </span>
                            <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg leading-tight">
                                {mov.categoria}
                            </h3>
                        </div>
                        
                        {/* ESTA ES LA SECCIÓN QUE DEBE ESTAR AGREGADA PARA VER LA DESCRIPCIÓN */}
                        {mov.descripcion && (
                            <div className="bg-white/60 dark:bg-gray-800/60 inline-block px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 mt-1 mb-2">
                                <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                                    {mov.descripcion}
                                </p>
                            </div>
                        )}

                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <span className="flex items-center gap-1 font-mono">
                                📅 {mov.fecha}
                            </span>
                            <span className="uppercase font-bold tracking-wider opacity-70">
                                {mov.tipo}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 sm:gap-2">
                        <span className={`text-2xl font-black ${
                            mov.tipo === 'ingreso' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                            {mov.tipo === 'ingreso' ? '+' : '-'}${Number(mov.monto).toFixed(2)}
                        </span>
                        
                        <div className="flex gap-2">
                            <button 
                                onClick={() => onEditar(mov)}
                                className="bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/40 dark:text-blue-400 dark:hover:bg-blue-800 p-2 rounded-lg transition-colors cursor-pointer shadow-sm"
                                title="Editar"
                            >
                                ✏️
                            </button>
                            <button 
                                onClick={() => onEliminar(mov.id)}
                                className="bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-400 dark:hover:bg-red-800 p-2 rounded-lg transition-colors cursor-pointer shadow-sm"
                                title="Eliminar"
                            >
                                ❌
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}