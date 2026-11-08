import React from 'react';

export default function PedidosPendientes({ pedidos, onCobrarPedido, onCancelarPedido, onEditarPedido }) {
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm transition-colors min-h-[400px]">
            <h2 className="text-xl font-bold mb-6 border-b pb-2 dark:border-gray-700 dark:text-white">
                Pedidos por Entregar ({pedidos.length})
            </h2>

            {pedidos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <span className="text-6xl mb-4">🛵</span>
                    <p>No hay pedidos pendientes por entregar.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pedidos.map((pedido) => (
                        <div key={pedido.id} className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/50 rounded-xl p-4 flex flex-col shadow-sm">
                            <div className="flex justify-between items-start mb-3 border-b border-yellow-200 dark:border-yellow-700/50 pb-2">
                                <div>
                                    <h3 className="font-bold text-yellow-900 dark:text-yellow-400 text-lg">
                                        👤 {pedido.cliente || 'Cliente Anónimo'}
                                    </h3>
                                    <p className="text-xs text-yellow-700 dark:text-yellow-600">{pedido.hora}</p>
                                </div>
                                <span className="bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 text-xs font-black px-2 py-1 rounded-md">
                                    Pendiente
                                </span>
                            </div>

                            <div className="flex-1 mb-4">
                                <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                                    {pedido.items.map((item, idx) => (
                                        <li key={idx} className="flex justify-between">
                                            <span>{item.cantidad}x {item.nombre}</span>
                                            <span className="font-mono">${(item.precio * item.cantidad).toFixed(2)}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="mt-auto pt-3 border-t border-yellow-200 dark:border-yellow-700/50">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="font-bold text-gray-600 dark:text-gray-400">Total a cobrar:</span>
                                    <span className="text-xl font-black text-green-600 dark:text-green-400">${pedido.total.toFixed(2)}</span>
                                </div>
                                
                                {/* 🔴 TRES BOTONES AHORA: Cancelar, Editar, Cobrar */}
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => onCancelarPedido(pedido.id)}
                                        className="flex-1 bg-red-100 hover:bg-red-200 text-red-600 font-bold py-2 rounded-lg transition-colors cursor-pointer text-xs"
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        onClick={() => onEditarPedido(pedido)}
                                        className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-600 font-bold py-2 rounded-lg transition-colors cursor-pointer text-xs"
                                    >
                                        Editar
                                    </button>
                                    <button 
                                        onClick={() => onCobrarPedido(pedido)}
                                        className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded-lg shadow-md transition-colors cursor-pointer text-xs"
                                    >
                                        Cobrar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}