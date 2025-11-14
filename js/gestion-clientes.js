// ====== CREAR VENTANA CLIENTES ======
function openClientesWin(el) {
  const wb = comprobarVentanaAbierta("clientes");
  if (wb) return wb;

  const configuracion = {
    KEY: "clientes",
    winbox: {
      tipo: "generico",
      options: {
        title: "Clientes",
        x: 110,
        y: 110,
      }
    },
    tabulator: {
      options: {
        editable: false,
        columns: [
          { title:"ID", field:"id", width:70, hozAlign:"right", headerSort:false },
          { title:"Nombre", field:"nombre", editor:"input", editable: tablaEditable, cssClass: "filtrable", },
          CeldaAcciones,
        ],
        data: Object.values(DATOS.maestros.clientes || {}),
      },
    },
  }

  return crearVentana(configuracion);  
}
