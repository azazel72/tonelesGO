// ====== CREAR VENTANA INSTALACIONES ======
function openInstalacionesWin(el) {
  const KEY = "instalaciones";
  const title = "Instalaciones";
  const tablaBD = "instalaciones";
  const columns = [
      { title:"ID", field:"id", width:70, hozAlign:"right", headerSort:false },
      { title:"Nombre", field:"nombre", editor:"input", editable:false, filtrable:true  },
      CeldaAcciones,
    ];
  const options = {
    winbox: {
      x: 210,
      y: 35,
    }
  }
  return crearWinBox(KEY, title, tablaBD, columns, options);
}
