// ====== CREAR VENTANA USUARIOS ======
function openUsuariosWin() {
  const wb = comprobarVentanaAbierta("usuarios");
  if (wb) return wb;

  const parametros_check = {
    hozAlign: "center",
    formatter: "tickCross",
    editor: "tickCross",
    editable: tablaEditable,
    cssClass: "filtrable",
  };

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
          { title:"ID", field:"id", width:70, hozAlign:"right"},
          {
            title:"Codigo",
            field:"codigo",
            editor:"input",
            editable: tablaEditable,
            cssClass: "filtrable",
            validator: [
              {
                type: function(cell, value) {
                  const v = (value ?? "").toString().trim();
                  return v === "" || /^\d{1,2}$/.test(v);
                },
                parameters: {},
              },
            ],
            mutatorEdit: (value) => (value ?? "").toString().trim().slice(0, 2),
          },
          { title:"Alias", field:"alias", editor:"input", editable: tablaEditable, cssClass: "filtrable", },
          { title:"Nombre", field:"nombre", editor:"input", editable: tablaEditable, cssClass: "filtrable", },
          { title:"Activo", field:"activo", ...parametros_check },
          {
            title:"Clave *",
            field:"clave",
            editor:"input",
            editorParams: {
              elementAttributes: {
                type: "password",
                autocomplete: "new-password",
              },
            },
            formatter: () => "••••••••",
            validator: [
              {
                type: function(cell, value) {
                  return (value ?? "").toString().trim() !== "";
                },
                parameters: {},
              },
            ],
            editable: tablaEditable,
          },
          { title: "Rol *",
            field: "rol_id",
            editor: "list",
            editorParams: {
              values: rolesDict,
              clearable:false,
              autocomplete: true,
              allowEmpty: false,
              listOnEmpty: true,
              freetext: false,
            },
            validator: [
              {
                type: function(cell, value) {
                  return value !== null && value !== undefined && `${value}`.trim() !== "";
                },
                parameters: {},
              },
            ],
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
