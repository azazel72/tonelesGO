function openTostadosWin() {
  const wb = comprobarVentanaAbierta("tostados");
  if (wb) return wb;

  const configuracion = {
    KEY: "tostados",
    winbox: {
      tipo: "generico",
      options: {
        title: "Tostados",
        x: 20,
        y: 120,
      }
    },
    tabulator: {
      options: {
        editable: false,
        columns: [
          { title: "ID", field: "id", width: 70, hozAlign: "right" },
          { title: "Descripcion", field: "descripcion", editor: "input", editable: tablaEditable, cssClass: "filtrable" },
          CeldaAcciones,
        ],
        data: Object.values(DATOS.maestros.tostados || {}),
      },
    },
  };

  return crearVentana(configuracion);
}
