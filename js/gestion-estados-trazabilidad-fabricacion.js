// ====== CREAR VENTANA ESTADOS TRAZABILIDAD FABRICACION ======
function openEstadosTrazabilidadFabricacionWin() {
  const wb = comprobarVentanaAbierta("estados_trazabilidad_fabricacion");
  if (wb) return wb;

  const configuracion = {
    KEY: "estados_trazabilidad_fabricacion",
    winbox: {
      tipo: "generico",
      options: {
        title: "Estados trazabilidad fabricación",
        x: 265,
        y: 80,
      }
    },
    tabulator: {
      options: {
        editable: false,
        columns: [
          { title:"ID", field:"id", width:70, hozAlign:"right"},
          { title:"Descripción", field:"descripcion", editor:"input", editable: tablaEditable, cssClass: "filtrable", },
          CeldaAcciones,
        ],
        data: Object.values(DATOS.maestros.estados_trazabilidad_fabricacion || {}),
      },
    },
  }

  return crearVentana(configuracion);
}
