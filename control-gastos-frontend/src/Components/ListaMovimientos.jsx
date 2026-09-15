import ItemMovimiento from './ItemMovimiento';

function ListaMovimientos({ movimientos, onEliminar }) {
  if (!movimientos || movimientos.length === 0) {
    return <p>Aún no hay registros. ¡Añade tu primer movimiento!</p>;
  }

  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {movimientos.map((mov) => (
        <ItemMovimiento key={mov.id} mov={mov} onEliminar={onEliminar} />
      ))}
    </ul>
  );
}

export default ListaMovimientos;