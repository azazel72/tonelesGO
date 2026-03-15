
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
            cellEdited: onPedidoCellEditedFabricacionSemanal,
          },
          {
            title: "Fecha inicio",
            field: "fecha_inicio",
            editor: "date",
            editorParams: {
              elementAttributes: {
                min: "0001-01-01",
                step: 7,
              },
            },
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
            editable: false,
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
            editable: false,
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
  return Object.values(DATOS?.fabricacion?.pedidos ?? {}).filter(
    (pedido) => {
      const estado = Number.parseInt(String(pedido?.estado ?? ""), 10);
      return estado === 1 || estado === 2;
    }
  ).map(
    ({ id, ...resto }) => ({
      ...resto, id,
      value: id,
      label: getEtiquetaPedidoSelector({ id, ...resto }),
    })
  );
}

function getEtiquetaPedido(pedido) {
  if (!pedido) return "";
  const descripcion = (pedido.descripcion || "").trim();
  const cliente = DATOS?.maestros?.clientes?.[pedido.cliente_id]?.nombre || "";
  const tipo = DATOS?.fabricacion?.tipos_producto?.[pedido.tipo_producto_id]?.descripcion || "";
  const material = DATOS?.maestros?.materiales?.[pedido.material_id]?.descripcion || "";
  const cantidad = Number.parseInt(String(pedido.cantidad ?? ""), 10);
  const cantidadTxt = Number.isFinite(cantidad) ? String(cantidad) : "";
  const partes = [descripcion, cliente, tipo, material, cantidadTxt ? `Cant. ${cantidadTxt}` : ""].filter(Boolean);
  if (partes.length) return partes.join(" | ");
  return pedido.numero || pedido.descripcion || String(pedido.id);
}

function getEtiquetaPedidoSelector(pedido) {
  if (!pedido) return "";
  const descripcion = (pedido.descripcion || "").trim();
  const cliente = DATOS?.maestros?.clientes?.[pedido.cliente_id]?.nombre || "";
  const tipo = DATOS?.fabricacion?.tipos_producto?.[pedido.tipo_producto_id]?.descripcion || "";
  const material = DATOS?.maestros?.materiales?.[pedido.material_id]?.descripcion || "";
  const cantidad = Number.parseInt(String(pedido.cantidad ?? ""), 10);
  const cantidadTxt = Number.isFinite(cantidad) ? `Cant. ${cantidad}` : "";
  const partes = [descripcion, cliente, tipo, material, cantidadTxt].filter(Boolean);
  if (partes.length) return partes.join(" | ");
  return pedido.numero || String(pedido.id);
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

function obtenerDerivadosPedidoFabricacion(pedidoId) {
  const pedido = DATOS?.fabricacion?.pedidos?.[pedidoId];
  if (!pedido) {
    return {
      tipo_producto_id: null,
      material_id: null,
    };
  }
  return {
    tipo_producto_id: pedido.tipo_producto_id ?? null,
    material_id: pedido.material_id ?? null,
  };
}

async function onPedidoCellEditedFabricacionSemanal(cell) {
  const tabla = cell.getTable();
  const row = cell.getRow();
  const actual = row.getData();
  const derivados = obtenerDerivadosPedidoFabricacion(actual.pedido_id);
  const cambios = Object.entries(derivados).filter(([campo, valor]) => actual[campo] !== valor);
  if (!cambios.length) return;

  tabla.__suppressCellEdited = true;
  try {
    await row.update(derivados);
  } finally {
    tabla.__suppressCellEdited = false;
  }

  const actualizado = row.getData();
  if (!actualizado?.id) return; // Fila nueva: se guarda al crear

  try {
    for (const [campo] of cambios) {
      const valor = actualizado[campo];
      const resultado = await wsRequest("modificar_maestro", {
        tabla: "fabricacion_semanal",
        id: actualizado.id,
        campo,
        valor,
        valores: actualizado,
      });
      if (resultado && Object.prototype.hasOwnProperty.call(resultado, "valor")) {
        const valorServidor = resultado.valor;
        if (valorServidor !== row.getData()[campo]) {
          tabla.__suppressCellEdited = true;
          try {
            await row.update({ [campo]: valorServidor });
          } finally {
            tabla.__suppressCellEdited = false;
          }
        }
      }
    }
  } catch (e) {
    console.error("Error al sincronizar campos derivados del pedido:", e);
    alert("No se pudieron guardar tipo/material/cantidad derivados del pedido.");
  }
}
