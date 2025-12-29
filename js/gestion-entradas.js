
// ====== CREAR VENTANA ENTRADAS ======
function openEntradasWin() {
  const wb = comprobarVentanaAbierta("entradas");
  if (wb) return wb;

  const proveedoresDict = Object.values(DATOS?.maestros?.proveedores ?? {}).map(
    ({ id, nombre, ...resto }) => ({
      ...resto, id, nombre,
      value: id,
      label: nombre,
    })
  );

  const parametros_check = {
    hozAlign: "center",
    formatter: "tickCross",
    editor: "tickCross",
    editable: tablaEditable,
    cssClass: "filtrable",
  };

  const configuracion = {
    KEY: "entradas",
    winbox: {
      tipo: "generico",
      options: {
        title: "Entradas",
        x: 60,
        y: 160,
      }
    },
    tabulator: {
      options: {
        editable: false,
        columns: [
          { title:"ID", field:"id", width:70, hozAlign:"right"},
          { title:"Numero", field:"numero", editor:"input", editable: tablaEditable, cssClass: "filtrable" },
          {
            title: "Proveedor",
            field: "proveedor_id",
            editor: "list",
            editorParams: {
              values: proveedoresDict,
              clearable: true,
              autocomplete: true,
              allowEmpty: true,
              listOnEmpty: true,
              freetext: false,
            },
            editable: tablaEditable,
            cssClass: "filtrable",
            formatter: cell => DATOS?.maestros?.proveedores?.[cell.getValue()]?.nombre ?? cell.getValue(),
          },
          {
            title:"Fecha",
            field:"fecha",
            editor:"input",
            editorParams: {
              elementAttributes: { type: "date" },
            },
            editable: tablaEditable,
            cssClass: "filtrable",
          },
          { title:"Entregado", field:"entregado", ...parametros_check },
          { title:"Anulado", field:"anulado", ...parametros_check },
          CeldaAcciones,
        ],
        data: Object.values(DATOS.maestros.entradas || {}),
      },
    },
  };

  return crearVentana(configuracion);
}
