// ====== CREAR VENTANA USUARIOS ======
function openUsuariosWin() {
  const wb = comprobarVentanaAbierta("usuarios");
  if (wb) return wb;

  const rolesDict = Object.values(DATOS?.maestros?.roles ?? {}).map(
    ({ id, nombre, ...resto }) => ({
      ...resto, id, nombre,
      value: id,
      label: nombre,
    })
  );

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
        editable: false,
        columns: [
          { title:"ID", field:"id", width:70, hozAlign:"right", headerSort:false },
          { title:"Alias", field:"alias", editor:"input", editable: tablaEditable, cssClass: "filtrable", },
          { title:"Nombre", field:"nombre", editor:"input", editable: tablaEditable, cssClass: "filtrable", },
          { title: "Rol",
            field: "rol_id",
            editor: "list",
            editorParams: {
              values: rolesDict,
              clearable:true,
              autocomplete: true,
              allowEmpty: true,
              listOnEmpty: true,
              freetext: false,
            },
            editable: tablaEditable,
            cssClass: "filtrable",
            formatter: cell => DATOS?.maestros?.roles[cell.getValue()]?.nombre ?? cell.getValue(),
          },
          CeldaAcciones,
        ],
        data: Object.values(DATOS.maestros.usuarios || {}),
      },
    },
  }

  return crearVentana(configuracion);
}
