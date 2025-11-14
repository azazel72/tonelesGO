// ====== CREAR VENTANA PROVEEDORES ======
function openProveedoresWin() {
  const wb = comprobarVentanaAbierta("proveedores");
  if (wb) return wb;

  const configuracion = {
    KEY: "proveedores",
    winbox: {
      tipo: "generico",
      options: {
        title: "Proveedores",
        x: 55,
        y: 55,
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
        data: Object.values(DATOS.maestros.proveedores || {}),
      },
    },
  }

  return crearVentana(configuracion);
}
