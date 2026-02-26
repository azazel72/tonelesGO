
// ====== CREAR VENTANA DUELAS ======
function openDuelasWin() {
  if (!asegurarFabricacionCargada("tipos_producto", "duelas")) return null;

  const wb = comprobarVentanaAbierta("duelas");
  if (wb) return wb;

  const materialesDict = Object.values(DATOS?.maestros?.materiales ?? {}).map(
    ({ id, descripcion, ...resto }) => ({
      ...resto, id, descripcion,
      value: id,
      label: descripcion,
    })
  );
  const tiposProductoDuelaDict = Object.values(DATOS?.fabricacion?.tipos_producto ?? {})
    .filter((tp) => String(tp?.tipo || "").toUpperCase() === "DUELA")
    .map(
      ({ id, descripcion, codigo, ...resto }) => ({
        ...resto, id, descripcion, codigo,
        value: id,
        label: descripcion || codigo || String(id),
      })
    );

  const configuracion = {
    KEY: "duelas",
    winbox: {
      tipo: "generico",
      options: {
        title: "Duelas",
        x: 30,
        y: 140,
      }
    },
    tabulator: {
      options: {
        editable: false,
        columns: [
          { title:"ID", field:"id", width:70, hozAlign:"right"},
          { title:"Descripcion", field:"descripcion", editor:"input", editable: tablaEditable, cssClass: "filtrable" },
          {
            title: "Material",
            field: "material_id",
            editor: "list",
            editorParams: {
              values: materialesDict,
              clearable: true,
              autocomplete: true,
              allowEmpty: true,
              listOnEmpty: true,
              freetext: false,
            },
            editable: tablaEditable,
            cssClass: "filtrable",
            formatter: cell => DATOS?.maestros?.materiales?.[cell.getValue()]?.descripcion ?? cell.getValue(),
          },
          {
            title: "Tipo producto",
            field: "tipo_producto_id",
            editor: "list",
            editorParams: {
              values: tiposProductoDuelaDict,
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
          CeldaAcciones,
        ],
        data: Object.values(DATOS.maestros.duelas || {}),
      },
    },
  };

  return crearVentana(configuracion);
}
