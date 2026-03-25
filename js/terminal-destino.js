function prepararEventosDestino() {
    const lista = document.getElementById("destino-lista");
    const inputCodigo = document.getElementById("destino-expedir-codigo");
    const inputCodigoEnvinar = document.getElementById("destino-envinar-codigo");
    const btnConfirmar = document.getElementById("destino-expedir-confirmar");
    const btnConfirmarEnvinar = document.getElementById("destino-envinar-confirmar");
    const modalEl = document.getElementById("modalExpedirDestino");
    const modalEnvinarEl = document.getElementById("modalEnvinarDestino");

    if (lista) {
        lista.addEventListener("click", (event) => {
            const boton = event.target.closest("[data-destino-expedir]");
            if (!boton) return;
            event.preventDefault();
            event.stopPropagation();
            if (boton.dataset.destinoAccion === "envinar") {
                abrirModalEnvinarDestino(boton);
                return;
            }
            abrirModalExpedirDestinoDesdeBoton(boton);
        });
    }

    if (inputCodigo) {
        inputCodigo.addEventListener("keydown", (event) => {
            if (event.key !== "Enter") return;
            event.preventDefault();
            agregarCodigoExpedicionDestino(inputCodigo.value);
        });
    }

    if (inputCodigoEnvinar) {
        inputCodigoEnvinar.addEventListener("keydown", (event) => {
            if (event.key !== "Enter") return;
            event.preventDefault();
            agregarCodigoEnvinar(inputCodigoEnvinar.value);
        });
    }

    if (btnConfirmar) {
        btnConfirmar.addEventListener("click", async () => {
            await confirmarExpedicionDestino();
        });
    }

    if (btnConfirmarEnvinar) {
        btnConfirmarEnvinar.addEventListener("click", async () => {
            await confirmarEnvinarDestino();
        });
    }

    if (modalEl) {
        modalEl.addEventListener("hidden.bs.modal", () => {
            limpiarModalExpedirDestino();
        });
    }

    if (modalEnvinarEl) {
        modalEnvinarEl.addEventListener("hidden.bs.modal", () => {
            limpiarModalEnvinarDestino();
        });
    }
}

async function cargarVistaDestino() {
    await cargarVistaProductosPorFiltros({
        listaId: "destino-lista",
        resumenId: "destino-resumen",
        tipos: ["BOTA"],
        pedidoEstado: 2,
        estadosProducto: [1, 2, 3],
        etiquetaResumen: "botas",
        textoVacio: "No hay botas para destino.",
        renderizador: renderizarVistaProductosPorPedido,
        mostrarDestinoPedido: true,
        resolverClasePedido: (destino) => {
            const valor = String(destino || "").trim().toUpperCase();
            if (valor === "CLIENTE") return "destino-pedido-card destino-pedido-card-cliente";
            if (valor === "ENVINADO") return "destino-pedido-card destino-pedido-card-envinado";
            return "destino-pedido-card";
        },
        renderAccionPedido: (grupo) => renderizarAccionPedidoDestino(grupo),
    });
}

const estadoDestino = {
    pedidoId: null,
    pedidoNumero: "",
    codigosPermitidos: [],
    codigosSeleccionados: [],
};

const estadoDestinoEnvinar = {
    pedidoId: null,
    pedidoNumero: "",
    codigosPermitidos: [],
    codigosSeleccionados: [],
};

const maestrosDestinoEnvinar = {
    instalaciones: {},
    ubicaciones: {},
};

function renderizarAccionPedidoDestino(grupo) {
    const destino = String(grupo?.pedidoDestino || "").trim().toUpperCase();
    if (destino === "CLIENTE") {
        return `
        <button
            type="button"
            class="btn btn-sm destino-pedido-accion"
            data-destino-expedir="1"
            data-pedido-id="${Number(grupo?.pedidoId || 0)}"
            data-pedido-numero="${escapeHtmlDestinoProductos(grupo?.pedidoNumero || "")}"
            data-codigos="${escapeHtmlDestinoProductos((grupo?.codigos || []).join("|"))}"
            title="Expedir"
            aria-label="Expedir pedido"
        >
            <i class="bi bi-truck"></i>
        </button>
    `;
    }
    if (destino === "ENVINADO") {
        return `
        <button
            type="button"
            class="btn btn-sm destino-pedido-accion"
            data-destino-expedir="1"
            data-destino-accion="envinar"
            data-pedido-id="${Number(grupo?.pedidoId || 0)}"
            data-pedido-numero="${escapeHtmlDestinoProductos(grupo?.pedidoNumero || "")}"
            data-codigos="${escapeHtmlDestinoProductos((grupo?.codigos || []).join("|"))}"
            title="Envinar"
            aria-label="Envinar pedido"
        >
            <svg viewBox="0 0 64 64" width="18" height="18" aria-hidden="true" focusable="false">
                <path fill="currentColor" d="M21 6c-2.8 0-5 2.2-5 5v12c0 9.2 6.3 16.9 14.8 19.1L29 52h-6c-1.7 0-3 1.3-3 3v3h24v-3c0-1.7-1.3-3-3-3h-6l-1.8-9.9C41.7 39.9 48 32.2 48 23V11c0-2.8-2.2-5-5-5H21zm1 6h20v10c0 7.7-5.4 14.1-12.6 15.6C25.2 36.8 22 30.8 22 24V12z"/>
            </svg>
        </button>
    `;
    }
    return "";
}

function abrirModalExpedirDestinoDesdeBoton(boton) {
    estadoDestino.pedidoId = Number(boton.dataset.pedidoId || 0);
    estadoDestino.pedidoNumero = String(boton.dataset.pedidoNumero || "");
    estadoDestino.codigosPermitidos = String(boton.dataset.codigos || "")
        .split("|")
        .map((codigo) => codigo.trim())
        .filter(Boolean);
    estadoDestino.codigosSeleccionados = [];

    const tituloPedido = document.getElementById("destino-expedir-pedido");
    const inputContenedor = document.getElementById("destino-expedir-contenedor");
    const inputCodigo = document.getElementById("destino-expedir-codigo");
    const modalEl = document.getElementById("modalExpedirDestino");

    if (tituloPedido) tituloPedido.textContent = estadoDestino.pedidoNumero;
    if (inputContenedor) inputContenedor.value = "";
    if (inputCodigo) inputCodigo.value = "";
    renderizarCodigosExpedicionDestino();
    mostrarErrorExpedicionDestino("");

    if (!modalEl) return;
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
    setTimeout(() => inputCodigo?.focus(), 150);
}

function agregarCodigoExpedicionDestino(codigoRaw) {
    const codigo = String(codigoRaw || "").trim();
    const inputCodigo = document.getElementById("destino-expedir-codigo");
    if (!codigo) return;
    if (!estadoDestino.codigosPermitidos.includes(codigo)) {
        mostrarErrorExpedicionDestino("Ese código no está en la lista del pedido.");
        return;
    }
    if (estadoDestino.codigosSeleccionados.includes(codigo)) {
        mostrarErrorExpedicionDestino("Ese código ya está agregado.");
        return;
    }
    estadoDestino.codigosSeleccionados.push(codigo);
    if (inputCodigo) inputCodigo.value = "";
    mostrarErrorExpedicionDestino("");
    renderizarCodigosExpedicionDestino();
}

function quitarCodigoExpedicionDestino(codigo) {
    estadoDestino.codigosSeleccionados = estadoDestino.codigosSeleccionados.filter((item) => item !== codigo);
    renderizarCodigosExpedicionDestino();
}

function renderizarCodigosExpedicionDestino() {
    const contenedor = document.getElementById("destino-expedir-codigos");
    if (!contenedor) return;
    if (!estadoDestino.codigosSeleccionados.length) {
        contenedor.innerHTML = `<div class="text-muted small">Sin botas seleccionadas.</div>`;
        return;
    }
    contenedor.innerHTML = estadoDestino.codigosSeleccionados
        .map((codigo) => `
            <span class="destino-expedir-codigo">
                ${escapeHtmlDestinoProductos(codigo)}
                <button type="button" data-destino-quitar-codigo="${escapeHtmlDestinoProductos(codigo)}" aria-label="Quitar código">&times;</button>
            </span>
        `)
        .join("");

    contenedor.querySelectorAll("[data-destino-quitar-codigo]").forEach((boton) => {
        boton.addEventListener("click", () => {
            quitarCodigoExpedicionDestino(String(boton.dataset.destinoQuitarCodigo || ""));
        });
    });
}

function mostrarErrorExpedicionDestino(texto) {
    const error = document.getElementById("destino-expedir-error");
    if (!error) return;
    error.textContent = texto || "";
    error.classList.toggle("d-none", !texto);
}

function limpiarModalExpedirDestino() {
    estadoDestino.pedidoId = null;
    estadoDestino.pedidoNumero = "";
    estadoDestino.codigosPermitidos = [];
    estadoDestino.codigosSeleccionados = [];
    const tituloPedido = document.getElementById("destino-expedir-pedido");
    const inputContenedor = document.getElementById("destino-expedir-contenedor");
    const inputCodigo = document.getElementById("destino-expedir-codigo");
    if (tituloPedido) tituloPedido.textContent = "";
    if (inputContenedor) inputContenedor.value = "";
    if (inputCodigo) inputCodigo.value = "";
    mostrarErrorExpedicionDestino("");
    renderizarCodigosExpedicionDestino();
}

async function confirmarExpedicionDestino() {
    const inputContenedor = document.getElementById("destino-expedir-contenedor");
    const btnConfirmar = document.getElementById("destino-expedir-confirmar");
    const modalEl = document.getElementById("modalExpedirDestino");
    const contenedor = String(inputContenedor?.value || "").trim();

    if (!estadoDestino.pedidoId) {
        mostrarErrorExpedicionDestino("No hay pedido seleccionado.");
        return;
    }
    if (!contenedor) {
        mostrarErrorExpedicionDestino("Contenedor es obligatorio.");
        return;
    }
    if (!estadoDestino.codigosSeleccionados.length) {
        mostrarErrorExpedicionDestino("Debes agregar al menos una bota.");
        return;
    }

    try {
        if (btnConfirmar) btnConfirmar.disabled = true;
        mostrarErrorExpedicionDestino("");
        await wsRequest("expedir_productos_destino", {
            pedido_id: estadoDestino.pedidoId,
            contenedor,
            codigos: estadoDestino.codigosSeleccionados,
        });
        const modal = modalEl ? bootstrap.Modal.getOrCreateInstance(modalEl) : null;
        modal?.hide();
        await cargarVistaDestino();
    } catch (err) {
        console.error("No se pudo expedir el pedido:", err);
        mostrarErrorExpedicionDestino(err?.message || "No se pudo expedir el pedido.");
    } finally {
        if (btnConfirmar) btnConfirmar.disabled = false;
    }
}

async function asegurarMaestrosEnvinarDestino() {
    const tieneInstalaciones = maestrosDestinoEnvinar.instalaciones && Object.keys(maestrosDestinoEnvinar.instalaciones).length > 0;
    const tieneUbicaciones = maestrosDestinoEnvinar.ubicaciones && Object.keys(maestrosDestinoEnvinar.ubicaciones).length > 0;
    if (tieneInstalaciones && tieneUbicaciones) return;
    const maestros = await wsRequest("maestros", {});
    maestrosDestinoEnvinar.instalaciones = maestros?.instalaciones || {};
    maestrosDestinoEnvinar.ubicaciones = maestros?.ubicaciones || {};
}

function obtenerUbicacionesEnvinar() {
    const instalaciones = maestrosDestinoEnvinar.instalaciones || {};
    const ubicaciones = maestrosDestinoEnvinar.ubicaciones || {};
    return Object.values(ubicaciones)
        .filter((ubicacion) => {
            const instalacion = instalaciones?.[ubicacion?.instalacion_id] || null;
            return String(instalacion?.tipo || "").trim().toUpperCase() === "B";
        })
        .sort((a, b) => {
            const textoA = obtenerTextoUbicacionEnvinar(a);
            const textoB = obtenerTextoUbicacionEnvinar(b);
            return textoA.localeCompare(textoB, "es");
        });
}

function obtenerTextoUbicacionEnvinar(ubicacion) {
    const instalaciones = maestrosDestinoEnvinar.instalaciones || {};
    const instalacion = instalaciones?.[ubicacion?.instalacion_id] || null;
    const nombreInstalacion = String(instalacion?.nombre || "").trim();
    const nombreUbicacion = String(ubicacion?.descripcion || ubicacion?.id || "").trim();
    return nombreInstalacion ? `${nombreInstalacion} - ${nombreUbicacion}` : nombreUbicacion;
}

function pintarSelectorUbicacionesEnvinar() {
    const selector = document.getElementById("destino-envinar-ubicacion");
    if (!selector) return;
    const ubicaciones = obtenerUbicacionesEnvinar();
    selector.innerHTML = `<option value="">Selecciona una ubicación...</option>` + ubicaciones
        .map((ubicacion) => `<option value="${ubicacion.id}">${escapeHtmlDestinoProductos(obtenerTextoUbicacionEnvinar(ubicacion))}</option>`)
        .join("");
}

async function abrirModalEnvinarDestino(boton) {
    estadoDestinoEnvinar.pedidoId = Number(boton.dataset.pedidoId || 0);
    estadoDestinoEnvinar.pedidoNumero = String(boton.dataset.pedidoNumero || "");
    estadoDestinoEnvinar.codigosPermitidos = String(boton.dataset.codigos || "")
        .split("|")
        .map((codigo) => codigo.trim())
        .filter(Boolean);
    estadoDestinoEnvinar.codigosSeleccionados = [];

    const tituloPedido = document.getElementById("destino-envinar-pedido");
    const inputCodigo = document.getElementById("destino-envinar-codigo");
    const modalEl = document.getElementById("modalEnvinarDestino");

    if (tituloPedido) tituloPedido.textContent = estadoDestinoEnvinar.pedidoNumero;
    await asegurarMaestrosEnvinarDestino();
    pintarSelectorUbicacionesEnvinar();
    if (inputCodigo) inputCodigo.value = "";
    renderizarCodigosEnvinar();
    mostrarErrorEnvinar("");

    if (!modalEl) return;
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
    setTimeout(() => inputCodigo?.focus(), 150);
}

function agregarCodigoEnvinar(codigoRaw) {
    const codigo = String(codigoRaw || "").trim();
    const inputCodigo = document.getElementById("destino-envinar-codigo");
    if (!codigo) return;
    if (!estadoDestinoEnvinar.codigosPermitidos.includes(codigo)) {
        mostrarErrorEnvinar("Ese código no está en la lista del pedido.");
        return;
    }
    if (estadoDestinoEnvinar.codigosSeleccionados.includes(codigo)) {
        mostrarErrorEnvinar("Ese código ya está agregado.");
        return;
    }
    estadoDestinoEnvinar.codigosSeleccionados.push(codigo);
    if (inputCodigo) inputCodigo.value = "";
    mostrarErrorEnvinar("");
    renderizarCodigosEnvinar();
}

function quitarCodigoEnvinar(codigo) {
    estadoDestinoEnvinar.codigosSeleccionados = estadoDestinoEnvinar.codigosSeleccionados.filter((item) => item !== codigo);
    renderizarCodigosEnvinar();
}

function renderizarCodigosEnvinar() {
    const contenedor = document.getElementById("destino-envinar-codigos");
    if (!contenedor) return;
    if (!estadoDestinoEnvinar.codigosSeleccionados.length) {
        contenedor.innerHTML = `<div class="text-muted small">Sin botas seleccionadas.</div>`;
        return;
    }
    contenedor.innerHTML = estadoDestinoEnvinar.codigosSeleccionados
        .map((codigo) => `
            <span class="destino-expedir-codigo">
                ${escapeHtmlDestinoProductos(codigo)}
                <button type="button" data-destino-envinar-quitar="${escapeHtmlDestinoProductos(codigo)}" aria-label="Quitar código">&times;</button>
            </span>
        `)
        .join("");

    contenedor.querySelectorAll("[data-destino-envinar-quitar]").forEach((boton) => {
        boton.addEventListener("click", () => {
            quitarCodigoEnvinar(String(boton.dataset.destinoEnvinarQuitar || ""));
        });
    });
}

function mostrarErrorEnvinar(texto) {
    const error = document.getElementById("destino-envinar-error");
    if (!error) return;
    error.textContent = texto || "";
    error.classList.toggle("d-none", !texto);
}

function limpiarModalEnvinarDestino() {
    estadoDestinoEnvinar.pedidoId = null;
    estadoDestinoEnvinar.pedidoNumero = "";
    estadoDestinoEnvinar.codigosPermitidos = [];
    estadoDestinoEnvinar.codigosSeleccionados = [];

    const tituloPedido = document.getElementById("destino-envinar-pedido");
    const selectorUbicacion = document.getElementById("destino-envinar-ubicacion");
    const inputCodigo = document.getElementById("destino-envinar-codigo");
    if (tituloPedido) tituloPedido.textContent = "";
    if (selectorUbicacion) selectorUbicacion.innerHTML = `<option value="">Selecciona una ubicación...</option>`;
    if (inputCodigo) inputCodigo.value = "";
    mostrarErrorEnvinar("");
    renderizarCodigosEnvinar();
}

async function confirmarEnvinarDestino() {
    const selectorUbicacion = document.getElementById("destino-envinar-ubicacion");
    const btnConfirmar = document.getElementById("destino-envinar-confirmar");
    const modalEl = document.getElementById("modalEnvinarDestino");
    const ubicacionId = Number(selectorUbicacion?.value || 0);

    if (!estadoDestinoEnvinar.pedidoId) {
        mostrarErrorEnvinar("No hay pedido seleccionado.");
        return;
    }
    if (!ubicacionId) {
        mostrarErrorEnvinar("Debes seleccionar una ubicación.");
        return;
    }
    if (!estadoDestinoEnvinar.codigosSeleccionados.length) {
        mostrarErrorEnvinar("Debes agregar al menos una bota.");
        return;
    }

    try {
        if (btnConfirmar) btnConfirmar.disabled = true;
        mostrarErrorEnvinar("");
        await wsRequest("envinar_productos_destino", {
            pedido_id: estadoDestinoEnvinar.pedidoId,
            ubicacion_id: ubicacionId,
            codigos: estadoDestinoEnvinar.codigosSeleccionados,
        });
        const modal = modalEl ? bootstrap.Modal.getOrCreateInstance(modalEl) : null;
        modal?.hide();
        await cargarVistaDestino();
    } catch (err) {
        console.error("No se pudo envinar el pedido:", err);
        mostrarErrorEnvinar(err?.message || "No se pudo envinar el pedido.");
    } finally {
        if (btnConfirmar) btnConfirmar.disabled = false;
    }
}
