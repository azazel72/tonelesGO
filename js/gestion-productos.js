
// ====== CREAR VENTANA PRODUCTOS ======
function openProductosWin() {
  const wb = comprobarVentanaAbierta("productos");
  if (wb) return wb;

  const tipos = [
    { value: "FONDO", label: "FONDO" },
    { value: "VASO", label: "VASO" },
    { value: "BOTA", label: "BOTA" },
    { value: "FLEJE", label: "FLEJE" },
  ];

  const materialesDict = Object.values(DATOS?.maestros?.materiales ?? {}).map(
    ({ id, descripcion, ...resto }) => ({
      ...resto, id, descripcion,
      value: id,
      label: descripcion,
    })
  );

  const configuracion = {
    KEY: "productos",
    winbox: {
      tipo: "generico",
      options: {
        title: "Productos",
        x: 150,
        y: 220,
      }
    },
    tabulator: {
      options: {
        editable: false,
        columns: [
          { title:"ID", field:"id", width:70, hozAlign:"right"},
          {
            title:"Tipo",
            field:"tipo",
            editor:"list",
            editorParams: {
              values: tipos,
              clearable: true,
              autocomplete: true,
              allowEmpty: true,
              listOnEmpty: true,
              freetext: false,
            },
            editable: tablaEditable,
            cssClass: "filtrable",
          },
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
          { title:"Produccion", field:"produccion_id", editor:"number", editable: tablaEditable, cssClass: "filtrable", hozAlign:"right" },
          CeldaAcciones,
        ],
        data: Object.values(DATOS.maestros.productos || {}),
      },
    },
  };

  return crearVentana(configuracion);
}
