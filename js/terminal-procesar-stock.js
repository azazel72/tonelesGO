const terminalProcesarStock = {
    maestros: null,
    fabricacion: null,
    materiales: null,
    instalaciones: null,
    ubicaciones: null,
    palets: null,
    tipos_producto: null,
    paletsConsumo: [],
    cubicajeConsumo: [],
};

function prepararEventosProcesarStock() {
    const selectorTipo = document.getElementById("procesarstock-tipo-producto");
    const selectorMadera = document.getElementById("procesarstock-material");
    const selectorUbicacionOrigen = document.getElementById("procesarstock-ubicacion-origen");
    const selectorOrigen = document.getElementById("procesarstock-origen");
    const inputCubicaje = document.getElementById("procesarstock-cubicaje");
    const inputPaquetes = document.getElementById("procesarstock-paquetes");
    const btnProcesar = document.getElementById("procesarstock-procesar");

    if (selectorTipo) selectorTipo.addEventListener("change", actualizarOrigenesProcesarStock);
    if (selectorMadera) selectorMadera.addEventListener("change", actualizarOrigenesProcesarStock);
    if (selectorUbicacionOrigen) selectorUbicacionOrigen.addEventListener("change", actualizarOrigenesProcesarStock);
    if (selectorOrigen) selectorOrigen.addEventListener("change", autocompletarProcesarStockDesdeOrigen);
    if (inputCubicaje) inputCubicaje.addEventListener("input", actualizarEstadoBotonProcesarStock);
    if (inputPaquetes) inputPaquetes.addEventListener("input", actualizarEstadoBotonProcesarStock);
    if (btnProcesar) {
        btnProcesar.disabled = true;
        btnProcesar.title = "Completa los datos para procesar";
        btnProcesar.addEventListener("click", procesarStockDesdeVistaNueva);
    }
}

async function cargarFormularioProcesarStock() {
    try {
        await asegurarDatosProcesarStock();
        poblarFiltrosProcesarStock();
        await actualizarOrigenesProcesarStock();
    } catch (err) {
        console.error("No se pudo cargar el formulario de procesar:", err);
        setEstadoProcesarStock("Error cargando datos del formulario.", "danger");
    }
}

async function asegurarDatosProcesarStock() {
    const [maestros, fabricacion] = await Promise.all([
        wsRequest("maestros", {}),
        wsRequest("fabricacion", {}),
    ]);
    terminalProcesarStock.maestros = maestros || {};
    terminalProcesarStock.fabricacion = fabricacion || {};
    terminalProcesarStock.materiales = maestros?.materiales || {};
    terminalProcesarStock.instalaciones = maestros?.instalaciones || {};
    terminalProcesarStock.ubicaciones = maestros?.ubicaciones || {};
    terminalProcesarStock.palets = maestros?.palets || {};
    terminalProcesarStock.tipos_producto = fabricacion?.tipos_producto || {};
}

function poblarFiltrosProcesarStock(valorTipoPrevio = "", valorMaderaPrevio = "") {
    const selectorTipo = document.getElementById("procesarstock-tipo-producto");
    const selectorMadera = document.getElementById("procesarstock-material");
    if (!selectorTipo || !selectorMadera) return;

    const tipos = Object.values(terminalProcesarStock.tipos_producto || {})
        .filter((t) => String(t?.tipo || "").toUpperCase() === "DUELA")
        .sort((a, b) => String(a.descripcion || "").localeCompare(String(b.descripcion || ""), "es"));
    const maderas = Object.values(terminalProcesarStock.materiales || {})
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

function esInstalacionMProcesarStock(instalacionId) {
    const instalacion = terminalProcesarStock.instalaciones?.[instalacionId] || null;
    const nombre = String(instalacion?.nombre || "").trim().toUpperCase();
    const tipo = String(instalacion?.tipo || "").trim().toUpperCase();
    return nombre === "M" || tipo === "M";
}

async function actualizarOrigenesProcesarStock() {
    const selectorTipo = document.getElementById("procesarstock-tipo-producto");
    const selectorMadera = document.getElementById("procesarstock-material");
    const selectorUbicacion = document.getElementById("procesarstock-ubicacion-origen");
    const selectorOrigen = document.getElementById("procesarstock-origen");
    if (!selectorUbicacion || !selectorOrigen) return;

    const valorUbicacionPrevio = selectorUbicacion.value || "";
    const valorOrigenPrevio = selectorOrigen.value || "";
    const tipoId = selectorTipo?.value ? Number(selectorTipo.value) : null;
    const materialId = selectorMadera?.value ? Number(selectorMadera.value) : null;

    try {
        terminalProcesarStock.paletsConsumo = (await wsRequest("listar_palets_consumo", {})) || [];
        const ctx = await wsRequest("obtener_contexto_consumo", {
            tipo_producto_id: tipoId || null,
            material_id: materialId || null,
            ubicacion_id: valorUbicacionPrevio ? Number(valorUbicacionPrevio) : null,
        });
        terminalProcesarStock.paletsConsumo = Array.isArray(ctx?.palets) ? ctx.palets : [];
        terminalProcesarStock.cubicajeConsumo = tipoId
            ? [{ tipo_producto_id: tipoId, cubicaje_estandar: Number(ctx?.cubicaje_estandar || 0) }]
            : [];
    } catch (err) {
        console.error("No se pudo obtener contexto para procesar:", err);
        selectorOrigen.innerHTML = `<option value="">Error cargando palets</option>`;
        selectorUbicacion.innerHTML = `<option value="">Error cargando ubicaciones</option>`;
        actualizarEstadoBotonProcesarStock();
        return;
    }

    poblarSelectorUbicacionOrigenProcesarStock(valorUbicacionPrevio);
    poblarSelectorOrigenProcesarStock(valorOrigenPrevio);
}

function poblarSelectorUbicacionOrigenProcesarStock(valorPrevio = "") {
    const selectorUbicacion = document.getElementById("procesarstock-ubicacion-origen");
    if (!selectorUbicacion) return;

    const opcionesUbicacion = new Map();
    (terminalProcesarStock.paletsConsumo || []).forEach((s) => {
        const instalacionId = s?.id_instalacion;
        if (!instalacionId) return;
        if (!esInstalacionMProcesarStock(instalacionId)) return;
        const nombre = terminalProcesarStock.instalaciones?.[instalacionId]?.nombre || `Instalación ${instalacionId}`;
        opcionesUbicacion.set(String(instalacionId), nombre);
    });
    const opcionesOrdenadas = Array.from(opcionesUbicacion.entries())
        .sort((a, b) => String(a[1]).localeCompare(String(b[1]), "es"));

    selectorUbicacion.innerHTML = `<option value="">Todas las ubicaciones</option>` + opcionesOrdenadas
        .map(([id, nombre]) => `<option value="${id}">${nombre}</option>`)
        .join("");

    if (valorPrevio && opcionesUbicacion.has(String(valorPrevio))) {
        selectorUbicacion.value = String(valorPrevio);
    }
}

function poblarSelectorOrigenProcesarStock(valorPrevio = "") {
    const selectorOrigen = document.getElementById("procesarstock-origen");
    const selectorUbicacion = document.getElementById("procesarstock-ubicacion-origen");
    const selectorTipo = document.getElementById("procesarstock-tipo-producto");
    const selectorMadera = document.getElementById("procesarstock-material");
    if (!selectorOrigen || !selectorUbicacion) return;

    const filtroUbicacion = selectorUbicacion.value ? String(selectorUbicacion.value) : null;
    const tipoId = selectorTipo?.value ? Number(selectorTipo.value) : null;
    const materialId = selectorMadera?.value ? Number(selectorMadera.value) : null;

    const filtrados = (terminalProcesarStock.paletsConsumo || []).filter((s) => {
        const restante = Math.max(Number(s?.cantidad_stock || 0) - Number(s?.cantidad_consumida || 0), 0);
        const cumpleInstalacionM = esInstalacionMProcesarStock(s?.id_instalacion);
        const cumpleUbicacion = !filtroUbicacion || String(s?.id_instalacion ?? "") === String(filtroUbicacion);
        const cumpleMaterial = !materialId || Number(s?.id_material || 0) === Number(materialId);
        const cumpleTipo = !tipoId || Number(s?.tipo_producto || 0) === Number(tipoId);
        return restante > 0 && cumpleInstalacionM && cumpleUbicacion && cumpleMaterial && cumpleTipo;
    });

    if (!filtrados.length) {
        selectorOrigen.innerHTML = `<option value="">Sin palets disponibles</option>`;
        autocompletarProcesarStockDesdeOrigen();
        return;
    }

    selectorOrigen.innerHTML = `<option value="">Seleccione palet...</option>` + filtrados.map((s) => {
        const restante = Math.max(Number(s?.cantidad_stock || 0) - Number(s?.cantidad_consumida || 0), 0)
            .toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 3 });
        const tipoTxt = terminalProcesarStock.tipos_producto?.[s.tipo_producto]?.descripcion || `Tipo ${s.tipo_producto || "-"}`;
        const maderaTxt = terminalProcesarStock.materiales?.[s.id_material]?.descripcion || `Madera ${s.id_material || "-"}`;
        const ubicTxt = terminalProcesarStock.instalaciones?.[s.id_instalacion]?.nombre || `Ubicación ${s.id_instalacion || "-"}`;
        const etiqueta = `${s.codigo || s.id} | Restante ${restante} | ${tipoTxt} | ${maderaTxt} | ${ubicTxt}`;
        return `<option value="${s.id}">${etiqueta}</option>`;
    }).join("");

    if (valorPrevio && filtrados.some((s) => String(s.id) === String(valorPrevio))) {
        selectorOrigen.value = String(valorPrevio);
    } else if (filtrados.length > 0) {
        selectorOrigen.value = String(filtrados[0].id);
    }
    autocompletarProcesarStockDesdeOrigen();
}

function obtenerCubicajeInicialProcesarStock(tipoProductoId) {
    const lista = Array.isArray(terminalProcesarStock.cubicajeConsumo) ? terminalProcesarStock.cubicajeConsumo : [];
    const enLista = lista.find((c) => Number(c?.tipo_producto_id || 0) === Number(tipoProductoId));
    if (enLista) return Number(enLista.cubicaje_estandar || 0);
    return 0;
}

function autocompletarProcesarStockDesdeOrigen() {
    const selectorOrigen = document.getElementById("procesarstock-origen");
    const selectorTipo = document.getElementById("procesarstock-tipo-producto");
    const inputCubicaje = document.getElementById("procesarstock-cubicaje");
    const inputPaquetes = document.getElementById("procesarstock-paquetes");
    if (!selectorOrigen || !inputCubicaje || !inputPaquetes) return;

    const origenId = Number(selectorOrigen.value || 0);
    if (!origenId) {
        inputCubicaje.value = "";
        inputPaquetes.value = "1";
        actualizarEstadoBotonProcesarStock();
        return;
    }

    const tipoId = selectorTipo?.value ? Number(selectorTipo.value) : null;
    const cubicajeInicial = obtenerCubicajeInicialProcesarStock(tipoId);
    if (Number.isFinite(cubicajeInicial) && cubicajeInicial > 0) {
        inputCubicaje.value = String(cubicajeInicial);
    }
    if (!inputPaquetes.value || Number(inputPaquetes.value) < 1) {
        inputPaquetes.value = "1";
    }
    actualizarEstadoBotonProcesarStock();
}

function actualizarEstadoBotonProcesarStock() {
    const selectorOrigen = document.getElementById("procesarstock-origen");
    const inputCubicaje = document.getElementById("procesarstock-cubicaje");
    const inputPaquetes = document.getElementById("procesarstock-paquetes");
    const inputTotal = document.getElementById("procesarstock-total");
    const btnProcesar = document.getElementById("procesarstock-procesar");
    if (!selectorOrigen || !inputCubicaje || !inputPaquetes || !inputTotal || !btnProcesar) return;

    const origenId = Number(selectorOrigen.value || 0);
    const cubicaje = Number.parseFloat(String(inputCubicaje.value || "").replace(",", "."));
    const paquetes = Number.parseInt(String(inputPaquetes.value || "1"), 10);
    const total = Number.isFinite(cubicaje) && Number.isFinite(paquetes) ? cubicaje * paquetes : NaN;

    inputTotal.value = Number.isFinite(total) && total > 0
        ? total.toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 3 })
        : "";

    const habilitado = Boolean(origenId)
        && Number.isFinite(cubicaje)
        && cubicaje > 0
        && Number.isFinite(paquetes)
        && paquetes > 0;

    btnProcesar.disabled = !habilitado;
    btnProcesar.title = habilitado ? "" : "Completa los datos para procesar";
}

async function procesarStockDesdeVistaNueva() {
    const selectorOrigen = document.getElementById("procesarstock-origen");
    const inputCubicaje = document.getElementById("procesarstock-cubicaje");
    const inputPaquetes = document.getElementById("procesarstock-paquetes");
    const btnProcesar = document.getElementById("procesarstock-procesar");
    if (!selectorOrigen || !inputCubicaje || !inputPaquetes || !btnProcesar) return;

    const origenId = Number(selectorOrigen.value || 0);
    const cubicaje = Number.parseFloat(String(inputCubicaje.value || "").replace(",", "."));
    const paquetes = Number.parseInt(String(inputPaquetes.value || "1"), 10);
    const cubicajeTotal = cubicaje * paquetes;

    if (!origenId) {
        setEstadoProcesarStock("Selecciona un palet de origen.", "danger");
        return;
    }
    if (!Number.isFinite(cubicajeTotal) || cubicajeTotal <= 0) {
        setEstadoProcesarStock("El cubicaje total debe ser mayor que 0.", "danger");
        return;
    }
    if (!Number.isFinite(paquetes) || paquetes <= 0) {
        setEstadoProcesarStock("Los paquetes deben ser mayores que 0.", "danger");
        return;
    }

    btnProcesar.disabled = true;
    setEstadoProcesarStock("Procesando stock...", "muted");

    try {
        await wsRequest("procesar_stock", {
            palet_origen_id: origenId,
            cubicaje,
            paquetes,
        });
        inputCubicaje.value = "";
        inputPaquetes.value = "1";
        await refrescarVistaProcesarStock();
        setEstadoProcesarStock("Stock procesado correctamente.", "success");
    } catch (err) {
        console.error("Error procesando stock:", err);
        setEstadoProcesarStock("No se pudo procesar el stock.", "danger");
    } finally {
        actualizarEstadoBotonProcesarStock();
    }
}

async function refrescarVistaProcesarStock() {
    await asegurarDatosProcesarStock();
    poblarFiltrosProcesarStock(
        document.getElementById("procesarstock-tipo-producto")?.value || "",
        document.getElementById("procesarstock-material")?.value || ""
    );
    await actualizarOrigenesProcesarStock();
    try {
        await refrescarMaestrosFabricacion?.();
        await actualizarPaletsConsumoYCubicaje?.();
    } catch (err) {
        console.warn("No se pudieron refrescar otras vistas tras procesar stock:", err);
    }
}

function setEstadoProcesarStock(texto, tipo = "muted") {
    const estado = document.getElementById("procesarstock-estado");
    if (!estado) return;
    estado.className = "small";
    estado.classList.add(`text-${tipo}`);
    estado.textContent = texto || "";
}
