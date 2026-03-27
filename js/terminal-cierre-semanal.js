const estadoCierreSemanal = {
    lineaId: null,
    pedidoId: null,
    origenVista: "vista_fabricacion_semanal",
    data: null,
};

function asegurarEstructuraVistaCierreSemanal() {
    const panel = document.getElementById("panelCierreSemanal");
    if (!panel) return;
    const body = panel.querySelector(".panel-fijo-body");
    if (!body) return;
    if (document.getElementById("cierre-semanal-kpis")
        && document.getElementById("cierre-semanal-lotes")
        && document.getElementById("cierre-semanal-codigos")
        && document.getElementById("cierre-semanal-cerrar")) {
        return;
    }
    body.classList.add("cierre-semanal-body");
    body.innerHTML = `
        <div class="cierre-semanal-bloque">
            <h6 class="cierre-semanal-bloque-titulo">Resumen</h6>
            <div class="cierre-semanal-resumen-grid" id="cierre-semanal-kpis">
                <div class="cierre-semanal-empty">Cargando resumen...</div>
            </div>
        </div>

        <div class="cierre-semanal-bloque">
            <div class="d-flex justify-content-between align-items-center gap-2 flex-wrap">
                <h6 class="cierre-semanal-bloque-titulo mb-0">Palets y lotes consumidos</h6>
                <span class="small text-muted" id="cierre-semanal-lotes-resumen"></span>
            </div>
            <div class="cierre-semanal-lotes-lista" id="cierre-semanal-lotes">
                <div class="cierre-semanal-empty">Cargando lotes...</div>
            </div>
        </div>

        <div class="cierre-semanal-bloque">
            <h6 class="cierre-semanal-bloque-titulo">Botas fabricadas</h6>
            <div class="cierre-semanal-codigos" id="cierre-semanal-codigos">
                <div class="cierre-semanal-empty">Cargando códigos...</div>
            </div>
        </div>

        <div class="cierre-semanal-bloque">
            <h6 class="cierre-semanal-bloque-titulo">Acciones</h6>
            <div class="cierre-semanal-acciones">
                <button type="button" class="btn btn-outline-warning" id="cierre-semanal-reasignar-negativo">
                    <i class="bi bi-arrow-left-right"></i> Reasignar consumo negativo
                </button>
                <button type="button" class="btn btn-outline-success" id="cierre-semanal-crear-procesado">
                    <i class="bi bi-box-seam"></i> Convertir sobrante en palet procesado
                </button>
                <button type="button" class="btn btn-primary" id="cierre-semanal-cerrar">
                    <i class="bi bi-check2-circle"></i> Cerrar semanal
                </button>
            </div>
            <div class="cierre-semanal-nota" id="cierre-semanal-nota-acciones"></div>
        </div>
    `;
}

function obtenerInfoLineaSemanal(linea) {
    const pedido = terminalFabricacion?.pedidos?.[linea?.pedido_id] || null;
    const tipo = terminalFabricacion?.tipos_producto?.[linea?.tipo_producto_id]?.descripcion || "-";
    const material = terminalFabricacion?.materiales?.[linea?.material_id]?.descripcion || "-";
    const semanaPedida = Number(linea?.cantidad || 0) || 0;
    const semanaFabricada = Number(linea?.cantidad_fabricada || 0) || 0;
    const pedidoTotal = Number(pedido?.cantidad || 0) || 0;
    const pedidoFabricado = Number(pedido?.cantidad_fabricada || 0) || 0;
    return {
        linea,
        pedido,
        tipo,
        material,
        pedidoDescripcion: (pedido?.descripcion || `Pedido ${linea?.pedido_id || "-"}`).trim(),
        fechaInicio: typeof formatearFechaEuropea === "function" ? formatearFechaEuropea(linea?.fecha_inicio) : (linea?.fecha_inicio || ""),
        semanaPedida,
        semanaFabricada,
        semanaPendiente: semanaPedida - semanaFabricada,
        pedidoTotal,
        pedidoFabricado,
        pedidoPendiente: pedidoTotal - pedidoFabricado,
    };
}

function formatearValorSemanal(valor) {
    return Number(valor || 0).toLocaleString("es-ES", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 3,
    });
}

function construirResumenCantidadesLinea(info) {
    return [
        `Semana: pedidas ${formatearValorSemanal(info.semanaPedida)} | fabricadas ${formatearValorSemanal(info.semanaFabricada)}`,
        `Pedido total: pedidas ${formatearValorSemanal(info.pedidoTotal)} | fabricadas ${formatearValorSemanal(info.pedidoFabricado)}`,
    ].join("\n");
}

function construirKpisLinea(info, resumenLotes = null, codigos = []) {
    const m3Total = Number(resumenLotes?.m3_total || 0);
    const m3Consumido = Number(resumenLotes?.m3_consumidos_palets || 0);
    const m3Restante = m3Total - m3Consumido;
    return [
        { label: "Semana pedidas", value: formatearValorSemanal(info.semanaPedida) },
        { label: "Semana fabricadas", value: formatearValorSemanal(info.semanaFabricada) },
        { label: "Pedido total", value: formatearValorSemanal(info.pedidoTotal) },
        { label: "Pedido fabricado", value: formatearValorSemanal(info.pedidoFabricado) },
        { label: "Botas registradas", value: formatearValorSemanal(Number(resumenLotes?.botas_registradas ?? codigos.length)) },
        { label: "M3 total", value: formatearValorSemanal(m3Total) },
        { label: "M3 consumidos", value: formatearValorSemanal(m3Consumido) },
        { label: "M3 restantes", value: formatearValorSemanal(m3Restante) },
    ];
}

function obtenerConsumoDuelaPorTipoBota(tipoBotaId) {
    const consumos = Object.values(terminalFabricacion?.consumos || {});
    const tipos = terminalFabricacion?.tipos_producto || {};
    const botaIdNum = Number(tipoBotaId || 0);
    if (!botaIdNum) return 0;
    const consumo = consumos.find((item) => {
        if (Number(item?.bota_id || 0) !== botaIdNum) return false;
        const tipoConsumible = tipos?.[Number(item?.consumible_id || 0)];
        return String(tipoConsumible?.tipo || "").toUpperCase() === "DUELA";
    });
    return Number(consumo?.consumo || 0) || 0;
}

function agruparPaletsCierreSemanal(trazas, tipoBotaId) {
    const consumoUnitario = obtenerConsumoDuelaPorTipoBota(tipoBotaId);
    const items = (trazas || []).map((t) => {
        const cubicaje = Number(t?.palet_cubicaje || 0) || 0;
        const consumido = Number(t?.palet_consumido || 0) || 0;
        const restante = cubicaje - consumido;
        const lote = typeof obtenerLoteDesdeCodigoPalet === "function"
            ? obtenerLoteDesdeCodigoPalet(t?.palet_codigo || t?.palet_id || "")
            : String(t?.palet_codigo || t?.palet_id || "");
        return {
            ...t,
            lote,
            cubicaje,
            consumido,
            restante,
            botasFabricadas: Number(t?.cantidad_fabricada || 0) || 0,
            botasPosibles: consumoUnitario > 0 ? Math.floor(Math.max(restante, 0) / consumoUnitario) : 0,
            negativa: restante < 0,
        };
    });
    const resumen = items.reduce((acc, item) => {
        acc.volumenTotal += item.cubicaje;
        acc.consumidoTotal += item.consumido;
        acc.botasFabricadas += item.botasFabricadas;
        acc.botasPosibles += item.botasPosibles;
        if (item.negativa) acc.negativos += 1;
        return acc;
    }, { volumenTotal: 0, consumidoTotal: 0, botasFabricadas: 0, botasPosibles: 0, negativos: 0 });
    return { items, resumen };
}

async function cargarCodigosCierreSemanal(lineaId) {
    const items = (await wsRequest("listar_productos_por_filtros", { tipos: ["BOTA"] })) || [];
    return items
        .filter((item) => Number(item?.fabricacion_semanal_id || 0) === Number(lineaId || 0))
        .map((item) => String(item?.codigo || "").trim())
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b, "es", { numeric: true, sensitivity: "base" }));
}

function renderizarResumenCierreSemanal(info, resumenLotes, codigos, consistencias = null) {
    const contenedor = document.getElementById("cierre-semanal-kpis");
    if (!contenedor) return;
    const kpis = construirKpisLinea(info, resumenLotes, codigos);
    if (consistencias) {
        kpis.push({
            label: "Semana BBDD vs botas",
            value: consistencias.semana_fabricada_coincide
                ? "OK"
                : `${formatearValorSemanal(consistencias.cantidad_bbdd_semana)} vs ${formatearValorSemanal(consistencias.botas_registradas)}`,
        });
        kpis.push({
            label: "Consumo botas vs palets",
            value: consistencias.consumo_coincide
                ? "OK"
                : `${formatearValorSemanal(consistencias.consumo_calculado_botas)} vs ${formatearValorSemanal(consistencias.consumo_total_palets)}`,
        });
    }
    contenedor.innerHTML = kpis.map((item) => `
        <article class="cierre-semanal-kpi">
            <span class="cierre-semanal-kpi-label">${item.label}</span>
            <span class="cierre-semanal-kpi-value">${item.value}</span>
        </article>
    `).join("");
}

function renderizarLotesCierreSemanal(info, items, resumen) {
    const lista = document.getElementById("cierre-semanal-lotes");
    const resumenEl = document.getElementById("cierre-semanal-lotes-resumen");
    if (resumenEl) {
        resumenEl.textContent = `Palets ${items.length} | Negativos ${resumen.negativos} | Posibles ${formatearValorSemanal(resumen.botas_posibles)}`;
    }
    if (!lista) return;
    if (!items.length) {
        lista.innerHTML = `<div class="cierre-semanal-empty">Sin palets/lotes registrados.</div>`;
        return;
    }
    const positivos = items.filter((item) => Number(item.m3_sobrante || 0) > 0);
    lista.innerHTML = items.map((item) => `
        <article class="cierre-semanal-lote${item.negativa ? " cierre-semanal-lote-negativo" : ""}">
            <div class="cierre-semanal-lote-titulo">${item.palet_codigo || item.palet_id || "Palet"}${item.lote ? ` · lote ${item.lote}` : ""}</div>
            <div class="cierre-semanal-lote-grid">
                <div><strong>M3 total:</strong> ${formatearValorSemanal(item.m3_total)}</div>
                <div><strong>M3 consumidos:</strong> ${formatearValorSemanal(item.m3_consumidos)}</div>
                <div><strong>M3 sobrante:</strong> ${formatearValorSemanal(item.m3_sobrante)}</div>
                <div><strong>Botas fabricadas:</strong> ${formatearValorSemanal(item.botas_registradas)}</div>
                <div><strong>Botas posibles:</strong> ${formatearValorSemanal(item.botas_posibles)}</div>
                <div><strong>Esperado semana/total:</strong> ${formatearValorSemanal(info.semanaPedida)} / ${formatearValorSemanal(info.pedidoTotal)}</div>
            </div>
            <div class="cierre-semanal-acciones mt-3">
                ${item.negativo ? `
                    <select class="form-select form-select-sm" data-cierre-destino="${item.trazabilidad_id}">
                        <option value="">Destino para reasignar...</option>
                        ${positivos
                            .filter((destino) => Number(destino.trazabilidad_id) !== Number(item.trazabilidad_id))
                            .map((destino) => `<option value="${destino.trazabilidad_id}">${destino.palet_codigo} (${formatearValorSemanal(destino.m3_sobrante)} m3)</option>`)
                            .join("")}
                    </select>
                    <input class="form-control form-control-sm" type="number" step="0.001" min="0.001" value="${formatearValorSemanal(Math.abs(Number(item.m3_sobrante || 0))).replace(',', '.')}" data-cierre-m3="${item.trazabilidad_id}">
                    <button type="button" class="btn btn-sm btn-outline-warning" data-action="reasignar-negativo-item" data-trazabilidad-id="${item.trazabilidad_id}">
                        Reasignar negativo
                    </button>
                ` : `
                    <button type="button" class="btn btn-sm btn-outline-success" data-action="procesar-sobrante-item" data-trazabilidad-id="${item.trazabilidad_id}" data-m3="${Number(item.m3_sobrante || 0)}">
                        Convertir sobrante a procesado
                    </button>
                `}
            </div>
        </article>
    `).join("");
}

function renderizarCodigosCierreSemanal(codigos) {
    const contenedor = document.getElementById("cierre-semanal-codigos");
    if (!contenedor) return;
    if (!codigos.length) {
        contenedor.innerHTML = `<div class="cierre-semanal-empty">No hay códigos de botas fabricadas todavía.</div>`;
        return;
    }
    contenedor.innerHTML = `
        <div class="small text-muted">${codigos.length} códigos de botas fabricadas.</div>
        <div class="cierre-semanal-codigos-lista">
            ${codigos.map((codigo) => `<span class="cierre-semanal-codigo">${codigo}</span>`).join("")}
        </div>
    `;
}

async function abrirVistaCierreSemanalDesdeLinea(lineaId, origenVista = "vista_fabricacion_semanal") {
    estadoCierreSemanal.lineaId = Number(lineaId || 0) || null;
    estadoCierreSemanal.pedidoId = null;
    estadoCierreSemanal.origenVista = origenVista || "vista_fabricacion_semanal";
    if (typeof contextoNavegacion !== "undefined") {
        contextoNavegacion.cierreSemanalOrigen = estadoCierreSemanal.origenVista;
    }
    await cargarVistaCierreSemanal();
    mostrarSeccion?.("vista_cierre_semanal");
}

async function cargarVistaCierreSemanal() {
    try {
        asegurarEstructuraVistaCierreSemanal();
        const lineaId = Number(estadoCierreSemanal.lineaId || 0);
        if (!lineaId) return;
        const data = (await wsRequest("obtener_cierre_semanal", { fabricacion_semanal_id: lineaId })) || {};
        const linea = data?.linea || {};
        const pedido = data?.pedido || {};
        const info = {
            linea,
            pedido,
            tipo: linea?.tipo_producto_descripcion || "-",
            material: linea?.material_descripcion || "-",
            pedidoDescripcion: (pedido?.descripcion || `Pedido ${linea?.pedido_id || "-"}`).trim(),
            fechaInicio: typeof formatearFechaEuropea === "function" ? formatearFechaEuropea(linea?.fecha_inicio) : (linea?.fecha_inicio || ""),
            semanaPedida: Number(linea?.cantidad || 0) || 0,
            semanaFabricada: Number(linea?.cantidad_fabricada || 0) || 0,
            semanaPendiente: (Number(linea?.cantidad || 0) || 0) - (Number(linea?.cantidad_fabricada || 0) || 0),
            pedidoTotal: Number(pedido?.cantidad || 0) || 0,
            pedidoFabricado: Number(pedido?.cantidad_fabricada || 0) || 0,
            pedidoPendiente: (Number(pedido?.cantidad || 0) || 0) - (Number(pedido?.cantidad_fabricada || 0) || 0),
        };
        estadoCierreSemanal.pedidoId = Number(linea?.pedido_id || 0) || null;
        const items = Array.isArray(data?.palets) ? data.palets : [];
        const resumen = data?.totales || {};
        const codigos = Array.isArray(data?.codigos_botas) ? data.codigos_botas : [];
        const consistencias = data?.consistencias || null;
        estadoCierreSemanal.data = data;

        const titulo = document.getElementById("cierre-semanal-titulo");
        const subtitulo = document.getElementById("cierre-semanal-subtitulo");
        const resumenEl = document.getElementById("cierre-semanal-resumen");
        if (titulo) titulo.textContent = `Cierre semanal: ${info.pedidoDescripcion}`;
        if (subtitulo) subtitulo.textContent = `Tipo ${info.tipo} | Madera ${info.material} | Inicio ${info.fechaInicio || "-"}`;
        if (resumenEl) {
            const lineasResumen = [construirResumenCantidadesLinea(info)];
            if (consistencias) {
                lineasResumen.push(
                    consistencias.semana_fabricada_coincide
                        ? "Control botas: OK. La cantidad fabricada semanal coincide con las botas recuperadas."
                        : `Control botas: NO cuadra. BBDD ${formatearValorSemanal(consistencias.cantidad_bbdd_semana)} frente a botas ${formatearValorSemanal(consistencias.botas_registradas)}.`
                );
                lineasResumen.push(
                    consistencias.consumo_coincide
                        ? "Control consumo: OK. El consumo calculado de botas coincide con el consumido total de palets."
                        : `Control consumo: NO cuadra. Botas ${formatearValorSemanal(consistencias.consumo_calculado_botas)} frente a palets ${formatearValorSemanal(consistencias.consumo_total_palets)}.`
                );
            }
            resumenEl.textContent = lineasResumen.join("\n");
        }

        renderizarResumenCierreSemanal(info, resumen, codigos, consistencias);
        renderizarLotesCierreSemanal(info, items, resumen);
        renderizarCodigosCierreSemanal(codigos);
    } catch (err) {
        console.error(err);
        const kpis = document.getElementById("cierre-semanal-kpis");
        const lotes = document.getElementById("cierre-semanal-lotes");
        const codigos = document.getElementById("cierre-semanal-codigos");
        if (kpis) kpis.innerHTML = `<div class="cierre-semanal-empty">Error al cargar resumen.</div>`;
        if (lotes) lotes.innerHTML = `<div class="cierre-semanal-empty">Error al cargar lotes.</div>`;
        if (codigos) codigos.innerHTML = `<div class="cierre-semanal-empty">Error al cargar códigos.</div>`;
    }
}

function prepararEventosCierreSemanal() {
    const btnReasignar = document.getElementById("cierre-semanal-reasignar-negativo");
    if (btnReasignar) {
        btnReasignar.addEventListener("click", () => {
            const primerNegativo = document.querySelector("[data-action='reasignar-negativo-item']");
            if (primerNegativo) primerNegativo.scrollIntoView({ behavior: "smooth", block: "center" });
        });
    }
    const btnProcesado = document.getElementById("cierre-semanal-crear-procesado");
    if (btnProcesado) {
        btnProcesado.addEventListener("click", async () => {
            const positivos = (estadoCierreSemanal.data?.palets || []).filter((item) => Number(item?.m3_sobrante || 0) > 0);
            if (!positivos.length) {
                alert("No hay sobrantes positivos para procesar.");
                return;
            }
            const primer = positivos[0];
            if (!confirm(`Se procesará el sobrante completo del palet ${primer.palet_codigo}. ¿Continuar?`)) return;
            await wsRequest("crear_palet_procesado_desde_cierre", {
                fabricacion_semanal_id: estadoCierreSemanal.lineaId,
                items: [{ trazabilidad_id: primer.trazabilidad_id, m3: Number(primer.m3_sobrante || 0) }],
            });
            await cargarVistaCierreSemanal();
            refrescarFabricacionDesdeServidor?.();
        });
    }
    const btnCerrar = document.getElementById("cierre-semanal-cerrar");
    if (btnCerrar) {
        btnCerrar.addEventListener("click", async () => {
            if (!estadoCierreSemanal.lineaId) return;
            if (!confirm("Se sincronizará la cantidad fabricada con las botas recuperadas y se marcará la línea como Finalizada. ¿Continuar?")) return;
            await wsRequest("cerrar_fabricacion_semanal", {
                fabricacion_semanal_id: estadoCierreSemanal.lineaId,
            });
            await cargarVistaCierreSemanal();
            refrescarFabricacionDesdeServidor?.();
        });
    }
    const listaLotes = document.getElementById("cierre-semanal-lotes");
    if (listaLotes && !listaLotes.dataset.bindCierreSemanal) {
        listaLotes.dataset.bindCierreSemanal = "1";
        listaLotes.addEventListener("click", async (event) => {
            const btnReasignarItem = event.target.closest("[data-action='reasignar-negativo-item']");
            if (btnReasignarItem) {
                const origenId = Number(btnReasignarItem.getAttribute("data-trazabilidad-id") || 0);
                const destinoId = Number(document.querySelector(`[data-cierre-destino="${origenId}"]`)?.value || 0);
                const m3 = Number(String(document.querySelector(`[data-cierre-m3="${origenId}"]`)?.value || "").replace(",", "."));
                if (!origenId || !destinoId || !Number.isFinite(m3) || m3 <= 0) {
                    alert("Debes indicar destino y m3 válidos.");
                    return;
                }
                await wsRequest("reasignar_consumo_negativo_cierre", {
                    fabricacion_semanal_id: estadoCierreSemanal.lineaId,
                    trazabilidad_origen_id: origenId,
                    trazabilidad_destino_id: destinoId,
                    m3_mover: m3,
                });
                await cargarVistaCierreSemanal();
                refrescarFabricacionDesdeServidor?.();
                return;
            }
            const btnProcesarItem = event.target.closest("[data-action='procesar-sobrante-item']");
            if (btnProcesarItem) {
                const trazabilidadId = Number(btnProcesarItem.getAttribute("data-trazabilidad-id") || 0);
                const m3 = Number(btnProcesarItem.getAttribute("data-m3") || 0);
                if (!trazabilidadId || !Number.isFinite(m3) || m3 <= 0) {
                    alert("Ese palet no tiene sobrante positivo.");
                    return;
                }
                await wsRequest("crear_palet_procesado_desde_cierre", {
                    fabricacion_semanal_id: estadoCierreSemanal.lineaId,
                    items: [{ trazabilidad_id: trazabilidadId, m3 }],
                });
                await cargarVistaCierreSemanal();
                refrescarFabricacionDesdeServidor?.();
            }
        });
    }
}
