// ====== CREAR VENTANA USUARIOS ======
function openUsuariosWin(el) {
  const KEY = "usuarios";
  const title = "Usuarios";
  const tablaBD = "usuarios";
  const columns = [
      { title:"ID", field:"id", width:70, hozAlign:"right", headerSort:false },
      { title:"Alias", field:"username", editor:"input", editable:false, filtrable:true },
      { title:"Nombre", field:"fullname", editor:"input", editable:false, filtrable:true },
      { title:"Rol", field:"role", editor:"input", editable:false, filtrable:true },
      CeldaAcciones,
    ];

  const options = {
    winbox: {
      x: 1,
      y: 1,
    }
  }
  return crearWinBox(KEY, title, tablaBD, columns, options);
}
