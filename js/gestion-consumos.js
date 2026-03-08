// ====== CREAR VENTANA CONSUMOS ======
function openConsumosWin() {
  if (!asegurarFabricacionCargada("consumos")) return null;
  if (!asegurarFabricacionCargada("tipos_producto", "consumos")) return null;

  const wb = comprobarVentanaAbierta("consumos");
  if (wb) return wb;

  const tiposProducto = Object.values(DATOS?.fabricacion?.tipos_producto ?? {});

  const botasDict = tiposProducto
    .filter((tp) => ["BOTA", "FONDO"].includes(String(tp?.tipo || "").toUpperCase()))
    .map(({ id, descripcion, codigo, ...resto }) => ({
      ...resto,
      id,
      descripcion,
      codigo,
      value: id,
      label: descripcion || codigo || String(id),
    }));

  const consumiblesDict = tiposProducto
    .filter((tp) => ["FONDO", "FLEJE", "DUELA"].includes(String(tp?.tipo || "").toUpperCase()))
    .map((tp) => ({
      ...tp,
      value: tp.id,
      label: `${tpLabel(tp)} - ${tp.descripcion || tp.codigo || tp.id}`,
    }));

  const configuracion = {
    KEY: "consumos",
    data_key: "fabricacion",
    winbox: {
      tipo: "generico",
      options: {
        title: "Consumos",
        x: 180,
        y: 180,
      }
    },
    tabulator: {
      options: {
        editable: false,
        columns: [
          { title: "ID", field: "id", width: 70, hozAlign: "right" },
          {
            title: "Producto",
            field: "bota_id",
            editor: "list",
            editorParams: {
              values: botasDict,
              clearable: true,
              autocomplete: true,
              allowEmpty: true,
              listOnEmpty: true,
              freetext: false,
            },
            editable: tablaEditable,
            cssClass: "filtrable",
            formatter: (cell) => DATOS?.fabricacion?.tipos_producto?.[cell.getValue()]?.descripcion ?? cell.getValue(),
          },
          {
            title: "Consumible",
            field: "consumible_id",
            editor: "list",
            editorParams: {
              values: consumiblesDict,
              clearable: true,
              autocomplete: true,
              allowEmpty: true,
              listOnEmpty: true,
              freetext: false,
            },
            editable: tablaEditable,
            cssClass: "filtrable",
            formatter: (cell) => DATOS?.fabricacion?.tipos_producto?.[cell.getValue()]?.descripcion ?? cell.getValue(),
          },
          {
            title: "Consumo",
            field: "consumo",
            editor: "number",
            editorParams: {
              min: 0,
              step: 0.0001,
            },
            editable: tablaEditable,
            cssClass: "filtrable",
            hozAlign: "right",
          },
          CeldaAcciones,
        ],
        data: Object.values(DATOS.fabricacion.consumos || {}),
      },
    },
  };

  return crearVentana(configuracion);
}

function tpLabel(tp) {
  return String(tp?.tipo || "").toUpperCase() || "TIPO";
}
