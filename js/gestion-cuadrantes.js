console.log("gestion-cuadrantes.js loaded");

// ====== CREAR VENTANA CUADRANTES ======
function openCuadrantesWin() {
  let wb = comprobarVentanaAbierta("cuadrantes");
  if (wb) return wb;

  const configuracionCuadrantes = {
    KEY: "cuadrantes",
    winbox: {
      tipo: "cuadrantes",
      options: {
        title: "Planificador de puestos de trabajo",
        x: 0,
        y: 56,
        width: "100%",
        height: "100%",
        background: "#343a40",
      }
    },
    tabulator: {
      height: "auto",
      layout: "fitColumns",
      columns: crearColumnasCuadrantes(DATOS.cuadrante),
      data: crearDatosCuadrantes(DATOS.cuadrante),
    },
  }

  wb = crearVentanaCuadrantes(configuracionCuadrantes);

  wb.maximize();
  
  return wb;
}

// ====== MUESTRA LA VENTANA DE CUADRANTES ======
async function mostrar_cuadrantes(response) {
  DATOS.cuadrante = response.data ?? [];
  await cargarFestivosSemanaCuadrante(DATOS?.cuadrante?.fecha_inicio);

  if (response.data && windowsRegistry.has("cuadrantes")) {
    const { table, wb } = windowsRegistry.get("cuadrantes");
    if (table) {
      table.setColumns(crearColumnasCuadrantes(DATOS.cuadrante));
      table.setData(crearDatosCuadrantes(DATOS.cuadrante));
      repintarEstadoUsoCuadrante(table, wb?.body || document);
      actualizarIndicadoresFaltasCuadrante();
    }
  }
}

// ====== FIN CREAR VENTANA CUADRANTES ======

// --- UTILIDADES ---

function obtenerFechasSemanaCuadrante(fechaInicio) {
  if (!fechaInicio) return [];
  return [
    { letra: "J", nombre: "Jue", fecha: sumarDiasYYYYMMDD(fechaInicio, 0) },
    { letra: "V", nombre: "Vie", fecha: sumarDiasYYYYMMDD(fechaInicio, 1) },
    { letra: "L", nombre: "Lun", fecha: sumarDiasYYYYMMDD(fechaInicio, 4) },
    { letra: "M", nombre: "Mar", fecha: sumarDiasYYYYMMDD(fechaInicio, 5) },
    { letra: "X", nombre: "Mié", fecha: sumarDiasYYYYMMDD(fechaInicio, 6) },
  ];
}

function obtenerFechasFestivasCuadrante() {
  const fechas = new Set();
  const festivos = DATOS?.festivos?.cuadrante_semana || [];
  festivos.forEach((item) => {
    const fecha = String(item?.fecha || "").trim();
    if (fecha) fechas.add(fecha);
  });
  return fechas;
}

async function cargarFestivosSemanaCuadrante(fechaInicio) {
  DATOS.festivos = DATOS.festivos || { anio: [], cuadrante_semana: [] };
  if (!fechaInicio) {
    DATOS.festivos.cuadrante_semana = [];
    return [];
  }
  const fechaFin = sumarDiasYYYYMMDD(fechaInicio, 6);
  try {
    const festivos = await wsRequest("listar_dias_festivos_rango", {
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
    }) || [];
    DATOS.festivos.cuadrante_semana = Array.isArray(festivos) ? festivos : [];
  } catch (_err) {
    DATOS.festivos.cuadrante_semana = Object.values(DATOS?.maestros?.dias_festivos || {})
      .filter((item) => {
        const fecha = String(item?.fecha || "");
        return fecha && fecha >= String(fechaInicio) && fecha <= String(fechaFin);
      })
      .sort((a, b) => String(a?.fecha || "").localeCompare(String(b?.fecha || "")));
  }
  return DATOS.festivos.cuadrante_semana;
}

function esFechaFestivaCuadrante(fecha) {
  return Boolean(fecha) && obtenerFechasFestivasCuadrante().has(String(fecha));
}

function obtenerDiasCuadranteSemanaCompleta() {
  return obtenerFechasSemanaCuadrante(DATOS?.cuadrante?.fecha_inicio).map((dia) => ({
    ...dia,
    festivo: esFechaFestivaCuadrante(dia.fecha),
  }));
}

// === construcción de columnas ===
function crearColumnasCuadrantes(cuadrante) {
  const diasSemana = obtenerFechasSemanaCuadrante(cuadrante?.fecha_inicio);

  const columnas = [
    { title: "ID", field: "id", visible: false, headerSort: false },
    { title: "Puesto", field: "nombre", width: 180, frozen: true, headerSort: true, formatter: formatterPuestoCuadranteConOrden, sorter: sorterPuestoCuadrantePorOrden },
    ...diasSemana.map((dia) => ({
      title: crearTituloClonableDia(dia.nombre, dia.fecha),
      field: dia.fecha,
      formatter: formatterColumnasCuadrante,
      variableHeight: true,
      cssClass: `celda-cuadrante${esFechaFestivaCuadrante(dia.fecha) ? " celda-cuadrante-festiva" : ""}`,
      headerSort: false,
    })),
  ];
  return columnas;
}

function formatterPuestoCuadranteConOrden(cell) {
  const data = cell.getRow().getData() || {};
  const nombre = String(data.nombre || "").trim();
  return nombre;
}

function sorterPuestoCuadrantePorOrden(a, b, aRow, bRow) {
  const dataA = aRow?.getData?.() || {};
  const dataB = bRow?.getData?.() || {};
  const ordenA = Number(dataA.orden || 0);
  const ordenB = Number(dataB.orden || 0);
  if (ordenA !== ordenB) return ordenA - ordenB;

  const nombreA = String(dataA.nombre || "");
  const nombreB = String(dataB.nombre || "");
  const porNombre = nombreA.localeCompare(nombreB, "es", { sensitivity: "base" });
  if (porNombre !== 0) return porNombre;

  return Number(dataA.id || 0) - Number(dataB.id || 0);
}

function crearTituloClonableDia(dia, fecha) {
  const festivo = esFechaFestivaCuadrante(fecha);
  const title = festivo
    ? "Día festivo. No permite asignaciones ni clonado."
    : "Arrastra esta columna a otro día para clonar";
  return `
    <div class="cuadrante-header-title${festivo ? " cuadrante-header-title-festivo" : ""}" draggable="${festivo ? "false" : "true"}" title="${title}">
      <span>${titulo_con_fecha(dia, fecha)}</span>
    </div>
  `;
}

function obtenerTextoPillCuadrante(usuario) {
  if (!usuario) return "Usuario no encontrado";
  return usuario.alias || usuario.nombre || "Usuario no encontrado";
}

function crearContenidoPillCuadrante(nombre) {
  const indicador = document.createElement("span");
  indicador.className = "usuario-pill-faltas-dot";
  indicador.hidden = true;

  const wrapper = document.createElement("div");
  wrapper.className = "usuario-pill-contenido";

  const avisos = document.createElement("div");
  avisos.className = "usuario-pill-avisos";
  ["J", "V", "L", "M", "X"].forEach((letra) => {
    const marca = document.createElement("span");
    marca.textContent = letra;
    avisos.appendChild(marca);
  });

  const texto = document.createElement("div");
  texto.className = "usuario-pill-texto";
  texto.textContent = nombre;

  wrapper.append(indicador, avisos, texto);
  return wrapper;
}

function compararUsuariosCuadrantePorCodigo(a, b) {
  const codigoA = String(a?.codigo ?? "").trim();
  const codigoB = String(b?.codigo ?? "").trim();
  if (codigoA && codigoB) {
    return codigoA.localeCompare(codigoB, "es", { numeric: true, sensitivity: "base" });
  }
  if (codigoA) return -1;
  if (codigoB) return 1;
  return String(a?.nombre ?? "").localeCompare(String(b?.nombre ?? ""), "es", { sensitivity: "base" });
}

function obtenerDiasCuadranteActivos() {
  return obtenerDiasCuadranteSemanaCompleta().filter((dia) => !dia.festivo);
}

function obtenerAsignacionesUsuarioPorDia(tabla, usuarioId) {
  const estado = {};
  const dias = obtenerDiasCuadranteSemanaCompleta();
  dias.forEach((dia) => {
    estado[dia.fecha] = false;
  });
  if (!tabla) return estado;

  (tabla.getRows() || []).forEach((row) => {
    const data = row.getData() || {};
    dias.forEach((dia) => {
      const valores = data[dia.fecha] || [];
      if (valores.some((detalle) => String(detalle.usuario_id) === String(usuarioId))) {
        estado[dia.fecha] = true;
      }
    });
  });
  return estado;
}

function actualizarIndicadoresFaltasCuadrante() {
  const registro = windowsRegistry.get("cuadrantes");
  const tabla = registro?.table;
  const contenedor = registro?.wb?.body?.querySelector?.("#contenedor-cuadrante") || document.querySelector("#contenedor-cuadrante");
  const dias = obtenerDiasCuadranteSemanaCompleta();
  if (!contenedor || !dias.length) return;

  contenedor.querySelectorAll(".usuario-pill").forEach((pill) => {
    const usuarioId = pill.dataset.usuarioId;
    const avisos = pill.querySelector(".usuario-pill-avisos");
    const indicador = pill.querySelector(".usuario-pill-faltas-dot");
    if (!usuarioId || !avisos || !indicador) return;

    const asignaciones = obtenerAsignacionesUsuarioPorDia(tabla, usuarioId);
    let faltaAlgunDia = false;
    let faltaJueves = false;
    let faltaOtroDia = false;

    Array.from(avisos.children).forEach((marca, index) => {
      const dia = dias[index];
      if (!dia) return;
      if (dia.festivo) {
        marca.classList.remove("falta-dia", "cubre-dia");
        marca.classList.add("festivo-dia");
        return;
      }

      marca.classList.remove("festivo-dia");
      const asignado = Boolean(asignaciones[dia.fecha]);
      marca.classList.toggle("falta-dia", !asignado);
      marca.classList.toggle("cubre-dia", asignado);
      if (!asignado) {
        faltaAlgunDia = true;
        if (index === 0) faltaJueves = true;
        else faltaOtroDia = true;
      }
    });

    pill.classList.toggle("usuario-pill-con-faltas", faltaAlgunDia);
    indicador.classList.toggle("usuario-pill-faltas-dot-aviso", !faltaJueves && faltaOtroDia);
    indicador.hidden = !faltaAlgunDia;
  });
}

function formatterColumnasCuadrante(cell, formatterParams, onRendered) {
  
  onRendered(function() {
    const el = cell.getElement();
    const value = cell.getValue() || [];
    const field = cell.getField();
    const rowData = cell.getRow().getData() || {};
    const esFestivo = esFechaFestivaCuadrante(field);
    el.innerHTML = "";
    el.classList.toggle("celda-cuadrante-festiva", esFestivo);

    // Pintar cada pill
    [...value].forEach((detalle, index) => {
      if (!detalle?.usuario_id) {
        return;
      }

      const pill = crearElemento("div",
        {
          class: "usuario-pill badge m-1 p-2",
          draggable: "true",
          style: getPillColorByIndex(detalle.usuario_id),
        }
      );
      pill.dataset.usuarioId = String(detalle.usuario_id);
      pill.appendChild(crearContenidoPillCuadrante(obtenerTextoPillCuadrante(detalle.empleado)));
      // info para el drag
      pill.dataset.detalle = JSON.stringify(detalle);

      pill.addEventListener("dragstart", (e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("tipo", "pill-cuadrante");
        e.dataTransfer.setData("detalle", JSON.stringify(detalle));
      });

      el.appendChild(pill);
    });

    // Bind de eventos de drop en la celda (una sola vez por elemento DOM)
    if (!el.dataset.dndBound) {
      el.dataset.dndBound = "1";

      el.addEventListener("dragenter", (e) => {
        if (esFechaFestivaCuadrante(cell.getField())) return;
        e.preventDefault();
        el.classList.add("drop-target");
      });

      el.addEventListener("dragover", (e) => {
        if (esFechaFestivaCuadrante(cell.getField())) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        el.classList.add("drop-target");
      });

      el.addEventListener("dragleave", () => {
        el.classList.remove("drop-target");
      });

      el.addEventListener("drop", (e) => {
        if (esFechaFestivaCuadrante(cell.getField())) return;
        e.preventDefault();
        el.classList.remove("drop-target");
        manejarDropEnCelda(e, cell);
      });
    }

    actualizarIndicadoresFaltasCuadrante();
  });
 
  return "";
}

async function manejarDropEnCelda(e, cellDestino) {
  let origen = JSON.parse(e.dataTransfer.getData("detalle"));

  const tipo = e.dataTransfer.getData("tipo");
  if (!origen.usuario_id) return;

  const tabla = cellDestino.getRow().getTable();
  const fieldDestino = cellDestino.getField();
  const rowDestino = cellDestino.getRow();
  const dataRowDestino = rowDestino.getData();
  let valoresDestino = cellDestino.getValue() || [];

  if (esFechaFestivaCuadrante(fieldDestino)) {
    alert("No se pueden asignar empleados en un día festivo.");
    return;
  }

  const detalleOrigenId = origen?.id ? Number(origen.id) : null;

  const conflictos = buscarAsignacionesUsuarioEnFecha(tabla, Number(origen.usuario_id), fieldDestino, detalleOrigenId);
  if (conflictos.length) {
    const puestos = conflictos
      .map((c) => c.puestoNombre)
      .filter((v, i, arr) => arr.indexOf(v) === i)
      .join(", ");
    const confirmar = confirm(
      `El operario ya está asignado este día en: ${puestos}. ¿Quieres asignarlo también en este puesto?`
    );
    if (!confirmar) return;
  }

  if (valoresDestino.some(e => e.usuario_id == origen.usuario_id)) {
    console.log("Ya existe el usuario en destino (repetido o misma celda origen destino)");
    return;
  }

  let nuevoDetalle = null;

  //if (tipo === "pill-cuadrante") {
  if (origen.puesto_id && origen.fecha) {
    //moviendo pildora del cuadrante
    const rowOrigen = tabla.getRow(origen.puesto_id);
    const dataOrigen = rowOrigen.getData();
    const valoresOrigen = dataOrigen[origen.fecha] ?? [];

    nuevoDetalle = await actualizarDetalleCuadrante({
      id: origen.id,
      cuadrante_id: origen.cuadrante_id,
      puesto_id: dataRowDestino.id,
      fecha: fieldDestino,
      usuario_id: Number(origen.usuario_id),
    });

    // quitar de la celda origen
    const nuevosValoresOrigen = valoresOrigen.filter(p => String(p.usuario_id) !== String(origen.usuario_id));
    rowOrigen.update({ [origen.fecha]: nuevosValoresOrigen });
  } else {
    nuevoDetalle = await insertarDetalleCuadrante({
      cuadrante_id: DATOS.cuadrante.id,
      puesto_id: dataRowDestino.id,
      fecha: fieldDestino,
      usuario_id: Number(origen.usuario_id),
    });
  }

  if (!nuevoDetalle) {
    console.error("Error al procesar el detalle del cuadrante");
    return;
  }

  nuevoDetalle.empleado = DATOS.maestros.usuarios[origen.usuario_id];
  const nuevaDestino = valoresDestino.concat(nuevoDetalle);
  rowDestino.update({ [fieldDestino]: nuevaDestino });
}

function buscarAsignacionesUsuarioEnFecha(tabla, usuarioId, fecha, excluirDetalleId = null) {
  if (!tabla || !usuarioId || !fecha) return [];
  const rows = tabla.getRows() || [];
  const encontrados = [];
  for (const row of rows) {
    const data = row.getData() || {};
    const valores = data[fecha] || [];
    valores.forEach((d) => {
      if (String(d.usuario_id) !== String(usuarioId)) return;
      if (excluirDetalleId != null && String(d.id) === String(excluirDetalleId)) return;
      encontrados.push({ row, data, valores, detalle: d, puestoNombre: data.nombre || `Puesto ${data.id}` });
    });
  }
  return encontrados;
}

function obtenerIdsUsadosCuadrante(cuadrante = DATOS?.cuadrante) {
  const puestoIds = new Set();
  const usuarioIds = new Set();
  (cuadrante?.detalles || []).forEach((detalle) => {
    const puestoId = Number(detalle?.puesto_id || 0);
    const usuarioId = Number(detalle?.usuario_id || 0);
    if (puestoId) puestoIds.add(puestoId);
    if (usuarioId) usuarioIds.add(usuarioId);
  });
  return { puestoIds, usuarioIds };
}

function repintarEstadoUsoCuadrante(table, scope = document) {
  const { puestoIds, usuarioIds } = obtenerIdsUsadosCuadrante(DATOS?.cuadrante);

  scope.querySelectorAll?.(".usuario-pill").forEach((pill) => {
    const usuarioId = Number(pill.dataset.usuarioId || 0);
    const usuario = DATOS?.maestros?.usuarios?.[usuarioId];
    pill.classList.toggle("inactivo", usuario?.activo === false);
    pill.classList.toggle("usado", usuarioIds.has(usuarioId));
  });

  let visibleIndex = 0;
  (table?.getRows?.() || []).forEach((row) => {
    const data = row.getData() || {};
    const puestoId = Number(data.id || 0);
    const puesto = DATOS?.maestros?.puestos_trabajo?.[puestoId];
    const rowEl = row.getElement?.();
    if (!rowEl) return;
    rowEl.classList.toggle("inactivo", puesto?.activo === false);
    rowEl.classList.toggle("usado", puestoIds.has(puestoId));
    const visible = !rowEl.classList.contains("inactivo") || rowEl.classList.contains("usado");
    console.log(rowEl.classList.contains("inactivo"), rowEl.classList.contains("usado"),visible, visibleIndex);
    if (!visible) return;
    rowEl.classList.remove("tabulator-row-even", "tabulator-row-odd");
    rowEl.classList.add(++visibleIndex % 2 === 0 ? "tabulator-row-even" : "tabulator-row-odd");
  });
}

function crearDatosCuadrantes(cuadrante) {
  if (!cuadrante?.fecha_inicio) return [];

  const diasSemana = obtenerFechasSemanaCuadrante(cuadrante?.fecha_inicio);
  const datos = Object.values(DATOS.maestros.puestos_trabajo)
    .sort((a, b) => {
      const ordenA = Number(a?.orden || 0);
      const ordenB = Number(b?.orden || 0);
      if (ordenA !== ordenB) return ordenA - ordenB;
      return Number(a?.id || 0) - Number(b?.id || 0);
    })
    .map(puesto => ({
    id: puesto.id,
    nombre: puesto.nombre,
    orden: Number(puesto?.orden || 0),
    ...Object.fromEntries(
      diasSemana.map((dia) => [
        dia.fecha,
        cuadrante.detalles
          .filter(d => d.puesto_id === puesto.id && d.fecha === dia.fecha)
          .map(d => ({ ...d, empleado: DATOS.maestros.usuarios[d.usuario_id] })),
      ])
    ),
  }));
  DATOS.cuadrante_dinamico = datos;
  return datos;
}

function crearVentanaCuadrantes(configuracion, show=true) {
   // CREACION DE WINBOX
  const contenedor = crearElemento("div", { class: "contenedor-winbox" });

  const plantilla = document.getElementById("plantilla_cuadrantes");
  const contenido = plantilla.content.cloneNode(true);
  contenedor.appendChild(contenido);

  const listaUsuarios = contenedor.querySelector("#listaUsuarios");
  completarEmpleadosCuadrantes(configuracion.KEY, listaUsuarios, DATOS.maestros.usuarios, configuracion);

  // Ventana
  const wb = crearWinBox(configuracion.KEY, contenedor, configuracion.winbox.options);
  if (show) {
    wb.show();
    wb.focus();
  }

  // Tabulator
  const tablaCuadrante = contenedor.querySelector("#tablaCuadrante");
  const tabla = crearTabla("cuadrantes", tablaCuadrante, configuracion.tabulator);
  inicializarUiClonadoColumnas(contenedor, tabla);

  windowsRegistry.set(configuracion.KEY, { wb: wb, table: tabla });
  repintarEstadoUsoCuadrante(tabla, contenedor);

  agregarEventosCuadrantes(wb, configuracion, contenedor);

  return wb;
}

function inicializarUiClonadoColumnas(contenedor, tabla) {
  if (tabla.__uiClonadoInicializada) return;
  tabla.__uiClonadoInicializada = true;

  asegurarModalClonadoCuadrantes();

  tabla.on("tableBuilt", () => {
    bindInteraccionesCabeceraCuadrantes(tabla);
  });
}

function asegurarModalClonadoCuadrantes() {
  if (document.getElementById("cuadrantes-clonar-columna-modal")) return;
  const modalHtml = `
  <div class="modal fade" id="cuadrantes-clonar-columna-modal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Clonar columna de día</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
        </div>
        <div class="modal-body">
          <div class="mb-2">
            <label for="cuadrantes-clonar-origen" class="form-label">Origen</label>
            <select id="cuadrantes-clonar-origen" class="form-select"></select>
          </div>
          <div>
            <label for="cuadrantes-clonar-destino" class="form-label">Destino</label>
            <select id="cuadrantes-clonar-destino" class="form-select"></select>
          </div>
          <div class="form-check mt-3">
            <input class="form-check-input" type="checkbox" id="cuadrantes-clonar-mantener-destino">
            <label class="form-check-label" for="cuadrantes-clonar-mantener-destino">
              Mantener datos de destino
            </label>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
          <button type="button" class="btn btn-primary" id="cuadrantes-clonar-confirmar">Clonar</button>
        </div>
      </div>
    </div>
  </div>`;
  document.body.insertAdjacentHTML("beforeend", modalHtml);
}

function bindInteraccionesCabeceraCuadrantes(tabla) {
  const host = tabla.element;
  if (!host || host.dataset.clonadoBind === "1") return;
  host.dataset.clonadoBind = "1";

  host.addEventListener("mouseover", (e) => {
    const title = e.target.closest(".cuadrante-header-title");
    if (!title) return;
    const colEl = title.closest(".tabulator-col");
    const field = colEl?.getAttribute("tabulator-field");
    if (!esCampoDiaCuadrante(field)) return;
    aplicarClaseColumnaCompleta(tabla, "cuadrante-columna-hover", field);
  });

  host.addEventListener("mouseout", (e) => {
    const title = e.target.closest(".cuadrante-header-title");
    if (!title) return;
    const relatedTitle = e.relatedTarget?.closest?.(".cuadrante-header-title");
    if (relatedTitle) return;
    limpiarClaseColumnaCompleta(tabla, "cuadrante-columna-hover");
  });

  host.addEventListener("dragstart", (e) => {
    const title = e.target.closest(".cuadrante-header-title");
    if (!title) return;
    const colEl = title.closest(".tabulator-col");
    const field = colEl?.getAttribute("tabulator-field");
    if (!esCampoDiaCuadrante(field) || esFechaFestivaCuadrante(field)) return;
    e.dataTransfer.setData("text/cuadrante-col-field", field);
    e.dataTransfer.effectAllowed = "copy";
    aplicarClaseColumnaCompleta(tabla, "cuadrante-columna-origen", field);
  });

  host.addEventListener("dragend", () => {
    limpiarClaseColumnaCompleta(tabla, "cuadrante-columna-origen");
    limpiarClaseColumnaCompleta(tabla, "cuadrante-columna-destino");
  });

  host.addEventListener("dragover", (e) => {
    if (!e.dataTransfer?.types?.includes("text/cuadrante-col-field")) return;
    const colEl = e.target.closest(".tabulator-col");
    const field = colEl?.getAttribute("tabulator-field");
    if (!esCampoDiaCuadrante(field) || esFechaFestivaCuadrante(field)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    aplicarClaseColumnaCompleta(tabla, "cuadrante-columna-destino", field);
  });

  host.addEventListener("dragleave", (e) => {
    const colEl = e.target.closest(".tabulator-col");
    if (!colEl) return;
    const relatedCol = e.relatedTarget?.closest?.(".tabulator-col");
    if (relatedCol === colEl) return;
    limpiarClaseColumnaCompleta(tabla, "cuadrante-columna-destino");
  });

  host.addEventListener("drop", (e) => {
    const fieldOrigen = e.dataTransfer?.getData("text/cuadrante-col-field");
    if (!fieldOrigen) return;
    const colEl = e.target.closest(".tabulator-col");
    const fieldDestino = colEl?.getAttribute("tabulator-field");
    if (!esCampoDiaCuadrante(fieldDestino) || fieldDestino === fieldOrigen || esFechaFestivaCuadrante(fieldOrigen) || esFechaFestivaCuadrante(fieldDestino)) return;
    e.preventDefault();
    limpiarClaseColumnaCompleta(tabla, "cuadrante-columna-origen");
    limpiarClaseColumnaCompleta(tabla, "cuadrante-columna-destino");
    abrirModalClonadoCuadrantes(tabla, fieldOrigen, fieldDestino);
  });
}

function obtenerColumnasDiasCuadrante(tabla) {
  return tabla.getColumns()
    .filter((col) => {
      const field = col.getField?.();
      return esCampoDiaCuadrante(field);
    })
    .map((col) => {
      const field = col.getField();
      const titulo = col.getElement()?.querySelector(".cuadrante-header-title span")?.textContent?.trim();
      return { field, label: titulo || field, festivo: esFechaFestivaCuadrante(field) };
    });
}

function esCampoDiaCuadrante(field) {
  return Boolean(field) && field !== "id" && field !== "nombre";
}

function aplicarClaseColumnaCompleta(tabla, clase, field) {
  limpiarClaseColumnaCompleta(tabla, clase);
  if (!field) return;
  tabla.element.querySelectorAll(`.tabulator-col[tabulator-field="${field}"]`).forEach((el) => el.classList.add(clase));
  tabla.element.querySelectorAll(`.tabulator-cell[tabulator-field="${field}"]`).forEach((el) => el.classList.add(clase));
}

function limpiarClaseColumnaCompleta(tabla, clase) {
  tabla.element.querySelectorAll(`.${clase}`).forEach((el) => el.classList.remove(clase));
}

function abrirModalClonadoCuadrantes(tabla, fieldOrigen = null, fieldDestino = null) {
  const modalEl = document.getElementById("cuadrantes-clonar-columna-modal");
  if (!modalEl) return;
  const selectOrigen = modalEl.querySelector("#cuadrantes-clonar-origen");
  const selectDestino = modalEl.querySelector("#cuadrantes-clonar-destino");
  const checkMantenerDestino = modalEl.querySelector("#cuadrantes-clonar-mantener-destino");
  const btnConfirmar = modalEl.querySelector("#cuadrantes-clonar-confirmar");
  if (!selectOrigen || !selectDestino || !checkMantenerDestino || !btnConfirmar) return;

  const columnasDias = obtenerColumnasDiasCuadrante(tabla).filter((col) => !col.festivo);
  if (!columnasDias.length) {
    alert("No hay días laborables disponibles para clonar.");
    return;
  }
  const optionsHtml = columnasDias.map((col) => `<option value="${col.field}">${col.label}</option>`).join("");
  selectOrigen.innerHTML = optionsHtml;
  selectDestino.innerHTML = optionsHtml;

  const origenFinal = fieldOrigen || columnasDias[0]?.field;
  if (origenFinal) selectOrigen.value = origenFinal;
  if (fieldDestino) selectDestino.value = fieldDestino;
  else if (columnasDias.length > 1) {
    const destinoDefecto = columnasDias.find((c) => c.field !== selectOrigen.value)?.field;
    if (destinoDefecto) selectDestino.value = destinoDefecto;
  }

  checkMantenerDestino.checked = false;

  btnConfirmar.onclick = () => {
    const origen = selectOrigen.value;
    const destino = selectDestino.value;
    const mantenerDatosDestino = checkMantenerDestino.checked;
    if (!origen || !destino || origen === destino) {
      alert("Selecciona origen y destino diferentes.");
      return;
    }

    const btn = btnConfirmar;
    btn.disabled = true;
    wsRequest("clonar_columna_cuadrante", {
      cuadrante_id: DATOS.cuadrante?.id,
      fecha_origen: origen,
      fecha_destino: destino,
      mantener_datos_destino: mantenerDatosDestino,
    })
      .then((data) => {
        if (!data) {
          alert("No se recibió respuesta válida del servidor.");
          return;
        }
        mostrar_cuadrantes({ data });
        actualizarIndicadoresFaltasCuadrante();
        bootstrap.Modal.getOrCreateInstance(modalEl).hide();
      })
      .catch((err) => {
        console.error(err);
        alert("Error al clonar columna: " + (err?.message || err));
      })
      .finally(() => {
        btn.disabled = false;
      });
  };

  const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
  modal.show();
}

function completarEmpleadosCuadrantes(key, listaUsuarios, usuarios, configuracion) {
  listaUsuarios.innerHTML = "";
  Object.values(usuarios)
    .sort(compararUsuariosCuadrantePorCodigo)
    .forEach(element => {
    if (element.empleado) {
      const pill = crearElemento("div",
        { value: element.id,
          class: `usuario-pill badge m-1 p-2${element.activo === false ? " inactivo" : ""}`,
          draggable: "true",
          style: getPillColorByIndex(element.id),
        }
      );
      pill.dataset.usuarioId = String(element.id);
      pill.appendChild(crearContenidoPillCuadrante(obtenerTextoPillCuadrante(element)));
      pill.dataset.detalle = JSON.stringify({ empleado: element, usuario_id: element.id });
      listaUsuarios.appendChild(pill);
    }
  });
  listaUsuarios.addEventListener("dragstart", (e) => {
    const pill = e.target.closest(".usuario-pill");
    if (pill) {
      e.dataTransfer.setData("tipo", "pill-listado");
      e.dataTransfer.setData("detalle", pill.dataset.detalle);
    }
  });
  listaUsuarios.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  });
  listaUsuarios.addEventListener("drop", async (e) => {
    e.preventDefault();

    const tipo = e.dataTransfer.getData("tipo");
    let detalle = JSON.parse(e.dataTransfer.getData("detalle"));

    if (tipo !== "pill-cuadrante" || !detalle.fecha || !detalle.puesto_id || !detalle.usuario_id || !detalle.id) return;

    const tabla = windowsRegistry.get(key).table;
    const rowOrigen = tabla.getRow(detalle.puesto_id);
    const valores = rowOrigen.getData()[detalle.fecha] ?? [];

    // quitar del cuadrante
    let respuesta = await eliminarDetalleCuadrante({id: detalle.id});

    console.log(respuesta, valores);
    const nuevosValores = valores.filter(p => String(p.id) !== String(respuesta.id));
    console.log(nuevosValores);
    rowOrigen.update({ [detalle.fecha]: nuevosValores });
    actualizarIndicadoresFaltasCuadrante();
  });

  repintarEstadoUsoCuadrante(windowsRegistry.get(key)?.table, listaUsuarios.closest(".contenedor-winbox") || document);
  actualizarIndicadoresFaltasCuadrante();
}

function agregarEventosCuadrantes(wb, configuracion, contenedor) {
  const input_fecha_cuadrantes = contenedor.querySelector('#u-cargar-cuadrantes-input');

  contenedor.querySelector("#u-cargar-cuadrantes")?.addEventListener("click", async () => {
    if (!input_fecha_cuadrantes.checkValidity()) {
      alert("Fecha inválida");
      input_fecha_cuadrantes.focus();
      return;
    }
    send("cargar_cuadrantes", { fecha: input_fecha_cuadrantes.value });
   
  });

  contenedor.querySelector("#u-color_empleados-input").addEventListener("change", async () => {
    document.querySelector("#contenedor-cuadrante").classList.toggle("mismo-color");
  });

  contenedor.querySelector("#u-ancho_empleados-input").addEventListener("change", async () => {
    document.querySelector("#contenedor-cuadrante").classList.toggle("mismo-ancho");
  });

  contenedor.querySelector("#u-ver-faltas-input").addEventListener("change", async () => {
    document.querySelector("#contenedor-cuadrante").classList.toggle("ver-faltas");
  });

  contenedor.querySelector("#u-extender-jueves-semana")?.addEventListener("click", async (event) => {
    const btn = event.currentTarget;
    btn.disabled = true;
    try {
      const fecha = input_fecha_cuadrantes.value || DATOS?.cuadrante?.fecha_inicio;
      await wsRequest("extender_jueves_semana_cuadrante", {
        cuadrante_id: DATOS?.cuadrante?.id,
        fecha,
      });
      if (fecha) {
        const data = await wsRequest("cargar_cuadrantes", { fecha });
        mostrar_cuadrantes({ data });
        actualizarIndicadoresFaltasCuadrante();
      }
    } catch (err) {
      console.error(err);
      alert("Error al extender lunes: " + (err?.message || err));
    } finally {
      btn.disabled = false;
    }
  });

  contenedor.querySelector("#u-limpiar-cuadrante")?.addEventListener("click", async (event) => {
    if (!DATOS?.cuadrante?.id) return;
    if (!confirm("¿Quieres limpiar todo el cuadrante actual?")) return;
    const btn = event.currentTarget;
    btn.disabled = true;
    try {
      const data = await wsRequest("limpiar_cuadrante", {
        cuadrante_id: DATOS.cuadrante.id,
      });
      mostrar_cuadrantes({ data });
      actualizarIndicadoresFaltasCuadrante();
    } catch (err) {
      console.error(err);
      alert("Error al limpiar el cuadrante: " + (err?.message || err));
    } finally {
      btn.disabled = false;
    }
  });

  input_fecha_cuadrantes.value = obtenerAnteriorDiaSemana().toISOString().split("T")[0];
  actualizarIndicadoresFaltasCuadrante();
}

async function actualizarDetalleCuadrante(detalles) {
  let respuesta = await wsRequest("actualizar_detalle_cuadrante", detalles);
  console.log(respuesta);
  return respuesta;
}

async function insertarDetalleCuadrante(detalles) {
  console.log(detalles);
  let respuesta = await wsRequest("insertar_detalle_cuadrante", detalles);
  console.log(respuesta);
  return respuesta;
}

async function eliminarDetalleCuadrante(detalles) {
  let respuesta = await wsRequest("eliminar_detalle_cuadrante",  detalles);
  console.log(respuesta);
  return respuesta;
}


function respuesta_cuadrantes(msg) {
  console.log("Respuesta cuadrantes:", msg);
  // Aquí podríamos actualizar DATOS.cuadrante.detalles si es necesario
}
