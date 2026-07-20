function openInventarioDuelasWin() {
  const KEY = "inventario_duelas";
  if (!asegurarFabricacionCargada("tipos_producto", KEY)) return null;

  const wb = comprobarVentanaAbierta(KEY);
  if (wb) return wb;

  const contenedor = crearElemento("div", { class: "contenedor-winbox p-2" });
  const cabecera = crearElemento("div", { class: "cabecera p-2 border-bottom d-flex gap-2 align-items-center" });
  const btnActualizar = crearElemento("button", {
    id: "u-actualizar-inventario-duelas",
    class: "btn btn-sm btn-outline-primary",
    content: "Actualizar",
  });
  const btnPlegar = crearElemento("button", {
    id: "u-plegar-inventario-duelas",
    class: "btn btn-sm btn-outline-secondary",
    content: "Plegar todo",
  });
  const btnExcel = crearElemento("button", {
    id: "u-export-excel-inventario-duelas",
    class: "btn btn-sm btn-outline-success",
    content: '<i class="bi bi-filetype-xlsx"></i> Excel',
  });
  const btnPdf = crearElemento("button", {
    id: "u-export-pdf-inventario-duelas",
    class: "btn btn-sm btn-outline-danger",
    content: '<i class="bi bi-filetype-pdf"></i> PDF',
  });
  const switches = crearElemento("div", {
    class: "d-flex gap-3 align-items-center flex-wrap ms-auto",
  });
  switches.innerHTML = `
    <div class="form-check form-switch mb-0">
      <input class="form-check-input" type="checkbox" id="u-ocultar-restante-cero-duelas">
      <label class="form-check-label" for="u-ocultar-restante-cero-duelas">Ocultar restante 0</label>
    </div>
    <div class="form-check form-switch mb-0">
      <input class="form-check-input" type="checkbox" id="u-agrupacion-duela" checked>
      <label class="form-check-label" for="u-agrupacion-duela">Tipo de duela</label>
    </div>
    <div class="form-check form-switch mb-0">
      <input class="form-check-input" type="checkbox" id="u-agrupacion-madera">
      <label class="form-check-label" for="u-agrupacion-madera">Tipo de madera</label>
    </div>
    <div class="form-check form-switch mb-0">
      <input class="form-check-input" type="checkbox" id="u-agrupacion-instalacion">
      <label class="form-check-label" for="u-agrupacion-instalacion">Instalación</label>
    </div>
  `;
  cabecera.appendChild(btnActualizar);
  cabecera.appendChild(btnPlegar);
  cabecera.appendChild(btnExcel);
  cabecera.appendChild(btnPdf);
  cabecera.appendChild(switches);
  contenedor.appendChild(cabecera);

  const cuerpo = crearElemento("div", { class: "p-2 overflow-auto", style: "height: calc(100% - 52px);" });
  cuerpo.innerHTML = `
    <h6 class="mt-1">Palets de madera por tipo de duela, madera e instalación</h6>
    <table class="table table-sm table-striped" id="tabla-informe-palets-duela">
      <thead>
        <tr>
          <th>Grupo</th>
          <th>Detalle</th>
          <th class="text-end">Palets</th>
          <th class="text-end">Cubicaje</th>
          <th class="text-end">Consumido</th>
          <th class="text-end">Restante</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>
  `;
  contenedor.appendChild(cuerpo);

  const nueva = crearWinBox(KEY, contenedor, {
    title: "Inventario de maderas",
    x: 200,
    y: 120,
    width: "1020px",
    height: "600px",
  });
  windowsRegistry.set(KEY, { wb: nueva, table: null });

  const obtenerAgrupacion = () => ({
    ocultarRestanteCero: Boolean(contenedor.querySelector("#u-ocultar-restante-cero-duelas")?.checked),
    tipo: Boolean(contenedor.querySelector("#u-agrupacion-duela")?.checked),
    material: Boolean(contenedor.querySelector("#u-agrupacion-madera")?.checked),
    instalacion: Boolean(contenedor.querySelector("#u-agrupacion-instalacion")?.checked),
  });
  const aplicarEstadoGrupos = (contraido) => {
    cuerpo.querySelectorAll("tr[data-grupo]").forEach((filaGrupo) => {
      const grupo = filaGrupo.dataset.grupo;
      filaGrupo.dataset.contraido = contraido ? "1" : "0";
      filaGrupo.classList.toggle("inventario-grupo-contraido", contraido);
      cuerpo.querySelectorAll(`tr[data-detalle-grupo="${grupo}"]`).forEach((fila) => {
        fila.hidden = contraido;
      });
    });
    btnPlegar.textContent = contraido ? "Desplegar todo" : "Plegar todo";
    btnPlegar.dataset.contraido = contraido ? "1" : "0";
  };
  const recargar = () => cargarInventarioDuelas(cuerpo, obtenerAgrupacion());
  btnActualizar.addEventListener("click", recargar);
  btnPlegar.addEventListener("click", () => {
    const contraido = btnPlegar.dataset.contraido === "1";
    aplicarEstadoGrupos(!contraido);
  });
  btnExcel.addEventListener("click", () => exportarTablaHtmlInventarioDuelas(cuerpo.querySelector("#tabla-informe-palets-duela"), "inventario_palets", "xlsx"));
  btnPdf.addEventListener("click", () => exportarTablaHtmlInventarioDuelas(cuerpo.querySelector("#tabla-informe-palets-duela"), "inventario_palets", "pdf"));
  contenedor.querySelectorAll(".form-check-input").forEach((input) => {
    input.addEventListener("change", recargar);
  });
  cuerpo.addEventListener("click", (event) => {
    const filaGrupo = event.target.closest("tr[data-grupo]");
    if (!filaGrupo) return;
    const grupo = filaGrupo.dataset.grupo;
    const contraido = filaGrupo.dataset.contraido === "1";
    filaGrupo.dataset.contraido = contraido ? "0" : "1";
    filaGrupo.classList.toggle("inventario-grupo-contraido", !contraido);
    cuerpo.querySelectorAll(`tr[data-detalle-grupo="${grupo}"]`).forEach((fila) => {
      fila.hidden = !contraido;
    });
    const hayExpandido = Array.from(cuerpo.querySelectorAll("tr[data-grupo]")).some((fila) => fila.dataset.contraido !== "1");
    btnPlegar.textContent = hayExpandido ? "Plegar todo" : "Desplegar todo";
    btnPlegar.dataset.contraido = hayExpandido ? "0" : "1";
  });
  recargar();
  return nueva;
}

async function cargarInventarioDuelas(contenedor, agrupacion = { tipo: true, material: true, instalacion: false, ocultarRestanteCero: false }) {
  const tbody = contenedor.querySelector("#tabla-informe-palets-duela tbody");
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="6">Cargando...</td></tr>`;

  try {
    const data = await wsRequest("inventario_duelas", {});
    const filas = (data?.palets_por_tipo_material_ubicacion || []).filter((fila) => {
      if (!agrupacion?.ocultarRestanteCero) return true;
      return Number(fila?.total_restante || 0) !== 0;
    });

    if (!filas.length) {
      tbody.innerHTML = `<tr><td colspan="6">Sin datos</td></tr>`;
      return;
    }

    const grupos = new Map();
    for (const fila of filas) {
      const partesGrupo = [];
      if (agrupacion.tipo) partesGrupo.push(fila.tipo_producto || "Sin tipo");
      if (agrupacion.material) partesGrupo.push(fila.material || "Sin material");
      if (agrupacion.instalacion) partesGrupo.push(fila.ubicacion || "Sin ubicación");
      const clave = partesGrupo.length ? partesGrupo.join(" | ") : "Total";
      if (!grupos.has(clave)) grupos.set(clave, []);
      grupos.get(clave).push(fila);
    }

    let html = "";
    let indiceGrupo = 0;
    for (const [grupo, items] of grupos.entries()) {
      indiceGrupo += 1;
      const grupoId = `grupo-${indiceGrupo}`;
      const totalPalets = items.reduce((acc, x) => acc + Number(x.total_palets || 0), 0);
      const totalCubicaje = items.reduce((acc, x) => acc + Number(x.total_cubicaje || 0), 0);
      const totalConsumido = items.reduce((acc, x) => acc + Number(x.total_consumido || 0), 0);
      const totalRestante = items.reduce((acc, x) => acc + Number(x.total_restante || 0), 0);

      html += `
        <tr class="table-secondary inventario-grupo" data-grupo="${grupoId}" data-contraido="0" style="cursor:pointer;">
          <td><strong>${grupo}</strong></td>
          <td></td>
          <td class="text-end"><strong>${totalPalets.toLocaleString("es-ES")}</strong></td>
          <td class="text-end"><strong>${totalCubicaje.toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 3 })}</strong></td>
          <td class="text-end"><strong>${totalConsumido.toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 3 })}</strong></td>
          <td class="text-end"><strong>${totalRestante.toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 3 })}</strong></td>
        </tr>
      `;

      for (const item of items) {
        const partesDetalle = [];
        if (!agrupacion.tipo) partesDetalle.push(item.tipo_producto || "Sin tipo");
        if (!agrupacion.material) partesDetalle.push(item.material || "Sin material");
        if (!agrupacion.instalacion) partesDetalle.push(item.ubicacion || "Sin ubicación");
        const detalle = partesDetalle.join(" | ");
        html += `
          <tr data-detalle-grupo="${grupoId}">
            <td></td>
            <td>${detalle}</td>
            <td class="text-end">${Number(item.total_palets || 0).toLocaleString("es-ES")}</td>
            <td class="text-end">${Number(item.total_cubicaje || 0).toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 3 })}</td>
            <td class="text-end">${Number(item.total_consumido || 0).toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 3 })}</td>
            <td class="text-end">${Number(item.total_restante || 0).toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 3 })}</td>
          </tr>
        `;
      }
    }

    tbody.innerHTML = html;
    const contenedorWin = tbody.closest(".overflow-auto");
    const botonPlegar = contenedorWin?.previousElementSibling?.querySelector("#u-plegar-inventario-duelas");
    if (botonPlegar) {
      botonPlegar.textContent = "Plegar todo";
      botonPlegar.dataset.contraido = "0";
    }
  } catch (error) {
    console.error(error);
    tbody.innerHTML = `<tr><td colspan="6">Error al cargar inventario</td></tr>`;
  }
}

function exportarTablaHtmlInventarioDuelas(tabla, nombreBase, formato) {
  if (!tabla) return;
  if (formato === "xlsx") {
    if (!window.XLSX) {
      alert("No está cargada la librería de Excel.");
      return;
    }
    const libro = window.XLSX.utils.table_to_book(tabla, { sheet: nombreBase });
    window.XLSX.writeFile(libro, `${nombreBase}.xlsx`);
    return;
  }
  if (!window.jspdf?.jsPDF || !window.jspdf?.jsPDF.API?.autoTable) {
    alert("No está cargada la librería de PDF.");
    return;
  }
  const pdf = new window.jspdf.jsPDF({ orientation: "landscape" });
  pdf.autoTable({ html: tabla, styles: { fontSize: 8 }, headStyles: { fillColor: [52, 58, 64] } });
  pdf.save(`${nombreBase}.pdf`);
}
