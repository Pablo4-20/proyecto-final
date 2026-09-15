import { useState } from 'react';

function FormularioMovimiento({ onAgregar }) {
  const [formulario, setFormulario] = useState({ 
    tipo: 'gasto', // Por defecto inicia en gasto
    monto: '', 
    categoria: '', 
    fecha: '', 
    descripcion: '' 
  });

  const handleChange = (e) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  };

  const handleTipoChange = (nuevoTipo) => {
    setFormulario({ ...formulario, tipo: nuevoTipo });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAgregar(formulario);
    setFormulario({ tipo: 'gasto', monto: '', categoria: '', fecha: '', descripcion: '' });
  };

  const inputClass = "w-full p-3 mb-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition-colors";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      
      {/* Botones de Selección: Gasto / Ingreso */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          type="button"
          onClick={() => handleTipoChange('gasto')}
          className={`py-2.5 rounded-lg font-bold text-sm transition-all shadow-sm ${
            formulario.tipo === 'gasto'
              ? 'bg-red-500 text-white shadow-red-500/30'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          📉 Gasto
        </button>

        <button
          type="button"
          onClick={() => handleTipoChange('ingreso')}
          className={`py-2.5 rounded-lg font-bold text-sm transition-all shadow-sm ${
            formulario.tipo === 'ingreso'
              ? 'bg-green-500 text-white shadow-green-500/30'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          📈 Ingreso
        </button>
      </div>

      <input 
        type="number" 
        name="monto" 
        value={formulario.monto} 
        onChange={handleChange} 
        placeholder="Monto (Ej. 50.00)" 
        step="0.01" 
        className={inputClass} 
        required 
      />
      
      <input 
        type="text" 
        name="categoria" 
        value={formulario.categoria} 
        onChange={handleChange} 
        placeholder="Categoría (Ej. Comida)" 
        className={inputClass} 
        required 
      />
      
      <input 
        type="date" 
        name="fecha" 
        value={formulario.fecha} 
        onChange={handleChange} 
        className={inputClass} 
        required 
      />
      
      <textarea 
        name="descripcion" 
        value={formulario.descripcion} 
        onChange={handleChange} 
        placeholder="Descripción (Opcional)" 
        className={`${inputClass} resize-none h-24`} 
      />

      <button 
        type="submit" 
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-md transition-colors cursor-pointer"
      >
        Guardar Movimiento
      </button>
    </form>
  );
}

export default FormularioMovimiento;