import MovimientoUIFactory from '../utils/MovimientoFactory';

function ItemMovimiento({ mov, onEliminar }) {
  // Aplicación del Patrón Factory: Delegamos la lógica visual a la fábrica
  const ui = MovimientoUIFactory.crearUI(mov.tipo);

  return (
    <li style={{ 
      padding: '15px', 
      borderBottom: '1px solid #ddd', 
      margin: '10px 0', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      backgroundColor: ui.colorFondo,
      borderRadius: '8px',
      borderLeft: `6px solid ${ui.colorPrincipal}`,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div>
        <strong style={{ fontSize: '1.1em', color: '#333' }}>
          {ui.icono} {mov.categoria}
        </strong>
        <br/>
        <span style={{ color: ui.colorPrincipal, fontWeight: 'bold', fontSize: '1.2em', display: 'inline-block', marginTop: '5px' }}>
          {ui.signo}${mov.monto} 
          <small style={{ marginLeft: '8px', fontSize: '0.7em', color: '#666' }}>
            ({mov.tipo.toUpperCase()})
          </small>
        </span>
        <br/>
        <small style={{ color: '#777', display: 'inline-block', marginTop: '5px' }}>
          📅 {mov.fecha} {mov.descripcion ? `- 📝 ${mov.descripcion}` : ''}
        </small>
      </div>
      
      <button 
        onClick={() => onEliminar(mov.id)} 
        style={{ 
          backgroundColor: '#ff5252', 
          color: 'white', 
          border: 'none', 
          padding: '8px 12px', 
          cursor: 'pointer', 
          borderRadius: '4px',
          fontWeight: 'bold',
          transition: 'background-color 0.3s'
        }}
        title="Eliminar registro"
      >
        X
      </button>
    </li>
  );
}

export default ItemMovimiento;