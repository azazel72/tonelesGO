function openInventarioDuelasWin() {
  const KEY = "inventario_duelas";
  const wb = comprobarVentanaAbierta(KEY);
  if (wb) return wb;

  const contenedor = crearElemento("div", { class: "contenedor-winbox p-2" });
  const cabecera = crearElemento("div", { class: "cabecera p-2 border-bottom d-flex gap-2 align-items-center" });
  const btnActualizar = crearElemento("button", {
    id: "u-actualizar-inventario-duelas",
    class: "btn btn-sm btn-outline-primary",
    content: "Actualizar",
  });
  const selectorAgrupacion = crearElemento("select", {
    id: "u-agrupacion-inventario-duelas",
    class: "form-select form-select-sm",
    style: "width:auto;",
  });
  selectorAgrupacion.innerHTML = `
    <option value="duela">Agrupar por duela</option>
    <option value="ubicacion">Agrupar por ubicación</option>
  `;
  cabecera.appendChild(btnActualizar);
  cabecera.appendChild(selectorAgrupacion);
  contenedor.appendChild(cabecera);

  const cuerpo = crearElemento("div", { class: "p-2 overflow-auto", style: "height: calc(100% - 52px);" });
  cuerpo.innerHTML = `
    <h6 class="mt-1">Duelas activas por ubicación (agrupado por duela)</h6>
    <table class="table table-sm table-striped" id="tabla-informe-palets-duela">
      <thead><tr><th>Ubicación</th><th class="text-end">Total palets</th><th class="text-end">Cubicaje</th><th class="text-end">Consumido</th><th class="text-end">Restante</th></tr></thead>
      <tbody></tbody>
    </table>
  `;
  contenedor.appendChild(cuerpo);

  const nueva = crearWinBox(KEY, contenedor, {
    title: "Inventario Duelas",
    x: 200,
    y: 120,
    width: "900px",
    height: "560px",
  });
  windowsRegistry.set(KEY, { wb: nueva, table: null });

  btnActualizar.addEventListener("click", () => cargarInformeMaterial(cuerpo, selectorAgrupacion.value));
  selectorAgrupacion.addEventListener("change", () => cargarInformeMaterial(cuerpo, selectorAgrupacion.value));
  cargarInformeMaterial(cuerpo, selectorAgrupacion.value);
  return nueva;
}

async function cargarInformeMaterial(contenedor, agrupacion = "duela") {
  const tbodyPalets = contenedor.querySelector("#tabla-informe-palets-duela tbody");
  if (!tbodyPalets) return;
  tbodyPalets.innerHTML = `<tr><td colspan="5">Cargando...</td></tr>`;

  try {
    const data = await wsRequest("inventario_duelas", {});
    const filas = data?.palets_por_duela_ubicacion || [];

    if (!filas.length) {
      tbodyPalets.innerHTML = `<tr><td colspan="5">Sin datos</td></tr>`;
      return;
    }

    let html = "";
    const agruparPorDuela = agrupacion !== "ubicacion";
    const grupos = new Map();
    for (const r of filas) {
      const clave = agruparPorDuela ? (r.duela ?? "Sin tipo") : (r.ubicacion ?? "Sin ubicación");
      if (!grupos.has(clave)) grupos.set(clave, []);
      grupos.get(clave).push(r);
    }

    for (const [clave, items] of grupos.entries()) {
      const sumPalets = items.reduce((acc, x) => acc + Number(x.total_palets || 0), 0);
      const sumCubicaje = items.reduce((acc, x) => acc + Number(x.total_cubicaje || 0), 0);
      const sumConsumido = items.reduce((acc, x) => acc + Number(x.total_consumido || 0), 0);
      const sumRestante = items.reduce((acc, x) => acc + Number(x.total_restante || 0), 0);

      html += `
        <tr class="table-secondary">
          <td><strong>${clave}</strong></td>
          <td class="text-end"><strong>${sumPalets.toLocaleString("es-ES")}</strong></td>
          <td class="text-end"><strong>${sumCubicaje.toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 3 })}</strong></td>
          <td class="text-end"><strong>${sumConsumido.toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 3 })}</strong></td>
          <td class="text-end"><strong>${sumRestante.toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 3 })}</strong></td>
        </tr>
      `;

      for (const r of items) {
        html += `
          <tr>
            <td>${agruparPorDuela ? (r.ubicacion ?? "Sin ubicación") : (r.duela ?? "Sin tipo")}</td>
            <td class="text-end">${Number(r.total_palets || 0).toLocaleString("es-ES")}</td>
            <td class="text-end">${Number(r.total_cubicaje || 0).toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 3 })}</td>
            <td class="text-end">${Number(r.total_consumido || 0).toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 3 })}</td>
            <td class="text-end">${Number(r.total_restante || 0).toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 3 })}</td>
          </tr>
        `;
      }
    }
    tbodyPalets.innerHTML = html;
  } catch (error) {
    console.error(error);
    tbodyPalets.innerHTML = `<tr><td colspan="5">Error al cargar informe</td></tr>`;
  }
}
