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
          { title:"T 7:00", field:"temperatura_1", editor:"number", editable: tablaEditable, cssClass: "filtrable", hozAlign:"right" },
          { title:"H 7:00", field:"humedad_1", editor:"number", editable: tablaEditable, cssClass: "filtrable", hozAlign:"right" },
          { title:"T 10:00", field:"temperatura_2", editor:"number", editable: tablaEditable, cssClass: "filtrable", hozAlign:"right" },
          { title:"H 10:00", field:"humedad_2", editor:"number", editable: tablaEditable, cssClass: "filtrable", hozAlign:"right" },
          { title:"T 14:00", field:"temperatura_3", editor:"number", editable: tablaEditable, cssClass: "filtrable", hozAlign:"right" },
          { title:"H 14:00", field:"humedad_3", editor:"number", editable: tablaEditable, cssClass: "filtrable", hozAlign:"right" },
          CeldaAcciones,
        ],
        data: Object.values(DATOS.maestros.ambientes || {}),
      },
    },
  };

  return crearVentana(configuracion);
}
