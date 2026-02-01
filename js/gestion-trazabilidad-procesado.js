
// ====== CREAR VENTANA TRAZABILIDAD PROCESADO ======
function openTrazabilidadProcesadoWin() {
  if (!asegurarFabricacionCargada("trazabilidad_procesado")) return null;

  const wb = comprobarVentanaAbierta("trazabilidad_procesado");
  if (wb) return wb;

  const paletsDict = Object.values(DATOS?.maestros?.palets ?? {}).map(
    ({ id, codigo, ...resto }) => ({
      ...resto, id, codigo,
      value: id,
      label: codigo || String(id),
    })
  );

  const configuracion = {
    KEY: "trazabilidad_procesado",
    data_key: "fabricacion",
    winbox: {
      tipo: "generico",
      options: {
        title: "Trazabilidad procesado",
        x: 180,
        y: 200,
      }
    },
    tabulator: {
      options: {
        editable: false,
        columns: [
          { title:"ID", field:"id", width:70, hozAlign:"right"},
          {
            title: "Palet origen",
            field: "palet_origen_id",
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
          {
            title: "Palet destino",
            field: "palet_destino_id",
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
          CeldaAcciones,
        ],
        data: Object.values(DATOS.fabricacion.trazabilidad_procesado || {}),
      },
    },
  };

  return crearVentana(configuracion);
}
