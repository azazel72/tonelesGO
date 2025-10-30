// ====== CREAR VENTANA UBICACIONES ======
function openUbicacionesWin(el) {
  const KEY = "ubicaciones";
  const title = "Ubicaciones";
  const tablaBD = "ubicaciones";
  const columns = [
      { title:"ID", field:"id", width:70, hozAlign:"right", headerSort:false },
      { title:"Descripción", field:"descripcion", editor:"input", editable:false, filtrable:true  },
      { title:"Instalación", field:"instalacion_id", editable:false, filtrable:true,
        editor: "list",
        editorParams: {
          valuesURL: `${BASE}?table=instalaciones&all=1`, // la API debe devolver un JSON con pares clave/valor
          valueField: "data.id",
          labelField: "data.nombre"
        },
        formatter: "lookup",
        formatterParams: async () => {
          const res = await fetch(`${BASE}?table=instalaciones&all=1`);
          const data = await res.json();
          return Object.fromEntries(data.data.map(c => [c.id, c.nombre]));
        }        
      },
      { title:"Orden", field:"orden", editor:"input", editable:false, filtrable:true  },
      CeldaAcciones,
    ];
  const options = {
    winbox: {
      x: 265,
      y: 90,
    }
  }
  return crearWinBox(KEY, title, tablaBD, columns, options);
}
