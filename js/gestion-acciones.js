function routeMessage(data) {
  try {
    const msg = typeof data === 'string' ? JSON.parse(data) : data;
    (ACCIONES[msg.action] || ACCIONES.default)?.(msg);
  } catch (e) {
    console.error('WS JSON inválido:', e, data);
  }
}

var ACCIONES = {
    "default": (msg) => {
        console.warn("Acción no manejada:", msg);
    },
    "login": respuesta_login,
    "maestros": respuesta_maestros,
};