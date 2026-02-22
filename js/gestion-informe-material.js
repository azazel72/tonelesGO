function openInformeMaterialWin() {
  const KEY = "informe_material";
  const wb = comprobarVentanaAbierta(KEY);
  if (wb) return wb;

  const contenedor = crearElemento("div", { class: "contenedor-winbox p-2" });
  const cabecera = crearElemento("div", { class: "cabecera p-2 border-bottom d-flex gap-2 align-items-center" });
  const btnActualizar = crearElemento("button", {
    id: "u-actualizar-informe-material",
    class: "btn btn-sm btn-outline-primary",
    content: "Actualizar",
  });
  cabecera.appendChild(btnActualizar);
  contenedor.appendChild(cabecera);

  const cuerpo = crearElemento("div", { class: "p-2 overflow-auto", style: "height: calc(100% - 52px);" });
  cuerpo.innerHTML = `
    <h6 class="mt-1">Palets activos por tipo de duela</h6>
    <table class="table table-sm table-striped" id="tabla-informe-palets-duela">
      <thead><tr><th>Tipo duela</th><th class="text-end">Total palets</th><th class="text-end">Total kilos</th></tr></thead>
      <tbody></tbody>
    </table>
    <h6 class="mt-3">Botas activas por tipo y material</h6>
    <table class="table table-sm table-striped" id="tabla-informe-botas-material">
      <thead><tr><th>Tipo</th><th>Material</th><th class="text-end">Total botas</th></tr></thead>
      <tbody></tbody>
    </table>
  `;
  contenedor.appendChild(cuerpo);

  const nueva = crearWinBox(KEY, contenedor, {
    title: "Informe Material",
    x: 200,
    y: 120,
    width: "900px",
    height: "560px",
  });
  windowsRegistry.set(KEY, { wb: nueva, table: null });

  btnActualizar.addEventListener("click", () => cargarInformeMaterial(cuerpo));
  cargarInformeMaterial(cuerpo);
  return nueva;
}

async function cargarInformeMaterial(contenedor) {
  const tbodyPalets = contenedor.querySelector("#tabla-informe-palets-duela tbody");
  const tbodyBotas = contenedor.querySelector("#tabla-informe-botas-material tbody");
  if (!tbodyPalets || !tbodyBotas) return;
  tbodyPalets.innerHTML = `<tr><td colspan="3">Cargando...</td></tr>`;
  tbodyBotas.innerHTML = `<tr><td colspan="3">Cargando...</td></tr>`;

  try {
    const data = await wsRequest("informe_material", {});
    const palets = data?.palets_por_duela || [];
    const botas = data?.botas_por_tipo_material || [];

    tbodyPalets.innerHTML = palets.length
      ? palets.map((r) => `
          <tr>
            <td>${r.duela ?? ""}</td>
            <td class="text-end">${Number(r.total_palets || 0).toLocaleString("es-ES")}</td>
            <td class="text-end">${Number(r.total_kilos || 0).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
        `).join("")
      : `<tr><td colspan="3">Sin datos</td></tr>`;

    tbodyBotas.innerHTML = botas.length
      ? botas.map((r) => `
          <tr>
            <td>${r.tipo ?? ""}</td>
            <td>${r.material ?? ""}</td>
            <td class="text-end">${Number(r.total_botas || 0).toLocaleString("es-ES")}</td>
          </tr>
        `).join("")
      : `<tr><td colspan="3">Sin datos</td></tr>`;
  } catch (error) {
    console.error(error);
    tbodyPalets.innerHTML = `<tr><td colspan="3">Error al cargar informe</td></tr>`;
    tbodyBotas.innerHTML = `<tr><td colspan="3">Error al cargar informe</td></tr>`;
  }
}
