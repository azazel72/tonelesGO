
// ====== CREAR VENTANA FABRICACION SEMANAL ======
function openFabricacionSemanalWin() {
  if (!asegurarFabricacionCargada("fabricacion_semanal")) return null;

  const wb = comprobarVentanaAbierta("fabricacion_semanal");
  if (wb) return wb;

  const ordenesDict = construirOrdenesFabricacionDict();

  const tiposDict = Object.values(DATOS?.fabricacion?.tipos_producto ?? {}).map(
    ({ id, descripcion, codigo, ...resto }) => ({
      ...resto, id, descripcion, codigo,
      value: id,
      label: descripcion || codigo || String(id),
    })
  );

  const materialesDict = construirMaterialesDict();

  const estadosDict = Object.values(DATOS?.maestros?.estados_fabricacion_semanal ?? {}).map(
    ({ id, descripcion, ...resto }) => ({
      ...resto, id, descripcion,
      value: id,
      label: descripcion,
    })
  );

  const configuracion = {
    KEY: "fabricacion_semanal",
    data_key: "fabricacion",
    winbox: {
      tipo: "generico",
      options: {
        title: "Fabricacion semanal",
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
            title: "Pedido",
            field: "pedido_id",
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
            formatter: (cell) => getEtiquetaPedido(DATOS?.fabricacion?.pedidos?.[cell.getValue()]),
          },
          {
            title: "Fecha inicio",
            field: "fecha_inicio",
            editor: "date",
            editable: tablaEditable,
            cssClass: "filtrable",
            sorter: "date",
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
          {
            title: "Material",
            field: "material_id",
            editor: "list",
            editorParams: {
              values: materialesDict,
              clearable: true,
              autocomplete: true,
              allowEmpty: true,
              listOnEmpty: true,
              freetext: false,
            },
            editable: tablaEditable,
            cssClass: "filtrable",
            formatter: cell => DATOS?.maestros?.materiales?.[cell.getValue()]?.descripcion ?? cell.getValue(),
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
            formatter: cell => DATOS?.maestros?.estados_fabricacion_semanal?.[cell.getValue()]?.descripcion ?? cell.getValue(),
          },
          CeldaAcciones,
        ],
        data: Object.values(DATOS.fabricacion.fabricacion_semanal || {}),
      },
    },
  };

  return crearVentana(configuracion);
}

function construirOrdenesFabricacionDict() {
  return Object.values(DATOS?.fabricacion?.pedidos ?? {}).map(
    ({ id, ...resto }) => ({
      ...resto, id,
      value: id,
      label: getEtiquetaPedido({ id, ...resto }),
    })
  );
}

function getEtiquetaPedido(pedido) {
  if (!pedido) return "";
  const tipo = DATOS?.fabricacion?.tipos_producto?.[pedido.tipo_producto_id]?.descripcion || "";
  const material = DATOS?.maestros?.materiales?.[pedido.material_id]?.descripcion || "";
  const cantidad = Number.parseInt(String(pedido.cantidad ?? ""), 10);
  const cantidadTxt = Number.isFinite(cantidad) ? String(cantidad) : "";
  const partes = [tipo, material, cantidadTxt ? `Cant. ${cantidadTxt}` : ""].filter(Boolean);
  if (partes.length) return partes.join(" | ");
  return pedido.numero || pedido.descripcion || String(pedido.id);
}

function construirMaterialesDict() {
  return Object.values(DATOS?.maestros?.materiales ?? {}).map(
    ({ id, descripcion, ...resto }) => ({
      ...resto, id, descripcion,
      value: id,
      label: descripcion,
    })
  );
}

function actualizarLineasFabricacionEditorOrdenes() {
  const par = windowsRegistry.get("fabricacion_semanal");
  if (!par?.table) return;
  const tabla = par.table;
  const ordenesDict = construirOrdenesFabricacionDict();
  const col = tabla.getColumn("pedido_id");
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

function actualizarLineasFabricacionEditorMateriales() {
  const par = windowsRegistry.get("fabricacion_semanal");
  if (!par?.table) return;
  const tabla = par.table;
  const materialesDict = construirMaterialesDict();
  const col = tabla.getColumn("material_id");
  if (!col) return;
  col.updateDefinition({
    editorParams: {
      values: materialesDict,
      clearable: true,
      autocomplete: true,
      allowEmpty: true,
      listOnEmpty: true,
      freetext: false,
    },
  });
}
