
// ====== CREAR VENTANA TRAZABILIDAD PRODUCTO ======
function openTrazabilidadProductoWin() {
  if (!asegurarFabricacionCargada("trazabilidad_producto")) return null;

  const wb = comprobarVentanaAbierta("trazabilidad_producto");
  if (wb) return wb;

  const trazDict = Object.values(DATOS?.fabricacion?.trazabilidad_fabricacion ?? {}).map(
    ({ id, ...resto }) => ({
      ...resto, id,
      value: id,
      label: `Trazabilidad ${id}`,
    })
  );

  const productosDict = Object.values(DATOS?.maestros?.productos ?? {}).map(
    ({ id, codigo, ...resto }) => ({
      ...resto, id, codigo,
      value: id,
      label: codigo || String(id),
    })
  );

  const configuracion = {
    KEY: "trazabilidad_producto",
    data_key: "fabricacion",
    winbox: {
      tipo: "generico",
      options: {
        title: "Trazabilidad producto",
        x: 220,
        y: 240,
      }
    },
    tabulator: {
      options: {
        editable: false,
        columns: [
          { title:"ID", field:"id", width:70, hozAlign:"right"},
          {
            title: "Trazabilidad",
            field: "trazabilidad_fabricacion_id",
            editor: "list",
            editorParams: {
              values: trazDict,
              clearable: true,
              autocomplete: true,
              allowEmpty: true,
              listOnEmpty: true,
              freetext: false,
            },
            editable: tablaEditable,
            cssClass: "filtrable",
            formatter: cell => DATOS?.fabricacion?.trazabilidad_fabricacion?.[cell.getValue()]?.id ?? cell.getValue(),
          },
          {
            title: "Producto",
            field: "producto_id",
            editor: "list",
            editorParams: {
              values: productosDict,
              clearable: true,
              autocomplete: true,
              allowEmpty: true,
              listOnEmpty: true,
              freetext: false,
            },
            editable: tablaEditable,
            cssClass: "filtrable",
            formatter: cell => DATOS?.maestros?.productos?.[cell.getValue()]?.codigo ?? cell.getValue(),
          },
          CeldaAcciones,
        ],
        data: Object.values(DATOS.fabricacion.trazabilidad_producto || {}),
      },
    },
  };

  return crearVentana(configuracion);
}
