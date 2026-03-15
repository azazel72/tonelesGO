
// ====== CREAR VENTANA PALETS ======
function openPaletsWin() {
  if (!asegurarFabricacionCargada("tipos_producto", "palets")) return null;
  const wb = comprobarVentanaAbierta("palets");
  if (wb) return wb;

  const lineasDict = Object.values(DATOS?.maestros?.lineas_entrada ?? {}).map(
    ({ id, ...resto }) => ({
      ...resto, id,
      value: id,
      label: id,
    })
  );

  const ubicacionesDict = Object.values(DATOS?.maestros?.ubicaciones ?? {}).map(
    ({ id, descripcion, ...resto }) => ({
      ...resto, id, descripcion,
      value: id,
      label: descripcion,
    })
  );

  const tiposProductoDict = Object.values(DATOS?.fabricacion?.tipos_producto ?? {})
    .filter((tipo) => String(tipo?.tipo || "").toUpperCase() === "DUELA")
    .map(({ id, descripcion, codigo, ...resto }) => ({
      ...resto, id, descripcion, codigo,
      value: id,
      label: descripcion || codigo || String(id),
    }));

  const materialesDict = Object.values(DATOS?.maestros?.materiales ?? {}).map(
    ({ id, descripcion, ...resto }) => ({
      ...resto, id, descripcion,
      value: id,
      label: descripcion,
    })
  );

  const estadosDict = Object.values(DATOS?.maestros?.estados_palets ?? {}).map(
    ({ id, descripcion, ...resto }) => ({
      ...resto, id, descripcion,
      value: id,
      label: descripcion,
    })
  );

  const parametros_check = {
    hozAlign: "center",
    formatter: "tickCross",
    editor: "tickCross",
    editable: tablaEditable,
    cssClass: "filtrable",
  };

  const configuracion = {
    KEY: "palets",
    winbox: {
      tipo: "generico",
      options: {
        title: "Palets",
        x: 120,
        y: 200,
      }
    },
    tabulator: {
      options: {
        editable: false,
        columns: [
          { title:"ID", field:"id", width:70, hozAlign:"right"},
          { title:"Codigo", field:"codigo", editor:"input", editable: tablaEditable, cssClass: "filtrable" },
          {
            title: "Linea entrada",
            field: "linea_entrada_id",
            editor: "list",
            editorParams: {
              values: lineasDict,
              clearable: true,
              autocomplete: true,
              allowEmpty: true,
              listOnEmpty: true,
              freetext: false,
            },
            editable: tablaEditable,
            cssClass: "filtrable",
            formatter: cell => DATOS?.maestros?.lineas_entrada?.[cell.getValue()]?.id ?? cell.getValue(),
          },
          {
            title: "Ubicacion",
            field: "ubicacion_id",
            editor: "list",
            editorParams: {
              values: ubicacionesDict,
              clearable: true,
              autocomplete: true,
              allowEmpty: true,
              listOnEmpty: true,
              freetext: false,
            },
            editable: tablaEditable,
            cssClass: "filtrable",
            formatter: cell => DATOS?.maestros?.ubicaciones?.[cell.getValue()]?.descripcion ?? cell.getValue(),
          },
          {
            title: "Tipo producto",
            field: "tipo_producto_id",
            editor: "list",
            editorParams: {
              values: tiposProductoDict,
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
          { title:"Cubicaje", field:"cubicaje", editor:"number", editable: tablaEditable, cssClass: "filtrable", hozAlign:"right" },
          { title:"Consumido", field:"consumido", editor:"number", editable: tablaEditable, cssClass: "filtrable", hozAlign:"right" },
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
            formatter: cell => DATOS?.maestros?.estados_palets?.[cell.getValue()]?.descripcion ?? cell.getValue(),
          },
          { title:"Procesado", field:"procesado", ...parametros_check },
          CeldaAcciones,
        ],
        data: Object.values(DATOS.maestros.palets || {}),
      },
    },
  };

  return crearVentana(configuracion);
}
