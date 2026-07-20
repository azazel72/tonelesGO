function openAsistenciasMensualesWin() {
  const KEY = "asistencias_mensuales";
  const wb = comprobarVentanaAbierta(KEY);
  if (wb) return wb;

  const ahora = new Date();
  const añoActual = ahora.getFullYear();
  const mesActual = String(ahora.getMonth() + 1).padStart(2, "0");

  const contenedor = crearElemento("div", { class: "contenedor-winbox p-2" });
  const cabecera = crearElemento("div", { class: "cabecera p-2 border-bottom d-flex gap-2 align-items-center flex-wrap" });
  const btnActualizar = crearElemento("button", {
    id: "u-actualizar-asistencias-mensuales",
    class: "btn btn-sm btn-outline-primary",
    content: "Actualizar",
  });
  const btnExcel = crearElemento("button", {
    id: "u-export-excel-asistencias-mensuales",
    class: "btn btn-sm btn-outline-success",
    content: '<i class="bi bi-filetype-xlsx"></i> Excel',
  });
  const btnPdf = crearElemento("button", {
    id: "u-export-pdf-asistencias-mensuales",
    class: "btn btn-sm btn-outline-danger",
    content: '<i class="bi bi-filetype-pdf"></i> PDF',
  });
  const filtros = crearElemento("div", {
    class: "d-flex gap-2 align-items-center flex-wrap ms-auto",
  });

  const inputPeriodo = crearElemento("input", {
    id: "u-periodo-asistencias-mensuales",
    class: "form-control form-control-sm gestion-asistencias-month",
  });
  inputPeriodo.type = "month";
  inputPeriodo.value = `${añoActual}-${mesActual}`;

  filtros.appendChild(crearElemento("span", { class: "small text-muted", content: "Periodo" }));
  filtros.appendChild(inputPeriodo);

  cabecera.appendChild(btnActualizar);
  cabecera.appendChild(btnExcel);
  cabecera.appendChild(btnPdf);
  cabecera.appendChild(filtros);
  contenedor.appendChild(cabecera);

  const cuerpo = crearElemento("div", { class: "p-2 overflow-auto", style: "height: calc(100% - 52px);" });
  cuerpo.innerHTML = `
    <div class="gestion-asistencias-header">
      <h6 class="mt-1 mb-1">Asistencias mensuales</h6>
      <div id="asistencias-mensuales-rango" class="small text-muted"></div>
    </div>
    <table class="table table-sm table-striped table-bordered gestion-asistencias-table" id="tabla-asistencias-mensuales">
      <thead></thead>
      <tbody></tbody>
    </table>
  `;
  contenedor.appendChild(cuerpo);

  const nueva = crearWinBox(KEY, contenedor, {
    title: "Asistencias mensuales",
    x: 180,
    y: 110,
    width: "1100px",
    height: "620px",
  });
  windowsRegistry.set(KEY, { wb: nueva, table: null });

  const obtenerPeriodo = () => {
    const [añoTexto, mesTexto] = String(inputPeriodo.value || "").split("-");
    return {
      año: Number(añoTexto || 0),
      mes: Number(mesTexto || 0),
    };
  };
  const recargar = () => cargarAsistenciasMensuales(cuerpo, {
    ...obtenerPeriodo(),
  });
  btnActualizar.addEventListener("click", recargar);
  btnExcel.addEventListener("click", () => exportarTablaHtmlAsistencias(cuerpo.querySelector("#tabla-asistencias-mensuales"), "asistencias_mensuales", "xlsx"));
  btnPdf.addEventListener("click", () => exportarTablaHtmlAsistencias(cuerpo.querySelector("#tabla-asistencias-mensuales"), "asistencias_mensuales", "pdf"));
  inputPeriodo.addEventListener("change", recargar);
  recargar();

  return nueva;
}

async function cargarAsistenciasMensuales(contenedor, filtros = {}) {
  const tabla = contenedor.querySelector("#tabla-asistencias-mensuales");
  const thead = tabla?.querySelector("thead");
  const tbody = tabla?.querySelector("tbody");
  const rango = contenedor.querySelector("#asistencias-mensuales-rango");
  if (!tabla || !thead || !tbody || !rango) return;

  thead.innerHTML = "";
  tbody.innerHTML = `<tr><td>Cargando...</td></tr>`;
  rango.textContent = "";

  try {
    const data = await wsRequest("listar_asistencias_mensuales", {
      mes: Number(filtros?.mes || 0),
      año: Number(filtros?.año || 0),
    });

    const columnas = Array.isArray(data?.columnas_puestos) ? data.columnas_puestos : [];
    const filas = Array.isArray(data?.filas) ? data.filas : [];
    const diasLaborables = Number(data?.dias_laborables || 0);
    const tituloMes = obtenerNombreMesAsistencia(Number(data?.mes || filtros?.mes || 0));
    rango.textContent = data?.fecha_inicio && data?.fecha_fin
      ? `${tituloMes} ${data?.año || filtros?.año || ""} · ${formatearFechaAsistencia(data.fecha_inicio)} a ${formatearFechaAsistencia(data.fecha_fin)} · Laborables: ${diasLaborables}`
      : `${tituloMes} ${data?.año || filtros?.año || ""}`.trim();

    thead.innerHTML = `
      <tr>
        <th>Codigo</th>
        <th>Usuario</th>
        <th class="text-end">Asistencia</th>
        ${columnas.map((col) => `<th class="text-end">${escapeHtmlAsistencia(col.nombre || `Puesto ${col.id}`)}</th>`).join("")}
        <th class="text-end">Total</th>
      </tr>
    `;

    if (!filas.length) {
      tbody.innerHTML = `<tr><td colspan="${4 + columnas.length}">Sin datos</td></tr>`;
      return;
    }

    tbody.innerHTML = filas.map((fila) => {
      const asistencia = Number(fila?.asistencia || 0);
      let totalFila = asistencia;
      const celdasPuestos = columnas.map((col) => {
        const valor = Number(fila?.puestos?.[String(col.id)] || 0);
        totalFila += valor;
        return `<td class="text-end${valor !== 0 ? " gestion-asistencias-valor-no-cero" : ""}">${valor}</td>`;
      }).join("");

      const codigo = escapeHtmlAsistencia(fila?.codigo || "");
      const nombre = escapeHtmlAsistencia(fila?.nombre || fila?.alias || `Usuario ${fila?.usuario_id || ""}`);
      const totalClass = " gestion-asistencias-total";
      const mismatchClass = totalFila !== diasLaborables ? " gestion-asistencias-total-error" : "";
      return `
        <tr>
          <td>${codigo}</td>
          <td>${nombre}</td>
          <td class="text-end">${asistencia}</td>
          ${celdasPuestos}
          <td class="text-end${totalClass}${mismatchClass}">${totalFila}</td>
        </tr>
      `;
    }).join("");
  } catch (error) {
    console.error(error);
    tbody.innerHTML = `<tr><td colspan="4">Error al cargar asistencias</td></tr>`;
  }
}

function exportarTablaHtmlAsistencias(tabla, nombreBase, formato) {
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

function obtenerNombreMesAsistencia(mes) {
  return [
    "", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ][Number(mes) || 0] || "";
}

function formatearFechaAsistencia(valor) {
  if (!valor) return "";
  const partes = String(valor).split("-");
  if (partes.length !== 3) return valor;
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function escapeHtmlAsistencia(valor) {
  return String(valor ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
