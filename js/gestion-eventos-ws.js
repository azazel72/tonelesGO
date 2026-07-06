function routeMessage(data) {
  //console.log(data);
  try {
    const msg = typeof data === 'string' ? JSON.parse(data) : data;
    if (msg.request_id) {
      const pending = pendingWsRequests.get(msg.request_id);
      if (pending) {
        pendingWsRequests.delete(msg.request_id);
        if (msg.error) {
          const error = new Error(msg.error);
          pending.reject(error);
          alert(msg.error);
        } else {
          pending.resolve(msg.data);
        }
        return;
      }
    }
    if (msg.error) {
      console.error("Error servidor:", msg.error, msg);
      alert(msg.error);
      return;
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
    "logout": () => {},
    "set_pantalla": () => {},
    "maestros": respuesta_maestros,
    "fabricacion": respuesta_fabricacion,
    "fabricacion_actualizar": (msg) => {
        if (msg?.data?.refetch_maestros) {
            send("maestros", {});
        }
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
