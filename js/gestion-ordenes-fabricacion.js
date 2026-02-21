
// ====== CREAR VENTANA ORDENES FABRICACION ======
function openOrdenesFabricacionWin() {
  if (!asegurarFabricacionCargada("ordenes_fabricacion")) return null;

  const wb = comprobarVentanaAbierta("ordenes_fabricacion");
  if (wb) return wb;

  const estadosDict = Object.values(DATOS?.maestros?.estados_ordenes_fabricacion ?? {}).map(
    ({ id, descripcion, ...resto }) => ({
      ...resto, id, descripcion,
      value: id,
      label: descripcion,
    })
  );

  const configuracion = {
    KEY: "ordenes_fabricacion",
    data_key: "fabricacion",
    winbox: {
      tipo: "generico",
      options: {
        title: "Ordenes de fabricacion",
        x: 120,
        y: 140,
      }
    },
    tabulator: {
      options: {
        editable: false,
        columns: [
          { title:"ID", field:"id", width:70, hozAlign:"right"},
          { title:"Numero", field:"numero", editor:"input", editable: tablaEditable, cssClass: "filtrable" },
          { title:"Descripción", field:"descripcion", editor:"input", editable: tablaEditable, cssClass: "filtrable" },
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
          {
            title:"Fecha fin",
            field:"fecha_finalizacion",
            editor:"input",
            editorParams: {
              elementAttributes: { type: "date" },
            },
            editable: tablaEditable,
            cssClass: "filtrable",
          },
          {
            title: "Estado",
            field: "estado",
            editor: "list",
            editorParams: {
              values: estadosDict,
              clearable: true,
              autocomplete: true,
              allowEmpty: true,
              listOnEmpty: true,
              freetext: false,
            },
            editable: tablaEditable,
            cssClass: "filtrable",
            formatter: cell => DATOS?.maestros?.estados_ordenes_fabricacion?.[cell.getValue()]?.descripcion ?? cell.getValue(),
          },
          CeldaAcciones,
        ],
        data: Object.values(DATOS.fabricacion.ordenes_fabricacion || {}),
      },
    },
  };

  return crearVentana(configuracion);
}
