
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

  const materialesDict = Object.values(DATOS?.maestros?.materiales ?? {}).map(
    ({ id, descripcion, ...resto }) => ({
      ...resto, id, descripcion,
      value: id,
      label: descripcion,
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
            title: "Fleje 1",
            field: "fleje_1_id",
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
            title: "Fleje 2",
            field: "fleje_2_id",
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
            title: "Fleje 3",
            field: "fleje_3_id",
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
            title: "Fleje 4",
            field: "fleje_4_id",
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
            title: "Fleje 5",
            field: "fleje_5_id",
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
