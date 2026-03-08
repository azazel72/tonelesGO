// ====== CREAR VENTANA ESTADOS FABRICACION SEMANAL ======
function openEstadosFabricacionSemanalWin() {
  const wb = comprobarVentanaAbierta("estados_fabricacion_semanal");
  if (wb) return wb;

  const configuracion = {
    KEY: "estados_fabricacion_semanal",
    winbox: {
      tipo: "generico",
      options: {
        title: "Estados fabricacion semanal",
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
        data: Object.values(DATOS.maestros.estados_fabricacion_semanal || {}),
      },
    },
  }

  return crearVentana(configuracion);
}
