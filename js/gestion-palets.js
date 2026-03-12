
// ====== CREAR VENTANA PALETS ======
function openPaletsWin() {
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

  const duelasDict = Object.values(DATOS?.maestros?.duelas ?? {}).map(
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
            title: "Tipo duela",
            field: "duela_tipo_id",
            editor: "list",
            editorParams: {
              values: duelasDict,
              clearable: true,
              autocomplete: true,
              allowEmpty: true,
              listOnEmpty: true,
              freetext: false,
            },
            editable: tablaEditable,
            cssClass: "filtrable",
            formatter: cell => DATOS?.maestros?.duelas?.[cell.getValue()]?.descripcion ?? cell.getValue(),
          },
          {
            title: "Tipo producto",
            field: "tipo_producto_id",
            editable: false,
            cssClass: "filtrable",
            formatter: cell => DATOS?.fabricacion?.tipos_producto?.[cell.getValue()]?.descripcion ?? cell.getValue(),
          },
          {
            title: "Material",
            field: "material_id",
            editable: false,
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
