
// ====== CREAR VENTANA LINEAS DE ENTRADA ======
function openLineasEntradaWin() {
  if (!asegurarFabricacionCargada("tipos_producto", "lineas_entrada")) return null;
  const wb = comprobarVentanaAbierta("lineas_entrada");
  if (wb) return wb;

  const entradasDict = Object.values(DATOS?.maestros?.entradas ?? {}).map(
    ({ id, numero, ...resto }) => ({
      ...resto, id, numero,
      value: id,
      label: numero,
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

  const parametros_check = {
    hozAlign: "center",
    formatter: "tickCross",
    editor: "tickCross",
    editable: tablaEditable,
    cssClass: "filtrable",
  };

  const configuracion = {
    KEY: "lineas_entrada",
    winbox: {
      tipo: "generico",
      options: {
        title: "Lineas de entrada",
        x: 90,
        y: 180,
      }
    },
    tabulator: {
      options: {
        editable: false,
        columns: [
          { title:"ID", field:"id", width:70, hozAlign:"right"},
          {
            title: "Entrada",
            field: "entrada_id",
            editor: "list",
            editorParams: {
              values: entradasDict,
              clearable: true,
              autocomplete: true,
              allowEmpty: true,
              listOnEmpty: true,
              freetext: false,
            },
            editable: tablaEditable,
            cssClass: "filtrable",
            formatter: cell => DATOS?.maestros?.entradas?.[cell.getValue()]?.numero ?? cell.getValue(),
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
          { title:"Bultos", field:"bultos", editor:"number", editable: tablaEditable, cssClass: "filtrable", hozAlign:"right" },
          { title:"Kilos", field:"kilos", editor:"number", editable: tablaEditable, cssClass: "filtrable", hozAlign:"right" },
          { title:"Bultos entregados", field:"bultos_entregados", editor:"number", editable: tablaEditable, cssClass: "filtrable", hozAlign:"right" },
          { title:"Verificado", field:"verificado", ...parametros_check },
          CeldaAcciones,
        ],
        data: Object.values(DATOS.maestros.lineas_entrada || {}),
      },
    },
  };

  return crearVentana(configuracion);
}
