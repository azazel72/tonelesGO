const DATOS = {
    maestros: {},
    fabricacion: {},
    planificacion_entradas: { planificacion: {} },
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

        async "ver-puestos-trabajo"() {
            await openPuestosTrabajoWin();
        },

        async "ver-materiales"() {
            await openMaterialesWin();
        },

        async "ver-duelas"() {
            await openDuelasWin();
        },

        async "ver-entradas"() {
            await openEntradasWin();
        },

        async "ver-lineas-entrada"() {
            await openLineasEntradaWin();
        },

        async "ver-palets"() {
            await openPaletsWin();
        },

        async "ver-productos"() {
            await openProductosWin();
        },

        async "ver-archivos-subidos"() {
            await openArchivosSubidosWin();
        },
        async "ver-ordenes-fabricacion"() {
            await openOrdenesFabricacionWin();
        },
        async "ver-tipos-producto"() {
            await openTiposProductoWin();
        },
        async "ver-lineas-fabricacion"() {
            await openLineasFabricacionWin();
        },
        async "ver-trazabilidad-procesado"() {
            await openTrazabilidadProcesadoWin();
        },
        async "ver-trazabilidad-fabricacion"() {
            await openTrazabilidadFabricacionWin();
        },
        async "ver-trazabilidad-producto"() {
            await openTrazabilidadProductoWin();
        },
        async "ver-botas"() {
            await openBotasWin();
        },

        async "ver-planificacion-entradas"() {
            await openPlanificacionEntradasWin();
        },
        async "ver-cuadrantes"() {
            await openCuadrantesWin();
        },

        async "cerrar-maestros"() {
            cerrarVentanasMaestros();
        },

        async "subir-archivo"() {
            await openSubirArchivoWin();
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

    // Mantener actualizado cuando se agreguen nuevas ventanas/maestros.
    window.WINDOW_OPENERS = {
        usuarios: openUsuariosWin,
        roles: openRolesWin,
        proveedores: openProveedoresWin,
        clientes: openClientesWin,
        instalaciones: openInstalacionesWin,
        ubicaciones: openUbicacionesWin,
        estados: openEstadosWin,
        puestos_trabajo: openPuestosTrabajoWin,
        materiales: openMaterialesWin,
        duelas: openDuelasWin,
        entradas: openEntradasWin,
        lineas_entrada: openLineasEntradaWin,
        palets: openPaletsWin,
        productos: openProductosWin,
        archivos_subidos: openArchivosSubidosWin,
        ordenes_fabricacion: openOrdenesFabricacionWin,
        tipos_producto: openTiposProductoWin,
        lineas_fabricacion: openLineasFabricacionWin,
        trazabilidad_procesado: openTrazabilidadProcesadoWin,
        trazabilidad_fabricacion: openTrazabilidadFabricacionWin,
        trazabilidad_producto: openTrazabilidadProductoWin,
        botas: openBotasWin,
        planificacion_entradas: openPlanificacionEntradasWin,
        cuadrantes: openCuadrantesWin,
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
        if (window.__reloadKey) {
            const key = window.__reloadKey;
            window.__reloadKey = null;
            window.WINDOW_OPENERS?.[key]?.();
        }
    } else {
        alert("Error al recibir maestros: " + response.error);
    }
}

function respuesta_fabricacion(response) {
    if (response.data) {
        DATOS.fabricacion = response.data;
        console.log("Fabricacion recibida:", DATOS.fabricacion);
        if (window.__reloadKey) {
            const key = window.__reloadKey;
            window.__reloadKey = null;
            window.WINDOW_OPENERS?.[key]?.();
        }
    } else {
        alert("Error al recibir fabricacion: " + response.error);
    }
}

function asegurarFabricacionCargada(key) {
    if (DATOS.fabricacion && DATOS.fabricacion[key]) return true;
    window.__reloadKey = key;
    send("fabricacion", {});
    return false;
}
