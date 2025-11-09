// ====== CREAR VENTANA INSTALACIONES ======
function openInstalacionesWin() {
    const wb = comprobarVentanaAbierta("instalaciones");
    if (wb) return wb;

    const configuracion = {
    KEY: "instalaciones",
    winbox: {
      tipo: "generico",
      options: {
        title: "Instalaciones",
        x: 210,
        y: 35,
      }
    },
    tabulator: {
      options: {
        columns: [
          { title:"ID", field:"id", width:70, hozAlign:"right", headerSort:false },
          { title:"Nombre", field:"nombre", editor:"input", editable:false, cssClass: "filtrable", },
          CeldaAcciones,
        ],
        data: Object.values(DATOS.maestros.instalaciones || {}),
      },
    },
  }

  return crearVentana(configuracion);
}
