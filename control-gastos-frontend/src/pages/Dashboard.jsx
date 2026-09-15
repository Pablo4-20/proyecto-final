import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import FormularioMovimiento from '../components/FormularioMovimiento';
import ListaMovimientos from '../components/ListaMovimientos';

function Dashboard() {
  const navigate = useNavigate();
  const [movimientos, setMovimientos] = useState([]);

  const handleCerrarSesion = async () => {
    try {
      // Le avisamos al backend que destruya el token en la base de datos
      await api.post('/logout'); 
    } catch (error) {
      console.error("Error al cerrar sesión en el servidor:", error);
    } finally {
      // Pase lo que pase, borramos la llave local y lo expulsamos al login
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  const cargarMovimientos = async () => {
    try {
      const respuesta = await api.get('/movimientos');
      setMovimientos(respuesta.data);
    } catch (error) {
      console.error("Error de conexión:", error);
    }
  };

  useEffect(() => {
    cargarMovimientos();
  }, []);

  const handleAgregarMovimiento = async (nuevoMovimiento) => {
    try {
      await api.post('/movimientos', nuevoMovimiento);
      cargarMovimientos();
    } catch (error) {
      const mensajeError = error.response?.data?.message || error.message;
      alert(`Falló el guardado: ${mensajeError}`);
    }
  };

  const handleEliminarMovimiento = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este movimiento?")) {
      try {
        await api.delete(`/movimientos/${id}`);
        cargarMovimientos();
      } catch (error) {
        console.error("Error al eliminar:", error);
      }
    }
  };

  return (
    <div className="contenedor">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Control de Gastos Familiar 💰</h1>
        <button 
          onClick={handleCerrarSesion}
          style={{ backgroundColor: '#f44336', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Cerrar Sesión
        </button>
      </div>
      
      {/* Aquí volvemos a inyectar el formulario */}
      <FormularioMovimiento onAgregar={handleAgregarMovimiento} />

      <hr style={{ margin: '30px 0' }}/>

      <div className="lista-movimientos">
        <h2>Historial de Movimientos</h2>
        
        {/* Y aquí volvemos a inyectar la lista */}
        <ListaMovimientos 
          movimientos={movimientos} 
          onEliminar={handleEliminarMovimiento} 
        />
      </div>
    </div>
  );
}

export default Dashboard;