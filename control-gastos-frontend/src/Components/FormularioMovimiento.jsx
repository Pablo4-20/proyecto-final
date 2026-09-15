import { useState } from 'react';

function FormularioMovimiento({ onAgregar }) {
  const [formulario, setFormulario] = useState({
    tipo: 'gasto',
    monto: '',
    categoria: '',
    fecha: '',
    descripcion: ''
  });

  const handleChange = (e) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAgregar(formulario); 
    setFormulario({ tipo: 'gasto', monto: '', categoria: '', fecha: '', descripcion: '' });
  };

  return (
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
  );
}

export default FormularioMovimiento;