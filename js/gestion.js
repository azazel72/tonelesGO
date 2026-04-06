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

        async "ver-estados-pedidos"() {
            await openEstadosPedidosWin();
        },
        async "ver-estados-fabricacion-semanal"() {
            await openEstadosFabricacionSemanalWin();
        },
        async "ver-estados-productos"() {
            await openEstadosProductosWin();
        },
        async "ver-estados-trazabilidad-fabricacion"() {
            await openEstadosTrazabilidadFabricacionWin();
        },
        async "ver-estados-palets"() {
            await openEstadosPaletsWin();
        },

        async "ver-puestos-trabajo"() {
            await openPuestosTrabajoWin();
        },

        async "ver-materiales"() {
            await openMaterialesWin();
        },

        async "ver-entradas"() {
            await openEntradasWin();
        },

        async "ver-lineas-entrada"() {
            await openLineasEntradaWin();
        },
        async "ver-entradas-flejes"() {
            await openEntradasFlejesWin();
        },

        async "ver-palets"() {
            await openPaletsWin();
        },
        async "ver-productos"() {
            await openProductosWin();
        },
        async "ver-cubicaje"() {
            if (!asegurarFabricacionCargada("tipos_producto")) return;
            await openCubicajeWin();
        },

        async "ver-archivos-subidos"() {
            await openArchivosSubidosWin();
        },
        async "ver-ambientes"() {
            await openAmbientesWin();
        },
        async "ver-pedidos"() {
            setPantalla?.("gestion_fabricacion", { vista: "pedidos" });
            await openPedidosWin();
        },
        async "ver-analiticas-vino"() {
            setPantalla?.("gestion_fabricacion", { vista: "analiticas" });
            await openAnaliticasWin();
        },
        async "ver-planificacion-pedidos"() {
            setPantalla?.("gestion_fabricacion", { vista: "planificacion_pedidos" });
            await openPlanificacionPedidosWin();
        },
        async "ver-tipos-producto"() {
            await openTiposProductoWin();
        },
        async "ver-fabricacion-semanal"() {
            setPantalla?.("gestion_fabricacion", { vista: "fabricacion_semanal" });
            await openFabricacionSemanalWin();
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
        async "ver-consumos"() {
            await openConsumosWin();
        },
        async "ver-documentos-botas-envinadas"() {
            await openDocumentosBotasEnvinadasWin();
        },

        async "ver-planificacion-entradas"() {
            await openPlanificacionEntradasWin();
        },
        async "ver-cuadrantes"() {
            await openCuadrantesWin();
        },
        async "ver-inventario-duelas"() {
            await openInventarioDuelasWin();
        },
        async "ver-inventario-flejes"() {
            await openInventarioFlejesWin();
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
        estados_pedidos: openEstadosPedidosWin,
        estados_fabricacion_semanal: openEstadosFabricacionSemanalWin,
        estados_productos: openEstadosProductosWin,
        estados_trazabilidad_fabricacion: openEstadosTrazabilidadFabricacionWin,
        estados_palets: openEstadosPaletsWin,
        puestos_trabajo: openPuestosTrabajoWin,
        materiales: openMaterialesWin,
        entradas: openEntradasWin,
        lineas_entrada: openLineasEntradaWin,
        entradas_flejes: openEntradasFlejesWin,
        palets: openPaletsWin,
        productos: openProductosWin,
        cubicaje: openCubicajeWin,
        archivos_subidos: openArchivosSubidosWin,
        ambientes: openAmbientesWin,
        pedidos: openPedidosWin,
        analiticas: openAnaliticasWin,
        planificacion_pedidos: openPlanificacionPedidosWin,
        tipos_producto: openTiposProductoWin,
        fabricacion_semanal: openFabricacionSemanalWin,
        trazabilidad_procesado: openTrazabilidadProcesadoWin,
        trazabilidad_fabricacion: openTrazabilidadFabricacionWin,
        trazabilidad_producto: openTrazabilidadProductoWin,
        consumos: openConsumosWin,
        planificacion_entradas: openPlanificacionEntradasWin,
        cuadrantes: openCuadrantesWin,
        inventario_duelas: openInventarioDuelasWin,
        inventario_flejes: openInventarioFlejesWin,
    };

    // Delegación de eventos (un solo listener para toda la página)
    document.addEventListener("click", async (ev) => {
        const el = ev.target.closest("[data-action]");
        if (!el) return;
        if (
            el.classList.contains("disabled") ||
            el.dataset.permisoBloqueado === "1" ||
            el.getAttribute("aria-disabled") === "true"
        ) {
            ev.preventDefault();
            ev.stopPropagation();
            return;
        }
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
        actualizarLineasFabricacionEditorMateriales?.();
        calcularPermisosUsuarioLogado();
        aplicarPermisosMenuGestion();
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
        actualizarLineasFabricacionEditorOrdenes?.();
        refrescarVentanasFabricacionGestion?.();
        if (window.__reloadKey) {
            const key = window.__reloadKey;
            window.__reloadKey = null;
            window.WINDOW_OPENERS?.[key]?.();
        }
    } else {
        alert("Error al recibir fabricacion: " + response.error);
    }
}

function refrescarVentanasFabricacionGestion() {
    const pedidos = windowsRegistry.get("pedidos")?.table;
    if (pedidos) {
        pedidos.replaceData(Object.values(DATOS.fabricacion.pedidos || {}));
    }

    const fabricacionSemanal = windowsRegistry.get("fabricacion_semanal")?.table;
    if (fabricacionSemanal) {
        fabricacionSemanal.replaceData(Object.values(DATOS.fabricacion.fabricacion_semanal || {}));
    }

    const analiticas = windowsRegistry.get("analiticas")?.table;
    if (analiticas) {
        analiticas.replaceData(Object.values(DATOS.fabricacion.analiticas || {}));
    }

    refrescarPlanificacionPedidosWin?.();
}

function asegurarFabricacionCargada(key, reloadKey = key) {
    if (DATOS.fabricacion && DATOS.fabricacion[key]) return true;
    window.__reloadKey = reloadKey;
    send("fabricacion", {});
    return false;
}

function setPantalla(pantalla, contexto = {}) {
    const ws = conn && conn.socket;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ action: "set_pantalla", data: { pantalla, contexto } }));
}

