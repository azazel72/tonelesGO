// ====== CREAR VENTANA USUARIOS ======
function openRolesWin() {
  const wb = comprobarVentanaAbierta("roles");
  if (wb) return wb;

  const parametros_check = {
    hozAlign: "center",
    formatter: "tickCross",
    editor: "tickCross",
    editorParams: {
      //tristate: false,
    },
    editable: tablaEditable,
    cssClass: "filtrable",
  }

  const configuracion = {
    KEY: "roles",
    winbox: {
      tipo: "generico",
      options: {
        title: "Roles",
        x: 1,
        y: 1,
      }
    },
    tabulator: {
      options: {
        editable: false,
        columns: [
          { title:"ID", field:"id", width:70, hozAlign:"right", headerSort:false },
          { title:"Nombre", field:"nombre", editor:"input", editable: tablaEditable, cssClass: "filtrable", },
          { title:"Planificación", field:"planificacion", ...parametros_check},
          { title:"Recepción", field:"recepcion", ...parametros_check},
          { title:"Ubicación", field:"ubicacion", ...parametros_check},
          { title:"Fabricación", field:"fabricacion", ...parametros_check},
          { title:"Expedición", field:"expedicion", ...parametros_check},
          { title:"Trazabilidad", field:"trazabilidad", ...parametros_check},
          { title:"Administrador", field:"administrador", ...parametros_check},
          CeldaAcciones,
        ],
        data: Object.values(DATOS.maestros.roles || {}),
      },
    },
  }

  return crearVentana(configuracion);
}
