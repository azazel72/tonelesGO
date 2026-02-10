// ====== CREAR VENTANA PUESTOS DE TRABAJO ======
function openPuestosTrabajoWin() {
  const wb = comprobarVentanaAbierta("puestos_trabajo");
  if (wb) return wb;

  const parametros_check = {
    hozAlign: "center",
    formatter: "tickCross",
    editor: "tickCross",
    editorParams: {
      //tristate: false,
    },
    editable: tablaEditable,
    cssClass: "filtrable",
  }

  const configuracion = {
    KEY: "puestos_trabajo",
    winbox: {
      tipo: "generico",
      options: {
        title: "Puestos de trabajo",
        x: 265,
        y: 80,
      }
    },
    tabulator: {
      options: {
        editable: false,
        columns: [
          { title:"ID", field:"id", width:70, hozAlign:"right"},
          { title:"Nombre", field:"nombre", editor:"input", editable: tablaEditable, cssClass: "filtrable", },
          { title:"Es maquinaria", field:"es_maquinaria", ...parametros_check},
          { title:"Fabricación", field:"fabricacion", ...parametros_check},
          CeldaAcciones,
        ],
        data: Object.values(DATOS.maestros.puestos_trabajo || {}),
      },
    },
  }

  return crearVentana(configuracion);  

}
