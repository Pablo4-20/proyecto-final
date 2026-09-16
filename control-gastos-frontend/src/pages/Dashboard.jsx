import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import FormularioMovimiento from '../Components/FormularioMovimiento';
import ListaMovimientos from '../Components/ListaMovimientos';

function Dashboard() {
  const navigate = useNavigate();
  const [movimientos, setMovimientos] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [usuario, setUsuario] = useState({ name: 'Usuario' });
  
  // Estado para controlar el Modal de Eliminación personalizado
  const [modalEliminar, setModalEliminar] = useState({ abierto: false, id: null });
  
  // NUEVO ESTADO: Controla el modal de edición y guarda los datos que se están editando
  const [movimientoAEditar, setMovimientoAEditar] = useState(null);

  const handleCerrarSesion = async () => {
    try {
      await api.post('/logout'); 
    } catch (error) {
      console.error("Error al salir:", error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  const cargarMovimientos = async () => {
    try {
      const respuesta = await api.get('/movimientos');
      setMovimientos(respuesta.data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    // 1. Recuperamos el usuario guardado en localStorage
    const usuarioGuardado = localStorage.getItem('user');
    if (usuarioGuardado) {
      setUsuario(JSON.parse(usuarioGuardado));
    }
    
    // 2. Cargamos los movimientos
    cargarMovimientos();
  }, []);

  const handleAgregarMovimiento = async (nuevoMovimiento) => {
    try {
      await api.post('/movimientos', nuevoMovimiento);
      cargarMovimientos();
    } catch (error) {
      alert(`Falló el guardado: ${error.message}`);
    }
  };

  // --- LÓGICA DE ELIMINACIÓN ---
  const solicitarEliminar = (id) => {
    setModalEliminar({ abierto: true, id });
  };

  const confirmarEliminar = async () => {
    try {
      await api.delete(`/movimientos/${modalEliminar.id}`);
      cargarMovimientos();
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setModalEliminar({ abierto: false, id: null });
    }
  };

  // --- LÓGICA DE EDICIÓN ---
  const solicitarEditar = (mov) => {
    setMovimientoAEditar({ ...mov }); // Copiamos los datos del movimiento al estado del modal
  };

  const handleEditChange = (e) => {
    setMovimientoAEditar({ ...movimientoAEditar, [e.target.name]: e.target.value });
  };

  const confirmarEditar = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/movimientos/${movimientoAEditar.id}`, movimientoAEditar);
      cargarMovimientos(); // Refrescamos la tabla
      setMovimientoAEditar(null); // Cerramos el modal
    } catch (error) {
      console.error("Error al editar:", error);
      alert("Ocurrió un error al guardar los cambios.");
    }
  };

  // --- CÁLCULOS AUTOMÁTICOS PARA LAS TARJETAS ---
  const totalIngresos = movimientos
    .filter(m => m.tipo === 'ingreso')
    .reduce((acc, m) => acc + parseFloat(m.monto), 0);

  const totalGastos = movimientos
    .filter(m => m.tipo === 'gasto')
    .reduce((acc, m) => acc + parseFloat(m.monto), 0);

  const saldoDisponible = totalIngresos - totalGastos;

  // Clase CSS reutilizable para los inputs del modal de edición
  const inputClass = "w-full p-3 mb-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition-colors";

  return (
    <div className={`${darkMode ? 'dark' : ''} min-h-screen transition-colors duration-300 relative`}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Encabezado con el nombre de usuario */}
          <header className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-gray-800 p-4 md:p-6 rounded-2xl shadow-sm mb-6 transition-colors">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Control de Gastos 💰</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Bienvenido, <span className="font-semibold text-blue-600 dark:text-blue-400">{usuario.name}</span>
              </p>
            </div>

            <div className="flex gap-4 items-center mt-4 md:mt-0">
              <button 
                onClick={() => setDarkMode(!darkMode)} 
                className="text-2xl p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                title="Alternar tema"
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
              <button 
                onClick={handleCerrarSesion}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-md cursor-pointer"
              >
                Salir
              </button>
            </div>
          </header>

          {/* Tarjetas de Resumen Visuales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border-l-4 border-green-500 transition-colors flex flex-col justify-center">
              <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Total Ingresos</h3>
              <p className="text-3xl font-black text-green-600 dark:text-green-400">
                +${totalIngresos.toFixed(2)}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border-l-4 border-red-500 transition-colors flex flex-col justify-center">
              <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Total Gastos</h3>
              <p className="text-3xl font-black text-red-600 dark:text-red-400">
                -${totalGastos.toFixed(2)}
              </p>
            </div>

            <div className={`bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border-l-4 transition-colors flex flex-col justify-center ${saldoDisponible >= 0 ? 'border-blue-500' : 'border-orange-500'}`}>
              <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Saldo Disponible</h3>
              <p className={`text-3xl font-black ${saldoDisponible >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>
                ${saldoDisponible.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Contenido a dos columnas */}
          <main className="grid md:grid-cols-3 gap-8">
            <section className="md:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm h-fit transition-colors">
              <h2 className="text-xl font-bold mb-6 border-b pb-2 dark:border-gray-700">Registrar Nuevo</h2>
              <FormularioMovimiento onAgregar={handleAgregarMovimiento} />
            </section>

            <section className="md:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm transition-colors">
              <h2 className="text-xl font-bold mb-6 border-b pb-2 dark:border-gray-700">Historial</h2>
              {/* Le pasamos solicitarEliminar Y solicitarEditar */}
              <ListaMovimientos 
                movimientos={movimientos} 
                onEliminar={solicitarEliminar} 
                onEditar={solicitarEditar} 
              />
            </section>
          </main>

        </div>
      </div>

      {/* --- MODAL DE ELIMINACIÓN PERSONALIZADO --- */}
      {modalEliminar.abierto && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl max-w-sm w-full border border-gray-200 dark:border-gray-700 text-center animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-500 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
              ⚠️
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">¿Eliminar registro?</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              Esta acción no se puede deshacer y actualizará tus saldos automáticamente.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setModalEliminar({ abierto: false, id: null })}
                className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-2.5 rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarEliminar}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-lg transition-colors shadow-md cursor-pointer"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL DE EDICIÓN PERSONALIZADO --- */}
      {movimientoAEditar && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 border-b pb-2 dark:border-gray-700">
              Editar Registro
            </h3>
            
            <form onSubmit={confirmarEditar} className="flex flex-col">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => setMovimientoAEditar({ ...movimientoAEditar, tipo: 'gasto' })}
                  className={`py-2 rounded-lg font-bold text-sm transition-all cursor-pointer ${
                    movimientoAEditar.tipo === 'gasto' 
                      ? 'bg-red-500 text-white shadow-red-500/30' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  📉 Gasto
                </button>
                <button
                  type="button"
                  onClick={() => setMovimientoAEditar({ ...movimientoAEditar, tipo: 'ingreso' })}
                  className={`py-2 rounded-lg font-bold text-sm transition-all cursor-pointer ${
                    movimientoAEditar.tipo === 'ingreso' 
                      ? 'bg-green-500 text-white shadow-green-500/30' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  📈 Ingreso
                </button>
              </div>

              <input 
                type="number" 
                name="monto" 
                value={movimientoAEditar.monto} 
                onChange={handleEditChange} 
                placeholder="Monto" 
                className={inputClass} 
                required 
                step="0.01" 
              />
              <input 
                type="text" 
                name="categoria" 
                value={movimientoAEditar.categoria} 
                onChange={handleEditChange} 
                placeholder="Categoría" 
                className={inputClass} 
                required 
              />
              <input 
                type="date" 
                name="fecha" 
                value={movimientoAEditar.fecha} 
                onChange={handleEditChange} 
                className={inputClass} 
                required 
              />
              <textarea 
                name="descripcion" 
                value={movimientoAEditar.descripcion || ''} 
                onChange={handleEditChange} 
                placeholder="Descripción (Opcional)" 
                className={`${inputClass} resize-none h-24`} 
              />

              <div className="flex gap-3 mt-2">
                <button 
                  type="button" 
                  onClick={() => setMovimientoAEditar(null)} 
                  className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-2.5 rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition-colors shadow-md cursor-pointer"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Dashboard;