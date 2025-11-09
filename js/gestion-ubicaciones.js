// ====== CREAR VENTANA UBICACIONES ======
function openUbicacionesWin() {
  const wb = comprobarVentanaAbierta("ubicaciones");
  if (wb) return wb;

  const instalacionesDict = Object.values(DATOS?.maestros?.instalaciones ?? {}).map(
    ({ id, nombre, ...resto }) => ({
      ...resto, id, nombre,
      value: id,
      label: nombre,
    })
  );

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
          { title:"Descripción", field:"descripcion", editor:"input", cssClass: "filtrable", },
          {
            title: "Instalación",
            field: "instalacion_id",
            editor: "list",
            editorParams: {
              values: instalacionesDict,
              clearable:true,
              autocomplete: true,
              allowEmpty: true,
              listOnEmpty: true,
              freetext: false,
              itemFormatter:function(label, value, item, element){
                return "<strong>" + label + " </strong><br/><div>" + item.tipo + "</div>";
              },
            },
            formatter: cell => DATOS?.maestros?.instalaciones[cell.getValue()]?.nombre ?? cell.getValue(),
          },
          { title:"Orden", field:"orden", editor:"input", cssClass: "filtrable", },
          CeldaAcciones,
        ],
        data: Object.values(DATOS.maestros.ubicaciones || {}),
      },
    },
  }

  return crearVentana(configuracion);
}
