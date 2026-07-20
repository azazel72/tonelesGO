const COLUMNAS_PERMISOS_ROL = [
    "planificacion",
    "recepcion",
    "ubicacion",
    "fabricacion",
    "expedicion",
    "trazabilidad",
    "administrador",
];

const ACCIONES_PERMISO_GESTION = {
    "ver-usuarios": [],
    "ver-roles": [],
    "ver-estados-pedidos": [],
    "ver-estados-fabricacion-semanal": [],
    "ver-estados-productos": [],
    "ver-estados-flejes": [],
    "ver-estados-trazabilidad-fabricacion": [],
    "ver-estados-palets": [],
    "ver-puestos-trabajo": [],
    "ver-proveedores": [],
    "ver-clientes": [],
    "ver-instalaciones": [],
    "ver-ubicaciones": [],
    "ver-materiales": [],
    "ver-tostados": [],
    "ver-entradas": { permisos: [], marcarCandado: false, desactivada: false },
    "ver-lineas-entrada": { permisos: [], marcarCandado: false, desactivada: false },
    "ver-entradas-flejes": [],
    "ver-palets": [],
    "ver-productos": [],
    "ver-cubicaje": [],
    "ver-archivos-subidos": [],
    "ver-ambientes": [],
    "cerrar-maestros": [],
    "ver-planificacion-entradas": { permisos: ["planificacion"], marcarCandado: false, desactivada: false },
    "ver-cuadrantes": [],
    "ver-pedidos": [],
    "ver-planificacion-pedidos": [],
    "ver-tipos-producto": [],
    "ver-fabricacion-semanal": [],
    "ver-consumos": [],
    "ver-trazabilidad-procesado": [],
    "ver-trazabilidad-fabricacion": [],
    "ver-trazabilidad-producto": [],
    "ver-inventario-duelas": [],
    "ver-inventario-flejes": [],
    "exportar-csv": [],
    "exportar-json": [],
    "subir-archivo": [],
};

const MODO_RESTRICCION_MENU_GESTION = "desactivar"; //desactivar u ocultar

const SESION_GESTION = {
    usuario: null,
    permisos: null,
};

function obtenerConfigAccionGestion(action) {
    const entrada = ACCIONES_PERMISO_GESTION[action];
    if (Array.isArray(entrada)) {
        return { definida: true, permisos: entrada, marcarCandado: false, desactivada: false };
    }
    if (entrada && typeof entrada === "object") {
        return {
            definida: true,
            permisos: Array.isArray(entrada.permisos) ? entrada.permisos : [],
            marcarCandado: Boolean(entrada.marcarCandado),
            desactivada: Boolean(entrada.desactivada),
        };
    }
    return { definida: false, permisos: [], marcarCandado: false, desactivada: false };
}

function registrarUsuarioLogado(usuario) {
    SESION_GESTION.usuario = usuario || null;
}

function calcularPermisosUsuarioLogado() {
    const usuario = SESION_GESTION.usuario;
    const rolId = usuario?.rol_id;
    const roles = DATOS?.maestros?.roles;
    const rol = rolId != null ? roles?.[rolId] : null;

    if (!rol) {
        SESION_GESTION.permisos = null;
        return null;
    }

    const permisos = {};
    for (const columna of COLUMNAS_PERMISOS_ROL) {
        permisos[columna] = Boolean(rol[columna]);
    }
    SESION_GESTION.permisos = permisos;
    return permisos;
}

function tienePermisoAccionGestion(action) {
    const config = obtenerConfigAccionGestion(action);
    const requisitos = config.permisos;
    if (!config.definida || requisitos.length === 0) return true;

    const permisos = SESION_GESTION.permisos;
    if (!permisos) return false;
    if (permisos.administrador) return true;
    return requisitos.some((permiso) => Boolean(permisos[permiso]));
}

function aplicarMarcaCandadoMenu(el, mostrarCandado) {
    const lockExistente = el.querySelector(".permiso-lock-icon");
    if (!mostrarCandado) {
        lockExistente?.remove();
        el.classList.remove("permiso-item-marcado");
        return;
    }

    el.classList.add("permiso-item-marcado");
    if (lockExistente) return;
    const candado = document.createElement("i");
    candado.className = "bi bi-lock-fill permiso-lock-icon";
    candado.setAttribute("aria-hidden", "true");
    el.appendChild(candado);
}

function bloquearAccionMenu(el) {
    if (MODO_RESTRICCION_MENU_GESTION === "ocultar") {
        el.classList.add("d-none");
        el.dataset.permisoOculto = "1";
        return;
    }
    el.classList.add("disabled", "pe-none");
    el.setAttribute("disabled", "true");
    el.setAttribute("aria-disabled", "true");
    el.setAttribute("tabindex", "-1");
    el.dataset.permisoBloqueado = "1";
}

function desbloquearAccionMenu(el) {
    if (el.dataset.permisoOculto === "1") {
        el.classList.remove("d-none");
        delete el.dataset.permisoOculto;
    }
    if (el.dataset.permisoBloqueado === "1") {
        el.classList.remove("disabled", "pe-none");
        el.removeAttribute("disabled");
        el.removeAttribute("aria-disabled");
        el.removeAttribute("tabindex");
        delete el.dataset.permisoBloqueado;
    }
}

function aplicarPermisosMenuGestion() {
    const acciones = document.querySelectorAll("[data-action]");
    if (!acciones.length) return;

    for (const el of acciones) {
        const action = el.dataset.action;
        if (!action) continue;
        const config = obtenerConfigAccionGestion(action);
        aplicarMarcaCandadoMenu(el, config.marcarCandado);
        const permitido = config.desactivada ? false : tienePermisoAccionGestion(action);
        if (permitido) desbloquearAccionMenu(el);
        else bloquearAccionMenu(el);
    }
}
