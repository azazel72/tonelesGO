// ====== CREAR VENTANA CLIENTES ======
function openClientesWin(el) {
  const KEY = "clientes";
  const title = "Clientes";
  
  const columns = [
      { title:"ID", field:"id", width:70, hozAlign:"right", headerSort:false },
      { title:"Nombre", field:"nombre", editor:"input", editable: false, filtrable:true },
      CeldaAcciones,
    ];
  const options = {
    winbox: {
      x: 110,
      y: 110,
    }
  }
  var datos = Object.values(DATOS.maestros.clientes || {});
  return crearVentana(KEY, title, columns, datos, options);

}
