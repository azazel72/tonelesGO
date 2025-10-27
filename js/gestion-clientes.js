// ====== CREAR VENTANA CLIENTES ======
function openClientesWin(el) {
  const KEY = "clientes";
  const title = "Clientes";
  const tablaBD = "clientes";
  const columns = [
      { title:"ID", field:"id", width:70, hozAlign:"right", headerSort:false },
      { title:"Nombre", field:"name", editor:"input", editable: false, filtrable:true },
      CeldaAcciones,
    ];
  const options = {
    winbox: {
      x: 110,
      y: 110,
    }
  }
  return crearWinBox(KEY, title, tablaBD, columns, options);
}
