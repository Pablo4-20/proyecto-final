import { useState, useEffect } from 'react';
import { getCierreDiario } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function CierreCaja({ fechaOperativa, onCerrarCaja }) {
    const [cierre, setCierre] = useState(null);
    
    // Al cargar el componente o cambiar la fecha operativa, ponemos por defecto la jornada actual
    const [fechaBusqueda, setFechaBusqueda] = useState(fechaOperativa);
    const [cargando, setCargando] = useState(false);

    useEffect(() => {
        setFechaBusqueda(fechaOperativa);
    }, [fechaOperativa]);

    const handleConsultar = async () => {
        setCargando(true);
        try {
            const data = await getCierreDiario(fechaBusqueda);
            setCierre(data);
        } catch (error) {
            console.error("Error al cargar el cierre", error);
            alert("Hubo un error al calcular el cierre.");
        } finally {
            setCargando(false);
        }
    };

    const datosGrafica = cierre ? [
        { name: 'Ingresos', monto: Number(cierre.total_ingresos), color: '#22c55e' },
        { name: 'Gastos', monto: Number(cierre.total_gastos), color: '#ef4444' },
        { name: 'Saldo', monto: Number(cierre.balance_diario), color: '#3b82f6' }
    ] : [];

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm mb-8">
            {/* Encabezado y Selector */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4 pb-4 border-b dark:border-gray-700">
                <h2 className="text-xl font-bold dark:text-white">Cálculo de Cierre</h2>
                
                <div className="flex gap-2 w-full md:w-auto">
                    <input
                        type="date"
                        value={fechaBusqueda}
                        onChange={(e) => setFechaBusqueda(e.target.value)}
                        className="border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-gray-50 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button 
                        onClick={handleConsultar}
                        disabled={cargando}
                        className="bg-gray-800 dark:bg-gray-700 hover:bg-black dark:hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg cursor-pointer disabled:opacity-50"
                    >
                        {cargando ? 'Buscando...' : 'Buscar Día'}
                    </button>
                </div>
            </div>
            
            {/* Botón de Acción Principal para Cerrar Caja */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <div>
                    <p className="font-bold text-blue-800 dark:text-blue-300">Cierre Manual de Jornada</p>
                    <p className="text-sm text-blue-600 dark:text-blue-400">Jornada actual: {fechaOperativa}. Presiona para terminar hoy e iniciar mañana.</p>
                </div>
                <button 
                    onClick={onCerrarCaja}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-md cursor-pointer whitespace-nowrap"
                >
                    🔒 Cerrar Caja de Hoy
                </button>
            </div>

            {/* Resultados y Gráfica */}
            {cierre ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 border-t dark:border-gray-700 pt-6">
                    <div className="flex flex-col gap-4 justify-center">
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800/30">
                            <p className="text-green-800 dark:text-green-400 font-bold uppercase text-xs mb-1">Total Ingresos</p>
                            <p className="text-3xl text-green-600 dark:text-green-500 font-black">+${Number(cierre.total_ingresos).toFixed(2)}</p>
                        </div>
                        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800/30">
                            <p className="text-red-800 dark:text-red-400 font-bold uppercase text-xs mb-1">Total Gastos</p>
                            <p className="text-3xl text-red-600 dark:text-red-500 font-black">-${Number(cierre.total_gastos).toFixed(2)}</p>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800/30">
                            <p className="text-blue-800 dark:text-blue-400 font-bold uppercase text-xs mb-1">Balance Neto del Día</p>
                            <p className="text-3xl text-blue-600 dark:text-blue-500 font-black">${Number(cierre.balance_diario).toFixed(2)}</p>
                        </div>
                    </div>

                    <div className="h-64 lg:h-full w-full bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={datosGrafica} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                <XAxis dataKey="name" stroke="#8884d8" />
                                <YAxis stroke="#8884d8" />
                                <Tooltip formatter={(value) => `$${value}`} cursor={{fill: 'transparent'}} />
                                <Bar dataKey="monto" radius={[4, 4, 0, 0]}>
                                    {datosGrafica.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400 border-t dark:border-gray-700 mt-4">
                    Haz clic en "Buscar Día" para ver los resultados matemáticos y la gráfica.
                </div>
            )}
        </div>
    );
}