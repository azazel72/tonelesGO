
// ====== CREAR VENTANA TRAZABILIDAD FABRICACION ======
function openTrazabilidadFabricacionWin() {
  if (!asegurarFabricacionCargada("trazabilidad_fabricacion")) return null;

  const wb = comprobarVentanaAbierta("trazabilidad_fabricacion");
  if (wb) return wb;

  const lineasDict = Object.values(DATOS?.fabricacion?.lineas_fabricacion ?? {}).map(
    ({ id, orden_id, ...resto }) => ({
      ...resto, id, orden_id,
      value: id,
      label: `Linea ${id} (orden ${orden_id ?? "?"})`,
    })
  );

  const paletsDict = Object.values(DATOS?.maestros?.palets ?? {}).map(
    ({ id, codigo, ...resto }) => ({
      ...resto, id, codigo,
      value: id,
      label: codigo || String(id),
    })
  );

  const estadosDict = Object.values(DATOS?.maestros?.estados ?? {}).map(
    ({ id, descripcion, ...resto }) => ({
      ...resto, id, descripcion,
      value: id,
      label: descripcion,
    })
  );

  const configuracion = {
    KEY: "trazabilidad_fabricacion",
    data_key: "fabricacion",
    winbox: {
      tipo: "generico",
      options: {
        title: "Trazabilidad fabricacion",
        x: 200,
        y: 220,
      }
    },
    tabulator: {
      options: {
        editable: false,
        columns: [
          { title:"ID", field:"id", width:70, hozAlign:"right"},
          {
            title: "Linea",
            field: "linea_fabricacion_id",
            editor: "list",
            editorParams: {
              values: lineasDict,
              clearable: true,
              autocomplete: true,
              allowEmpty: true,
              listOnEmpty: true,
              freetext: false,
            },
            editable: tablaEditable,
            cssClass: "filtrable",
            formatter: cell => DATOS?.fabricacion?.lineas_fabricacion?.[cell.getValue()]?.id ?? cell.getValue(),
          },
          {
            title: "Palet",
            field: "palet_id",
            editor: "list",
            editorParams: {
              values: paletsDict,
              clearable: true,
              autocomplete: true,
              allowEmpty: true,
              listOnEmpty: true,
              freetext: false,
            },
            editable: tablaEditable,
            cssClass: "filtrable",
            formatter: cell => DATOS?.maestros?.palets?.[cell.getValue()]?.codigo ?? cell.getValue(),
          },
          { title:"Cant. fabricada", field:"cantidad_fabricada", editor:"number", editable: tablaEditable, cssClass: "filtrable", hozAlign:"right" },
          {
            title: "Estado",
            field: "estado",
            editor: "list",
            editorParams: {
              values: estadosDict,
              clearable: true,
              autocomplete: true,
              allowEmpty: true,
              listOnEmpty: true,
              freetext: false,
            },
            editable: tablaEditable,
            cssClass: "filtrable",
            formatter: cell => DATOS?.maestros?.estados?.[cell.getValue()]?.descripcion ?? cell.getValue(),
          },
          CeldaAcciones,
        ],
        data: Object.values(DATOS.fabricacion.trazabilidad_fabricacion || {}),
      },
    },
  };

  return crearVentana(configuracion);
}
