async function openDiasFestivosWin() {
  const KEY = "dias_festivos";
  const wb = comprobarVentanaAbierta(KEY);
  if (wb) {
    await refrescarDiasFestivosWin();
    return wb;
  }

  const contenedor = crearElemento("div", { class: "contenedor-winbox dias-festivos-win" });
  contenedor.innerHTML = `
    <div class="dias-festivos-layout">
      <div class="dias-festivos-toolbar">
        <button type="button" class="btn btn-sm btn-outline-secondary" id="df-prev-year"><i class="bi bi-chevron-left"></i></button>
        <select id="df-year" class="form-select form-select-sm dias-festivos-year"></select>
        <button type="button" class="btn btn-sm btn-outline-secondary" id="df-next-year"><i class="bi bi-chevron-right"></i></button>
        <div class="ms-auto d-flex gap-2 align-items-center">
          <input id="df-date" class="form-control form-control-sm" type="date">
          <button type="button" class="btn btn-sm btn-primary" id="df-add-date">Agregar día</button>
        </div>
      </div>
      <div class="dias-festivos-body">
        <aside class="dias-festivos-side">
          <h6 class="mb-2">Festivos del año</h6>
          <div id="df-list" class="dias-festivos-list"></div>
        </aside>
        <section class="dias-festivos-calendar-wrap">
          <div id="df-calendar" class="dias-festivos-calendar"></div>
        </section>
      </div>
    </div>
  `;

  const ventana = crearWinBox(KEY, contenedor, {
    title: "Dias festivos",
    x: 180,
    y: 100,
    width: "1180px",
    height: "760px",
  });

  const state = {
    wb: ventana,
    contenedor,
    year: obtenerAnioActualDiasFestivos(),
    festivos: [],
    loadedYear: null,
  };
  windowsRegistry.set(KEY, state);

  contenedor.querySelector("#df-prev-year")?.addEventListener("click", async () => {
    state.year -= 1;
    await renderDiasFestivosWin(state, { forceReload: true });
  });
  contenedor.querySelector("#df-next-year")?.addEventListener("click", async () => {
    state.year += 1;
    await renderDiasFestivosWin(state, { forceReload: true });
  });
  contenedor.querySelector("#df-year")?.addEventListener("change", async (event) => {
    state.year = Number(event.target.value || obtenerAnioActualDiasFestivos());
    await renderDiasFestivosWin(state, { forceReload: true });
  });
  contenedor.querySelector("#df-add-date")?.addEventListener("click", async () => {
    const input = contenedor.querySelector("#df-date");
    const fecha = String(input?.value || "").trim();
    if (!fecha) {
      alert("Selecciona una fecha.");
      return;
    }
    if (!fecha.startsWith(`${state.year}-`)) {
      alert("La fecha debe pertenecer al año seleccionado.");
      return;
    }
    await agregarDiaFestivo(fecha, state);
    input.value = "";
    await renderDiasFestivosWin(state, { forceReload: true });
  });
  contenedor.querySelector("#df-calendar")?.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-fecha]");
    if (!button) return;
    const fecha = button.getAttribute("data-fecha");
    if (!fecha) return;
    await toggleDiaFestivo(fecha, state);
    await renderDiasFestivosWin(state, { forceReload: true });
  });
  contenedor.querySelector("#df-list")?.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-delete-fecha]");
    if (!button) return;
    const fecha = button.getAttribute("data-delete-fecha");
    if (!fecha) return;
    await eliminarDiaFestivoPorFecha(fecha, state);
    await renderDiasFestivosWin(state, { forceReload: true });
  });

  await renderDiasFestivosWin(state, { forceReload: true });
  return ventana;
}

function obtenerAnioActualDiasFestivos() {
  return new Date().getFullYear();
}

function obtenerRangoAnualDiasFestivos(anio) {
  return {
    fecha_inicio: `${anio}-01-01`,
    fecha_fin: `${anio}-12-31`,
  };
}

function obtenerDiasFestivosTodos(state = null) {
  if (state?.festivos?.length) return state.festivos;
  const cacheAnual = DATOS?.festivos?.anio || [];
  if (cacheAnual.length) return cacheAnual;
  return Object.values(DATOS?.maestros?.dias_festivos || {});
}

function obtenerAniosDisponiblesDiasFestivos(anioSeleccionado) {
  const base = Number(anioSeleccionado || obtenerAnioActualDiasFestivos());
  const anios = [];
  for (let offset = -2; offset <= 2; offset += 1) {
    anios.push(base + offset);
  }
  return anios;
}

async function cargarDiasFestivosPorRango(fecha_inicio, fecha_fin) {
  try {
    const respuesta = await wsRequest("listar_dias_festivos_rango", { fecha_inicio, fecha_fin });
    return Array.isArray(respuesta) ? respuesta : [];
  } catch (_err) {
    return Object.values(DATOS?.maestros?.dias_festivos || {})
      .filter((item) => {
        const fecha = String(item?.fecha || "");
        return fecha && fecha >= String(fecha_inicio) && fecha <= String(fecha_fin);
      })
      .sort((a, b) => String(a?.fecha || "").localeCompare(String(b?.fecha || "")));
  }
}

function construirMapaDiasFestivos(festivos) {
  const mapa = new Map();
  for (const item of festivos || []) {
    mapa.set(String(item.fecha), item);
  }
  return mapa;
}

async function renderDiasFestivosWin(state, { forceReload = false } = {}) {
  if (!state?.contenedor) return;
  const anio = Number(state.year || obtenerAnioActualDiasFestivos());
  state.year = anio;

  const select = state.contenedor.querySelector("#df-year");
  const inputFecha = state.contenedor.querySelector("#df-date");
  const lista = state.contenedor.querySelector("#df-list");
  const calendario = state.contenedor.querySelector("#df-calendar");

  if (select) {
    const anios = obtenerAniosDisponiblesDiasFestivos(anio);
    select.innerHTML = anios.map((item) => `<option value="${item}" ${item === anio ? "selected" : ""}>${item}</option>`).join("");
  }

  if (inputFecha) {
    inputFecha.value = `${anio}-01-01`;
  }

  if (forceReload || state.loadedYear !== anio) {
    const rango = obtenerRangoAnualDiasFestivos(anio);
    state.festivos = await cargarDiasFestivosPorRango(rango.fecha_inicio, rango.fecha_fin);
    state.loadedYear = anio;
    DATOS.festivos.anio = state.festivos;
  }

  const festivos = obtenerDiasFestivosTodos(state);
  if (lista) {
    if (!festivos.length) {
      lista.innerHTML = `<div class="text-muted small">No hay festivos cargados para ${anio}.</div>`;
    } else {
      lista.innerHTML = festivos.map((item) => `
        <div class="dias-festivos-list-item">
          <span>${formatearFechaFestivo(item.fecha)}</span>
          <button type="button" class="btn btn-sm btn-outline-danger" data-delete-fecha="${item.fecha}">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      `).join("");
    }
  }

  if (calendario) {
    calendario.innerHTML = construirCalendarioAnualDiasFestivos(anio, construirMapaDiasFestivos(festivos));
  }
}

function formatearFechaFestivo(fechaIso) {
  const fecha = new Date(`${fechaIso}T00:00:00`);
  if (Number.isNaN(fecha.getTime())) return fechaIso || "";
  return fecha.toLocaleDateString("es-ES", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function construirCalendarioAnualDiasFestivos(anio, mapaFestivos) {
  const nombresMes = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const nombresSemana = ["L", "M", "X", "J", "V", "S", "D"];
  return nombresMes.map((mesNombre, indiceMes) => {
    const primerDia = new Date(anio, indiceMes, 1);
    const diasMes = new Date(anio, indiceMes + 1, 0).getDate();
    const offset = (primerDia.getDay() + 6) % 7;
    const celdas = [];

    for (let i = 0; i < offset; i += 1) {
      celdas.push(`<div class="dias-festivos-day dias-festivos-day-empty"></div>`);
    }
    for (let dia = 1; dia <= diasMes; dia += 1) {
      const fecha = `${anio}-${String(indiceMes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
      const festivo = mapaFestivos.has(fecha);
      const jsDay = new Date(anio, indiceMes, dia).getDay();
      const esFinSemana = jsDay === 0 || jsDay === 6;
      celdas.push(`
        <button
          type="button"
          class="dias-festivos-day${festivo ? " is-festivo" : ""}${esFinSemana ? " is-weekend" : ""}"
          data-fecha="${fecha}"
          title="${fecha}"
        >${dia}</button>
      `);
    }

    return `
      <section class="dias-festivos-month">
        <div class="dias-festivos-month-title">${mesNombre}</div>
        <div class="dias-festivos-weekdays">${nombresSemana.map((dia) => `<span>${dia}</span>`).join("")}</div>
        <div class="dias-festivos-days">${celdas.join("")}</div>
      </section>
    `;
  }).join("");
}

async function agregarDiaFestivo(fecha, state = null) {
  const existente = obtenerDiasFestivosTodos(state).find((item) => String(item?.fecha || "") === String(fecha));
  if (existente) return existente;
  const respuesta = await wsRequest("insertar_maestro", { tabla: "dias_festivos", fecha });
  if (respuesta?.id) {
    DATOS.maestros.dias_festivos = DATOS.maestros.dias_festivos || {};
    DATOS.maestros.dias_festivos[respuesta.id] = respuesta;
  }
  await recargarFestivosRelacionados(state);
  return respuesta;
}

async function eliminarDiaFestivoPorFecha(fecha, state = null) {
  const existente = obtenerDiasFestivosTodos(state).find((item) => String(item?.fecha || "") === String(fecha));
  if (!existente?.id) return;
  const respuesta = await wsRequest("eliminar_maestro", { tabla: "dias_festivos", id: existente.id });
  if (respuesta?.id && DATOS?.maestros?.dias_festivos) {
    delete DATOS.maestros.dias_festivos[respuesta.id];
  }
  await recargarFestivosRelacionados(state);
  return respuesta;
}

async function toggleDiaFestivo(fecha, state = null) {
  const existente = obtenerDiasFestivosTodos(state).find((item) => String(item?.fecha || "") === String(fecha));
  if (existente?.id) {
    await eliminarDiaFestivoPorFecha(fecha, state);
    return;
  }
  await agregarDiaFestivo(fecha, state);
}

async function recargarFestivosRelacionados(state = null) {
  if (state) {
    state.loadedYear = null;
  }
  if (DATOS?.cuadrante?.fecha_inicio && typeof cargarFestivosSemanaCuadrante === "function") {
    await cargarFestivosSemanaCuadrante(DATOS.cuadrante.fecha_inicio);
    if (windowsRegistry.has("cuadrantes")) {
      const { table } = windowsRegistry.get("cuadrantes");
      table.setColumns(crearColumnasCuadrantes(DATOS.cuadrante));
      table.setData(crearDatosCuadrantes(DATOS.cuadrante));
      actualizarIndicadoresFaltasCuadrante();
    }
  }
}

async function refrescarDiasFestivosWin() {
  const state = windowsRegistry.get("dias_festivos");
  if (!state) return;
  await renderDiasFestivosWin(state, { forceReload: true });
}
