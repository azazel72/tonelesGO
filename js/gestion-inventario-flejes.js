function openInventarioFlejesWin() {
  const KEY = "inventario_flejes";
  if (!asegurarFabricacionCargada("tipos_producto", KEY)) return null;

  const wb = comprobarVentanaAbierta(KEY);
  if (wb) return wb;

  const contenedor = crearElemento("div", { class: "contenedor-winbox p-2" });
  const cabecera = crearElemento("div", { class: "cabecera p-2 border-bottom d-flex gap-2 align-items-center" });
  const btnActualizar = crearElemento("button", {
    id: "u-actualizar-inventario-flejes",
    class: "btn btn-sm btn-outline-primary",
    content: "Actualizar",
  });
  cabecera.appendChild(btnActualizar);
  contenedor.appendChild(cabecera);

  const cuerpo = crearElemento("div", { class: "p-2 overflow-auto", style: "height: calc(100% - 52px);" });
  cuerpo.innerHTML = `
    <h6 class="mt-1">Inventario de flejes</h6>
    <table class="table table-sm table-striped" id="tabla-inventario-flejes">
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Lote</th>
          <th>Tipo producto</th>
          <th class="text-end">Peso</th>
          <th class="text-end">Consumido</th>
          <th class="text-end">Restante</th>
          <th class="text-end">Botas posibles</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>
  `;
  contenedor.appendChild(cuerpo);

  const nueva = crearWinBox(KEY, contenedor, {
    title: "Inventario Flejes",
    x: 220,
    y: 130,
    width: "980px",
    height: "580px",
  });
  windowsRegistry.set(KEY, { wb: nueva, table: null });

  btnActualizar.addEventListener("click", () => cargarInventarioFlejes(cuerpo));
  cargarInventarioFlejes(cuerpo);
  return nueva;
}

async function cargarInventarioFlejes(contenedor) {
  const tbody = contenedor.querySelector("#tabla-inventario-flejes tbody");
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="7">Cargando...</td></tr>`;

  try {
    const data = await wsRequest("inventario_flejes", {});
    const filas = data?.inventario_flejes || [];

    if (!filas.length) {
      tbody.innerHTML = `<tr><td colspan="7">Sin datos</td></tr>`;
      return;
    }

    const grupos = new Map();
    for (const r of filas) {
      const clave = r.tipo_producto_descripcion || String(r.tipo_producto_id || "Sin tipo");
      if (!grupos.has(clave)) grupos.set(clave, []);
      grupos.get(clave).push(r);
    }

    let html = "";
    for (const [tipo, items] of grupos.entries()) {
      const sumPeso = items.reduce((acc, x) => acc + Number(x.peso || 0), 0);
      const sumConsumido = items.reduce((acc, x) => acc + Number(x.consumido || 0), 0);
      const sumRestante = items.reduce((acc, x) => acc + Number(x.restante || 0), 0);
      const consumoTipo = Number(items[0]?.tipo_producto_consumo || 0);
      const sumBotas = consumoTipo > 0 ? Math.floor(sumRestante / consumoTipo) : 0;

      html += `
        <tr class="table-secondary">
          <td><strong>${tipo}</strong></td>
          <td></td>
          <td></td>
          <td class="text-end"><strong>${sumPeso.toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</strong></td>
          <td class="text-end"><strong>${sumConsumido.toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</strong></td>
          <td class="text-end"><strong>${sumRestante.toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</strong></td>
          <td class="text-end"><strong>${sumBotas.toLocaleString("es-ES")}</strong></td>
        </tr>
      `;

      for (const r of items) {
        const restante = Number(r.restante || 0);
        const consumo = Number(r.tipo_producto_consumo || 0);
        const botasPosibles = consumo > 0 ? Math.floor(restante / consumo) : 0;
        html += `
          <tr>
            <td>${r.fecha || ""}</td>
            <td>${r.lote || ""}</td>
            <td></td>
            <td class="text-end">${Number(r.peso || 0).toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</td>
            <td class="text-end">${Number(r.consumido || 0).toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</td>
            <td class="text-end">${restante.toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</td>
            <td class="text-end">${botasPosibles.toLocaleString("es-ES")}</td>
          </tr>
        `;
      }
    }

    tbody.innerHTML = html;
  } catch (error) {
    console.error(error);
    tbody.innerHTML = `<tr><td colspan="7">Error al cargar inventario</td></tr>`;
  }
}
