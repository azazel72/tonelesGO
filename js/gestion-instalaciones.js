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
        editable: false,
        columns: [
          { title:"ID", field:"id", width:70, hozAlign:"right", headerSort:false },
          { title:"Nombre", field:"nombre", editor:"input", editable: tablaEditable, cssClass: "filtrable", },
          {
            title: "Tipo",
            field: "tipo",
            editor: "list",
            editorParams: {
              values: [{ label: "Maderas", value: "M" }, { label: "Botas", value: "B" }],
              clearable: true,
              autocomplete: true,
              allowEmpty: true,
            },
            editable: tablaEditable,
            formatter: cell => cell.getValue() == "M" ? "Maderas" : cell.getValue() == "B" ? "Botas" : cell.getValue(),
          },

          CeldaAcciones,
        ],
        data: Object.values(DATOS.maestros.instalaciones || {}),
      },
    },
  }

  return crearVentana(configuracion);
}
