
// ====== CREAR VENTANA TIPOS PRODUCTO ======
function openTiposProductoWin() {
  if (!asegurarFabricacionCargada("tipos_producto")) return null;

  const wb = comprobarVentanaAbierta("tipos_producto");
  if (wb) return wb;

  const tipos = [
    { value: "FONDO", label: "FONDO" },
    { value: "VASO", label: "VASO" },
    { value: "BOTA", label: "BOTA" },
    { value: "FLEJE", label: "FLEJE" },
    { value: "DUELA", label: "DUELA" },
  ];

  const configuracion = {
    KEY: "tipos_producto",
    data_key: "fabricacion",
    winbox: {
      tipo: "generico",
      options: {
        title: "Tipos de producto",
        x: 140,
        y: 160,
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
          { title:"Descripcion", field:"descripcion", editor:"input", editable: tablaEditable, cssClass: "filtrable" },
          CeldaAcciones,
        ],
        data: Object.values(DATOS.fabricacion.tipos_producto || {}),
      },
    },
  };

  return crearVentana(configuracion);
}
