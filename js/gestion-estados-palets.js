// ====== CREAR VENTANA ESTADOS PALETS ======
function openEstadosPaletsWin() {
  const wb = comprobarVentanaAbierta("estados_palets");
  if (wb) return wb;

  const configuracion = {
    KEY: "estados_palets",
    winbox: {
      tipo: "generico",
      options: {
        title: "Estados palets",
        x: 275,
        y: 90,
      }
    },
    tabulator: {
      options: {
        editable: false,
        columns: [
          { title:"ID", field:"id", width:70, hozAlign:"right"},
          { title:"Descripción", field:"descripcion", editor:"input", editable: tablaEditable, cssClass: "filtrable" },
          CeldaAcciones,
        ],
        data: Object.values(DATOS.maestros.estados_palets || {}),
      },
    },
  };

  return crearVentana(configuracion);
}
