
// ====== CREAR VENTANA PEDIDOS ======
function openPedidosWin() {
  if (!asegurarFabricacionCargada("pedidos")) return null;

  const wb = comprobarVentanaAbierta("pedidos");
  if (wb) return wb;

  const estadosDict = Object.values(DATOS?.maestros?.estados_pedidos ?? {}).map(
    ({ id, descripcion, ...resto }) => ({
      ...resto, id, descripcion,
      value: id,
      label: descripcion,
    })
  );
  const clientesDict = Object.values(DATOS?.maestros?.clientes ?? {}).map(
    ({ id, nombre, ...resto }) => ({
      ...resto, id, nombre,
      value: id,
      label: nombre || String(id),
    })
  );
  const tiposDict = Object.values(DATOS?.fabricacion?.tipos_producto ?? {}).map(
    ({ id, descripcion, codigo, ...resto }) => ({
      ...resto, id, descripcion, codigo,
      value: id,
      label: descripcion || codigo || String(id),
    })
  );
  const materialesDict = Object.values(DATOS?.maestros?.materiales ?? {}).map(
    ({ id, descripcion, ...resto }) => ({
      ...resto, id, descripcion,
      value: id,
      label: descripcion || String(id),
    })
  );
  const destinosDict = [
    { value: "C", label: "CLIENTE" },
    { value: "E", label: "ENVINADO" },
  ];

  const configuracion = {
    KEY: "pedidos",
    data_key: "fabricacion",
    winbox: {
      tipo: "generico",
      options: {
        title: "Pedidos",
        x: 120,
        y: 140,
      }
    },
    tabulator: {
      options: {
        editable: false,
        columns: [
          { title:"ID", field:"id", width:70, hozAlign:"right"},
          {
            title: "Numero",
            field: "numero",
            editor: "input",
            editable: tablaEditable,
            cssClass: "filtrable",
          },
          {
            title: "Cliente",
            field: "cliente_id",
            editor: "list",
            editorParams: {
              values: clientesDict,
              clearable: true,
              autocomplete: true,
              allowEmpty: true,
              listOnEmpty: true,
              freetext: false,
            },
            editable: tablaEditable,
            cssClass: "filtrable",
            formatter: cell => DATOS?.maestros?.clientes?.[cell.getValue()]?.nombre ?? cell.getValue(),
          },
          {
            title: "Destino",
            field: "destino",
            editor: "list",
            editorParams: {
              values: destinosDict,
              clearable: false,
              autocomplete: true,
              allowEmpty: false,
              listOnEmpty: true,
              freetext: false,
            },
            editable: tablaEditable,
            cssClass: "filtrable",
            formatter: cell => ({ C: "CLIENTE", E: "ENVINADO" }[String(cell.getValue() || "").trim().toUpperCase()] ?? cell.getValue()),
          },
          {
            title: "Descripcion",
            field: "descripcion",
            editor: "input",
            editable: tablaEditable,
            cssClass: "filtrable",
          },
          {
            title: "Tipo de producto",
            field: "tipo_producto_id",
            editor: "list",
            editorParams: {
              values: tiposDict,
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
            title: "Cantidad",
            field: "cantidad",
            editor: "number",
            editorParams: {
              min: 0,
              step: 1,
            },
            mutatorEdit: (value) => {
              const n = Number.parseInt(String(value ?? ""), 10);
              return Number.isFinite(n) ? n : 0;
            },
            editable: tablaEditable,
            cssClass: "filtrable",
            hozAlign: "right",
          },
          {
            title: "Cant. fabricada",
            field: "cantidad_fabricada",
            editor: "number",
            editorParams: {
              min: 0,
              step: 1,
            },
            mutatorEdit: (value) => {
              const n = Number.parseInt(String(value ?? ""), 10);
              return Number.isFinite(n) ? n : 0;
            },
            editable: tablaEditable,
            cssClass: "filtrable",
            hozAlign: "right",
          },
          {
            title: "Fecha",
            field: "fecha",
            editor: "date",
            editable: tablaEditable,
            cssClass: "filtrable",
            sorter: "date",
          },
          {
            title: "Fecha finalizacion",
            field: "fecha_finalizacion",
            editor: "date",
            editable: tablaEditable,
            cssClass: "filtrable",
            sorter: "date",
          },
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
            formatter: cell => DATOS?.maestros?.estados_pedidos?.[cell.getValue()]?.descripcion ?? cell.getValue(),
          },
          CeldaAcciones,
        ],
        data: Object.values(DATOS.fabricacion.pedidos || {}),
      },
    },
  };

  return crearVentana(configuracion);
}
