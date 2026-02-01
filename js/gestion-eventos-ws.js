function routeMessage(data) {
  //console.log(data);
  try {
    const msg = typeof data === 'string' ? JSON.parse(data) : data;
    if (msg.request_id) {
      const pending = pendingWsRequests.get(msg.request_id);
      if (pending) {
        pendingWsRequests.delete(msg.request_id);
        pending.resolve(msg.data);
        return;
      }
    }
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
    "fabricacion": respuesta_fabricacion,
    "fabricacion_actualizar": () => {
        send("fabricacion", {});
    },
    "cargar_planificacion_entradas": mostrar_planificacion_entradas,
    "agregar_planificacion_entradas": mostrar_planificacion_entradas,
    "cargar_cuadrantes": mostrar_cuadrantes,
    "actualizar_cuadrante": mostrar_cuadrantes,
    "insertar_detalle_cuadrante": respuesta_cuadrantes,
    "actualizar_detalle_cuadrante": respuesta_cuadrantes,
    "eliminar_detalle_cuadrante": respuesta_cuadrantes,
};
