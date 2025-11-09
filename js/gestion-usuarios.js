// ====== CREAR VENTANA USUARIOS ======
function openUsuariosWin() {
  const wb = comprobarVentanaAbierta("usuarios");
  if (wb) return wb;

  const configuracion = {
    KEY: "usuarios",
    winbox: {
      tipo: "generico",
      options: {
        title: "Usuarios",
        x: 1,
        y: 1,
      }
    },
    tabulator: {
      options: {
        columns: [
          { title:"ID", field:"id", width:70, hozAlign:"right", headerSort:false },
          { title:"Alias", field:"username", editor:"input", editable:false, cssClass: "filtrable", },
          { title:"Nombre", field:"fullname", editor:"input", editable:false, cssClass: "filtrable", },
          { title:"Rol", field:"role", editor:"input", editable:false, cssClass: "filtrable", },
          CeldaAcciones,
        ],
        data: Object.values(DATOS.maestros.usuarios || {}),
      },
    },
  }

  return crearVentana(configuracion);
}
