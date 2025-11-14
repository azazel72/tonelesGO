// ====== CREAR VENTANA ESTADOS ======
function openEstadosWin() {
  const wb = comprobarVentanaAbierta("estados");
  if (wb) return wb;

  const configuracion = {
    KEY: "estados",
    winbox: {
      tipo: "generico",
      options: {
        title: "Estados",
        x: 265,
        y: 80,
      }
    },
    tabulator: {
      options: {
        editable: false,
        columns: [
          { title:"ID", field:"id", width:70, hozAlign:"right", headerSort:false },
          { title:"Descripción", field:"descripcion", editor:"input", editable: tablaEditable, cssClass: "filtrable", },
          CeldaAcciones,
        ],
        data: Object.values(DATOS.maestros.estados || {}),
      },
    },
  }

  return crearVentana(configuracion);  

}
