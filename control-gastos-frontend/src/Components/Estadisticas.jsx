import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function Estadisticas({ movimientos }) {
    // Agrupar gastos por categoría
    const gastosPorCategoria = movimientos
        .filter(m => m.tipo === 'gasto')
        .reduce((acc, mov) => {
            acc[mov.categoria] = (acc[mov.categoria] || 0) + parseFloat(mov.monto);
            return acc;
        }, {});

    // Convertir a un formato que Recharts entienda y ordenar de mayor a menor
    const data = Object.keys(gastosPorCategoria)
        .map(key => ({
            name: key,
            total: gastosPorCategoria[key]
        }))
        .sort((a, b) => b.total - a.total);

    const COLORES = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7'];

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm transition-colors h-96">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Gastos Históricos por Categoría</h2>
            {data.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 25 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis 
                            dataKey="name" 
                            stroke="#8884d8" 
                            angle={-45} 
                            textAnchor="end" 
                            height={60} 
                        />
                        <YAxis stroke="#8884d8" />
                        <Tooltip 
                            formatter={(value) => `$${Number(value).toFixed(2)}`} 
                            cursor={{ fill: 'transparent' }} 
                        />
                        <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORES[index % COLORES.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                    No hay gastos para mostrar.
                </div>
            )}
        </div>
    );
}