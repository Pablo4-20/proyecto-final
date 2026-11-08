import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import FormularioMovimiento from '../Components/FormularioMovimiento';
import ListaMovimientos from '../Components/ListaMovimientos';
import CierreCaja from '../Components/CierreCaja';
import PuntoVenta from '../Components/PuntoVenta';
import PedidosPendientes from '../Components/PedidosPendientes';

const formatFecha = (dateObj) => {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};
const getHoyLocal = () => formatFecha(new Date());

function Dashboard() {
  const navigate = useNavigate();
  const [movimientos, setMovimientos] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [usuario, setUsuario] = useState({ name: 'Usuario' });
  const [vistaActiva, setVistaActiva] = useState('resumen'); 
  const [filtroTiempo, setFiltroTiempo] = useState('todo'); 

  const [modalEliminar, setModalEliminar] = useState({ abierto: false, id: null });
  const [movimientoAEditar, setMovimientoAEditar] = useState(null);

  // 🔴 NUEVO ESTADO: Para pasar un pedido de "Entregas" hacia el "POS"
  const [pedidoPOSAEditar, setPedidoPOSAEditar] = useState(null);

  const [fechaOperativa, setFechaOperativa] = useState(() => {
    const guardada = localStorage.getItem('fechaOperativa');
    return guardada || getHoyLocal();
  });

  const [fechaHistorial, setFechaHistorial] = useState(fechaOperativa);

  const [pedidosPendientes, setPedidosPendientes] = useState(() => {
    const guardados = localStorage.getItem('pedidos_pendientes');
    return guardados ? JSON.parse(guardados) : [];
  });

  useEffect(() => {
    localStorage.setItem('pedidos_pendientes', JSON.stringify(pedidosPendientes));
  }, [pedidosPendientes]);

  useEffect(() => {
      setFechaHistorial(fechaOperativa);
  }, [fechaOperativa]);

  const avanzarDiaOperativo = () => {
    if(pedidosPendientes.length > 0) {
        alert("⚠️ Tienes pedidos pendientes por entregar. Cóbralos o cancélalos antes de cerrar la caja.");
        setVistaActiva('entregas');
        return;
    }

    if(!window.confirm(`¿Estás seguro de cerrar la caja de hoy (${fechaOperativa})?\n\nLa caja empezará desde cero para la nueva jornada.`)) return;
    
    const [year, month, day] = fechaOperativa.split('-');
    const fechaObj = new Date(year, month - 1, day);
    fechaObj.setDate(fechaObj.getDate() + 1);
    
    const nuevoDia = formatFecha(fechaObj);
    
    setFechaOperativa(nuevoDia);
    localStorage.setItem('fechaOperativa', nuevoDia);
    alert(`Caja cerrada con éxito.\n\nIniciando nueva jornada en ceros para el día: ${nuevoDia}`);
  };

  const resetearFechaAHoy = () => {
    const hoy = getHoyLocal();
    setFechaOperativa(hoy);
    localStorage.setItem('fechaOperativa', hoy);
  };

  const handleCerrarSesion = async () => {
    try {
      await api.post('/logout'); 
    } catch (error) {} finally {
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
    const usuarioGuardado = localStorage.getItem('user');
    if (usuarioGuardado) setUsuario(JSON.parse(usuarioGuardado));
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

  // --- 🔴 FUNCIONES MODIFICADAS PARA PEDIDOS PENDIENTES ---
  const agregarPedidoPendiente = (nuevoPedido) => {
      setPedidosPendientes(prev => {
          // Revisamos si el pedido ya existe (por si estamos editando)
          const indice = prev.findIndex(p => p.id === nuevoPedido.id);
          if (indice >= 0) {
              const actualizados = [...prev];
              actualizados[indice] = nuevoPedido; // Lo reemplaza
              return actualizados;
          }
          // Si es nuevo, lo agrega al final
          return [...prev, nuevoPedido];
      });
      setVistaActiva('entregas');
  };

  // Se añadió 'sinConfirmar' para poder borrar silenciosamente si cobramos directo en el POS editando
  const cancelarPedido = (id, sinConfirmar = false) => {
      if(sinConfirmar || window.confirm("¿Estás seguro de cancelar este pedido? No se registrará ningún ingreso.")) {
          setPedidosPendientes(prev => prev.filter(p => p.id !== id));
      }
  };

  // 🔴 AQUÍ LLEGA EL DETALLE DEL PAGO PARA LOS PEDIDOS PENDIENTES
  const cobrarPedidoPendiente = async (pedido) => {
      const textoPago = pedido.metodoPago === 'efectivo' 
            ? 'Efectivo 💵' 
            : `Transferencia 📱 (${pedido.banco === 'pichincha' ? 'Pichincha' : 'Mego'})`;

      await handleAgregarMovimiento({
          tipo: 'ingreso',
          monto: pedido.total,
          categoria: pedido.textoCategoria,
          fecha: fechaOperativa,
          descripcion: `Cliente: ${pedido.cliente} | Pago: ${textoPago}`
      });
      setPedidosPendientes(pedidosPendientes.filter(p => p.id !== pedido.id));
  };

  // Se activa al hacer clic en "Editar" desde la lista de Entregas
  const iniciarEdicionPedidoPOS = (pedido) => {
      setPedidoPOSAEditar(pedido);
      setVistaActiva('pos'); // Te envía al Punto de Venta
  };

  // Se llama desde el POS una vez que ya cargó los datos, para no quedarse en bucle
  const limpiarEdicionPOS = () => {
      setPedidoPOSAEditar(null);
  };
  // -------------------------------------------------------------

  const solicitarEliminar = (id) => setModalEliminar({ abierto: true, id });
  const confirmarEliminar = async () => {
    try {
      await api.delete(`/movimientos/${modalEliminar.id}`);
      cargarMovimientos();
    } catch (error) {} finally {
      setModalEliminar({ abierto: false, id: null });
    }
  };

  const solicitarEditar = (mov) => setMovimientoAEditar({ ...mov });
  const handleEditChange = (e) => setMovimientoAEditar({ ...movimientoAEditar, [e.target.name]: e.target.value });
  const confirmarEditar = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/movimientos/${movimientoAEditar.id}`, movimientoAEditar);
      cargarMovimientos();
      setMovimientoAEditar(null);
    } catch (error) {
      alert("Ocurrió un error al guardar los cambios.");
    }
  };

  const movimientosDelDia = movimientos.filter(m => m.fecha === fechaOperativa);
  const ingresosDia = movimientosDelDia.filter(m => m.tipo === 'ingreso').reduce((acc, m) => acc + parseFloat(m.monto), 0);
  const gastosDia = movimientosDelDia.filter(m => m.tipo === 'gasto').reduce((acc, m) => acc + parseFloat(m.monto), 0);
  const saldoDia = ingresosDia - gastosDia;

  const getMovimientosGlobales = () => {
    if (filtroTiempo === 'todo') return movimientos;
    const hoy = new Date();
    return movimientos.filter(m => {
        const fechaMov = new Date(m.fecha + 'T00:00:00'); 
        if (filtroTiempo === 'semana') {
            const hace7Dias = new Date();
            hace7Dias.setDate(hoy.getDate() - 7);
            return fechaMov >= hace7Dias;
        }
        if (filtroTiempo === 'mes') {
            return fechaMov.getMonth() === hoy.getMonth() && fechaMov.getFullYear() === hoy.getFullYear();
        }
        if (filtroTiempo === 'anio') {
            return fechaMov.getFullYear() === hoy.getFullYear();
        }
        return true;
    });
  };

  const movimientosGlobales = getMovimientosGlobales();
  const ingresosGlobales = movimientosGlobales.filter(m => m.tipo === 'ingreso').reduce((acc, m) => acc + parseFloat(m.monto), 0);
  const gastosGlobales = movimientosGlobales.filter(m => m.tipo === 'gasto').reduce((acc, m) => acc + parseFloat(m.monto), 0);
  const saldoGlobal = ingresosGlobales - gastosGlobales;

  const movimientosParaHistorial = movimientos.filter(m => m.fecha === fechaHistorial);

  const inputClass = "w-full p-3 mb-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition-colors";

  const getTabClass = (tabName) => {
    const base = "flex-1 py-3 px-1 md:px-2 text-center font-bold rounded-xl transition-all cursor-pointer text-xs md:text-sm flex flex-col items-center justify-center gap-1 ";
    return vistaActiva === tabName ? base + "bg-blue-600 text-white shadow-md" : base + "bg-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700";
  };

  return (
    <div className={`${darkMode ? 'dark' : ''} min-h-screen transition-colors duration-300 relative`}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          
          <header className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-gray-800 p-4 md:p-6 rounded-2xl shadow-sm mb-4 transition-colors">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Control de Gastos 💰</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Bienvenido, <span className="font-semibold text-blue-600 dark:text-blue-400">{usuario.name}</span>
              </p>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-4 mt-4 md:mt-0">
              <div className="flex items-center gap-2">
                <div className="bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-lg font-bold text-sm">
                  📅 Jornada: {fechaOperativa}
                </div>
                {fechaOperativa !== getHoyLocal() && (
                  <button onClick={resetearFechaAHoy} className="text-xs bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 px-2 py-2 rounded-lg font-bold transition-colors cursor-pointer" title="Volver a la fecha real de hoy">
                    🔄 Corregir
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setDarkMode(!darkMode)} className="text-2xl p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer" title="Alternar tema">{darkMode ? '☀️' : '🌙'}</button>
                <button onClick={handleCerrarSesion} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-md cursor-pointer">Salir</button>
              </div>
            </div>
          </header>

          <nav className="grid grid-cols-2 md:grid-cols-5 gap-2 bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-sm mb-8 transition-colors">
            <button onClick={() => setVistaActiva('resumen')} className={getTabClass('resumen')}><span>📊</span> Resumen</button>
            <button onClick={() => setVistaActiva('cierre')} className={getTabClass('cierre')}><span>🔒</span> Cierre</button>
            <button onClick={() => setVistaActiva('pos')} className={getTabClass('pos')}><span>🛒</span> POS Rápidos</button>
            <button onClick={() => setVistaActiva('entregas')} className={getTabClass('entregas')}>
                <span>🛵</span> Entregas 
                {pedidosPendientes.length > 0 && (
                    <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full ml-1">{pedidosPendientes.length}</span>
                )}
            </button>
            <button onClick={() => setVistaActiva('historial')} className={getTabClass('historial')}><span>📋</span> Historial</button>
          </nav>

          {vistaActiva === 'resumen' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm mb-6 border-l-4 border-indigo-500">
                <div>
                  <h2 className="text-xl font-bold dark:text-white">Rendimiento Financiero</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Analiza tus ingresos y gastos a lo largo del tiempo.</p>
                </div>
                <div className="mt-4 md:mt-0">
                  <select value={filtroTiempo} onChange={(e) => setFiltroTiempo(e.target.value)} className="border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-gray-50 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer font-bold text-sm">
                    <option value="todo">Histórico Completo (Siempre)</option>
                    <option value="semana">Últimos 7 Días</option>
                    <option value="mes">Este Mes</option>
                    <option value="anio">Este Año</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm flex flex-col justify-center border border-gray-100 dark:border-gray-700">
                  <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Ingresos Acumulados</h3>
                  <p className="text-4xl font-black text-green-600 dark:text-green-400">+${ingresosGlobales.toFixed(2)}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm flex flex-col justify-center border border-gray-100 dark:border-gray-700">
                  <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Gastos Acumulados</h3>
                  <p className="text-4xl font-black text-red-600 dark:text-red-400">-${gastosGlobales.toFixed(2)}</p>
                </div>
                <div className={`bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm flex flex-col justify-center border border-gray-100 dark:border-gray-700`}>
                  <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Balance Acumulado</h3>
                  <p className={`text-4xl font-black ${saldoGlobal >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>${saldoGlobal.toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}

          {vistaActiva === 'cierre' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl font-bold mb-4 dark:text-white px-2">Ventas de la Jornada Actual ({fechaOperativa})</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border-l-4 border-green-500 flex flex-col justify-center">
                  <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Ingresos (Hoy)</h3>
                  <p className="text-3xl font-black text-green-600 dark:text-green-400">+${ingresosDia.toFixed(2)}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border-l-4 border-red-500 flex flex-col justify-center">
                  <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Gastos (Hoy)</h3>
                  <p className="text-3xl font-black text-red-600 dark:text-red-400">-${gastosDia.toFixed(2)}</p>
                </div>
                <div className={`bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border-l-4 flex flex-col justify-center ${saldoDia >= 0 ? 'border-blue-500' : 'border-orange-500'}`}>
                  <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Caja Final (Hoy)</h3>
                  <p className={`text-3xl font-black ${saldoDia >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>${saldoDia.toFixed(2)}</p>
                </div>
              </div>
              <CierreCaja fechaOperativa={fechaOperativa} onCerrarCaja={avanzarDiaOperativo} />
            </div>
          )}

          {/* 🔴 PUNTO DE VENTA (Actualizado para recibir las nuevas props) */}
          {vistaActiva === 'pos' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <PuntoVenta 
                onGuardarVenta={handleAgregarMovimiento} 
                onGuardarPedidoPendiente={agregarPedidoPendiente}
                onEliminarPendiente={cancelarPedido}
                pedidoAEditar={pedidoPOSAEditar}
                onLimpiarEdicion={limpiarEdicionPOS}
                fechaOperativa={fechaOperativa} 
              />
            </div>
          )}

          {/* 🔴 PESTAÑA: ENTREGAS PENDIENTES (Actualizada) */}
          {vistaActiva === 'entregas' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <PedidosPendientes 
                pedidos={pedidosPendientes}
                onCobrarPedido={cobrarPedidoPendiente}
                onCancelarPedido={cancelarPedido}
                onEditarPedido={iniciarEdicionPedidoPOS}
              />
            </div>
          )}

          {vistaActiva === 'historial' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <main className="grid md:grid-cols-3 gap-8">
                <section className="md:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm h-fit">
                  <h2 className="text-xl font-bold mb-6 border-b pb-2 dark:border-gray-700">Registrar Nuevo Manual</h2>
                  <FormularioMovimiento onAgregar={handleAgregarMovimiento} fechaOperativa={fechaOperativa} />
                </section>
                <section className="md:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm">
                  <div className="flex flex-col md:flex-row justify-between items-center mb-6 border-b pb-4 dark:border-gray-700 gap-4">
                    <h2 className="text-xl font-bold dark:text-white">Historial de Movimientos</h2>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-500">Ver día:</span>
                        <input type="date" value={fechaHistorial} onChange={(e) => setFechaHistorial(e.target.value)} className="border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-gray-50 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer text-sm" />
                    </div>
                  </div>
                  <ListaMovimientos movimientos={movimientosParaHistorial} onEliminar={solicitarEliminar} onEditar={solicitarEditar} />
                  {movimientosParaHistorial.length === 0 && (
                      <p className="text-center text-gray-500 mt-8">No hay registros para el día {fechaHistorial}.</p>
                  )}
                </section>
              </main>
            </div>
          )}
        </div>
      </div>

      {/* MODALES IGUALES... */}
      {modalEliminar.abierto && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl max-w-sm w-full border border-gray-200 dark:border-gray-700 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-500 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">⚠️</div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">¿Eliminar registro?</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button onClick={() => setModalEliminar({ abierto: false, id: null })} className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 font-bold py-2.5 rounded-lg cursor-pointer">Cancelar</button>
              <button onClick={confirmarEliminar} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-lg cursor-pointer">Sí, eliminar</button>
            </div>
          </div>
        </div>
      )}

      {movimientoAEditar && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-4 border-b pb-2">Editar Registro</h3>
            <form onSubmit={confirmarEditar} className="flex flex-col">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button type="button" onClick={() => setMovimientoAEditar({ ...movimientoAEditar, tipo: 'gasto' })} className={`py-2 rounded-lg font-bold text-sm cursor-pointer ${movimientoAEditar.tipo === 'gasto' ? 'bg-red-500 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>📉 Gasto</button>
                <button type="button" onClick={() => setMovimientoAEditar({ ...movimientoAEditar, tipo: 'ingreso' })} className={`py-2 rounded-lg font-bold text-sm cursor-pointer ${movimientoAEditar.tipo === 'ingreso' ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>📈 Ingreso</button>
              </div>
              <input type="number" name="monto" value={movimientoAEditar.monto} onChange={handleEditChange} placeholder="Monto" className={inputClass} required step="0.01" />
              <input type="text" name="categoria" value={movimientoAEditar.categoria} onChange={handleEditChange} placeholder="Categoría" className={inputClass} required />
              <input type="date" name="fecha" value={movimientoAEditar.fecha} onChange={handleEditChange} className={inputClass} required />
              <textarea name="descripcion" value={movimientoAEditar.descripcion || ''} onChange={handleEditChange} placeholder="Descripción (Opcional)" className={`${inputClass} resize-none h-24`} />
              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setMovimientoAEditar(null)} className="flex-1 bg-gray-200 dark:bg-gray-700 font-bold py-2.5 rounded-lg cursor-pointer">Cancelar</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white font-bold py-2.5 rounded-lg cursor-pointer">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;