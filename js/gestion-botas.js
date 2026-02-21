
// ====== CREAR VENTANA BOTAS ======
function openBotasWin() {
  if (!asegurarFabricacionCargada("botas")) return null;

  const wb = comprobarVentanaAbierta("botas");
  if (wb) return wb;

  const productosDict = Object.values(DATOS?.maestros?.productos ?? {}).map(
    ({ id, codigo, ...resto }) => ({
      ...resto, id, codigo,
      value: id,
      label: codigo || String(id),
    })
  );

  const estadosDict = Object.values(DATOS?.maestros?.estados_botas ?? {}).map(
    ({ id, descripcion, ...resto }) => ({
      ...resto, id, descripcion,
      value: id,
      label: descripcion,
    })
  );

  const configuracion = {
    KEY: "botas",
    data_key: "fabricacion",
    winbox: {
      tipo: "generico",
      options: {
        title: "Botas",
        x: 240,
        y: 260,
      }
    },
    tabulator: {
      options: {
        editable: false,
        columns: [
          { title:"ID", field:"id", width:70, hozAlign:"right"},
          { title:"Codigo", field:"codigo", editor:"input", editable: tablaEditable, cssClass: "filtrable" },
          {
            title: "Vaso",
            field: "vaso_producto_id",
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
          {
            title: "Fondo",
            field: "fondo_producto_id",
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
          {
            title: "Tapa",
            field: "tapa_producto_id",
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
            formatter: cell => DATOS?.maestros?.estados_botas?.[cell.getValue()]?.descripcion ?? cell.getValue(),
          },
          CeldaAcciones,
        ],
        data: Object.values(DATOS.fabricacion.botas || {}),
      },
    },
  };

  return crearVentana(configuracion);
}
