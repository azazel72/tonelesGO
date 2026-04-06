function openAnaliticasWin() {
  if (!asegurarFabricacionCargada("analiticas")) return null;

  const wb = comprobarVentanaAbierta("analiticas");
  if (wb) return wb;

  const estadosDict = [
    { value: "ACTIVA", label: "Activa" },
    { value: "FINALIZADA", label: "Finalizada" },
  ];

  const configuracion = {
    KEY: "analiticas",
    data_key: "fabricacion",
    winbox: {
      tipo: "generico",
      options: {
        title: "Analiticas",
        x: 140,
        y: 140,
        width: "1260px",
      }
    },
    tabulator: {
      options: {
        editable: false,
        columns: [
          { title:"ID", field:"id", width:70, hozAlign:"right"},
          { title: "Fecha", field: "fecha", editor: "date", editable: tablaEditable, sorter: "date", cssClass: "filtrable" },
          { title: "Descripcion", field: "descripcion", editor: "input", editable: tablaEditable, cssClass: "filtrable", widthGrow: 2 },
          {
            title: "Estado",
            field: "estado",
            editor: "list",
            editorParams: {
              values: estadosDict,
              clearable: false,
              autocomplete: true,
              allowEmpty: false,
              listOnEmpty: true,
              freetext: false,
            },
            editable: tablaEditable,
            cssClass: "filtrable",
            formatter: (cell) => ({ ACTIVA: "Activa", FINALIZADA: "Finalizada" }[String(cell.getValue() || "").trim().toUpperCase()] ?? cell.getValue()),
          },
          { title: "Grado alcoholico", field: "grado_alcoholico", editor: "input", editable: tablaEditable },
          { title: "pH", field: "ph", editor: "input", editable: tablaEditable, width: 90 },
          { title: "Acidez total", field: "acidez_total", editor: "input", editable: tablaEditable },
          { title: "Acidez volatil", field: "acidez_volatil", editor: "input", editable: tablaEditable },
          { title: "SO2 libre", field: "so2_libre", editor: "input", editable: tablaEditable },
          { title: "SO2 total", field: "so2_total", editor: "input", editable: tablaEditable },
          { title: "Azucar residual", field: "azucar_residual", editor: "input", editable: tablaEditable },
          { title: "Temperatura", field: "temperatura", editor: "input", editable: tablaEditable },
          CeldaAcciones,
        ],
        data: Object.values(DATOS.fabricacion.analiticas || {}),
      },
    },
  };

  return crearVentana(configuracion);
}
