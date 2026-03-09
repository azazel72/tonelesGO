function prepararEventosFabricacion() {
    console.log("[fabricar-bota] prepararEventosFabricacion iniciado");
    registrarEventosVistaProduccion("vista_consumo");
    registrarEventosVistaProduccion("vista_fabricacion");

    const btnAgregarDesdeStock = document.getElementById("consumo-stock-agregar-trazabilidad");
    if (btnAgregarDesdeStock) {
        btnAgregarDesdeStock.addEventListener("click", () => {
            agregarTrazabilidadFabricacionDesdeStockUI("vista_consumo");
        });
    }
    const btnAgregarDesdePalet = document.getElementById("consumo-palet-agregar-trazabilidad");
    if (btnAgregarDesdePalet) {
        btnAgregarDesdePalet.addEventListener("click", () => {
            agregarTrazabilidadFabricacionDesdePaletUI();
        });
    }
    const selectUbicacionConsumo = document.getElementById("consumo-ubicacion-origen");
    if (selectUbicacionConsumo) {
        selectUbicacionConsumo.addEventListener("change", async () => {
            await actualizarStockYCubicajeConsumo();
        });
    }
    const selectTipoConsumo = document.getElementById("consumo-tipo-producto");
    if (selectTipoConsumo) {
        selectTipoConsumo.addEventListener("change", async () => {
            await actualizarStockYCubicajeConsumo();
        });
    }
    const selectMaderaConsumo = document.getElementById("consumo-madera");
    if (selectMaderaConsumo) {
        selectMaderaConsumo.addEventListener("change", async () => {
            await actualizarStockYCubicajeConsumo();
        });
    }
    const selectPaletConsumo = document.getElementById("consumo-palet-origen");
    if (selectPaletConsumo) {
        selectPaletConsumo.addEventListener("change", () => {
            autocompletarCamposConsumoDesdeStock();
        });
    }

    const btnImprimir = document.getElementById("fabricacion-imprimir-etiqueta");
    console.log("[fabricar-bota] boton abrir modal encontrado:", !!btnImprimir);

    const btnImprimirFabricarBota = document.getElementById("fabricar-bota-imprimir");
    console.log("[fabricar-bota] boton imprimir encontrado:", !!btnImprimirFabricarBota);
    if (btnImprimirFabricarBota) {
        btnImprimirFabricarBota.addEventListener("click", async () => {
            console.log("[fabricar-bota] click en boton imprimir (listener js)");
            await imprimirEtiquetaFabricarBotaDesdeUI();
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
    const tbodyOrdenes = cfg.tablaOrdenesSelector
        ? document.querySelector(`${cfg.sectionSelector} ${cfg.tablaOrdenesSelector} tbody`)
        : null;
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
let lineaFabricacionMaterialActualId = null;
let lineaFabricacionTipoActualId = null;
let lineaFabricacionTipoBotaActualId = null;
let ordenFabricacionActualId = null;
const LIMITE_REACTIVAR_ESTADO = 1400;
let vistaProduccionActiva = "vista_fabricacion";
let trazabilidadesActivasFabricarBota = [];

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
            tablaOrdenesSelector: null,
            tablaLineasSelector: "#tabla_consumo_fabricacion_semanal",
            tituloOrdenSelector: null,
            modalId: "modalConsumo",
            productoSpanId: "consumo-producto-orden",
            tablaTrazabilidadSelector: "#tabla_trazabilidad_consumo",
            selectPaletOrigenId: "consumo-palet-origen",
            inputLoteId: "consumo-lote",
            inputCubicajeId: "consumo-cubicaje",
        };
    }
    return {
        vistaId: "vista_fabricacion",
        sectionSelector: "#vista_fabricacion",
        tablaOrdenesSelector: "#tabla_pedidos",
        tablaLineasSelector: "#tabla_fabricacion_semanal",
        tituloOrdenSelector: ".pedido_seleccionado",
        modalId: "modalFabricacion",
        productoSpanId: "fabricacion-producto-orden",
        tablaTrazabilidadSelector: "#tabla_trazabilidad_fabricacion",
        selectPaletOrigenId: null,
        inputLoteId: null,
        inputCubicajeId: null,
    };
}

// Cache sencillo para datos que necesitamos mostrar
const terminalFabricacion = {
    clientes: null,
    estados_trazabilidad_fabricacion: null,
    tipos_producto: null,
    materiales: null,
    duelas: null,
    instalaciones: null,
    ubicaciones: null,
    palets: null,
    stocks: null,
    cubicaje: null,
    usuarios: null,
    puestos_trabajo: null,
    pedidos: null,
    consumos: null,
    stocksConsumo: [],
    cubicajeConsumo: [],
};

async function refrescarMaestrosFabricacion() {
    try {
        const maestros = await wsRequest("maestros", {});
        terminalFabricacion.clientes = maestros?.clientes || {};
        terminalFabricacion.estados_trazabilidad_fabricacion = maestros?.estados_trazabilidad_fabricacion || {};
        terminalFabricacion.materiales = maestros?.materiales || {};
        terminalFabricacion.duelas = maestros?.duelas || {};
        terminalFabricacion.instalaciones = maestros?.instalaciones || {};
        terminalFabricacion.ubicaciones = maestros?.ubicaciones || {};
        terminalFabricacion.palets = maestros?.palets || {};
        terminalFabricacion.stocks = maestros?.stocks || {};
        terminalFabricacion.cubicaje = maestros?.cubicaje || {};
        terminalFabricacion.usuarios = maestros?.usuarios || {};
        terminalFabricacion.puestos_trabajo = maestros?.puestos_trabajo || {};
    } catch (err) {
        console.error("No se pudieron refrescar maestros:", err);
    }
}

async function asegurarDatosFabricacionTerminal() {
    if (
        terminalFabricacion.clientes &&
        terminalFabricacion.estados_trazabilidad_fabricacion &&
        terminalFabricacion.tipos_producto &&
        terminalFabricacion.materiales &&
        terminalFabricacion.duelas &&
        terminalFabricacion.ubicaciones &&
        terminalFabricacion.usuarios
    ) return;
    try {
        const maestros = await wsRequest("maestros", {});
        terminalFabricacion.clientes = maestros?.clientes || {};
        terminalFabricacion.estados_trazabilidad_fabricacion = maestros?.estados_trazabilidad_fabricacion || {};
        terminalFabricacion.materiales = maestros?.materiales || {};
        terminalFabricacion.duelas = maestros?.duelas || {};
        terminalFabricacion.instalaciones = maestros?.instalaciones || {};
        terminalFabricacion.ubicaciones = maestros?.ubicaciones || {};
        terminalFabricacion.palets = maestros?.palets || {};
        terminalFabricacion.stocks = maestros?.stocks || {};
        terminalFabricacion.cubicaje = maestros?.cubicaje || {};
        terminalFabricacion.usuarios = maestros?.usuarios || {};
        terminalFabricacion.puestos_trabajo = maestros?.puestos_trabajo || {};
        const fabricacion = await wsRequest("fabricacion", {});
        terminalFabricacion.pedidos = fabricacion?.pedidos || {};
        terminalFabricacion.tipos_producto = fabricacion?.tipos_producto || {};
        terminalFabricacion.consumos = fabricacion?.consumos || {};
    } catch (err) {
        console.error("No se pudieron cargar datos de fabricacion:", err);
        terminalFabricacion.clientes = terminalFabricacion.clientes || {};
        terminalFabricacion.estados_trazabilidad_fabricacion = terminalFabricacion.estados_trazabilidad_fabricacion || {};
        terminalFabricacion.tipos_producto = terminalFabricacion.tipos_producto || {};
        terminalFabricacion.materiales = terminalFabricacion.materiales || {};
        terminalFabricacion.duelas = terminalFabricacion.duelas || {};
        terminalFabricacion.instalaciones = terminalFabricacion.instalaciones || {};
        terminalFabricacion.ubicaciones = terminalFabricacion.ubicaciones || {};
        terminalFabricacion.palets = terminalFabricacion.palets || {};
        terminalFabricacion.stocks = terminalFabricacion.stocks || {};
        terminalFabricacion.cubicaje = terminalFabricacion.cubicaje || {};
        terminalFabricacion.usuarios = terminalFabricacion.usuarios || {};
        terminalFabricacion.puestos_trabajo = terminalFabricacion.puestos_trabajo || {};
        terminalFabricacion.pedidos = terminalFabricacion.pedidos || {};
        terminalFabricacion.consumos = terminalFabricacion.consumos || {};
    }
}

function resolverTipoDuelaDesdeConsumos(tipoBotaId, materialId = null) {
    const consumos = Object.values(terminalFabricacion.consumos || {});
    const duelas = Object.values(terminalFabricacion.duelas || {});
    const tipos = terminalFabricacion.tipos_producto || {};
    const botaIdNum = Number(tipoBotaId || 0);
    const materialIdNum = Number(materialId || 0);
    if (!botaIdNum) return null;

    const candidatos = consumos
        .filter((c) => Number(c?.bota_id || 0) === botaIdNum)
        .map((c) => Number(c?.consumible_id || 0))
        .filter((id) => {
            const tp = tipos?.[id];
            return String(tp?.tipo || "").toUpperCase() === "DUELA";
        });

    if (!candidatos.length) return null;
    if (!materialIdNum) return candidatos[0];

    const candidatoPorMaterial = candidatos.find((tipoDuelaId) =>
        duelas.some((d) => Number(d?.tipo_producto_id || 0) === tipoDuelaId && Number(d?.material_id || 0) === materialIdNum)
    );
    return candidatoPorMaterial || candidatos[0];
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
        const ordenes = (await wsRequest("listar_pedidos", { "año": añoActual })) || [];

        tbody.innerHTML = "";
        if (!ordenes.length) {
            const tr = document.createElement("tr");
            const td = document.createElement("td");
            td.colSpan = 3;
            td.textContent = "No hay pedidos";
            tr.appendChild(td);
            tbody.appendChild(tr);
            actualizarTablaLineasFabricacion([], cfg.vistaId);
            return;
        }

        ordenes.forEach((o) => {
            const tr = document.createElement("tr");
            tr.dataset.ordenId = o.id;
            const tipoProducto = terminalFabricacion.tipos_producto?.[o.tipo_producto_id]?.descripcion || "";
            const material = terminalFabricacion.materiales?.[o.material_id]?.descripcion || "";
            const cantidad = Number.parseInt(String(o.cantidad ?? ""), 10);
            tr.dataset.tipoProducto = tipoProducto;
            tr.dataset.material = material;
            tr.dataset.cantidad = Number.isFinite(cantidad) ? String(cantidad) : "";
            tr.innerHTML = `
        <td>${tipoProducto || "-"}</td>
        <td>${material || "-"}</td>
        <td>${Number.isFinite(cantidad) ? cantidad : 0}</td>
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
        tbody.innerHTML = `<tr><td colspan="3">Error al cargar pedidos</td></tr>`;
    }
}

async function cargarFabricacionSemanalConsumo() {
    const cfg = obtenerConfigVistaProduccion("vista_consumo");
    vistaProduccionActiva = cfg.vistaId;
    const tbody = document.querySelector(`${cfg.tablaLineasSelector} tbody`);
    if (!tbody) return;
    try {
        await asegurarDatosFabricacionTerminal();
        const fabricacion = (await wsRequest("fabricacion", {})) || {};
        terminalFabricacion.pedidos = fabricacion?.pedidos || {};
        terminalFabricacion.tipos_producto = fabricacion?.tipos_producto || {};
        const lineas = Object.values(fabricacion?.fabricacion_semanal || {})
            .filter((l) => Number(l?.estado || 0) === 2);

        actualizarTablaLineasFabricacionConsumo(lineas);
        if (lineas.length === 1 && tbody) {
            const filaUnica = tbody.querySelector("tr[data-linea-id]");
            if (filaUnica) {
                mostrarLotesMateriales(filaUnica, cfg.vistaId);
            }
        }
    } catch (err) {
        console.error(err);
        tbody.innerHTML = `<tr><td colspan="7">Error al cargar fabricaciones semanales</td></tr>`;
    }
}

async function seleccionarFabricacion(fila, opciones = {}) {
    const cfg = obtenerConfigVistaProduccion(opciones.vistaId);
    vistaProduccionActiva = cfg.vistaId;
    if (cfg.vistaId === "vista_consumo") {
        mostrarLotesMateriales(fila, cfg.vistaId);
        return;
    }
    const autoAbrirLineaUnica = opciones.autoAbrirLineaUnica === true;
    vista_fabricacion = document.getElementById(cfg.vistaId);
    vista_fabricacion.setAttribute("modo", "contenido_pedido");

    const pedidoId = Number(fila.dataset.ordenId);
    const tipoProducto = fila.dataset.tipoProducto || fila.children?.[0]?.textContent || "-";
    const material = fila.dataset.material || fila.children?.[1]?.textContent || "-";
    const cantidad = fila.dataset.cantidad || fila.children?.[2]?.textContent || "0";
    const titulo = `Pedido ${pedidoId}: ${tipoProducto} | ${material} | Cantidad ${cantidad}`;
    const tituloOrden = document.querySelector(cfg.tituloOrdenSelector);
    if (tituloOrden) tituloOrden.textContent = titulo;

    ordenFabricacionActualId = pedidoId;
    if (typeof setPantalla === "function") {
        setPantalla(cfg.vistaId, { pedido_id: pedidoId });
    }
    await cargarLineasFabricacion(pedidoId, { autoAbrirLineaUnica, vistaId: cfg.vistaId });
}

function seleccionarContenidoOrden(fila, vistaId = null) {
    const cfg = obtenerConfigVistaProduccion(vistaId);
    if (fila.closest("tfoot")) {
        vista_fabricacion = document.getElementById(cfg.vistaId);
        vista_fabricacion.setAttribute("modo", "listado_pedidos");
    } else {
            mostrarLotesMateriales(fila, cfg.vistaId);
        }
    }

function mostrarLotesMateriales(fila, vistaId = null) {
    const cfg = obtenerConfigVistaProduccion(vistaId);
    vistaProduccionActiva = cfg.vistaId;
    lineaFabricacionActualId = Number(fila.dataset.lineaId || 0) || null;
    lineaFabricacionMaterialActualId = Number(fila.dataset.materialId || 0) || null;
    lineaFabricacionTipoBotaActualId = Number(fila.dataset.tipoProductoId || 0) || null;
    lineaFabricacionTipoActualId = lineaFabricacionTipoBotaActualId;
    if (cfg.vistaId === "vista_consumo") {
        const tipoDuela = resolverTipoDuelaDesdeConsumos(lineaFabricacionTipoBotaActualId, lineaFabricacionMaterialActualId);
        if (tipoDuela) {
            lineaFabricacionTipoActualId = Number(tipoDuela);
        }
    }
    if (cfg.vistaId === "vista_consumo") {
        ordenFabricacionActualId = Number(fila.dataset.pedidoId || 0) || null;
    }
    const tipoId = Number(fila.dataset.tipoProductoId || 0) || null;
    const descripcionProducto =
        (tipoId && terminalFabricacion.tipos_producto?.[tipoId]?.descripcion) ||
        fila.children?.[0]?.textContent ||
        "Producto";
    const descripcionMaterial =
        (lineaFabricacionMaterialActualId && terminalFabricacion.materiales?.[lineaFabricacionMaterialActualId]?.descripcion) ||
        descripcionProducto;
    const cantidadFabricar = Number(fila.dataset.cantidadFabricar || 0) || 0;
    const pedidoDescripcionData = (fila.dataset.pedidoDescripcion || "").trim();
    const pedidoIdData = Number(fila.dataset.pedidoId || 0) || ordenFabricacionActualId || null;
    const pedidoDescripcionMapa = (pedidoIdData && terminalFabricacion.pedidos?.[pedidoIdData]?.descripcion) || "";
    const pedidoDescripcion = (pedidoDescripcionData || pedidoDescripcionMapa || "").trim();
    const resumenProducto = `Tipo: ${descripcionProducto} | Madera: ${descripcionMaterial} | Cantidad a fabricar: ${cantidadFabricar}`;
    const titulo = document.getElementById(cfg.productoSpanId);
    if (titulo) {
        titulo.textContent = resumenProducto;
    }
    const tituloModalId = cfg.vistaId === "vista_consumo" ? "modalConsumoLabel" : "modalFabricacionLabel";
    const tituloModal = document.getElementById(tituloModalId);
    if (tituloModal) {
        if (cfg.vistaId === "vista_consumo") {
            tituloModal.textContent = pedidoDescripcion || "Consumo";
        } else {
            const baseTitulo = "Trazabilidad de fabricacion";
            tituloModal.textContent = pedidoDescripcion
                ? `${baseTitulo}: ${pedidoDescripcion}`
                : baseTitulo;
        }
    }
    if (cfg.vistaId === "vista_fabricacion") {
        abrirModalFabricarBota();
        if (typeof setPantalla === "function") {
            setPantalla(cfg.vistaId, { pedido_id: ordenFabricacionActualId, fabricacion_semanal_id: lineaFabricacionActualId });
        }
        return;
    }
    const inputPaquetes = document.getElementById("consumo-paquetes");
    if (inputPaquetes && (!inputPaquetes.value || Number(inputPaquetes.value) < 1)) {
        inputPaquetes.value = "1";
    }
    const modalEl = document.getElementById(cfg.modalId);
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
    if (cfg.vistaId === "vista_consumo") {
        sincronizarFiltrosConsumoDesdeLinea();
        cargarStocksConsumoEnSelector();
    }
    if (typeof setPantalla === "function") {
        setPantalla(cfg.vistaId, { pedido_id: ordenFabricacionActualId, fabricacion_semanal_id: lineaFabricacionActualId });
    }
    if (lineaFabricacionActualId) {
        cargarTrazabilidadFabricacion(lineaFabricacionActualId, cfg.vistaId);
    }
}

async function cargarStocksConsumoEnSelector() {
    const selector = document.getElementById("consumo-palet-origen");
    const selectorUbicacion = document.getElementById("consumo-ubicacion-origen");
    const selectorTipo = document.getElementById("consumo-tipo-producto");
    const selectorMadera = document.getElementById("consumo-madera");
    if (!selector || !selectorUbicacion) return;

    const valorStockPrevio = selector.value || "";
    const valorUbicacionPrevio = selectorUbicacion.value || "";
    const valorTipoPrevio = String(lineaFabricacionTipoActualId || "");
    const valorMaderaPrevio = String(lineaFabricacionMaterialActualId || "");

    selector.innerHTML = `<option value="">Cargando stocks...</option>`;
    selectorUbicacion.innerHTML = `<option value="">Cargando ubicaciones...</option>`;
    if (selectorTipo) selectorTipo.innerHTML = `<option value="">Cargando tipos...</option>`;
    if (selectorMadera) selectorMadera.innerHTML = `<option value="">Cargando maderas...</option>`;
    try {
        terminalFabricacion.stocksConsumo = (await wsRequest("listar_stocks_consumo", {})) || [];
        terminalFabricacion.cubicajeConsumo = (await wsRequest("listar_cubicaje", {})) || [];
        console.log("[consumo] stocks recibidos:", terminalFabricacion.stocksConsumo);
        poblarFiltrosConsumo(valorTipoPrevio, valorMaderaPrevio);
        actualizarStocksConsumoEnSelector(valorUbicacionPrevio, valorStockPrevio);
    } catch (err) {
        console.error("No se pudo cargar el selector de stocks de consumo:", err);
        selector.innerHTML = `<option value="">Error cargando stocks</option>`;
        selectorUbicacion.innerHTML = `<option value="">Error cargando ubicaciones</option>`;
        if (selectorTipo) selectorTipo.innerHTML = `<option value="">Error cargando tipos</option>`;
        if (selectorMadera) selectorMadera.innerHTML = `<option value="">Error cargando maderas</option>`;
        actualizarEstadoCamposConsumoSegunStock();
    }
}

function poblarFiltrosConsumo(valorTipoPrevio = "", valorMaderaPrevio = "") {
    const selectorTipo = document.getElementById("consumo-tipo-producto");
    const selectorMadera = document.getElementById("consumo-madera");
    if (!selectorTipo || !selectorMadera) return;

    const tipos = Object.values(terminalFabricacion.tipos_producto || {})
        .filter((t) => String(t?.tipo || "").toUpperCase() === "DUELA")
        .sort((a, b) => String(a.descripcion || "").localeCompare(String(b.descripcion || ""), "es"));
    const maderas = Object.values(terminalFabricacion.materiales || {})
        .sort((a, b) => String(a.descripcion || "").localeCompare(String(b.descripcion || ""), "es"));

    selectorTipo.innerHTML = `<option value="">Todos los tipos</option>` + tipos.map((t) =>
        `<option value="${t.id}">${t.descripcion || t.codigo || t.id}</option>`
    ).join("");
    selectorMadera.innerHTML = `<option value="">Todas las maderas</option>` + maderas.map((m) =>
        `<option value="${m.id}">${m.descripcion || m.id}</option>`
    ).join("");

    selectorTipo.value = String(valorTipoPrevio || "");
    selectorMadera.value = String(valorMaderaPrevio || "");
}

function sincronizarFiltrosConsumoDesdeLinea() {
    const selectorTipo = document.getElementById("consumo-tipo-producto");
    const selectorMadera = document.getElementById("consumo-madera");
    if (selectorTipo) selectorTipo.value = String(lineaFabricacionTipoActualId || "");
    if (selectorMadera) selectorMadera.value = String(lineaFabricacionMaterialActualId || "");
}

function actualizarStocksConsumoEnSelector(valorUbicacionPrevio = "", valorStockPrevio = "") {
    const selectorStock = document.getElementById("consumo-palet-origen");
    const selectorUbicacion = document.getElementById("consumo-ubicacion-origen");
    const selectorTipo = document.getElementById("consumo-tipo-producto");
    const selectorMadera = document.getElementById("consumo-madera");
    if (!selectorStock || !selectorUbicacion) return;

    const ubicacionSeleccionada = selectorUbicacion.value === "" ? null : String(selectorUbicacion.value);
    const tipoSeleccionado = selectorTipo?.value ? Number(selectorTipo.value) : null;
    const maderaSeleccionada = selectorMadera?.value ? Number(selectorMadera.value) : null;
    const stocks = (terminalFabricacion.stocksConsumo || []);
    const materialId = maderaSeleccionada || lineaFabricacionMaterialActualId;
    const tipoId = tipoSeleccionado || lineaFabricacionTipoActualId;

    const opcionesUbicacion = new Map(); // id_instalacion -> nombre
    stocks.forEach((s) => {
        const instalacionId = s?.id_instalacion;
        if (!instalacionId) return;
        const nombre = terminalFabricacion.instalaciones?.[instalacionId]?.nombre || `Instalación ${instalacionId}`;
        opcionesUbicacion.set(String(instalacionId), nombre);
    });
    const opcionesUbicacionOrdenadas = Array.from(opcionesUbicacion.entries())
        .sort((a, b) => String(a[1]).localeCompare(String(b[1]), "es"));

    selectorUbicacion.innerHTML = `<option value="">Todas las ubicaciones</option>` + opcionesUbicacionOrdenadas
        .map(([id, nombre]) => `<option value="${id}">${nombre}</option>`)
        .join("");
    if (valorUbicacionPrevio && opcionesUbicacion.has(String(valorUbicacionPrevio))) {
        selectorUbicacion.value = valorUbicacionPrevio;
    }

    const filtroUbicacion = selectorUbicacion.value === "" ? ubicacionSeleccionada : String(selectorUbicacion.value);
    const filtrados = stocks.filter((s) => {
        const restante = Math.max(Number(s?.cantidad_stock || 0) - Number(s?.cantidad_consumida || 0), 0);
        const cumpleUbicacion = !filtroUbicacion || String(s?.id_instalacion ?? "") === String(filtroUbicacion);
        const cumpleMaterial = !materialId || Number(s?.id_material || 0) === Number(materialId);
        const cumpleTipo = !tipoId || Number(s?.tipo_producto || 0) === Number(tipoId);
        return restante > 0 && cumpleUbicacion && cumpleMaterial && cumpleTipo;
    });
    console.log("[consumo] stocks tras filtro tipo+material+ubicacion:", filtrados, { tipoId, materialId, filtroUbicacion });

    if (!filtrados.length) {
        selectorStock.innerHTML = `<option value="">Sin stocks disponibles</option>`;
        actualizarEstadoCamposConsumoSegunStock();
        return;
    }
    selectorStock.innerHTML = `<option value="">Seleccione stock...</option>` + filtrados.map((s) => {
        const restante = Math.max(Number(s?.cantidad_stock || 0) - Number(s?.cantidad_consumida || 0), 0)
            .toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 3 });
        const tipoTxt = terminalFabricacion.tipos_producto?.[s.tipo_producto]?.descripcion || `Tipo ${s.tipo_producto || "-"}`;
        const maderaTxt = terminalFabricacion.materiales?.[s.id_material]?.descripcion || `Madera ${s.id_material || "-"}`;
        const ubicTxt = terminalFabricacion.instalaciones?.[s.id_instalacion]?.nombre || `Ubicación ${s.id_instalacion || "-"}`;
        const etiqueta = `Restante ${restante} | ${tipoTxt} | ${maderaTxt} | ${ubicTxt}`;
        return `<option value="${s.id}">${etiqueta}</option>`;
    }).join("");
    if (valorStockPrevio && filtrados.some((s) => String(s.id) === String(valorStockPrevio))) {
        selectorStock.value = String(valorStockPrevio);
    } else if (filtrados.length > 0) {
        selectorStock.value = String(filtrados[0].id);
    }
    autocompletarCamposConsumoDesdeStock();
}

async function actualizarStockYCubicajeConsumo() {
    const selectorStock = document.getElementById("consumo-palet-origen");
    const selectorUbicacion = document.getElementById("consumo-ubicacion-origen");
    const selectorTipo = document.getElementById("consumo-tipo-producto");
    const selectorMadera = document.getElementById("consumo-madera");
    if (!selectorStock || !selectorUbicacion) return;

    const valorStockPrevio = selectorStock.value || "";
    const filtroUbicacion = selectorUbicacion.value === "" ? null : String(selectorUbicacion.value);
    const tipoId = selectorTipo?.value ? Number(selectorTipo.value) : null;
    const materialId = selectorMadera?.value ? Number(selectorMadera.value) : null;
    let stocks = [];
    try {
        const ctx = await wsRequest("obtener_contexto_consumo", {
            tipo_producto_id: tipoId || null,
            material_id: materialId || null,
            ubicacion_id: filtroUbicacion ? Number(filtroUbicacion) : null,
        });
        stocks = Array.isArray(ctx?.stocks) ? ctx.stocks : [];
        terminalFabricacion.stocksConsumo = stocks;
        const tipoCubicaje = Number(tipoId || lineaFabricacionTipoActualId || 0);
        terminalFabricacion.cubicajeConsumo = tipoCubicaje
            ? [{ tipo_producto_id: tipoCubicaje, cubicaje_estandar: Number(ctx?.cubicaje_estandar || 0) }]
            : [];
    } catch (err) {
        console.error("No se pudo obtener contexto de consumo:", err);
        selectorStock.innerHTML = `<option value="">Error cargando stocks</option>`;
        actualizarEstadoCamposConsumoSegunStock();
        return;
    }
    const filtrados = stocks;

    if (!filtrados.length) {
        selectorStock.innerHTML = `<option value="">Sin stocks disponibles</option>`;
        actualizarEstadoCamposConsumoSegunStock();
        return;
    }

    selectorStock.innerHTML = `<option value="">Seleccione stock...</option>` + filtrados.map((s) => {
        const restante = Math.max(Number(s?.cantidad_stock || 0) - Number(s?.cantidad_consumida || 0), 0)
            .toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 3 });
        const tipoTxt = terminalFabricacion.tipos_producto?.[s.tipo_producto]?.descripcion || `Tipo ${s.tipo_producto || "-"}`;
        const maderaTxt = terminalFabricacion.materiales?.[s.id_material]?.descripcion || `Madera ${s.id_material || "-"}`;
        const ubicTxt = terminalFabricacion.instalaciones?.[s.id_instalacion]?.nombre || `Ubicación ${s.id_instalacion || "-"}`;
        const etiqueta = `Restante ${restante} | ${tipoTxt} | ${maderaTxt} | ${ubicTxt}`;
        return `<option value="${s.id}">${etiqueta}</option>`;
    }).join("");

    if (valorStockPrevio && filtrados.some((s) => String(s.id) === String(valorStockPrevio))) {
        selectorStock.value = String(valorStockPrevio);
    } else {
        selectorStock.value = String(filtrados[0].id);
    }
    autocompletarCamposConsumoDesdeStock();
}

function obtenerCubicajeInicialConsumo(tipoProductoId) {
    const lista = Array.isArray(terminalFabricacion.cubicajeConsumo) ? terminalFabricacion.cubicajeConsumo : [];
    const enLista = lista.find((c) => Number(c?.tipo_producto_id || 0) === Number(tipoProductoId));
    if (enLista) return Number(enLista.cubicaje_estandar || 0);
    const mapa = terminalFabricacion.cubicaje || {};
    const item = Object.values(mapa).find((c) => Number(c?.tipo_producto_id || 0) === Number(tipoProductoId));
    return Number(item?.cubicaje_estandar || 0);
}

function actualizarEstadoCamposConsumoSegunStock() {
    const selectStock = document.getElementById("consumo-palet-origen");
    const inputLote = document.getElementById("consumo-lote");
    const inputCubicaje = document.getElementById("consumo-cubicaje");
    const inputPaquetes = document.getElementById("consumo-paquetes");
    const hayStock = Boolean(Number(selectStock?.value || 0));
    if (inputLote) inputLote.disabled = !hayStock;
    if (inputCubicaje) inputCubicaje.disabled = !hayStock;
    if (inputPaquetes) inputPaquetes.disabled = !hayStock;
    if (!hayStock) {
        if (inputLote) inputLote.value = "";
        if (inputPaquetes) inputPaquetes.value = "1";
        if (inputCubicaje) inputCubicaje.value = "";
    } else if (inputPaquetes && (!inputPaquetes.value || Number(inputPaquetes.value) < 1)) {
        inputPaquetes.value = "1";
    }
}

function autocompletarCamposConsumoDesdeStock() {
    const selectStock = document.getElementById("consumo-palet-origen");
    const inputLote = document.getElementById("consumo-lote");
    const inputCubicaje = document.getElementById("consumo-cubicaje");
    const selectorTipo = document.getElementById("consumo-tipo-producto");
    if (!selectStock || !inputLote || !inputCubicaje) return;

    actualizarEstadoCamposConsumoSegunStock();
    const stockId = Number(selectStock.value || 0);
    if (!stockId) return;
    const tipoSeleccionado = selectorTipo?.value ? Number(selectorTipo.value) : lineaFabricacionTipoActualId;
    const cubicajeInicial = obtenerCubicajeInicialConsumo(tipoSeleccionado);
    if (Number.isFinite(cubicajeInicial) && cubicajeInicial >= 0) {
        inputCubicaje.value = String(cubicajeInicial);
    }
}

async function cargarLineasFabricacion(pedidoId, opciones = {}) {
    const cfg = obtenerConfigVistaProduccion(opciones.vistaId);
    vistaProduccionActiva = cfg.vistaId;
    const autoAbrirLineaUnica = opciones.autoAbrirLineaUnica === true;
    const tbody = document.querySelector(`${cfg.tablaLineasSelector} tbody`);
    if (!tbody) return;
    try {
        const lineas = (await wsRequest("listar_fabricacion_semanal", { pedido_id: pedidoId })) || [];
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
        tr.dataset.materialId = l.material_id ?? "";
        tr.dataset.pedidoId = l.pedido_id ?? "";
        tr.dataset.cantidadFabricar = l.cantidad ?? "";
        tr.dataset.pedidoDescripcion = (terminalFabricacion.pedidos?.[l.pedido_id]?.descripcion || "").trim();
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

function actualizarTablaLineasFabricacionConsumo(lineas) {
    const cfg = obtenerConfigVistaProduccion("vista_consumo");
    const tbody = document.querySelector(`${cfg.tablaLineasSelector} tbody`);
    if (!tbody) return;
    tbody.innerHTML = "";
    if (!lineas || !lineas.length) {
        const tr = document.createElement("tr");
        const td = document.createElement("td");
        td.colSpan = 7;
        td.textContent = "Sin líneas en estado Producción";
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
    }
    lineas.forEach((l) => {
        const tr = document.createElement("tr");
        tr.dataset.lineaId = l.id ?? "";
        tr.dataset.tipoProductoId = l.tipo_producto_id ?? "";
        tr.dataset.materialId = l.material_id ?? "";
        tr.dataset.pedidoId = l.pedido_id ?? "";
        tr.dataset.cantidadFabricar = l.cantidad ?? "";
        const pedido = terminalFabricacion.pedidos?.[l.pedido_id] || null;
        const pedidoTxt = (pedido?.descripcion || `Pedido ${l.pedido_id || "-"}`).trim();
        tr.dataset.pedidoDescripcion = pedidoTxt;
        const fechaInicio = formatearFechaEuropea(l.fecha_inicio);
        const tipo = terminalFabricacion.tipos_producto?.[l.tipo_producto_id]?.descripcion || "-";
        const material = terminalFabricacion.materiales?.[l.material_id]?.descripcion || "-";
        const cantidad = Number(l.cantidad) || 0;
        const fabricada = Number(l.cantidad_fabricada) || 0;
        const falta = Math.max(0, cantidad - fabricada);
        tr.innerHTML = `
      <td>${pedidoTxt}</td>
      <td>${fechaInicio || "-"}</td>
      <td>${tipo}</td>
      <td>${material}</td>
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
        const trazas = (await wsRequest("listar_trazabilidad_fabricacion", { fabricacion_semanal_id: lineaId })) || [];
        tbody.innerHTML = "";
        if (!trazas.length) {
            const tr = document.createElement("tr");
            const td = document.createElement("td");
            td.colSpan = 4;
            td.textContent = "Sin registros";
            tr.appendChild(td);
            tbody.appendChild(tr);
            return;
        }
        trazas.forEach((t) => {
            const tr = document.createElement("tr");
            const estado = terminalFabricacion.estados_trazabilidad_fabricacion?.[t.estado]?.descripcion || (t.estado ?? "");
            const palet = terminalFabricacion.palets?.[t.palet_id] || null;
            const restante = palet
                ? Number(palet.restante)
                : null;
            const restanteTxt = Number.isFinite(restante)
                ? Number(restante).toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 3 })
                : "";
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
        <td>${restanteTxt}</td>
        <td>${t.cantidad_fabricada ?? ""}</td>
        <td class="text-center">
          ${botonHtml}
        </td>
      `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error(err);
        tbody.innerHTML = `<tr><td colspan="4">Error al cargar trazabilidad</td></tr>`;
    }
}

async function agregarTrazabilidadFabricacionDesdeStockUI(_vistaId = "vista_consumo") {
    const cfg = obtenerConfigVistaProduccion("vista_consumo");
    const selectPaletOrigen = document.getElementById(cfg.selectPaletOrigenId);
    const loteInput = document.getElementById(cfg.inputLoteId);
    const cubicajeInput = document.getElementById(cfg.inputCubicajeId);
    const paquetesInput = document.getElementById("consumo-paquetes");
    const paletOrigenId = Number(selectPaletOrigen?.value || 0);
    const lote = (loteInput?.value || "").trim();
    const cubicaje = Number.parseFloat((cubicajeInput?.value || "").toString().replace(",", "."));
    const paquetes = Number.parseInt((paquetesInput?.value || "1").toString(), 10) || 1;
    if (!lineaFabricacionActualId) {
        alert("Seleccione una linea de fabricacion.");
        return;
    }
    if (!paletOrigenId || !lote || !Number.isFinite(cubicaje) || cubicaje <= 0) {
        alert("Debes completar stock origen, cubicaje, paquetes y lote.");
        return;
    }

    try {
        await wsRequest("agregar_trazabilidad_fabricacion_desde_stock", {
            fabricacion_semanal_id: lineaFabricacionActualId,
            stock_origen_id: paletOrigenId,
            lote,
            cubicaje,
            paquetes,
        });
        if (loteInput) loteInput.value = "";
        if (cubicajeInput) cubicajeInput.value = "";
        if (paquetesInput) paquetesInput.value = "1";
        if (selectPaletOrigen) selectPaletOrigen.value = "";
        cargarStocksConsumoEnSelector();
        cargarTrazabilidadFabricacion(lineaFabricacionActualId, "vista_consumo");
    } catch (err) {
        console.error(err);
        alert("Error al agregar trazabilidad.");
    }
}

async function agregarTrazabilidadFabricacionDesdePaletUI() {
    const lotePaletInput = document.getElementById("consumo-palet-lote");
    const cubicajeInput = document.getElementById("consumo-palet-cubicaje");
    const lote_palet = (lotePaletInput?.value || "").trim();
    const cubicaje = Number.parseFloat((cubicajeInput?.value || "").toString().replace(",", "."));

    if (!lineaFabricacionActualId) {
        alert("Seleccione una linea de fabricacion.");
        return;
    }
    if (!lote_palet || !Number.isFinite(cubicaje) || cubicaje <= 0) {
        alert("Debes completar lote palet y cubicaje.");
        return;
    }

    try {
        await wsRequest("agregar_trazabilidad_fabricacion_desde_palet", {
            fabricacion_semanal_id: lineaFabricacionActualId,
            lote_palet,
            cubicaje,
        });
        if (lotePaletInput) lotePaletInput.value = "";
        if (cubicajeInput) cubicajeInput.value = "";
        cargarTrazabilidadFabricacion(lineaFabricacionActualId, "vista_consumo");
        cargarTrazabilidadFabricacion(lineaFabricacionActualId, "vista_fabricacion");
    } catch (err) {
        console.error(err);
        alert("Error al agregar consumo desde palet.");
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
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
    ajustarZIndexModal(modalEl);
}

function cargarCodigosBatideroEnSelector() {
    const selector = document.getElementById("fabricar-bota-batidero");
    if (!selector) return;
    const dias = ["Jueves", "Viernes", "Lunes", "Martes", "Miércoles"];
    const options = [`<option value="">Seleccione código...</option>`];
    for (let i = 0; i < dias.length; i += 1) {
        const base = (i + 1) * 10;
        const manana = base + 1;
        const tarde = base + 2;
        options.push(`<option value="${manana}">${manana} (${dias[i]} mañana)</option>`);
        options.push(`<option value="${tarde}">${tarde} (${dias[i]} tarde)</option>`);
    }
    selector.innerHTML = options.join("");
}

async function cargarLotesMaderaFabricarBota() {
    const selector = document.getElementById("fabricar-bota-lote-madera");
    if (!selector) return;
    selector.innerHTML = `<option value="">Cargando lotes de madera...</option>`;
    trazabilidadesActivasFabricarBota = [];
    if (!lineaFabricacionActualId) {
        selector.innerHTML = `<option value="">Seleccione una linea de fabricacion</option>`;
        return;
    }
    try {
        const trazas = (await wsRequest("listar_trazabilidad_fabricacion", { fabricacion_semanal_id: lineaFabricacionActualId })) || [];
        trazabilidadesActivasFabricarBota = trazas.filter((t) => Number(t.estado || 0) === 0);
        if (!trazabilidadesActivasFabricarBota.length) {
            selector.innerHTML = `<option value="">Sin lotes activos (estado 0)</option>`;
            return;
        }
        selector.innerHTML = `<option value="">Seleccione lote de madera...</option>` + trazabilidadesActivasFabricarBota.map((t) => {
            const palet = t.palet_codigo || t.palet_id || "";
            const cantidad = Number(t.cantidad_fabricada || 0);
            const estado = Number(t.estado || 0);
            return `<option value="${t.id}">${palet} | Cantidad ${cantidad} | Estado ${estado}</option>`;
        }).join("");
    } catch (err) {
        console.error("No se pudieron cargar lotes de madera para fabricar bota:", err);
        selector.innerHTML = `<option value="">Error cargando lotes</option>`;
    }
}

async function cargarLotesFlejeFabricarBota() {
    const selector = document.getElementById("fabricar-bota-lote-fleje");
    if (!selector) return;
    selector.innerHTML = `<option value="">Cargando lotes de fleje...</option>`;
    try {
        const resp = (await wsRequest("inventario_flejes", {})) || {};
        const items = (resp.inventario_flejes || [])
            .filter((f) => Number(f.estado || 0) < 2)
            .filter((f) => Number(f.restante || 0) > 0);
        if (!items.length) {
            selector.innerHTML = `<option value="">Sin flejes disponibles</option>`;
            return;
        }
        selector.innerHTML = `<option value="">Seleccione lote de fleje...</option>` + items.map((f) => {
            const restante = Number(f.restante || 0).toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
            const lote = f.lote || `Entrada ${f.id}`;
            const tipo = f.tipo_producto_descripcion || f.tipo_producto_tipo || "FLEJE";
            return `<option value="${f.id}">${lote} | ${tipo} | restante ${restante} kg</option>`;
        }).join("");
    } catch (err) {
        console.error("No se pudieron cargar lotes de fleje:", err);
        selector.innerHTML = `<option value="">Error cargando flejes</option>`;
    }
}

function obtenerUltimaAsignacionPorUsuario(items = []) {
    const porUsuario = new Map();
    for (const item of items) {
        const usuario = item?.usuario || null;
        if (!usuario?.id) continue;
        const existente = porUsuario.get(usuario.id);
        if (!existente || ((item.fecha || "") > (existente.fecha || ""))) {
            porUsuario.set(usuario.id, item);
        }
    }
    return Array.from(porUsuario.values());
}

async function cargarOperariosFondadoEnSelector() {
    const selector = document.getElementById("fabricar-bota-operario-fondado");
    if (!selector) return;
    selector.innerHTML = `<option value="">Cargando operarios...</option>`;
    try {
        const payload = (await wsRequest("listar_operarios_planificacion_fabricacion", {
            puesto_nombre: "FONDAR",
            dias_previos: 2,
            incluir_otros: false,
        })) || [];
        const lista = obtenerUltimaAsignacionPorUsuario(payload)
            .sort((a, b) => {
                const na = (a?.usuario?.nombre || a?.usuario?.alias || "").toString();
                const nb = (b?.usuario?.nombre || b?.usuario?.alias || "").toString();
                return na.localeCompare(nb, "es", { sensitivity: "base" });
            });

        if (!lista.length) {
            selector.innerHTML = `<option value="">Sin operarios de FONDAR (ultimos 2 dias)</option>`;
            return;
        }

        selector.innerHTML = `<option value="">Seleccione operario...</option>` + lista.map((item) => {
            const u = item.usuario || {};
            const nombre = u.nombre || u.alias || `Empleado ${u.id || ""}`.trim();
            const fecha = item.fecha ? formatearFechaEuropea(item.fecha) : "";
            return `<option value="${u.id}">${nombre}${fecha ? " | " + fecha : ""}</option>`;
        }).join("");
    } catch (err) {
        console.error("No se pudieron cargar operarios de fondado:", err);
        selector.innerHTML = `<option value="">Error cargando operarios</option>`;
    }
}

async function abrirModalFabricarBota() {
    console.log("[fabricar-bota] abrirModalFabricarBota lineaFabricacionActualId:", lineaFabricacionActualId);
    if (!lineaFabricacionActualId) {
        alert("Seleccione una linea de fabricacion.");
        return;
    }
    const productoOrigen = document.getElementById("fabricacion-producto-orden");
    const productoDestino = document.getElementById("fabricar-bota-producto");
    if (productoDestino) {
        productoDestino.textContent = productoOrigen?.textContent || "Producto";
    }
    const inputCantidad = document.getElementById("fabricar-bota-cantidad-etiquetas");
    if (inputCantidad && (!inputCantidad.value || Number(inputCantidad.value) < 1)) {
        inputCantidad.value = "1";
    }
    await Promise.all([
        cargarLotesMaderaFabricarBota(),
        cargarLotesFlejeFabricarBota(),
        cargarOperariosFondadoEnSelector(),
    ]);
    console.log("[fabricar-bota] datos cargados para modal", {
        lotesMadera: trazabilidadesActivasFabricarBota.length,
        loteMaderaSeleccionado: document.getElementById("fabricar-bota-lote-madera")?.value || "",
        loteFlejeSeleccionado: document.getElementById("fabricar-bota-lote-fleje")?.value || "",
        operarioSeleccionado: document.getElementById("fabricar-bota-operario-fondado")?.value || "",
    });
    cargarCodigosBatideroEnSelector();

    const modalEl = document.getElementById("modalFabricarBota");
    if (!modalEl) return;
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
    ajustarZIndexModal(modalEl);
}

async function imprimirEtiquetaFabricarBotaDesdeUI() {
    console.log("[fabricar-bota] imprimirEtiquetaFabricarBotaDesdeUI inicio");
    if (!lineaFabricacionActualId) {
        console.log("[fabricar-bota] bloqueado: sin lineaFabricacionActualId");
        alert("Seleccione una linea de fabricacion.");
        return;
    }
    const trazabilidadId = Number(document.getElementById("fabricar-bota-lote-madera")?.value || 0);
    const loteFlejeId = Number(document.getElementById("fabricar-bota-lote-fleje")?.value || 0);
    const batidero = Number(document.getElementById("fabricar-bota-batidero")?.value || 0);
    const operarioFondadoId = Number(document.getElementById("fabricar-bota-operario-fondado")?.value || 0);
    const cantidad = Math.max(1, Number.parseInt(document.getElementById("fabricar-bota-cantidad-etiquetas")?.value || "1", 10) || 1);
    console.log("[fabricar-bota] valores formulario", {
        lineaFabricacionActualId,
        trazabilidadId,
        loteFlejeId,
        batidero,
        operarioFondadoId,
        cantidad,
    });

    if (!trazabilidadId || !loteFlejeId || !batidero || !operarioFondadoId) {
        console.log("[fabricar-bota] bloqueado: faltan campos obligatorios");
        alert("Debes completar lote de madera, lote de fleje, batidero y operario de fondado.");
        return;
    }

    const traza = trazabilidadesActivasFabricarBota.find((t) => Number(t.id) === trazabilidadId);
    if (!traza) {
        console.log("[fabricar-bota] bloqueado: trazabilidad no encontrada en activas", {
            trazabilidadId,
            activas: trazabilidadesActivasFabricarBota.map((t) => t.id),
        });
        alert("El lote de madera seleccionado no esta disponible.");
        return;
    }
    const paletCodigo = traza.palet_codigo || traza.palet_id || "";
    try {
        const payload = {
            trazabilidad_ids: [trazabilidadId],
            palet_codigos: paletCodigo ? [paletCodigo] : [],
            tipo: "BOTA",
            operarios_ids: [operarioFondadoId],
            batidero,
            lote_fleje_id: loteFlejeId,
            cantidad_etiquetas: cantidad,
        };
        console.log("[fabricar-bota] enviando wsRequest imprimir_etiqueta_fabricacion", payload);
        const resp = await wsRequest("imprimir_etiqueta_fabricacion", payload);
        console.log("[fabricar-bota] respuesta wsRequest imprimir_etiqueta_fabricacion", resp);
        const modalEl = document.getElementById("modalFabricarBota");
        const modal = modalEl ? bootstrap.Modal.getInstance(modalEl) : null;
        if (modal) modal.hide();
        cargarTrazabilidadFabricacion(lineaFabricacionActualId, "vista_fabricacion");
        cargarTrazabilidadFabricacion(lineaFabricacionActualId, "vista_consumo");
        if (ordenFabricacionActualId) {
            cargarLineasFabricacion(ordenFabricacionActualId, { vistaId: "vista_fabricacion" });
        }
        cargarFabricacionSemanalConsumo();
    } catch (err) {
        console.error("[fabricar-bota] error en imprimir_etiqueta_fabricacion", err);
        alert("Error al imprimir etiqueta.");
    }
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
        const trazas = (await wsRequest("listar_trazabilidad_fabricacion", { fabricacion_semanal_id: lineaFabricacionActualId })) || [];
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
        }
        cargarFabricacionSemanalConsumo();
    } catch (err) {
        console.error(err);
        alert("Error al imprimir etiqueta.");
    }
}


function refrescarFabricacionDesdeServidor(_data = {}) {
    cargarFabricacionSemanalConsumo();
    cargarOrdenesFabricacion({ vistaId: "vista_fabricacion" });
    if (ordenFabricacionActualId) {
        cargarLineasFabricacion(ordenFabricacionActualId, { vistaId: "vista_fabricacion" });
    }
    if (lineaFabricacionActualId) {
        cargarTrazabilidadFabricacion(lineaFabricacionActualId, "vista_consumo");
        cargarTrazabilidadFabricacion(lineaFabricacionActualId, "vista_fabricacion");
    }
}
