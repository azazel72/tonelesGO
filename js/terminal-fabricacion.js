function prepararEventosFabricacion() {
    registrarEventosVistaProduccion("vista_consumo");
    registrarEventosVistaProduccion("vista_fabricacion");

    const btnAgregar = document.getElementById("consumo-agregar-trazabilidad");
    if (btnAgregar) {
        btnAgregar.addEventListener("click", () => {
            agregarTrazabilidadFabricacionDesdeUI("vista_consumo");
        });
    }

    const btnImprimir = document.getElementById("fabricacion-imprimir-etiqueta");
    if (btnImprimir) {
        btnImprimir.addEventListener("click", () => {
            abrirModalOperarioFabricacion();
        });
    }

    const btnConfirmar = document.getElementById("fabricacion-confirmar-impresion");
    if (btnConfirmar) {
        btnConfirmar.addEventListener("click", async () => {
            const operariosIds = obtenerOperariosSeleccionados();
            if (!operariosIds.length) {
                alert("Selecciona al menos un operario.");
                return;
            }
            const inputCantidad = document.getElementById("fabricacion-cantidad-etiquetas");
            const cantidad = Math.max(1, Number.parseInt(inputCantidad?.value || "1", 10) || 1);
            if (inputCantidad) inputCantidad.value = String(cantidad);
            const modalEl = document.getElementById("modalOperarioFabricacion");
            const modal = modalEl ? bootstrap.Modal.getInstance(modalEl) : null;
            if (modal) modal.hide();
            await imprimirEtiquetaFabricacion(operariosIds, cantidad);
        });
    }

    const tablaTrazConsumo = document.querySelector("#tabla_trazabilidad_consumo tbody");
    if (tablaTrazConsumo) {
        tablaTrazConsumo.addEventListener("click", async (event) => {
            const btn = event.target.closest("[data-action='trazabilidad-consumo-eliminar']");
            if (!btn) return;
            const tr = btn.closest("tr");
            if (!tr) return;
            const id = Number(tr.dataset.trazabilidadId);
            const cantidad = Number(tr.dataset.cantidad || 0);
            if (!id) return;
            if (cantidad !== 0) {
                alert("Solo se puede eliminar cuando la cantidad fabricada es 0.");
                return;
            }
            if (!confirm("¿Sacar lote de trazabilidad?")) return;
            await wsRequest("eliminar_trazabilidad_fabricacion", { id });
            cargarTrazabilidadFabricacion(lineaFabricacionActualId, "vista_consumo");
        });
    }

    const tablaTrazFabricacion = document.querySelector("#tabla_trazabilidad_fabricacion tbody");
    if (tablaTrazFabricacion) {
        tablaTrazFabricacion.addEventListener("click", async (event) => {
            const btn = event.target.closest("[data-action='trazabilidad-fabricacion-reactivar'], [data-action='trazabilidad-fabricacion-toggle']");
            if (!btn) return;
            const tr = btn.closest("tr");
            if (!tr) return;
            const id = Number(tr.dataset.trazabilidadId);
            const estado = Number(tr.dataset.estado || 0);
            const cantidad = Number(tr.dataset.cantidad || 0);
            const action = btn.getAttribute("data-action");
            if (!id) return;

            if (action === "trazabilidad-fabricacion-reactivar") {
                if (cantidad >= LIMITE_REACTIVAR_ESTADO) {
                    alert(`No se puede reactivar si la cantidad es mayor o igual a ${LIMITE_REACTIVAR_ESTADO}.`);
                    return;
                }
                if (!confirm("¿Cambiar a estado 0 para volver a usar este palet?")) return;
                await wsRequest("actualizar_estado_trazabilidad_fabricacion", { id, estado: 0 });
                cargarTrazabilidadFabricacion(lineaFabricacionActualId, "vista_fabricacion");
                cargarTrazabilidadFabricacion(lineaFabricacionActualId, "vista_consumo");
                return;
            }

            if (estado === 0 && cantidad === 0) {
                if (!confirm("¿Eliminar esta linea de trazabilidad?")) return;
                await wsRequest("eliminar_trazabilidad_fabricacion", { id });
                cargarTrazabilidadFabricacion(lineaFabricacionActualId, "vista_fabricacion");
                cargarTrazabilidadFabricacion(lineaFabricacionActualId, "vista_consumo");
                return;
            }

            if (!confirm("¿Cambiar a estado 1 para no usar este palet en nuevas trazabilidades?")) return;
            await wsRequest("actualizar_estado_trazabilidad_fabricacion", { id, estado: 1 });
            cargarTrazabilidadFabricacion(lineaFabricacionActualId, "vista_fabricacion");
            cargarTrazabilidadFabricacion(lineaFabricacionActualId, "vista_consumo");
        });
    }

}

function registrarEventosVistaProduccion(vistaId) {
    const cfg = obtenerConfigVistaProduccion(vistaId);
    const tbodyOrdenes = document.querySelector(`${cfg.sectionSelector} ${cfg.tablaOrdenesSelector} tbody`);
    if (tbodyOrdenes) {
        tbodyOrdenes.addEventListener("click", function (event) {
            const fila = event.target.closest("tr");
            if (!fila) return;
            seleccionarFabricacion(fila, { vistaId });
        });
    }

    const tablaLineas = document.querySelector(`${cfg.sectionSelector} ${cfg.tablaLineasSelector}`);
    if (tablaLineas) {
        tablaLineas.addEventListener("click", function (event) {
            const fila = event.target.closest("tr");
            if (!fila) return;
            seleccionarContenidoOrden(fila, vistaId);
        });
    }
}

let lineaFabricacionActualId = null;
let ordenFabricacionActualId = null;
const LIMITE_REACTIVAR_ESTADO = 1400;
let vistaProduccionActiva = "vista_fabricacion";

function obtenerVistaProduccionActiva(vistaId = null) {
    if (vistaId === "vista_consumo" || vistaId === "vista_fabricacion") return vistaId;
    if (typeof pantallaActual !== "undefined" && (pantallaActual === "vista_consumo" || pantallaActual === "vista_fabricacion")) {
        return pantallaActual;
    }
    return vistaProduccionActiva || "vista_fabricacion";
}

function obtenerConfigVistaProduccion(vistaId = null) {
    const vista = obtenerVistaProduccionActiva(vistaId);
    if (vista === "vista_consumo") {
        return {
            vistaId: "vista_consumo",
            sectionSelector: "#vista_consumo",
            tablaOrdenesSelector: "#tabla_ordenes_consumo",
            tablaLineasSelector: "#tabla_contenido_orden_consumo",
            tituloOrdenSelector: ".orden_consumo_seleccionada",
            modalId: "modalConsumo",
            productoSpanId: "consumo-producto-orden",
            tablaTrazabilidadSelector: "#tabla_trazabilidad_consumo",
            inputCodigoId: "consumo-palet-codigo",
        };
    }
    return {
        vistaId: "vista_fabricacion",
        sectionSelector: "#vista_fabricacion",
        tablaOrdenesSelector: "#tabla_ordenes_fabricacion",
        tablaLineasSelector: "#tabla_contenido_orden_fabricacion",
        tituloOrdenSelector: ".orden_fabricacion_seleccionada",
        modalId: "modalFabricacion",
        productoSpanId: "fabricacion-producto-orden",
        tablaTrazabilidadSelector: "#tabla_trazabilidad_fabricacion",
        inputCodigoId: null,
    };
}

// Cache sencillo para datos que necesitamos mostrar
const terminalFabricacion = {
    clientes: null,
    estados_trazabilidad_fabricacion: null,
    tipos_producto: null,
    usuarios: null,
    puestos_trabajo: null,
};

async function refrescarMaestrosFabricacion() {
    try {
        const maestros = await wsRequest("maestros", {});
        terminalFabricacion.clientes = maestros?.clientes || {};
        terminalFabricacion.estados_trazabilidad_fabricacion = maestros?.estados_trazabilidad_fabricacion || {};
        terminalFabricacion.usuarios = maestros?.usuarios || {};
        terminalFabricacion.puestos_trabajo = maestros?.puestos_trabajo || {};
    } catch (err) {
        console.error("No se pudieron refrescar maestros:", err);
    }
}

async function asegurarDatosFabricacionTerminal() {
    if (terminalFabricacion.clientes && terminalFabricacion.estados_trazabilidad_fabricacion && terminalFabricacion.tipos_producto && terminalFabricacion.usuarios) return;
    try {
        const maestros = await wsRequest("maestros", {});
        terminalFabricacion.clientes = maestros?.clientes || {};
        terminalFabricacion.estados_trazabilidad_fabricacion = maestros?.estados_trazabilidad_fabricacion || {};
        terminalFabricacion.usuarios = maestros?.usuarios || {};
        terminalFabricacion.puestos_trabajo = maestros?.puestos_trabajo || {};
        const fabricacion = await wsRequest("fabricacion", {});
        terminalFabricacion.tipos_producto = fabricacion?.tipos_producto || {};
    } catch (err) {
        console.error("No se pudieron cargar datos de fabricacion:", err);
        terminalFabricacion.clientes = terminalFabricacion.clientes || {};
        terminalFabricacion.estados_trazabilidad_fabricacion = terminalFabricacion.estados_trazabilidad_fabricacion || {};
        terminalFabricacion.tipos_producto = terminalFabricacion.tipos_producto || {};
        terminalFabricacion.usuarios = terminalFabricacion.usuarios || {};
        terminalFabricacion.puestos_trabajo = terminalFabricacion.puestos_trabajo || {};
    }
}

async function cargarOrdenesFabricacion(opciones = {}) {
    const cfg = obtenerConfigVistaProduccion(opciones.vistaId);
    vistaProduccionActiva = cfg.vistaId;
    const autoAccesoConsumo = opciones.autoAccesoConsumo === true;
    const tbody = document.querySelector(`${cfg.tablaOrdenesSelector} tbody`);
    if (!tbody) return;
    try {
        await asegurarDatosFabricacionTerminal();
        const añoActual = new Date().getFullYear();
        const ordenes = (await wsRequest("listar_ordenes_fabricacion", { "año": añoActual })) || [];

        tbody.innerHTML = "";
        if (!ordenes.length) {
            const tr = document.createElement("tr");
            const td = document.createElement("td");
            td.colSpan = 3;
            td.textContent = "No hay ordenes de fabricacion";
            tr.appendChild(td);
            tbody.appendChild(tr);
            actualizarTablaLineasFabricacion([], cfg.vistaId);
            return;
        }

        ordenes.forEach((o) => {
            const tr = document.createElement("tr");
            tr.dataset.ordenId = o.id;
            tr.dataset.numero = o.numero || o.id;
            tr.dataset.fecha = o.fecha;
            const descripcion = o.descripcion || "";
            tr.dataset.descripcion = descripcion;
            tr.innerHTML = `
        <td>${o.numero || o.id}</td>
        <td>${formatearFechaEuropea(o.fecha)}</td>
        <td>${descripcion}</td>
      `;
            tbody.appendChild(tr);
        });

        if (autoAccesoConsumo && ordenes.length === 1) {
            const filaUnica = tbody.querySelector("tr[data-orden-id]");
            if (filaUnica) {
                await seleccionarFabricacion(filaUnica, { autoAbrirLineaUnica: true, vistaId: cfg.vistaId });
            }
        }
    } catch (err) {
        console.error(err);
        tbody.innerHTML = `<tr><td colspan="3">Error al cargar ordenes</td></tr>`;
    }
}

async function seleccionarFabricacion(fila, opciones = {}) {
    const cfg = obtenerConfigVistaProduccion(opciones.vistaId);
    vistaProduccionActiva = cfg.vistaId;
    const autoAbrirLineaUnica = opciones.autoAbrirLineaUnica === true;
    vista_fabricacion = document.getElementById(cfg.vistaId);
    vista_fabricacion.setAttribute("modo", "contenido_orden");

    const ordenId = Number(fila.dataset.ordenId);
    const numero = fila.dataset.numero || ordenId;
    const fecha = formatearFechaEuropea(fila.dataset.fecha);
    const descripcion = fila.dataset.descripcion || fila.children?.[2]?.textContent || "";
    const titulo = `Orden ${numero}, ${fecha}${descripcion ? ", " + descripcion : ""}`;
    const tituloOrden = document.querySelector(cfg.tituloOrdenSelector);
    if (tituloOrden) tituloOrden.textContent = titulo;

    ordenFabricacionActualId = ordenId;
    if (typeof setPantalla === "function") {
        setPantalla(cfg.vistaId, { orden_id: ordenId });
    }
    await cargarLineasFabricacion(ordenId, { autoAbrirLineaUnica, vistaId: cfg.vistaId });
}

function seleccionarContenidoOrden(fila, vistaId = null) {
    const cfg = obtenerConfigVistaProduccion(vistaId);
    if (fila.closest("tfoot")) {
        vista_fabricacion = document.getElementById(cfg.vistaId);
        vista_fabricacion.setAttribute("modo", "listado_ordenes");
    } else {
        mostrarLotesMateriales(fila, cfg.vistaId);
    }
}

function mostrarLotesMateriales(fila, vistaId = null) {
    const cfg = obtenerConfigVistaProduccion(vistaId);
    vistaProduccionActiva = cfg.vistaId;
    lineaFabricacionActualId = Number(fila.dataset.lineaId || 0) || null;
    const tipoId = Number(fila.dataset.tipoProductoId || 0) || null;
    const descripcion =
        (tipoId && terminalFabricacion.tipos_producto?.[tipoId]?.descripcion) ||
        fila.children?.[0]?.textContent ||
        "Producto";
    const titulo = document.getElementById(cfg.productoSpanId);
    if (titulo) titulo.textContent = descripcion;
    const modalEl = document.getElementById(cfg.modalId);
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
    if (typeof setPantalla === "function") {
        setPantalla(cfg.vistaId, { orden_id: ordenFabricacionActualId, linea_fabricacion_id: lineaFabricacionActualId });
    }
    if (lineaFabricacionActualId) {
        cargarTrazabilidadFabricacion(lineaFabricacionActualId, cfg.vistaId);
    }
}

async function cargarLineasFabricacion(ordenId, opciones = {}) {
    const cfg = obtenerConfigVistaProduccion(opciones.vistaId);
    vistaProduccionActiva = cfg.vistaId;
    const autoAbrirLineaUnica = opciones.autoAbrirLineaUnica === true;
    const tbody = document.querySelector(`${cfg.tablaLineasSelector} tbody`);
    if (!tbody) return;
    try {
        const lineas = (await wsRequest("listar_lineas_fabricacion", { orden_id: ordenId })) || [];
        actualizarTablaLineasFabricacion(lineas, cfg.vistaId);
        if (autoAbrirLineaUnica && lineas.length === 1) {
            const filaUnica = tbody.querySelector("tr[data-linea-id]");
            if (filaUnica) {
                mostrarLotesMateriales(filaUnica, cfg.vistaId);
            }
        }
    } catch (err) {
        console.error(err);
        tbody.innerHTML = `<tr><td colspan="4">Error al cargar lineas</td></tr>`;
    }
}

function actualizarTablaLineasFabricacion(lineas, vistaId = null) {
    const cfg = obtenerConfigVistaProduccion(vistaId);
    const tbody = document.querySelector(`${cfg.tablaLineasSelector} tbody`);
    if (!tbody) return;
    tbody.innerHTML = "";
    if (!lineas || !lineas.length) {
        const tr = document.createElement("tr");
        const td = document.createElement("td");
        td.colSpan = 4;
        td.textContent = "Sin lineas";
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
    }
    lineas.forEach((l) => {
        const tr = document.createElement("tr");
        tr.dataset.lineaId = l.id ?? "";
        tr.dataset.tipoProductoId = l.tipo_producto_id ?? "";
        const tipo =
            terminalFabricacion.tipos_producto?.[l.tipo_producto_id]?.descripcion ||
            (typeof l.tipo_producto_id !== "undefined" ? String(l.tipo_producto_id) : "");
        const cantidad = Number(l.cantidad) || 0;
        const fabricada = Number(l.cantidad_fabricada) || 0;
        const falta = Math.max(0, cantidad - fabricada);
        tr.innerHTML = `
      <td>${tipo}</td>
      <td>${cantidad}</td>
      <td>${fabricada}</td>
      <td>${falta}</td>
    `;
        tbody.appendChild(tr);
    });
}

function formatearFechaEuropea(valor) {
    if (!valor) return "";
    const d = new Date(valor);
    if (Number.isNaN(d.getTime())) return valor;
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
}

async function cargarTrazabilidadFabricacion(lineaId, vistaId = "vista_consumo") {
    const cfg = obtenerConfigVistaProduccion(vistaId);
    if (!cfg.tablaTrazabilidadSelector) return;
    const tbody = document.querySelector(`${cfg.tablaTrazabilidadSelector} tbody`);
    if (!tbody) return;
    try {
        await asegurarDatosFabricacionTerminal();
        const trazas = (await wsRequest("listar_trazabilidad_fabricacion", { linea_fabricacion_id: lineaId })) || [];
        tbody.innerHTML = "";
        if (!trazas.length) {
            const tr = document.createElement("tr");
            const td = document.createElement("td");
            td.colSpan = 3;
            td.textContent = "Sin registros";
            tr.appendChild(td);
            tbody.appendChild(tr);
            return;
        }
        trazas.forEach((t) => {
            const tr = document.createElement("tr");
            const estado = terminalFabricacion.estados_trazabilidad_fabricacion?.[t.estado]?.descripcion || (t.estado ?? "");
            tr.dataset.trazabilidadId = t.id ?? "";
            tr.dataset.estado = t.estado ?? 0;
            tr.dataset.cantidad = t.cantidad_fabricada ?? 0;
            if (Number(t.estado) === 1) tr.classList.add("trazabilidad-inactiva");
            let botonHtml = "";
            if (cfg.vistaId === "vista_consumo") {
                const puedeEliminar = Number(t.cantidad_fabricada ?? 0) === 0;
                botonHtml = puedeEliminar
                    ? `<button type="button" class="btn btn-sm btn-outline-danger" data-action="trazabilidad-consumo-eliminar" title="Sacar lote de trazabilidad">
                         <i class="bi bi-trash"></i>
                       </button>`
                    : `<span class="text-muted">-</span>`;
            } else {
                const esInactiva = Number(t.estado ?? 0) === 1;
                const icono = esInactiva ? "bi-arrow-counterclockwise" : "bi-trash";
                const accion = esInactiva ? "trazabilidad-fabricacion-reactivar" : "trazabilidad-fabricacion-toggle";
                const titulo = esInactiva ? "Reactivar" : "Eliminar o inactivar";
                botonHtml = `<button type="button" class="btn btn-sm btn-outline-danger" data-action="${accion}" title="${titulo}">
                               <i class="bi ${icono}"></i>
                             </button>`;
            }
            tr.innerHTML = `
        <td>${t.palet_codigo || t.palet_id || ""}</td>
        <td>${t.cantidad_fabricada ?? ""}</td>
        <td class="text-center">
          ${botonHtml}
        </td>
      `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error(err);
        tbody.innerHTML = `<tr><td colspan="3">Error al cargar trazabilidad</td></tr>`;
    }
}

async function agregarTrazabilidadFabricacionDesdeUI(_vistaId = "vista_consumo") {
    const cfg = obtenerConfigVistaProduccion("vista_consumo");
    const codigoInput = document.getElementById(cfg.inputCodigoId);
    const codigo = (codigoInput?.value || "").trim();
    const cantidad = 0;

    if (!lineaFabricacionActualId) {
        alert("Seleccione una linea de fabricacion.");
        return;
    }
    if (!codigo) {
        alert("Ingrese un codigo de palet.");
        return;
    }

    try {
        await wsRequest("agregar_trazabilidad_fabricacion", {
            linea_fabricacion_id: lineaFabricacionActualId,
            palet_codigo: codigo,
            cantidad_fabricada: cantidad,
        });
        if (codigoInput) codigoInput.value = "";
        cargarTrazabilidadFabricacion(lineaFabricacionActualId, "vista_consumo");
    } catch (err) {
        console.error(err);
        alert("Error al agregar trazabilidad.");
    }
}

async function abrirModalOperarioFabricacion() {
    const modalEl = document.getElementById("modalOperarioFabricacion");
    if (!modalEl) return;
    const inputCantidad = document.getElementById("fabricacion-cantidad-etiquetas");
    if (inputCantidad && (!inputCantidad.value || Number(inputCantidad.value) < 1)) {
        inputCantidad.value = "1";
    }
    await asegurarDatosFabricacionTerminal();
    await cargarOperariosEnModal();
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
    ajustarZIndexModal(modalEl);
}

function ajustarZIndexModal(modalEl) {
    const abiertos = document.querySelectorAll(".modal.show").length;
    const base = 1050;
    const zIndex = base + (abiertos * 10);
    modalEl.style.zIndex = zIndex;
    const backdrop = document.querySelector(".modal-backdrop.show:last-of-type");
    if (backdrop) {
        backdrop.style.zIndex = zIndex - 1;
    }
}

function obtenerFechasPreferencia() {
    const fechas = [];
    const hoy = new Date();
    fechas.push(formatearFechaYYYYMMDD(hoy));
    let cursor = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    let count = 0;
    while (count < 3) {
        cursor.setDate(cursor.getDate() - 1);
        const day = cursor.getDay();
        if (day === 0 || day === 6) continue;
        fechas.push(formatearFechaYYYYMMDD(cursor));
        count += 1;
    }
    return fechas;
}

function formatearFechaYYYYMMDD(fecha) {
    const y = fecha.getFullYear();
    const m = String(fecha.getMonth() + 1).padStart(2, "0");
    const d = String(fecha.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

function formatearFechaYYYYMMDDUtc(fecha) {
    const y = fecha.getUTCFullYear();
    const m = String(fecha.getUTCMonth() + 1).padStart(2, "0");
    const d = String(fecha.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

function obtenerInicioCuadranteDesdeFecha(fechaStr) {
    const base = obtenerAnteriorDiaSemana(4, new Date(fechaStr + "T00:00:00"));
    return formatearFechaYYYYMMDDUtc(base);
}

async function obtenerOperariosPorPuesto(fechas) {
    const puestosFabricacion = Object.values(terminalFabricacion.puestos_trabajo || {})
        .filter((p) => p && p.fabricacion)
        .map((p) => p.id);
    if (!puestosFabricacion.length || !fechas.length) return new Map();

    const fechasSet = new Set(fechas);
    const cuadrantesPorInicio = new Map();
    const inicios = Array.from(new Set(fechas.map(obtenerInicioCuadranteDesdeFecha)));
    for (const inicio of inicios) {
        try {
            const cuadrante = await wsRequest("cargar_cuadrantes", { fecha: inicio });
            cuadrantesPorInicio.set(inicio, cuadrante);
        } catch (err) {
            console.warn("No se pudo cargar cuadrante:", inicio, err);
        }
    }

    const porPuesto = new Map();
    for (const cuadrante of cuadrantesPorInicio.values()) {
        const detalles = cuadrante?.detalles || [];
        detalles.forEach((det) => {
            if (!fechasSet.has(det.fecha)) return;
            if (!puestosFabricacion.includes(det.puesto_id)) return;
            if (!det.usuario_id) return;
            if (!porPuesto.has(det.puesto_id)) {
                porPuesto.set(det.puesto_id, new Set());
            }
            porPuesto.get(det.puesto_id).add(det.usuario_id);
        });
    }
    return porPuesto;
}

function ordenarEmpleadosPorNombre(empleados) {
    return empleados.sort((a, b) => {
        const na = (a?.nombre || a?.alias || "").toString();
        const nb = (b?.nombre || b?.alias || "").toString();
        return na.localeCompare(nb, "es", { sensitivity: "base" });
    });
}

function crearFilaSeccion(texto) {
    const tr = document.createElement("tr");
    tr.className = "table-secondary";
    const td = document.createElement("td");
    td.colSpan = 2;
    td.textContent = texto;
    tr.appendChild(td);
    return tr;
}

function crearFilaOperario({ id, nombre, fecha, checked = false }) {
    const tr = document.createElement("tr");
    tr.dataset.operarioId = id;
    if (checked) tr.classList.add("operario-row-selected");
    const fechaTexto = fecha ? (typeof formatearFechaEuropea === "function" ? formatearFechaEuropea(fecha) : fecha) : "";
    tr.innerHTML = `
      <td>${fechaTexto}</td>
      <td>${nombre}</td>
    `;
    tr.addEventListener("click", (e) => {
        tr.classList.toggle("operario-row-selected");
    });
    return tr;
}

async function cargarOperariosEnModal() {
    const tbody = document.querySelector("#tabla_operarios_fabricacion tbody");
    const btnConfirmar = document.getElementById("fabricacion-confirmar-impresion");
    if (!tbody) return;
    let payload = [];
    try {
        payload = await wsRequest("listar_operarios_planificacion_fabricacion", {}) || [];
    } catch (err) {
        console.warn("No se pudieron cargar operarios planificados:", err);
    }
    tbody.innerHTML = "";
    if (!payload.length) {
        const tr = document.createElement("tr");
        const td = document.createElement("td");
        td.colSpan = 2;
        td.textContent = "No hay empleados disponibles.";
        tr.appendChild(td);
        tbody.appendChild(tr);
        if (btnConfirmar) btnConfirmar.disabled = true;
        return;
    }
    if (btnConfirmar) btnConfirmar.disabled = false;
    const planificados = payload.filter((p) => p.origen === "planificacion");
    const otros = payload.filter((p) => p.origen !== "planificacion");

    const porPuesto = new Map();
    planificados.forEach((item) => {
        const puestoId = item.puesto_id || 0;
        if (!porPuesto.has(puestoId)) porPuesto.set(puestoId, new Map());
        const porUsuario = porPuesto.get(puestoId);
        const usuarioId = item.usuario_id;
        if (!usuarioId) return;
        const existente = porUsuario.get(usuarioId);
        if (!existente || (item.fecha && existente.fecha < item.fecha)) {
            porUsuario.set(usuarioId, item);
        }
    });

    const yaListados = new Set();
    const getPuestoNombre = (map) => map.values().next().value?.puesto_nombre || "";
    Array.from(porPuesto.entries())
        .sort((a, b) => getPuestoNombre(a[1]).localeCompare(getPuestoNombre(b[1]), "es", { sensitivity: "base" }))
        .forEach(([puestoId, porUsuario]) => {
            const sample = porUsuario.values().next().value;
            const puestoNombre = sample?.puesto_nombre || `Puesto ${puestoId}`;
            const lista = Array.from(porUsuario.values()).sort((a, b) => {
                const na = a?.usuario?.nombre || a?.usuario?.alias || "";
                const nb = b?.usuario?.nombre || b?.usuario?.alias || "";
                return na.localeCompare(nb, "es", { sensitivity: "base" });
            });
            if (!lista.length) return;
            tbody.appendChild(crearFilaSeccion(`Puesto: ${puestoNombre}`));
            lista.forEach((item) => {
                const u = item.usuario || {};
                if (u.id) yaListados.add(u.id);
                tbody.appendChild(crearFilaOperario({
                    id: u.id,
                    nombre: u.nombre || u.alias || `Empleado ${u.id || ""}`.trim(),
                    fecha: item.fecha,
                    checked: false,
                }));
            });
        });

    const otrosFiltrados = ordenarEmpleadosPorNombre(
        otros
            .map((o) => o.usuario)
            .filter((u) => u && !yaListados.has(u.id))
    );
    if (otrosFiltrados.length) {
        tbody.appendChild(crearFilaSeccion("Otros operarios"));
        otrosFiltrados.forEach((u) => {
            tbody.appendChild(crearFilaOperario({
                id: u.id,
                nombre: u.nombre || u.alias || `Empleado ${u.id}`,
                fecha: "",
                checked: false,
            }));
        });
    }
}

function obtenerOperariosSeleccionados() {
    const seleccionados = Array.from(
        document.querySelectorAll("#tabla_operarios_fabricacion tbody tr.operario-row-selected")
    )
        .map((tr) => Number(tr.dataset.operarioId))
        .filter((id) => Number.isFinite(id));
    return Array.from(new Set(seleccionados));
}

async function imprimirEtiquetaFabricacion(operariosIds = [], cantidadEtiquetas = 1) {
    if (!lineaFabricacionActualId) {
        alert("Seleccione una linea de fabricacion.");
        return;
    }
    try {
        const trazas = (await wsRequest("listar_trazabilidad_fabricacion", { linea_fabricacion_id: lineaFabricacionActualId })) || [];
        const activas = trazas.filter((t) => Number(t.estado || 0) === 0);
        if (!activas.length) {
            alert("No hay palets activos para imprimir.");
            return;
        }
        const trazabilidadIds = activas
            .map((t) => Number(t.id))
            .filter((id) => !!id);
        const paletCodigos = activas.map((t) => t.palet_codigo || t.palet_id || "").filter(Boolean);
        const resp = await wsRequest("imprimir_etiqueta_fabricacion", {
            trazabilidad_ids: trazabilidadIds,
            palet_codigos: paletCodigos,
            tipo: "BOTA",
            operarios_ids: operariosIds,
            cantidad_etiquetas: Math.max(1, Number.parseInt(String(cantidadEtiquetas), 10) || 1),
        });
        console.log("Etiqueta creada:", resp);
        cargarTrazabilidadFabricacion(lineaFabricacionActualId, "vista_consumo");
        if (ordenFabricacionActualId) {
            cargarLineasFabricacion(ordenFabricacionActualId, { vistaId: "vista_fabricacion" });
            cargarLineasFabricacion(ordenFabricacionActualId, { vistaId: "vista_consumo" });
        }
    } catch (err) {
        console.error(err);
        alert("Error al imprimir etiqueta.");
    }
}


function refrescarFabricacionDesdeServidor(_data = {}) {
    cargarOrdenesFabricacion({ vistaId: "vista_consumo" });
    cargarOrdenesFabricacion({ vistaId: "vista_fabricacion" });
    if (ordenFabricacionActualId) {
        cargarLineasFabricacion(ordenFabricacionActualId, { vistaId: "vista_consumo" });
        cargarLineasFabricacion(ordenFabricacionActualId, { vistaId: "vista_fabricacion" });
    }
    if (lineaFabricacionActualId) {
        cargarTrazabilidadFabricacion(lineaFabricacionActualId, "vista_consumo");
        cargarTrazabilidadFabricacion(lineaFabricacionActualId, "vista_fabricacion");
    }
}
