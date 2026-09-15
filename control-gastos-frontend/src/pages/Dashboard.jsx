import { useState, useEffect } from 'react';
import api from '../services/api';
import FormularioMovimiento from '../components/FormularioMovimiento';
import ListaMovimientos from '../components/ListaMovimientos';

function Dashboard() {
  const [movimientos, setMovimientos] = useState([]);

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
      <h1>Control de Gastos Familiar 💰</h1>
      
      <FormularioMovimiento onAgregar={handleAgregarMovimiento} />

      <hr style={{ margin: '30px 0' }}/>

      <div className="lista-movimientos">
        <h2>Historial de Movimientos</h2>
        <ListaMovimientos 
          movimientos={movimientos} 
          onEliminar={handleEliminarMovimiento} 
        />
      </div>
    </div>
  );
}

export default Dashboard;