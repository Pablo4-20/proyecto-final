import ItemMovimiento from './ItemMovimiento';

function ListaMovimientos({ movimientos, onEliminar, onEditar }) {
  if (movimientos.length === 0) {
    return <p className="text-center text-gray-500 dark:text-gray-400 py-8">No hay movimientos registrados.</p>;
  }

  return (
    <ul>
      {movimientos.map((mov) => (
        <ItemMovimiento 
          key={mov.id} 
          mov={mov} 
          onEliminar={onEliminar} 
          onEditar={onEditar} // <-- Pasamos la función
        />
      ))}
    </ul>
  );
}

export default ListaMovimientos;