import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function Login() {
  const [isLogin, setIsLogin] = useState(true); // Alterna entre Iniciar Sesión y Registro
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      // Determinamos el endpoint según la vista activa
      const endpoint = isLogin ? '/login' : '/register';
      
      const payload = isLogin 
        ? { email: formData.email, password: formData.password } 
        : formData;

      const respuesta = await api.post(endpoint, payload);
      
      // Guardamos el token y los datos del usuario en la memoria del navegador
      localStorage.setItem('token', respuesta.data.access_token);
      localStorage.setItem('user', JSON.stringify(respuesta.data.user)); // <-- Guardado de usuario
      
      // Redirigimos al Dashboard
      navigate('/dashboard');
    } catch (error) {
      const mensaje = error.response?.data?.message || 'Credenciales incorrectas o error de conexión.';
      setError(mensaje);
    } finally {
      setCargando(false);
    }
  };

  const inputClass = "w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition-colors";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors duration-300 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg transition-colors">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-gray-800 dark:text-gray-100">
            Control de Gastos 💰
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {isLogin ? 'Inicia sesión en tu cuenta' : 'Crea una cuenta nueva'}
          </p>
        </div>
        
        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-400 p-3 mb-6 rounded text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* El campo Nombre solo se muestra si el usuario está registrándose */}
          {!isLogin && (
            <input 
              type="text" 
              name="name" 
              placeholder="Nombre completo" 
              value={formData.name} 
              onChange={handleChange} 
              required 
              className={inputClass}
            />
          )}

          <input 
            type="email" 
            name="email" 
            placeholder="Correo electrónico" 
            value={formData.email} 
            onChange={handleChange} 
            required 
            className={inputClass}
          />
          
          <input 
            type="password" 
            name="password" 
            placeholder="Contraseña" 
            value={formData.password} 
            onChange={handleChange} 
            required 
            className={inputClass}
          />
          
          <button 
            type="submit" 
            disabled={cargando}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg shadow-md transition-colors cursor-pointer disabled:opacity-50 mt-2"
          >
            {cargando ? 'Procesando...' : (isLogin ? 'Entrar' : 'Registrarse')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium focus:outline-none cursor-pointer"
          >
            {isLogin 
              ? '¿No tienes una cuenta? Regístrate aquí' 
              : '¿Ya tienes una cuenta? Inicia sesión'}
          </button>
        </div>

      </div>
    </div>
  );
}

export default Login;