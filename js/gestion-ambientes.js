// ====== CREAR VENTANA AMBIENTES ======
function openAmbientesWin() {
  const wb = comprobarVentanaAbierta("ambientes");
  if (wb) return wb;

  const configuracion = {
    KEY: "ambientes",
    winbox: {
      tipo: "generico",
      options: {
        title: "Ambiente",
        x: 280,
        y: 120,
      }
    },
    tabulator: {
      options: {
        editable: false,
        columns: [
          { title:"ID", field:"id", width:70, hozAlign:"right"},
          {
            title:"Fecha",
            field:"fecha",
            editor:"input",
            editorParams: {
              elementAttributes: { type: "date" },
            },
            editable: tablaEditable,
            cssClass: "filtrable",
          },
          { title:"Toma", field:"toma", editor:"number", editable: tablaEditable, cssClass: "filtrable", hozAlign:"right" },
          { title:"Temperatura", field:"temperatura", editor:"number", editable: tablaEditable, cssClass: "filtrable", hozAlign:"right" },
          { title:"Humedad", field:"humedad", editor:"number", editable: tablaEditable, cssClass: "filtrable", hozAlign:"right" },
          CeldaAcciones,
        ],
        data: Object.values(DATOS.maestros.ambientes || {}),
      },
    },
  };

  return crearVentana(configuracion);
}
