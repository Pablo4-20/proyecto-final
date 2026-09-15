import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function Login() {
  const [credenciales, setCredenciales] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredenciales({ ...credenciales, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // 1. Enviamos credenciales al backend
      const respuesta = await api.post('/login', credenciales);
      
      // 2. Guardamos el token en la memoria del navegador
      localStorage.setItem('token', respuesta.data.access_token);
      
      // 3. Redirigimos al Dashboard
      navigate('/dashboard');
    } catch (error) {
      setError('Credenciales incorrectas. Verifica tu correo y contraseña.');
    }
  };

  return (
    <div className="contenedor" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div className="formulario-card" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center' }}>Iniciar Sesión</h2>
        
        {error && <div style={{ color: 'red', marginBottom: '10px', textAlign: 'center' }}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input 
            type="email" 
            name="email" 
            placeholder="Correo electrónico" 
            value={credenciales.email} 
            onChange={handleChange} 
            required 
            style={{ padding: '10px' }}
          />
          <input 
            type="password" 
            name="password" 
            placeholder="Contraseña" 
            value={credenciales.password} 
            onChange={handleChange} 
            required 
            style={{ padding: '10px' }}
          />
          <button type="submit" style={{ padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', cursor: 'pointer', fontSize: '16px' }}>
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;