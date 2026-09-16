import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import './App.css';

const RutaPrivada = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        
        {/* Asegúrate de que esta ruta esté escrita una sola vez */}
        <Route 
          path="/dashboard" 
          element={
            <RutaPrivada>
              <Dashboard />
            </RutaPrivada>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;