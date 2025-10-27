// ====== CREAR VENTANA ESTADOS ======
function openEstadosWin(el) {
  const KEY = "estados";
  const title = "Estados";
  const tablaBD = "estados";
  const columns = [
      { title:"ID", field:"id", width:70, hozAlign:"right", headerSort:false },
      { title:"Nombre", field:"descripcion", editor:"input", editable:false, filtrable:true  },
      CeldaAcciones,
    ];
  const options = {
    winbox: {
      x: 265,
      y: 80,
    }
  }
  return crearWinBox(KEY, title, tablaBD, columns, options);
}
