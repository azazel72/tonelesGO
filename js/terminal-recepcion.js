function prepararEventosRecepcion() {
  document
    .querySelector("#vista_recepcion table#tabla_entradas_recepcion tbody")
    .addEventListener("click", function (event) {
      const fila = event.target.closest("tr");
      if (!fila) return;
      seleccionarRecepcion(fila);
    });

  document
    .querySelector("#vista_recepcion table#tabla_contenido_entrada_recepcion")
    .addEventListener("click", function (event) {
      const fila = event.target.closest("tr");
      if (!fila) return;
      seleccionarContenidoEntrada(fila);
    });
}

// Cache sencillo para maestros que necesitamos mostrar (proveedores, duelas/materiales)
const terminalMaestros = {
  proveedores: null,
  duelas: null,
};

async function asegurarMaestrosTerminal() {
  // Si ya los tenemos, no hacemos nada
  if (terminalMaestros.proveedores && terminalMaestros.duelas) return;
  try {
    const resp = await wsRequest("maestros", {});
    if (resp && resp.proveedores) terminalMaestros.proveedores = resp.proveedores;
    if (resp && resp.duelas) terminalMaestros.duelas = resp.duelas;
    if (!terminalMaestros.proveedores) terminalMaestros.proveedores = {};
    if (!terminalMaestros.duelas) terminalMaestros.duelas = {};
  } catch (err) {
    console.error("No se pudieron cargar maestros para terminal:", err);
    // Fallback vacío para no romper el pintado
    terminalMaestros.proveedores = terminalMaestros.proveedores || {};
    terminalMaestros.duelas = terminalMaestros.duelas || {};
  }
}

async function cargarEntradasRecepcion() {
  const tbody = document.querySelector("#tabla_entradas_recepcion tbody");
  try {
    await asegurarMaestrosTerminal();
    const añoActual = new Date().getFullYear();
    const entradas =
      (await wsRequest("listar_entradas_planificacion", { "año": añoActual, proveedor_id: null })) || [];
    const pendientes = entradas
      .filter((e) => !e.entregado && !e.anulado)
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

    tbody.innerHTML = "";
    if (!pendientes.length) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 3;
      td.textContent = "No hay entradas pendientes";
      tr.appendChild(td);
      tbody.appendChild(tr);
      actualizarTablaLineas([], null);
      return;
    }

    pendientes.forEach((e) => {
      const tr = document.createElement("tr");
      tr.dataset.entradaId = e.id;
      tr.dataset.numero = e.numero || e.id;
      tr.dataset.fecha = e.fecha;
      tr.dataset.proveedorId = e.proveedor_id;
      const prov =
        terminalMaestros.proveedores?.[e.proveedor_id]?.nombre ||
        (typeof e.proveedor_id !== "undefined" ? String(e.proveedor_id) : "");
      tr.dataset.proveedorNombre = prov;
      tr.innerHTML = `
        <td>${e.numero || e.id}</td>
        <td>${formatearFechaEuropea(e.fecha)}</td>
        <td>${prov}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error(err);
    tbody.innerHTML = `<tr><td colspan="3">Error al cargar entradas</td></tr>`;
  }
}

function seleccionarRecepcion(fila) {
  const vista_recepcion = document.getElementById("vista_recepcion");
  vista_recepcion.setAttribute("modo", "contenido_entrada");

  const entradaId = Number(fila.dataset.entradaId);
  const numero = fila.dataset.numero || entradaId;
  const fecha = formatearFechaEuropea(fila.dataset.fecha);
  const proveedorNombre = fila.dataset.proveedorNombre || fila.children?.[2]?.textContent || "";
  const titulo = `Entrada ${numero}, ${fecha}${proveedorNombre ? ", " + proveedorNombre : ""}`;
  document.querySelector(".entrada_recepcion_seleccionado").textContent = titulo;

  cargarLineasRecepcion(entradaId);
}

function seleccionarContenidoEntrada(fila) {
  if (fila.closest("tfoot")) {
    const vista_recepcion = document.getElementById("vista_recepcion");
    vista_recepcion.setAttribute("modo", "listado_entradas");
  } else {
    imprimirEtiquetaEntradaRecepcion(fila);
  }
}

function imprimirEtiquetaEntradaRecepcion(fila) {
  const modal = new bootstrap.Modal(document.getElementById("miModal"));
  modal.show();
}

async function cargarLineasRecepcion(entradaId) {
  const tbody = document.querySelector("#tabla_contenido_entrada_recepcion tbody");
  try {
    const lineas = (await wsRequest("listar_lineas_entrada", { entrada_id: entradaId })) || [];
    actualizarTablaLineas(lineas);
  } catch (err) {
    console.error(err);
    tbody.innerHTML = `<tr><td colspan="4">Error al cargar lineas</td></tr>`;
  }
}

function actualizarTablaLineas(lineas) {
  const tbody = document.querySelector("#tabla_contenido_entrada_recepcion tbody");
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
    tr.dataset.duelaId = l.duela_id ?? "";
    const duela =
      terminalMaestros.duelas?.[l.duela_id]?.descripcion ||
      (typeof l.duela_id !== "undefined" ? String(l.duela_id) : "");
    tr.innerHTML = `
      <td>${duela}</td>
      <td>${l.kilos ?? ""}</td>
      <td>${l.bultos ?? ""}</td>
      <td><i class="bi bi-printer"></i></td>
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

function modificar(id, cambio) {
  const el = document.getElementById(id);
  let valor = parseInt(el.textContent);
  valor = Math.max(1, valor + cambio); // evita números negativos o cero
  el.textContent = valor;
}
