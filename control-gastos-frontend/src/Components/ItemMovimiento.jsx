import MovimientoUIFactory from '../utils/MovimientoFactory';

function ItemMovimiento({ mov, onEliminar, onEditar }) {
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
        <div className="text-sm text-gray-500 dark:text-gray-400 mt-2 flex flex-col gap-1">
          <span>📅 {mov.fecha}</span>
          {mov.descripcion && <span>📝 {mov.descripcion}</span>}
        </div>
      </div>
      
      {/* Contenedor de botones: Editar y Eliminar */}
      <div className="flex flex-col gap-2">
        <button 
          onClick={() => onEditar(mov)} 
          className="bg-blue-500 hover:bg-blue-600 text-white w-9 h-9 rounded-full flex items-center justify-center shadow-sm transition-colors focus:outline-none cursor-pointer"
          title="Editar registro"
        >
          ✏️
        </button>
        <button 
          onClick={() => onEliminar(mov.id)} 
          className="bg-red-500 hover:bg-red-600 text-white w-9 h-9 rounded-full flex items-center justify-center shadow-sm transition-colors focus:outline-none cursor-pointer"
          title="Eliminar registro"
        >
          ✕
        </button>
      </div>
    </li>
  );
}

export default ItemMovimiento;