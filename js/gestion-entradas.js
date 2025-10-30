// ====== CREAR VENTANA ENTRADAS ======
function openEntradasWin(el) {
  const KEY = "entradas";
  const title = "Entradas";
  const tablaBD = "entradas";
  const columns = [
      { title:"ID", field:"id", width:70, hozAlign:"right", headerSort:false },
      { title:"Descripción", field:"descripcion", editor:"input", editable:false, filtrable:true  },
      { title:"Instalación", field:"instalacion", editor:"input", editable:false, filtrable:true  },
      { title:"Orden", field:"orden", editor:"input", editable:false, filtrable:true  },
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
