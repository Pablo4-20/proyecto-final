class MovimientoUIFactory {
  static crearUI(tipo) {
    if (tipo === 'ingreso') {
      return {
        colorPrincipal: '#4CAF50', // Verde
        colorFondo: '#e8f5e9',
        icono: '📈',
        signo: '+'
      };
    } 
    
    if (tipo === 'gasto') {
      return {
        colorPrincipal: '#f44336', // Rojo
        colorFondo: '#ffebee',
        icono: '📉',
        signo: '-'
      };
    }

    // Retorno por defecto por seguridad
    return { 
      colorPrincipal: '#000000', 
      colorFondo: '#ffffff', 
      icono: '💰', 
      signo: '' 
    };
  }
}

export default MovimientoUIFactory;