function openEstadosProductosWin() {
  const wb = comprobarVentanaAbierta("estados_productos");
  if (wb) return wb;

  const configuracion = {
    KEY: "estados_productos",
    winbox: {
      tipo: "generico",
      options: {
        title: "Estados productos",
        x: 265,
        y: 80,
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
        data: Object.values(DATOS.maestros.estados_productos || {}),
      },
    },
  };

  return crearVentana(configuracion);
}
