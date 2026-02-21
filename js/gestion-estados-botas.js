// ====== CREAR VENTANA ESTADOS BOTAS ======
function openEstadosBotasWin() {
  const wb = comprobarVentanaAbierta("estados_botas");
  if (wb) return wb;

  const configuracion = {
    KEY: "estados_botas",
    winbox: {
      tipo: "generico",
      options: {
        title: "Estados botas",
        x: 265,
        y: 80,
      }
    },
    tabulator: {
      options: {
        editable: false,
        columns: [
          { title:"ID", field:"id", width:70, hozAlign:"right"},
          { title:"Descripción", field:"descripcion", editor:"input", editable: tablaEditable, cssClass: "filtrable", },
          CeldaAcciones,
        ],
        data: Object.values(DATOS.maestros.estados_botas || {}),
      },
    },
  }

  return crearVentana(configuracion);
}
