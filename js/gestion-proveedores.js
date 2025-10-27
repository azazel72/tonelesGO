// ====== CREAR VENTANA PROVEEDORES ======
function openProveedoresWin(el) {
  const KEY = "proveedores";
  const title = "Proveedores";
  const tablaBD = "proveedores";
  const columns = [
    { title:"ID", field:"id", width:70, hozAlign:"right", headerSort:false },
    { title:"Nombre", field:"name", editor:"input", editable:false, filtrable:true },
    CeldaAcciones,
  ];

  const options = {
    winbox: {
      x: 55,
      y: 55,
    }
  }
  return crearWinBox(KEY, title, tablaBD, columns, options);
}
