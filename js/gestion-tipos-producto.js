
// ====== CREAR VENTANA TIPOS PRODUCTO ======
function openTiposProductoWin() {
  if (!asegurarFabricacionCargada("tipos_producto")) return null;

  const wb = comprobarVentanaAbierta("tipos_producto");
  if (wb) return wb;

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
          { title:"Codigo", field:"codigo", editor:"input", editable: tablaEditable, cssClass: "filtrable" },
          { title:"Descripcion", field:"descripcion", editor:"input", editable: tablaEditable, cssClass: "filtrable" },
          { title:"Consumo", field:"consumo", editor:"number", editable: tablaEditable, cssClass: "filtrable", hozAlign:"right" },
          CeldaAcciones,
        ],
        data: Object.values(DATOS.fabricacion.tipos_producto || {}),
      },
    },
  };

  return crearVentana(configuracion);
}
