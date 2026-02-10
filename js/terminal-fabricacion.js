function prepararEventosFabricacion() {
    document.querySelector("#vista_fabricacion table#tabla_ordenes_fabricacion tbody").addEventListener("click", function (event) {
        const fila = event.target.closest("tr");
        if (!fila) return;
        seleccionarFabricacion(fila);
    });

    document.querySelector("#vista_fabricacion table#tabla_contenido_orden_fabricacion").addEventListener("click", function (event) {
        const fila = event.target.closest("tr");
        if (!fila) return;
        seleccionarContenidoOrden(fila);
    });

    const btnAgregar = document.getElementById("fabricacion-agregar-trazabilidad");
    if (btnAgregar) {
        btnAgregar.addEventListener("click", () => {
            agregarTrazabilidadFabricacionDesdeUI();
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
            const operarioId = obtenerOperarioSeleccionado();
            if (!operarioId) {
                alert("Selecciona un operario.");
                return;
            }
            const modalEl = document.getElementById("modalOperarioFabricacion");
            const modal = modalEl ? bootstrap.Modal.getInstance(modalEl) : null;
            if (modal) modal.hide();
            await imprimirEtiquetaFabricacion(operarioId);
        });
    }

    const tablaTraz = document.querySelector("#tabla_trazabilidad_fabricacion tbody");
    if (tablaTraz) {
        tablaTraz.addEventListener("click", async (event) => {
            const btn = event.target.closest("[data-action='trazabilidad-estado']");
            if (!btn) return;
            const tr = btn.closest("tr");
            if (!tr) return;
            const id = Number(tr.dataset.trazabilidadId);
            const cantidad = Number(tr.dataset.cantidad || 0);
            const estado = Number(tr.dataset.estado || 0);

            if (!id) return;

            if (estado == 1) {
                if (cantidad >= LIMITE_REACTIVAR_ESTADO) {
                    alert(`No se puede reactivar si la cantidad es mayor o igual a ${LIMITE_REACTIVAR_ESTADO}.`);
                    return;
                }
                if (!confirm("¿Cambiar a estado 0 para volver a usar este palet?")) return;
                await wsRequest("actualizar_estado_trazabilidad_fabricacion", { id, estado: 0 });
                cargarTrazabilidadFabricacion(lineaFabricacionActualId);
                return;
            }

            if (cantidad == 0) {
                if (!confirm("¿Eliminar esta linea de trazabilidad?")) return;
                await wsRequest("eliminar_trazabilidad_fabricacion", { id });
                cargarTrazabilidadFabricacion(lineaFabricacionActualId);
                return;
            }

            if (!confirm("¿Cambiar a estado 1 para no usar este palet en nuevas trazabilidades?")) return;
            await wsRequest("actualizar_estado_trazabilidad_fabricacion", { id, estado: 1 });
            cargarTrazabilidadFabricacion(lineaFabricacionActualId);
        });
    }

}

let lineaFabricacionActualId = null;
let ordenFabricacionActualId = null;
const LIMITE_REACTIVAR_ESTADO = 14;

// Cache sencillo para datos que necesitamos mostrar
const terminalFabricacion = {
    clientes: null,
    estados: null,
    tipos_producto: null,
    usuarios: null,
};

async function asegurarDatosFabricacionTerminal() {
    if (terminalFabricacion.clientes && terminalFabricacion.estados && terminalFabricacion.tipos_producto && terminalFabricacion.usuarios) return;
    try {
        const maestros = await wsRequest("maestros", {});
        terminalFabricacion.clientes = maestros?.clientes || {};
        terminalFabricacion.estados = maestros?.estados || {};
        terminalFabricacion.usuarios = maestros?.usuarios || {};
        const fabricacion = await wsRequest("fabricacion", {});
        terminalFabricacion.tipos_producto = fabricacion?.tipos_producto || {};
    } catch (err) {
        console.error("No se pudieron cargar datos de fabricacion:", err);
        terminalFabricacion.clientes = terminalFabricacion.clientes || {};
        terminalFabricacion.estados = terminalFabricacion.estados || {};
        terminalFabricacion.tipos_producto = terminalFabricacion.tipos_producto || {};
        terminalFabricacion.usuarios = terminalFabricacion.usuarios || {};
    }
}

async function cargarOrdenesFabricacion() {
    const tbody = document.querySelector("#tabla_ordenes_fabricacion tbody");
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
            actualizarTablaLineasFabricacion([], null);
            return;
        }

        ordenes.forEach((o) => {
            const tr = document.createElement("tr");
            tr.dataset.ordenId = o.id;
            tr.dataset.numero = o.numero || o.id;
            tr.dataset.fecha = o.fecha;
            tr.dataset.clienteId = o.cliente_id;
            const cliente =
                terminalFabricacion.clientes?.[o.cliente_id]?.nombre ||
                (typeof o.cliente_id !== "undefined" ? String(o.cliente_id) : "");
            tr.dataset.clienteNombre = cliente;
            tr.innerHTML = `
        <td>${o.numero || o.id}</td>
        <td>${formatearFechaEuropea(o.fecha)}</td>
        <td>${cliente}</td>
      `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error(err);
        tbody.innerHTML = `<tr><td colspan="3">Error al cargar ordenes</td></tr>`;
    }
}

function seleccionarFabricacion(fila) {
    vista_fabricacion = document.getElementById("vista_fabricacion");
    vista_fabricacion.setAttribute("modo", "contenido_orden");

    const ordenId = Number(fila.dataset.ordenId);
    const numero = fila.dataset.numero || ordenId;
    const fecha = formatearFechaEuropea(fila.dataset.fecha);
    const clienteNombre = fila.dataset.clienteNombre || fila.children?.[2]?.textContent || "";
    const titulo = `Orden ${numero}, ${fecha}${clienteNombre ? ", " + clienteNombre : ""}`;
    document.querySelector(".orden_fabricacion_seleccionada").textContent = titulo;

    ordenFabricacionActualId = ordenId;
    if (typeof setPantalla === "function") {
        setPantalla("vista_fabricacion", { orden_id: ordenId });
    }
    cargarLineasFabricacion(ordenId);
}

function seleccionarContenidoOrden(fila) {
    if (fila.closest("tfoot")) {
        vista_fabricacion = document.getElementById("vista_fabricacion");
        vista_fabricacion.setAttribute("modo", "listado_ordenes");
    } else {
        mostrarLotesMateriales(fila);
    }
}

function mostrarLotesMateriales(fila) {
    lineaFabricacionActualId = Number(fila.dataset.lineaId || 0) || null;
    const tipoId = Number(fila.dataset.tipoProductoId || 0) || null;
    const descripcion =
        (tipoId && terminalFabricacion.tipos_producto?.[tipoId]?.descripcion) ||
        fila.children?.[0]?.textContent ||
        "Producto";
    const titulo = document.getElementById("productoOrden");
    if (titulo) titulo.textContent = descripcion;
    const modal = new bootstrap.Modal(document.getElementById('miModal2'));
    modal.show();
    if (typeof setPantalla === "function") {
        setPantalla("vista_fabricacion", { orden_id: ordenFabricacionActualId, linea_fabricacion_id: lineaFabricacionActualId });
    }
    if (lineaFabricacionActualId) {
        cargarTrazabilidadFabricacion(lineaFabricacionActualId);
    }
}

async function cargarLineasFabricacion(ordenId) {
    const tbody = document.querySelector("#tabla_contenido_orden_fabricacion tbody");
    try {
        const lineas = (await wsRequest("listar_lineas_fabricacion", { orden_id: ordenId })) || [];
        actualizarTablaLineasFabricacion(lineas);
    } catch (err) {
        console.error(err);
        tbody.innerHTML = `<tr><td colspan="4">Error al cargar lineas</td></tr>`;
    }
}

function actualizarTablaLineasFabricacion(lineas) {
    const tbody = document.querySelector("#tabla_contenido_orden_fabricacion tbody");
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

async function cargarTrazabilidadFabricacion(lineaId) {
    const tbody = document.querySelector("#tabla_trazabilidad_fabricacion tbody");
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
            const estado = terminalFabricacion.estados?.[t.estado]?.descripcion || (t.estado ?? "");
            tr.dataset.trazabilidadId = t.id ?? "";
            tr.dataset.estado = t.estado ?? 0;
            tr.dataset.cantidad = t.cantidad_fabricada ?? 0;
            if (Number(t.estado) === 1) tr.classList.add("trazabilidad-inactiva");
            const esInactiva = Number(t.estado) === 1;
            const icono = esInactiva ? "bi-arrow-counterclockwise" : "bi-trash";
            const titulo = esInactiva ? "Reactivar" : "Eliminar";
            tr.innerHTML = `
        <td>${t.palet_codigo || t.palet_id || ""}</td>
        <td>${t.cantidad_fabricada ?? ""}</td>
        <td class="text-center">
          <button type="button" class="btn btn-sm btn-outline-danger" data-action="trazabilidad-estado" title="${titulo}">
            <i class="bi ${icono}"></i>
          </button>
        </td>
      `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error(err);
        tbody.innerHTML = `<tr><td colspan="3">Error al cargar trazabilidad</td></tr>`;
    }
}

async function agregarTrazabilidadFabricacionDesdeUI() {
    const codigoInput = document.getElementById("fabricacion-palet-codigo");
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
        cargarTrazabilidadFabricacion(lineaFabricacionActualId);
    } catch (err) {
        console.error(err);
        alert("Error al agregar trazabilidad.");
    }
}

async function abrirModalOperarioFabricacion() {
    const modalEl = document.getElementById("modalOperarioFabricacion");
    if (!modalEl) return;
    await asegurarDatosFabricacionTerminal();
    cargarOperariosEnModal();
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

function cargarOperariosEnModal() {
    const tbody = document.querySelector("#tabla_operarios_fabricacion tbody");
    const btnConfirmar = document.getElementById("fabricacion-confirmar-impresion");
    if (!tbody) return;
    const empleados = Object.values(terminalFabricacion.usuarios || {}).filter((u) => u && u.empleado);
    tbody.innerHTML = "";
    if (!empleados.length) {
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
    empleados.forEach((u, idx) => {
        const tr = document.createElement("tr");
        const nombre = u.nombre || u.alias || `Empleado ${u.id}`;
        tr.innerHTML = `
      <td>${nombre}</td>
      <td class="text-center">
        <input type="radio" name="operario_fabricacion" value="${u.id}" ${idx === 0 ? "checked" : ""}>
      </td>
    `;
        tbody.appendChild(tr);
    });
}

function obtenerOperarioSeleccionado() {
    const seleccionado = document.querySelector("input[name='operario_fabricacion']:checked");
    if (!seleccionado) return null;
    const id = Number(seleccionado.value);
    return Number.isFinite(id) ? id : null;
}

async function imprimirEtiquetaFabricacion(operarioId = null) {
    const tbody = document.querySelector("#tabla_trazabilidad_fabricacion tbody");
    if (!tbody) return;
    const filas = Array.from(tbody.querySelectorAll("tr"));
    const activas = filas.filter((tr) => Number(tr.dataset.estado || 0) === 0);
    if (!activas.length) {
        alert("No hay palets activos para imprimir.");
        return;
    }
    const trazabilidadIds = activas
        .map((tr) => Number(tr.dataset.trazabilidadId))
        .filter((id) => !!id);
    const paletCodigos = activas.map((tr) => tr.children?.[0]?.textContent?.trim()).filter(Boolean);

    try {
        const resp = await wsRequest("imprimir_etiqueta_fabricacion", {
            trazabilidad_ids: trazabilidadIds,
            palet_codigos: paletCodigos,
            tipo: "BOTA",
            fabricado_por_id: operarioId,
        });
        console.log("Etiqueta creada:", resp);
        cargarTrazabilidadFabricacion(lineaFabricacionActualId);
        if (ordenFabricacionActualId) {
            cargarLineasFabricacion(ordenFabricacionActualId);
        }
    } catch (err) {
        console.error(err);
        alert("Error al imprimir etiqueta.");
    }
}


function refrescarFabricacionDesdeServidor(_data = {}) {
    cargarOrdenesFabricacion();
    if (ordenFabricacionActualId) {
        cargarLineasFabricacion(ordenFabricacionActualId);
    }
    if (lineaFabricacionActualId) {
        cargarTrazabilidadFabricacion(lineaFabricacionActualId);
    }
}
