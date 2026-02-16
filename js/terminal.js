document.addEventListener("DOMContentLoaded", function () {

    // Navegacion por secciones usando el atributo "mostrar"
    const botonesNavegacion = document.querySelectorAll("button[mostrar]");
    botonesNavegacion.forEach(function (boton) {
        boton.addEventListener("click", function () {
            if (boton.dataset.origenFabricacion) {
                contextoNavegacion.fabricacionOrigen = boton.dataset.origenFabricacion;
            }
            if (boton.dataset.contextoUbicacion) {
                contextoNavegacion.ubicacionOrigen = boton.dataset.contextoUbicacion;
            }
            contextoNavegacion.autoAccesoConsumo = boton.dataset.accesoDirectoConsumo === "1";
            mostrarSeccion(boton.getAttribute("mostrar"));
        });
    });

    // Selecciona todas las migas de pan
    const migasPan = document.querySelector("header nav ol");
    migasPan.addEventListener("click", function (event) {
        event.preventDefault();
        const miga = event.target.closest("li:not(.active)");
        if (!miga || !miga.hasAttribute("mostrar")) return; // Verifica que se haya hecho clic en una miga válida
        // Muestra la sección correspondiente al atributo 'mostrar'
        mostrarSeccion(miga.getAttribute("mostrar"));
    });

    prepararEventosRecepcion();
    prepararEventosFabricacion();
    prepararEventosExpedicion();

    // Muestra la sección de tareas al cargar la página
    mostrarSeccion("vista_tareas");

    conexionInicial();
});

let pantallaActual = null;
let contextoPantalla = {};
const contextoNavegacion = {
    fabricacionOrigen: "botas",
    ubicacionOrigen: "botas",
    autoAccesoConsumo: false,
};

function mostrarSeccion(id) {
    if (id === "vista_inicio") {
        id = "vista_tareas";
    }
    const seccionActiva = document.getElementById(id);
    if (seccionActiva) {
        // Oculta todas las secciones
        const secciones = document.querySelectorAll("section");
        secciones.forEach(function (seccion) {
            seccion.classList.remove("pagina-activa");
        });
        // Muestra la sección correspondiente
        seccionActiva.classList.add("pagina-activa");
        if (id === "vista_recepcion") {
            cargarEntradasRecepcion();
        }
        if (id === "vista_fabricacion") {
            const activarAutoAccesoConsumo = contextoNavegacion.fabricacionOrigen === "palets" && contextoNavegacion.autoAccesoConsumo;
            contextoNavegacion.autoAccesoConsumo = false;
            cargarOrdenesFabricacion({ autoAccesoConsumo: activarAutoAccesoConsumo });
        }
        // Actualiza las migas de pan
        actualizarMigasPan(id);
        setPantalla(id, {});
    }
}

function actualizarMigasPan(mostrarSeccion) {
    const migasPan = document.querySelector("nav[aria-label='breadcrumb'] ol");
    migasPan.innerHTML = '';
    var nuevaMiga = null;
    switch (mostrarSeccion) {
        case "vista_tareas":
            nuevaMiga = crearMigaPan("Inicio", "vista_tareas", true);
            migasPan.appendChild(nuevaMiga);
            break;
        case "vista_menu_palets":
            nuevaMiga = crearMigaPan("Inicio", "vista_tareas", false);
            migasPan.appendChild(nuevaMiga);
            nuevaMiga = crearMigaPan("Palets", mostrarSeccion, true);
            migasPan.appendChild(nuevaMiga);
            break;
        case "vista_menu_botas":
            nuevaMiga = crearMigaPan("Inicio", "vista_tareas", false);
            migasPan.appendChild(nuevaMiga);
            nuevaMiga = crearMigaPan("Botas", mostrarSeccion, true);
            migasPan.appendChild(nuevaMiga);
            break;
        case "vista_recepcion":
            nuevaMiga = crearMigaPan("Inicio", "vista_tareas", false);
            migasPan.appendChild(nuevaMiga);
            nuevaMiga = crearMigaPan("Palets", "vista_menu_palets", false);
            migasPan.appendChild(nuevaMiga);
            nuevaMiga = crearMigaPan("Recepción", mostrarSeccion, true);
            migasPan.appendChild(nuevaMiga);
            break;
        case "vista_ubicacion":
            nuevaMiga = crearMigaPan("Inicio", "vista_tareas", false);
            migasPan.appendChild(nuevaMiga);
            if (contextoNavegacion.ubicacionOrigen === "botas") {
                nuevaMiga = crearMigaPan("Botas", "vista_menu_botas", false);
                migasPan.appendChild(nuevaMiga);
            }
            nuevaMiga = crearMigaPan("Ubicación", mostrarSeccion, true);
            migasPan.appendChild(nuevaMiga);
            break;
        case "vista_fabricacion":
            nuevaMiga = crearMigaPan("Inicio", "vista_tareas", false);
            migasPan.appendChild(nuevaMiga);
            if (contextoNavegacion.fabricacionOrigen === "palets") {
                nuevaMiga = crearMigaPan("Palets", "vista_menu_palets", false);
                migasPan.appendChild(nuevaMiga);
                nuevaMiga = crearMigaPan("Consumo", mostrarSeccion, true);
            } else {
                nuevaMiga = crearMigaPan("Botas", "vista_menu_botas", false);
                migasPan.appendChild(nuevaMiga);
                nuevaMiga = crearMigaPan("Fabricación", mostrarSeccion, true);
            }
            migasPan.appendChild(nuevaMiga);
            break;
        case "vista_expedicion":
            nuevaMiga = crearMigaPan("Inicio", "vista_tareas", false);
            migasPan.appendChild(nuevaMiga);
            nuevaMiga = crearMigaPan("Botas", "vista_menu_botas", false);
            migasPan.appendChild(nuevaMiga);
            nuevaMiga = crearMigaPan("Expediciones", mostrarSeccion, true);
            migasPan.appendChild(nuevaMiga);
            break;
    }
}

function crearMigaPan(nombre, mostrarSeccion, activo = false) {
    const nuevaMiga = document.createElement("li");
    nuevaMiga.classList.add("breadcrumb-item");
    nuevaMiga.setAttribute("mostrar", mostrarSeccion);
    if (activo) {
        nuevaMiga.innerHTML = nombre;
        nuevaMiga.classList.add("active");
        nuevaMiga.setAttribute("aria-current", "page");
    } else {
        nuevaMiga.innerHTML = `<a href="#">${nombre}</a>`;
    }
    return nuevaMiga;
}

function routeMessage(data) {
    //console.log("Mensaje recibido:", data);
    try {
        const msg = typeof data === 'string' ? JSON.parse(data) : data;
        if (msg.request_id) {
        const pending = pendingWsRequests.get(msg.request_id);
        if (pending) {
            pendingWsRequests.delete(msg.request_id);
            pending.resolve(msg.data);
            return;
        }
        }
        (ACCIONES[msg.action] || ACCIONES.default)?.(msg);
    } catch (e) {
        console.error('WS JSON inválido:', e, data);
    }
}

var ACCIONES = {
    "default": (msg) => {
        console.warn("Acción no manejada:", msg);
    },
    "login": console.log,
    "fabricacion_actualizar": (msg) => {
        if (pantallaActual === "vista_fabricacion") {
            if (msg?.data?.refetch_maestros) {
                refrescarMaestrosFabricacion?.();
            }
            refrescarFabricacionDesdeServidor?.(msg.data || {});
        }
    },
    "async_error": (msg) => {
        const texto = msg.error || msg.data || "Error async servidor.";
        console.error("Error async servidor:", texto);
        alert(texto);
    },
    "async_print": (msg) => {
        const data = msg.data || {};
        const codigo = data.codigo || "";
        console.log("Impresion completada:", data);
        if (codigo) {
            alert(`Etiqueta enviada a impresora: ${codigo}`);
        } else {
            alert("Etiqueta enviada a impresora.");
        }
    },
};

function setPantalla(pantalla, contexto = {}) {
    pantallaActual = pantalla;
    contextoPantalla = contexto;
    enviarPantalla();
}

function enviarPantalla() {
    const ws = conn && conn.socket;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    const payload = { pantalla: pantallaActual, contexto: contextoPantalla };
    ws.send(JSON.stringify({ action: "set_pantalla", data: payload }));
}
