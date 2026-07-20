function openDiasFestivosWin() {
  const KEY = "dias_festivos";
  const wb = comprobarVentanaAbierta(KEY);
  if (wb) {
    refrescarDiasFestivosWin();
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
  };
  windowsRegistry.set(KEY, state);

  contenedor.querySelector("#df-prev-year")?.addEventListener("click", () => {
    state.year -= 1;
    renderDiasFestivosWin(state);
  });
  contenedor.querySelector("#df-next-year")?.addEventListener("click", () => {
    state.year += 1;
    renderDiasFestivosWin(state);
  });
  contenedor.querySelector("#df-year")?.addEventListener("change", (event) => {
    state.year = Number(event.target.value || obtenerAnioActualDiasFestivos());
    renderDiasFestivosWin(state);
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
    await agregarDiaFestivo(fecha);
    input.value = "";
    renderDiasFestivosWin(state);
  });
  contenedor.querySelector("#df-calendar")?.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-fecha]");
    if (!button) return;
    const fecha = button.getAttribute("data-fecha");
    if (!fecha) return;
    await toggleDiaFestivo(fecha);
    renderDiasFestivosWin(state);
  });
  contenedor.querySelector("#df-list")?.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-delete-fecha]");
    if (!button) return;
    const fecha = button.getAttribute("data-delete-fecha");
    if (!fecha) return;
    await eliminarDiaFestivoPorFecha(fecha);
    renderDiasFestivosWin(state);
  });

  renderDiasFestivosWin(state);
  return ventana;
}

function obtenerAnioActualDiasFestivos() {
  return new Date().getFullYear();
}

function obtenerDiasFestivosTodos() {
  return Object.values(DATOS?.maestros?.dias_festivos || {});
}

function obtenerAniosDisponiblesDiasFestivos(anioSeleccionado) {
  const anios = new Set([obtenerAnioActualDiasFestivos(), Number(anioSeleccionado || 0)]);
  for (const item of obtenerDiasFestivosTodos()) {
    const fecha = String(item?.fecha || "");
    const anio = Number(fecha.slice(0, 4) || 0);
    if (anio) anios.add(anio);
  }
  return Array.from(anios).filter(Boolean).sort((a, b) => a - b);
}

function obtenerDiasFestivosPorAnio(anio) {
  return obtenerDiasFestivosTodos()
    .filter((item) => String(item?.fecha || "").startsWith(`${anio}-`))
    .sort((a, b) => String(a.fecha || "").localeCompare(String(b.fecha || "")));
}

function construirMapaDiasFestivos(anio) {
  const mapa = new Map();
  for (const item of obtenerDiasFestivosPorAnio(anio)) {
    mapa.set(String(item.fecha), item);
  }
  return mapa;
}

function renderDiasFestivosWin(state) {
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
    if (!anios.includes(anio)) {
      const option = document.createElement("option");
      option.value = String(anio);
      option.textContent = String(anio);
      option.selected = true;
      select.appendChild(option);
    }
  }

  if (inputFecha) {
    inputFecha.value = `${anio}-01-01`;
  }

  const festivos = obtenerDiasFestivosPorAnio(anio);
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
    calendario.innerHTML = construirCalendarioAnualDiasFestivos(anio, construirMapaDiasFestivos(anio));
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

async function agregarDiaFestivo(fecha) {
  const existente = obtenerDiasFestivosTodos().find((item) => String(item?.fecha || "") === String(fecha));
  if (existente) return existente;
  const respuesta = await wsRequest("insertar_maestro", { tabla: "dias_festivos", fecha });
  if (respuesta?.id) {
    DATOS.maestros.dias_festivos = DATOS.maestros.dias_festivos || {};
    DATOS.maestros.dias_festivos[respuesta.id] = respuesta;
  }
  return respuesta;
}

async function eliminarDiaFestivoPorFecha(fecha) {
  const existente = obtenerDiasFestivosTodos().find((item) => String(item?.fecha || "") === String(fecha));
  if (!existente?.id) return;
  const respuesta = await wsRequest("eliminar_maestro", { tabla: "dias_festivos", id: existente.id });
  if (respuesta?.id && DATOS?.maestros?.dias_festivos) {
    delete DATOS.maestros.dias_festivos[respuesta.id];
  }
}

async function toggleDiaFestivo(fecha) {
  const existente = obtenerDiasFestivosTodos().find((item) => String(item?.fecha || "") === String(fecha));
  if (existente?.id) {
    await eliminarDiaFestivoPorFecha(fecha);
    return;
  }
  await agregarDiaFestivo(fecha);
}

function refrescarDiasFestivosWin() {
  const state = windowsRegistry.get("dias_festivos");
  if (!state) return;
  renderDiasFestivosWin(state);
}
