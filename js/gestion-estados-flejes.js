function openEstadosFlejesWin() {
  const wb = comprobarVentanaAbierta("estados_flejes");
  if (wb) return wb;

  const configuracion = {
    KEY: "estados_flejes",
    winbox: {
      tipo: "generico",
      options: {
        title: "Estados flejes",
        x: 290,
        y: 110,
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
        data: Object.values(DATOS.maestros.estados_flejes || {}),
      },
    },
  };

  return crearVentana(configuracion);
}
