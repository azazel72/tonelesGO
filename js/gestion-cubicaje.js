function openCubicajeWin() {
  if (!asegurarFabricacionCargada("tipos_producto")) return null;

  const wb = comprobarVentanaAbierta("cubicaje");
  if (wb) return wb;

  const tiposDuela = Object.values(DATOS?.fabricacion?.tipos_producto ?? {})
    .filter((tp) => String(tp?.tipo || "").toUpperCase() === "DUELA")
    .sort((a, b) => Number(a?.id || 0) - Number(b?.id || 0));

  const cubicajeMap = DATOS?.maestros?.cubicaje || {};
  const cubicajeLista = Object.values(cubicajeMap);

  const data = tiposDuela.map((tp) => {
    const registro = cubicajeMap?.[tp.id]
      || cubicajeLista.find((c) => Number(c?.tipo_producto_id || 0) === Number(tp.id))
      || null;
    return {
      id: Number(tp.id),
      tipo_producto_id: Number(tp.id),
      cubicaje_estandar: Number(registro?.cubicaje_estandar || 0),
    };
  });

  const configuracion = {
    KEY: "cubicaje",
    winbox: {
      tipo: "generico",
      options: {
        title: "Cubicaje",
        x: 190,
        y: 230,
      }
    },
    tabulator: {
      options: {
        editable: tablaEditable,
        columns: [
          { title: "Tipo producto ID", field: "tipo_producto_id", width: 130, hozAlign: "right" },
          {
            title: "Tipo DUELA",
            field: "tipo_producto_id",
            cssClass: "filtrable",
            formatter: (cell) => DATOS?.fabricacion?.tipos_producto?.[cell.getValue()]?.descripcion ?? cell.getValue(),
          },
          {
            title: "Cubicaje estandar",
            field: "cubicaje_estandar",
            hozAlign: "right",
            cssClass: "filtrable",
            editor: "number",
            editable: tablaEditable,
          },
        ],
        data,
      },
    },
  };

  return crearVentana(configuracion);
}
