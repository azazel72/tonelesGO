// ====== CREAR VENTANA UBICACIONES ======
function openUbicacionesWin() {
  const configuracion = {
    KEY: "ubicaciones",
    winbox: {
      tipo: "generico",
      options: {
        title: "Ubicaciones",
        x: 265,
        y: 90,
      }
    },
    tabulator: {
      options: {
        columns: [
          { title:"ID", field:"id", width:70, hozAlign:"right", headerSort:false },
          { title:"Descripción", field:"descripcion", editor:"input", editable:false, filtrable:true  },
          { title:"Instalación", field:"instalacion_id", editable:false, filtrable:true,
            
            editor: "list",
            editorParams: {
              values: [{"id":"1", "nombre":"Instalación A"},{"id":"2", "nombre":"Instalación B"}],//Object.values(DATOS.maestros.instalaciones || {}),
              valueField: "id",
              labelField: "nombre",
              autocomplete: true,
              allowEmpty: true,
            },
            formatter: "lookup",
            formatterParams: {
              values: {"1": "Instalación A", "2": "Instalación B"}, // ejemplo estático
              // dinámico desde datos maestros
              
              values: Object.values(DATOS.maestros.instalaciones || {}).reduce((acc, instalacion) => {
                acc[instalacion.id] = instalacion.nombre;
                return acc;
              }, {}),
              valueField: "id",
              labelField: "nombre",
            },
          },
          { title:"Orden", field:"orden", editor:"input", editable:false, filtrable:true  },
          CeldaAcciones,
        ],
        data: Object.values(DATOS.maestros.ubicaciones || {}),
      },
    },
  }

  return crearVentana(configuracion);
}
