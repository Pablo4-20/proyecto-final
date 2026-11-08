import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Interceptor: Antes de que salga cualquier petición, revisa si tenemos un token guardado
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Función para obtener el cierre diario
export const getCierreDiario = async (fecha) => {
  const response = await api.get('/movimientos/cierre', {
      params: { fecha }
  });
  return response.data;
};

export default api;