
// ====== CREAR VENTANA ARCHIVOS SUBIDOS ======
function openArchivosSubidosWin() {
  const wb = comprobarVentanaAbierta("archivos_subidos");
  if (wb) return wb;

  const configuracion = {
    KEY: "archivos_subidos",
    winbox: {
      tipo: "generico",
      options: {
        title: "Archivos subidos",
        x: 0,
        y: 120,
      }
    },
    tabulator: {
      options: {
        editable: false,
        columns: [
          { title:"ID", field:"id", width:70, hozAlign:"right"},
          { title:"Titulo", field:"titulo", editor:"input", editable: tablaEditable, cssClass: "filtrable" },
          { title:"Nombre original", field:"nombre_original", cssClass: "filtrable" },
          { title:"Nombre archivo", field:"nombre_archivo" },
          { title:"Extension", field:"extension", width:90 },
          { title:"Entidad", field:"entidad", cssClass: "filtrable" },
          { title:"Entidad ID", field:"entidad_id", hozAlign:"right", width:110 },
          CeldaAcciones,
        ],
        data: Object.values(DATOS.maestros.archivos_subidos || {}),
      },
    },
  };

  return crearVentana(configuracion);
}
