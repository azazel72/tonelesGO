
// ====== CREAR VENTANA LINEAS DE PEDIDO ======
function openLineasPedidoWin() {
  const wb = comprobarVentanaAbierta("lineas_pedido");
  if (wb) return wb;

  const pedidosDict = Object.values(DATOS?.maestros?.pedidos ?? {}).map(
    ({ id, numero, ...resto }) => ({
      ...resto, id, numero,
      value: id,
      label: numero,
    })
  );

  const duelasDict = Object.values(DATOS?.maestros?.duelas ?? {}).map(
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
    KEY: "lineas_pedido",
    winbox: {
      tipo: "generico",
      options: {
        title: "Lineas de pedido",
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
            title: "Pedido",
            field: "pedido_id",
            editor: "list",
            editorParams: {
              values: pedidosDict,
              clearable: true,
              autocomplete: true,
              allowEmpty: true,
              listOnEmpty: true,
              freetext: false,
            },
            editable: tablaEditable,
            cssClass: "filtrable",
            formatter: cell => DATOS?.maestros?.pedidos?.[cell.getValue()]?.numero ?? cell.getValue(),
          },
          {
            title: "Duela",
            field: "duela_id",
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
          { title:"Bultos", field:"bultos", editor:"number", editable: tablaEditable, cssClass: "filtrable", hozAlign:"right" },
          { title:"Kilos", field:"kilos", editor:"number", editable: tablaEditable, cssClass: "filtrable", hozAlign:"right" },
          { title:"Bultos entregados", field:"bultos_entregados", editor:"number", editable: tablaEditable, cssClass: "filtrable", hozAlign:"right" },
          { title:"Verificado", field:"verificado", ...parametros_check },
          CeldaAcciones,
        ],
        data: Object.values(DATOS.maestros.lineas_pedido || {}),
      },
    },
  };

  return crearVentana(configuracion);
}
