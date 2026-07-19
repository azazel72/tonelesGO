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
          { title: "Depósito", field: "deposito", editor: "input", editable: tablaEditable, widthGrow: 1 },
          { title: "Litros", field: "litros", editor: "input", editable: tablaEditable, hozAlign: "right" },
          { title: "Alcohol", field: "alcohol", editor: "input", editable: tablaEditable, hozAlign: "right" },
          { title: "AV", field: "av", editor: "input", editable: tablaEditable, hozAlign: "right" },
          { title: "pH", field: "ph", editor: "input", editable: tablaEditable, hozAlign: "right", width: 90 },
          { title: "NTU", field: "ntu", editor: "input", editable: tablaEditable, hozAlign: "right" },
          { title: "Azúcar", field: "azucar", editor: "input", editable: tablaEditable, hozAlign: "right" },
          { title: "nº botas", field: "numero_botas", editor: "input", editable: tablaEditable, hozAlign: "right" },
          { title: "Cliente", field: "cliente", editor: "input", editable: tablaEditable, widthGrow: 1 },
          { title: "Tipo bota", field: "tipo_bota", editor: "input", editable: tablaEditable, widthGrow: 1 },
          { title: "vo(@)", field: "vo_at", editor: "input", editable: tablaEditable, hozAlign: "right" },
          { title: "Observaciones", field: "observaciones", editor: "textarea", editable: tablaEditable, widthGrow: 2 },
          CeldaAcciones,
        ],
        data: Object.values(DATOS.fabricacion.analiticas || {}),
      },
    },
  };

  return crearVentana(configuracion);
}
