// ====== CREAR VENTANA STOCKS ======
function openStocksWin() {
  const wb = comprobarVentanaAbierta("stocks");
  if (wb) return wb;

  const tiposProductoDict = Object.values(DATOS?.fabricacion?.tipos_producto ?? {}).map(
    ({ id, descripcion, tipo, ...resto }) => ({
      ...resto,
      id,
      descripcion,
      tipo,
      value: id,
      label: `${tipo || ""} - ${descripcion || ""}`.trim(),
    })
  );

  const materialesDict = Object.values(DATOS?.maestros?.materiales ?? {}).map(
    ({ id, descripcion, ...resto }) => ({
      ...resto,
      id,
      descripcion,
      value: id,
      label: descripcion,
    })
  );

  const instalacionesDict = Object.values(DATOS?.maestros?.instalaciones ?? {}).map(
    ({ id, nombre, ...resto }) => ({
      ...resto,
      id,
      nombre,
      value: id,
      label: nombre,
    })
  );

  const estadosPaletsDict = Object.values(DATOS?.maestros?.estados_palets ?? {}).map(
    ({ id, descripcion, ...resto }) => ({
      ...resto,
      id,
      descripcion,
      value: id,
      label: descripcion,
    })
  );

  const configuracion = {
    KEY: "stocks",
    winbox: {
      tipo: "generico",
      options: {
        title: "Stocks",
        x: 160,
        y: 210,
      }
    },
    tabulator: {
      options: {
        editable: false,
        columns: [
          { title: "ID", field: "id", width: 70, hozAlign: "right" },
          {
            title: "Tipo producto",
            field: "tipo_producto",
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
            field: "id_material",
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
          {
            title: "Instalacion",
            field: "id_instalacion",
            editor: "list",
            editorParams: {
              values: instalacionesDict,
              clearable: true,
              autocomplete: true,
              allowEmpty: true,
              listOnEmpty: true,
              freetext: false,
            },
            editable: tablaEditable,
            cssClass: "filtrable",
            formatter: cell => DATOS?.maestros?.instalaciones?.[cell.getValue()]?.nombre ?? cell.getValue(),
          },
          { title: "Cantidad stock", field: "cantidad_stock", editor: "number", editable: tablaEditable, cssClass: "filtrable", hozAlign: "right" },
          { title: "Cantidad consumida", field: "cantidad_consumida", editor: "number", editable: tablaEditable, cssClass: "filtrable", hozAlign: "right" },
          {
            title: "Estado palets",
            field: "estado_palets",
            editor: "list",
            editorParams: {
              values: estadosPaletsDict,
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
          CeldaAcciones,
        ],
        data: Object.values(DATOS?.maestros?.stocks || {}),
      },
    },
  };

  return crearVentana(configuracion);
}
