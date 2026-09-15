import { useState, useEffect } from 'react';
import api from '../services/api';

function Dashboard() {
  const [movimientos, setMovimientos] = useState([]);
  
  const [formulario, setFormulario] = useState({
    tipo: 'gasto',
    monto: '',
    categoria: '',
    fecha: '',
    descripcion: ''
  });

  const cargarMovimientos = async () => {
    try {
      // Usamos nuestra instancia 'api' con la ruta relativa
      const respuesta = await api.get('/movimientos');
      setMovimientos(respuesta.data);
    } catch (error) {
      console.error("Error de conexión:", error);
    }
  };

  useEffect(() => {
    cargarMovimientos();
  }, []);

  const handleChange = (e) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Petición POST mucho más limpia
      await api.post('/movimientos', formulario);
      cargarMovimientos();
      setFormulario({ tipo: 'gasto', monto: '', categoria: '', fecha: '', descripcion: '' });
    } catch (error) {
      const mensajeError = error.response?.data?.message || error.message;
      alert(`Falló el guardado: ${mensajeError}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este movimiento?")) {
      try {
        // Petición DELETE simplificada
        await api.delete(`/movimientos/${id}`);
        cargarMovimientos();
      } catch (error) {
        console.error("Error al eliminar:", error);
      }
    }
  };

  return (
    <div className="contenedor">
      <h1>Control de Gastos Familiar 💰</h1>
      
      <div className="formulario-card">
        <h2>Registrar Nuevo</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px', margin: '0 auto' }}>
          <select name="tipo" value={formulario.tipo} onChange={handleChange}>
            <option value="gasto">Gasto</option>
            <option value="ingreso">Ingreso</option>
          </select>
          <input type="number" name="monto" placeholder="Monto (Ej. 50.00)" step="0.01" value={formulario.monto} onChange={handleChange} required />
          <input type="text" name="categoria" placeholder="Categoría (Ej. Supermercado)" value={formulario.categoria} onChange={handleChange} required />
          <input type="date" name="fecha" value={formulario.fecha} onChange={handleChange} required />
          <input type="text" name="descripcion" placeholder="Descripción (Opcional)" value={formulario.descripcion} onChange={handleChange} />
          <button type="submit" style={{ padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', cursor: 'pointer' }}>Guardar</button>
        </form>
      </div>

      <hr style={{ margin: '30px 0' }}/>

      <div className="lista-movimientos">
        <h2>Historial de Movimientos</h2>
        {movimientos.length === 0 ? (
          <p>Aún no hay registros. ¡Añade tu primer movimiento!</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {movimientos.map((mov) => (
              <li key={mov.id} style={{ padding: '10px', borderBottom: '1px solid #ccc', margin: '5px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{mov.categoria}</strong>: ${mov.monto} 
                  <span style={{ color: mov.tipo === 'ingreso' ? 'green' : 'red', marginLeft: '10px' }}>
                    ({mov.tipo.toUpperCase()})
                  </span>
                  <br/>
                  <small>{mov.fecha} - {mov.descripcion}</small>
                </div>
                
                <button 
                  onClick={() => handleDelete(mov.id)} 
                  style={{ backgroundColor: '#f44336', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px' }}
                >
                  X
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Dashboard;