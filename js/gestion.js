const DATOS = {
    maestros: {},
    entradas: { planificacion: {} },
    salidas: { planificacion: {} },
};

window.onload = () => {
    const actions = {
        async "ver-usuarios"() {
            await openUsuariosWin();
        },

        async "ver-roles"() {
            await openRolesWin();
        },

        async "ver-proveedores"() {
            await openProveedoresWin();
        },

        async "ver-clientes"() {
            await openClientesWin();
        },

        async "ver-instalaciones"() {
            await openInstalacionesWin();
        },

        async "ver-ubicaciones"() {
            await openUbicacionesWin();
        },

        async "ver-estados"() {
            await openEstadosWin();
        },

        async "ver-materiales"() {
            await openMaterialesWin();
        },

        async "ver-entradas"() {
            await openEntradasWin();
        },
        async "ver-salidas"() {
            await openSalidasWin();
        },

        async "cerrar-maestros"() {
            cerrarVentanasMaestros();
        },


        async "login"() {
            enviarLogin();
        },
        async "logout"() {
            enviarLogout();
        },

        // Acción con parámetros vía data-*
        filtrar(el) {
            const field = el.dataset.filterField;
            const op    = el.dataset.filterOp || "=";
            const value = el.dataset.filterValue;
            console.log(field, op, value);
        },
    };

    // Delegación de eventos (un solo listener para toda la página)
    document.addEventListener("click", async (ev) => {
        const el = ev.target.closest("[data-action]");
        if (!el) return;
        ev.preventDefault();

        const action = el?.dataset?.action ?? "";
        const fn = actions[action];
        if (!fn) {
            console.warn("Acción no encontrada:", action);
            return;
        }

        // Manejo uniforme de errores y estado de UI
        try {
            el.classList.add("disabled", "pe-none"); // evita clics repetidos
            await fn();                             // pasa el elemento por si necesita data-*
        } catch (e) {
            console.error(e);
            alert("Error: " + (e.message || e));
        } finally {
            el.classList.remove("disabled", "pe-none");
        }
    });

    conexionInicial();
}


function respuesta_maestros(response) {
    if (response.data) {
        DATOS.maestros = response.data;
        console.log("Maestros recibidos:", DATOS.maestros);
    } else {
        alert("Error al recibir maestros: " + response.error);
    }
}