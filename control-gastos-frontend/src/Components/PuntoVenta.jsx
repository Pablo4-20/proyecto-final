import { useState, useEffect } from 'react';
import api from '../services/api';

export default function PuntoVenta({ onGuardarVenta, onGuardarPedidoPendiente, onEliminarPendiente, pedidoAEditar, onLimpiarEdicion, fechaOperativa }) {
    const [productos, setProductos] = useState([]);
    const [carrito, setCarrito] = useState([]);
    
    // 🔴 NUEVOS ESTADOS PARA CLIENTE Y PAGO
    const [nombreCliente, setNombreCliente] = useState(''); 
    const [metodoPago, setMetodoPago] = useState('efectivo'); // 'efectivo' | 'transferencia'
    const [banco, setBanco] = useState('pichincha'); // 'pichincha' | 'mego'
    
    const [idEdicion, setIdEdicion] = useState(null);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [nuevoProducto, setNuevoProducto] = useState({ nombre: '', precio: '', icono: '🍔' });

    const cargarProductos = async () => {
        try {
            const respuesta = await api.get('/productos');
            setProductos(respuesta.data);
        } catch (error) {}
    };

    useEffect(() => {
        cargarProductos();
    }, []);

    // 🔴 AL EDITAR, CARGAMOS EL MÉTODO DE PAGO Y BANCO
    useEffect(() => {
        if (pedidoAEditar) {
            setCarrito(pedidoAEditar.items);
            setNombreCliente(pedidoAEditar.cliente === 'Cliente Anónimo' ? '' : pedidoAEditar.cliente);
            setMetodoPago(pedidoAEditar.metodoPago || 'efectivo');
            setBanco(pedidoAEditar.banco || 'pichincha');
            setIdEdicion(pedidoAEditar.id);
            onLimpiarEdicion();
        }
    }, [pedidoAEditar, onLimpiarEdicion]);

    const guardarProductoBD = async (e) => {
        e.preventDefault();
        try {
            await api.post('/productos', nuevoProducto);
            setModalAbierto(false); 
            setNuevoProducto({ nombre: '', precio: '', icono: '🍔' }); 
            cargarProductos(); 
        } catch (error) {
            alert("Error al guardar el producto.");
        }
    };

    const eliminarProductoBD = async (id, e) => {
        e.stopPropagation(); 
        if(!window.confirm("¿Seguro que deseas eliminar este producto?")) return;
        try {
            await api.delete(`/productos/${id}`);
            cargarProductos(); 
        } catch (error) {
            alert("Error al eliminar.");
        }
    };

    const agregarAlCarrito = (producto) => {
        setCarrito(prev => {
            const existente = prev.find(item => item.id === producto.id);
            if (existente) return prev.map(item => item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item);
            return [...prev, { ...producto, cantidad: 1 }];
        });
    };

    const quitarDelCarrito = (id) => {
        setCarrito(prev => {
            const existente = prev.find(item => item.id === id);
            if (existente.cantidad === 1) return prev.filter(item => item.id !== id);
            return prev.map(item => item.id === id ? { ...item, cantidad: item.cantidad - 1 } : item);
        });
    };

    const cancelarEdicion = () => {
        setIdEdicion(null);
        setCarrito([]);
        setNombreCliente('');
        setMetodoPago('efectivo');
    };

    const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    const detalleProductosTexto = () => carrito.map(c => `${c.cantidad}x ${c.nombre}`).join(', ');

    // 🔴 FORMATEAMOS EL TEXTO PARA EL HISTORIAL
    const procesarPagoDirecto = () => {
        if (carrito.length === 0) return;
        
        const textoPago = metodoPago === 'efectivo' 
            ? 'Efectivo 💵' 
            : `Transferencia 📱 (${banco === 'pichincha' ? 'Pichincha' : 'Mego'})`;
            
        const nombreFinal = nombreCliente || 'Anónimo';

        onGuardarVenta({
            tipo: 'ingreso',
            monto: total,
            categoria: detalleProductosTexto(), 
            fecha: fechaOperativa,
            descripcion: `Cliente: ${nombreFinal} | Pago: ${textoPago}` // Así se verá en el Historial
        });

        if (idEdicion) {
            onEliminarPendiente(idEdicion, true);
            setIdEdicion(null);
        }

        setCarrito([]); 
        setNombreCliente('');
        setMetodoPago('efectivo');
    };

    const procesarPedidoPendiente = () => {
        if (carrito.length === 0) return;
        
        const nuevoPedido = {
            id: idEdicion || Date.now().toString(), 
            cliente: nombreCliente || 'Cliente Anónimo',
            hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            items: [...carrito],
            total: total,
            textoCategoria: detalleProductosTexto(),
            metodoPago: metodoPago, // Guardamos el método seleccionado
            banco: banco
        };

        onGuardarPedidoPendiente(nuevoPedido);
        setIdEdicion(null);
        setCarrito([]);
        setNombreCliente('');
        setMetodoPago('efectivo');
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm transition-colors relative">
            <div>
                <div className="flex justify-between items-center mb-4 border-b pb-2 dark:border-gray-700">
                    <h2 className="text-xl font-bold dark:text-white">Productos Rápidos</h2>
                    <button onClick={() => setModalAbierto(true)} className="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800 text-sm font-bold py-1 px-3 rounded-lg transition-colors cursor-pointer">
                        + Nuevo
                    </button>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-96 overflow-y-auto pr-2">
                    {productos.length === 0 ? (
                        <p className="col-span-full text-center text-gray-400 py-4">No has agregado productos aún.</p>
                    ) : (
                        productos.map(prod => (
                            <div key={prod.id} className="relative group">
                                <button onClick={() => agregarAlCarrito(prod)} className="w-full flex flex-col items-center justify-center p-3 bg-gray-50 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 border border-gray-200 dark:border-gray-600 rounded-xl transition-all active:scale-95 cursor-pointer h-full">
                                    <span className="text-2xl mb-1">{prod.icono}</span>
                                    <span className="font-bold text-gray-800 dark:text-gray-200 text-xs text-center leading-tight mb-1">{prod.nombre}</span>
                                    <span className="text-blue-600 dark:text-blue-400 font-black text-sm">${Number(prod.precio).toFixed(2)}</span>
                                </button>
                                <button onClick={(e) => eliminarProductoBD(prod.id, e)} className="absolute top-1 right-1 bg-red-100 text-red-600 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-sm hover:bg-red-200" title="Eliminar producto">🗑️</button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="flex flex-col border-t md:border-t-0 md:border-l dark:border-gray-700 pt-6 md:pt-0 md:pl-6">
                
                <div className="flex justify-between items-center mb-4 border-b pb-2 dark:border-gray-700">
                    <h2 className="text-xl font-bold dark:text-white">
                        {idEdicion ? '✏️ Editando Pedido' : 'Cuenta Actual'}
                    </h2>
                    {idEdicion && (
                        <button onClick={cancelarEdicion} className="text-xs bg-red-100 hover:bg-red-200 text-red-600 px-2 py-1 rounded-md font-bold transition-colors">
                            Cancelar Edición
                        </button>
                    )}
                </div>
                
                {/* 🔴 SECCIÓN DE CLIENTE Y MÉTODO DE PAGO */}
                <div className="flex flex-col gap-2 mb-4 bg-gray-50 dark:bg-gray-700 p-3 rounded-xl border border-gray-200 dark:border-gray-600">
                    <input 
                        type="text" 
                        placeholder="👤 Nombre del Cliente (Opcional)" 
                        value={nombreCliente}
                        onChange={(e) => setNombreCliente(e.target.value)}
                        className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold"
                    />
                    
                    <div className="flex gap-2 mt-1">
                        <button 
                            onClick={() => setMetodoPago('efectivo')}
                            className={`flex-1 py-1.5 rounded-lg text-sm font-bold border transition-colors cursor-pointer ${metodoPago === 'efectivo' ? 'bg-green-100 border-green-500 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-500 text-gray-500 dark:text-gray-400'}`}
                        >
                            💵 Efectivo
                        </button>
                        <button 
                            onClick={() => setMetodoPago('transferencia')}
                            className={`flex-1 py-1.5 rounded-lg text-sm font-bold border transition-colors cursor-pointer ${metodoPago === 'transferencia' ? 'bg-purple-100 border-purple-500 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-500 text-gray-500 dark:text-gray-400'}`}
                        >
                            📱 Transferencia
                        </button>
                    </div>
                    
                    {metodoPago === 'transferencia' && (
                        <div className="flex gap-2 mt-1 animate-in fade-in zoom-in duration-200">
                            <button 
                                onClick={() => setBanco('pichincha')}
                                className={`flex-1 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${banco === 'pichincha' ? 'bg-yellow-100 border-yellow-500 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-500 text-gray-500 dark:text-gray-400'}`}
                            >
                                🟡 Pichincha
                            </button>
                            <button 
                                onClick={() => setBanco('mego')}
                                className={`flex-1 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${banco === 'mego' ? 'bg-red-100 border-red-500 text-red-800 dark:bg-red-900/40 dark:text-red-400' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-500 text-gray-500 dark:text-gray-400'}`}
                            >
                                🔴 Mego
                            </button>
                        </div>
                    )}
                </div>
                
                <div className="flex-1 overflow-y-auto max-h-48 mb-4 pr-2 space-y-3">
                    {carrito.length === 0 ? (
                        <p className="text-gray-400 text-center py-4">No hay productos seleccionados</p>
                    ) : (
                        carrito.map(item => (
                            <div key={item.id} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                <div className="flex-1">
                                    <p className="font-bold dark:text-white text-sm">{item.nombre}</p>
                                    <p className="text-xs text-gray-500">${Number(item.precio).toFixed(2)} c/u</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => quitarDelCarrito(item.id)} className="w-8 h-8 rounded-full bg-red-100 text-red-600 font-bold hover:bg-red-200 cursor-pointer">-</button>
                                    <span className="font-bold w-4 text-center dark:text-white">{item.cantidad}</span>
                                    <button onClick={() => agregarAlCarrito(item)} className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold hover:bg-blue-200 cursor-pointer">+</button>
                                    <span className="font-black text-blue-600 dark:text-blue-400 w-16 text-right">${(item.precio * item.cantidad).toFixed(2)}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-xl mt-auto">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-bold text-gray-600 dark:text-gray-400">TOTAL A PAGAR:</span>
                        <span className="text-3xl font-black text-green-600 dark:text-green-500">${total.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex gap-2">
                        <button 
                            onClick={procesarPedidoPendiente}
                            disabled={carrito.length === 0}
                            className={`w-1/2 text-white font-bold py-3 rounded-lg shadow-md transition-colors cursor-pointer text-sm ${idEdicion ? 'bg-blue-500 hover:bg-blue-600' : 'bg-yellow-500 hover:bg-yellow-600'} disabled:bg-gray-400`}
                        >
                            {idEdicion ? '🔄 Guardar Cambios' : '🛵 Dejar Pendiente'}
                        </button>
                        <button 
                            onClick={procesarPagoDirecto}
                            disabled={carrito.length === 0}
                            className="w-1/2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg shadow-md transition-colors cursor-pointer text-sm"
                        >
                            ✅ Cobrar Ya
                        </button>
                    </div>
                </div>
            </div>

            {modalAbierto && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl max-w-sm w-full border border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in duration-200">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 border-b pb-2 dark:border-gray-700">Nuevo Producto</h3>
                        <form onSubmit={guardarProductoBD} className="flex flex-col gap-3">
                            <input type="text" placeholder="Nombre (Ej. Gaseosa)" value={nuevoProducto.nombre} onChange={(e) => setNuevoProducto({...nuevoProducto, nombre: e.target.value})} className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-500" required />
                            <div className="flex gap-3">
                                <input type="number" step="0.01" placeholder="Precio" value={nuevoProducto.precio} onChange={(e) => setNuevoProducto({...nuevoProducto, precio: e.target.value})} className="w-2/3 p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-500" required />
                                <input type="text" placeholder="Icono 🍕" value={nuevoProducto.icono} onChange={(e) => setNuevoProducto({...nuevoProducto, icono: e.target.value})} className="w-1/3 p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-center outline-none focus:ring-2 focus:ring-blue-500" maxLength="5"/>
                            </div>
                            <div className="flex gap-3 mt-4">
                                <button type="button" onClick={() => setModalAbierto(false)} className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-2 rounded-lg cursor-pointer">Cancelar</button>
                                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg shadow-md cursor-pointer">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}