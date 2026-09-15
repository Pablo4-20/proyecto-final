import MovimientoUIFactory from '../utils/MovimientoFactory';

function ItemMovimiento({ mov, onEliminar }) {
  const ui = MovimientoUIFactory.crearUI(mov.tipo);

  return (
    <li className={`flex justify-between items-center p-4 mb-4 rounded-xl border-l-4 shadow-sm transition-colors ${ui.bgClass} ${ui.borderClass}`}>
      <div>
        <strong className="text-lg flex items-center gap-2 text-gray-800 dark:text-gray-100">
          {ui.icono} {mov.categoria}
        </strong>
        <div className={`font-black text-xl mt-1 ${ui.textClass}`}>
          {ui.signo}${mov.monto} 
          <span className="text-xs ml-2 text-gray-500 dark:text-gray-400 font-normal">
            ({mov.tipo.toUpperCase()})
          </span>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-2">
          <span>📅 {mov.fecha}</span>
          {mov.descripcion && <span>📝 {mov.descripcion}</span>}
        </div>
      </div>
      
      <button 
        onClick={() => onEliminar(mov.id)} 
        className="bg-red-500 hover:bg-red-600 text-white w-9 h-9 rounded-full flex items-center justify-center shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
        title="Eliminar registro"
      >
        ✕
      </button>
    </li>
  );
}

export default ItemMovimiento;