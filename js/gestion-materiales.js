
// ====== CREAR VENTANA MATERIALES ======
function openMaterialesWin() {
  const wb = comprobarVentanaAbierta("materiales");
  if (wb) return wb;

  const configuracion = {
    KEY: "materiales",
    winbox: {
      tipo: "generico",
      options: {
        title: "Materiales",
        x: 0,
        y: 120,
      }
    },
    tabulator: {
      options: {
        editable: false,
        columns: [
          { title:"ID", field:"id", width:70, hozAlign:"right"},
          { title:"Descripcion", field:"descripcion", editor:"input", editable: tablaEditable, cssClass: "filtrable" },
          CeldaAcciones,
        ],
        data: Object.values(DATOS.maestros.materiales || {}),
      },
    },
  };

  return crearVentana(configuracion);
}
