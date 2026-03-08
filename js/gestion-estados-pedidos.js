// ====== CREAR VENTANA ESTADOS PEDIDOS ======
function openEstadosPedidosWin() {
  const wb = comprobarVentanaAbierta("estados_pedidos");
  if (wb) return wb;

  const configuracion = {
    KEY: "estados_pedidos",
    winbox: {
      tipo: "generico",
      options: {
        title: "Estados pedidos",
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
        data: Object.values(DATOS.maestros.estados_pedidos || {}),
      },
    },
  }

  return crearVentana(configuracion);
}
