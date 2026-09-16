import axios from 'axios';

const api = axios.create({
  baseURL: 'https://lat-oakland-mat-preliminary.trycloudflare.com/api',
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

export default api;