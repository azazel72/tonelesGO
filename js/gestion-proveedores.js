// ====== CREAR VENTANA PROVEEDORES ======
function openProveedoresWin(el) {
  const KEY = "proveedores";
  const title = "Proveedores";
  
  const columns = [
    { title:"ID", field:"id", width:70, hozAlign:"right", headerSort:false },
    { title:"Nombre", field:"nombre", editor:"input", editable:false, filtrable:true },
    CeldaAcciones,
  ];

  const options = {
    winbox: {
      x: 55,
      y: 55,
    }
  }
  var datos = Object.values(DATOS.maestros.proveedores || {});
  return crearVentana(KEY, title, columns, datos, options);
}
