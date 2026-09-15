class MovimientoUIFactory {
  static crearUI(tipo) {
    if (tipo === 'ingreso') {
      return {
        bgClass: 'bg-green-50 dark:bg-green-900/20',
        borderClass: 'border-green-500',
        textClass: 'text-green-600 dark:text-green-400',
        icono: '📈',
        signo: '+'
      };
    } 
    
    if (tipo === 'gasto') {
      return {
        bgClass: 'bg-red-50 dark:bg-red-900/20',
        borderClass: 'border-red-500',
        textClass: 'text-red-600 dark:text-red-400',
        icono: '📉',
        signo: '-'
      };
    }

    return { bgClass: 'bg-gray-50', borderClass: 'border-gray-500', textClass: 'text-gray-600', icono: '💰', signo: '' };
  }
}

export default MovimientoUIFactory;