
// ====== CREAR VENTANA ORDENES FABRICACION ======
function openOrdenesFabricacionWin() {
  if (!asegurarFabricacionCargada("ordenes_fabricacion")) return null;

  const wb = comprobarVentanaAbierta("ordenes_fabricacion");
  if (wb) return wb;

  const clientesDict = Object.values(DATOS?.maestros?.clientes ?? {}).map(
    ({ id, nombre, ...resto }) => ({
      ...resto, id, nombre,
      value: id,
      label: nombre,
    })
  );

  const estadosDict = Object.values(DATOS?.maestros?.estados ?? {}).map(
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
            title: "Cliente",
            field: "cliente_id",
            editor: "list",
            editorParams: {
              values: clientesDict,
              clearable: true,
              autocomplete: true,
              allowEmpty: true,
              listOnEmpty: true,
              freetext: false,
            },
            editable: tablaEditable,
            cssClass: "filtrable",
            formatter: cell => DATOS?.maestros?.clientes?.[cell.getValue()]?.nombre ?? cell.getValue(),
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
            formatter: cell => DATOS?.maestros?.estados?.[cell.getValue()]?.descripcion ?? cell.getValue(),
          },
          CeldaAcciones,
        ],
        data: Object.values(DATOS.fabricacion.ordenes_fabricacion || {}),
      },
    },
  };

  return crearVentana(configuracion);
}
