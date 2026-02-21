
// ====== CREAR VENTANA LINEAS FABRICACION ======
function openLineasFabricacionWin() {
  if (!asegurarFabricacionCargada("lineas_fabricacion")) return null;

  const wb = comprobarVentanaAbierta("lineas_fabricacion");
  if (wb) return wb;

  const ordenesDict = construirOrdenesFabricacionDict();

  const tiposDict = Object.values(DATOS?.fabricacion?.tipos_producto ?? {}).map(
    ({ id, descripcion, codigo, ...resto }) => ({
      ...resto, id, descripcion, codigo,
      value: id,
      label: descripcion || codigo || String(id),
    })
  );

  const estadosDict = Object.values(DATOS?.maestros?.estados_lineas_fabricacion ?? {}).map(
    ({ id, descripcion, ...resto }) => ({
      ...resto, id, descripcion,
      value: id,
      label: descripcion,
    })
  );

  const configuracion = {
    KEY: "lineas_fabricacion",
    data_key: "fabricacion",
    winbox: {
      tipo: "generico",
      options: {
        title: "Lineas de fabricacion",
        x: 160,
        y: 180,
      }
    },
    tabulator: {
      options: {
        editable: false,
        columns: [
          { title:"ID", field:"id", width:70, hozAlign:"right"},
          {
            title: "Orden",
            field: "orden_id",
            editor: "list",
            editorParams: {
              values: ordenesDict,
              clearable: true,
              autocomplete: true,
              allowEmpty: true,
              listOnEmpty: true,
              freetext: false,
            },
            editable: tablaEditable,
            cssClass: "filtrable",
            formatter: cell => DATOS?.fabricacion?.ordenes_fabricacion?.[cell.getValue()]?.numero ?? cell.getValue(),
          },
          {
            title: "Tipo",
            field: "tipo_producto_id",
            editor: "list",
            editorParams: {
              values: tiposDict,
              clearable: true,
              autocomplete: true,
              allowEmpty: true,
              listOnEmpty: true,
              freetext: false,
            },
            editable: tablaEditable,
            cssClass: "filtrable",
            formatter: cell => DATOS?.fabricacion?.tipos_producto?.[cell.getValue()]?.descripcion ?? cell.getValue(),
          },
          { title:"Cantidad", field:"cantidad", editor:"number", editable: tablaEditable, cssClass: "filtrable", hozAlign:"right" },
          { title:"Cant. fabricada", field:"cantidad_fabricada", editor:"number", editable: tablaEditable, cssClass: "filtrable", hozAlign:"right" },
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
            formatter: cell => DATOS?.maestros?.estados_lineas_fabricacion?.[cell.getValue()]?.descripcion ?? cell.getValue(),
          },
          CeldaAcciones,
        ],
        data: Object.values(DATOS.fabricacion.lineas_fabricacion || {}),
      },
    },
  };

  return crearVentana(configuracion);
}

function construirOrdenesFabricacionDict() {
  return Object.values(DATOS?.fabricacion?.ordenes_fabricacion ?? {}).map(
    ({ id, numero, ...resto }) => ({
      ...resto, id, numero,
      value: id,
      label: numero || String(id),
    })
  );
}

function actualizarLineasFabricacionEditorOrdenes() {
  const par = windowsRegistry.get("lineas_fabricacion");
  if (!par?.table) return;
  const tabla = par.table;
  const ordenesDict = construirOrdenesFabricacionDict();
  const col = tabla.getColumn("orden_id");
  if (!col) return;
  col.updateDefinition({
    editorParams: {
      values: ordenesDict,
      clearable: true,
      autocomplete: true,
      allowEmpty: true,
      listOnEmpty: true,
      freetext: false,
    },
  });
}
