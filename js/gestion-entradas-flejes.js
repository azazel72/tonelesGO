// ====== CREAR VENTANA ENTRADAS FLEJES ======
function openEntradasFlejesWin() {
  if (!asegurarFabricacionCargada("tipos_producto", "entradas_flejes")) return null;

  const wb = comprobarVentanaAbierta("entradas_flejes");
  if (wb) return wb;

  const tiposProductoDict = Object.values(DATOS?.fabricacion?.tipos_producto ?? {})
    .filter((tp) => String(tp?.tipo || "").toUpperCase() === "FLEJE")
    .map(
    ({ id, descripcion, codigo, ...resto }) => ({
      ...resto, id, descripcion, codigo,
      value: id,
      label: descripcion || codigo || String(id),
    })
  );

  const configuracion = {
    KEY: "entradas_flejes",
    winbox: {
      tipo: "generico",
      options: {
        title: "Entradas flejes",
        x: 230,
        y: 150,
      }
    },
    tabulator: {
      options: {
        editable: false,
        columns: [
          { title:"ID", field:"id", width:70, hozAlign:"right"},
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
          {
            title: "Tipo producto",
            field: "tipo_producto_id",
            editor: "list",
            editorParams: {
              values: tiposProductoDict,
              clearable: true,
              autocomplete: true,
              allowEmpty: true,
              listOnEmpty: true,
              freetext: false,
            },
            editable: tablaEditable,
            cssClass: "filtrable",
            formatter: cell => DATOS?.fabricacion?.tipos_producto?.[cell.getValue()]?.descripcion ?? cell.getValue(),
          },
          { title:"Lote", field:"lote", editor:"input", editable: tablaEditable, cssClass: "filtrable" },
          { title:"Peso", field:"peso", editor:"number", editable: tablaEditable, cssClass: "filtrable", hozAlign:"right" },
          { title:"Consumido", field:"consumido", editor:"number", editable: tablaEditable, cssClass: "filtrable", hozAlign:"right" },
          { title:"Estado", field:"estado", editor:"number", editable: tablaEditable, cssClass: "filtrable", hozAlign:"right" },
          CeldaAcciones,
        ],
        data: Object.values(DATOS.maestros.entradas_flejes || {}),
      },
    },
  };

  return crearVentana(configuracion);
}
