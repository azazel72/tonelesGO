// ====== MODO "crear siempre nueva" (opcional) ======
// Si prefieres SIEMPRE nueva ventana fresca:
// - Pon REUSE_SINGLE = false
// - (Opcional) cambia el título con un contador/fecha para distinguir instancias

// ====== CONFIG ======
const BASE = "/tonelesgo/api/index.php";       // <-- ajusta la ruta real a tu index.php
const REUSE_SINGLE = true;                 // true = una ventana que se reusa
const CLOSE_PRESERVES_STATE = true;        // true = cerrar SOLO oculta (conserva datos)
// ====== REGISTRO DE VENTANAS ======
const windowsRegistry = new Map(); // key -> { wb, table }


// ====== CREAR VENTANA GENERICA ======
function crearVentana(configuracion, show=true) {
  // Reusar
  if (REUSE_SINGLE && windowsRegistry.has(configuracion.KEY)) {
    const { wb, tabla } = windowsRegistry.get(configuracion.KEY);
    wb.show();
    wb.focus();
    return wb;
  }
  
  // CREACION DE WINBOX
  const contenedor = crearElemento("div", { class: "contenedor-winbox" });
  const cabecera = crearElemento("div", { class: "p-2 border-bottom d-flex gap-2 align-items-center" });
  contenedor.appendChild(cabecera);
  //Controles de cabecera
  if (configuracion.winbox.tipo == "generico") {
    const botonReload = crearBotonesGenericos("u-reload");
    const botonAdd    = crearBotonesGenericos("u-add");
    const botonFilter = crearBotonesGenericos("u-filter");
    const botonEditar = crearBotonesGenericos("u-editar");
    const contenedorDerecha = crearBotonesGenericos("contenedor-botones-derecha");
    contenedorDerecha.appendChild(botonFilter);
    contenedorDerecha.appendChild(botonEditar);
    cabecera.appendChild(botonReload);
    cabecera.appendChild(botonAdd);
    cabecera.appendChild(contenedorDerecha);
  }

  // Ventana
  const wb = crearWinBox(contenedor, configuracion.winbox.options);
  if (show) {
    wb.show();
    wb.focus();
  }

  // Tabulator
  const tabla = crearTabla(configuracion.KEY, contenedor, configuracion.tabulator.options);

  windowsRegistry.set(configuracion.KEY, { wb, table: tabla });

  tabla.on("cellEdited", async (cell) => {
    const row = cell.getRow().getData();
    if (!row.id) return;
    activo = wb.body.querySelector("#u-editar")?.getAttribute("aria-pressed") === "true";
    console.log("activo", activo);
    if (!activo) return;
    const res = await fetch(`${BASE}?table=${configuracion.KEY}&id=${encodeURIComponent(row.id)}`, {
      method: "PUT",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(row),
    });
    if (!res.ok) { alert(await res.text()); tabla.replaceData(); return; }
    try { cell.getRow().update(await res.json()); } catch {}
  });

  cabecera.addEventListener("click", (e) => {
    eventoClickCabecera(e, tabla);
  });
  
  return wb;
}

const CeldaAcciones = {
  title:"Acciones", width:100, headerSort:false, hozAlign:"center",
  formatter: getFormatter,
  cellClick: getCellClick,
};

function getFormatter(cell) {
  const d = cell.getRow().getData();
  return d.id === undefined
    ? `<button class="btn btn-sm btn-outline-primary" data-action-row="crear"><i class="bi bi-plus-lg"></i></button>`
    : `<button class="btn btn-sm btn-outline-danger" data-action-row="borrar"><i class="bi bi-trash"></i></button>`;
}

async function getCellClick(e, cell) {
  console.log("click en acciones");
  const action = e.target.closest("button")?.getAttribute("data-action-row");
  const tabla = cell.getTable();
  const tablaBD = tabla.options.ajaxURL.match(/table=([^&]+)/)[1];
  if (action === "crear") {
    const row = cell.getRow();
    const data = row.getData();
    try {
      const res = await fetch(`${BASE}?table=${tablaBD}`, {
        method: "POST",
        credentials:"same-origin",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error(await res.text());
      const wrap = await res.json();
      const created = wrap.data ?? wrap;

      row.update(created);
      const newRow = await tabla.addRow(row.getData());
      row.delete();

      //await newRow.getElement().scrollIntoView({ behavior: "smooth", block: "center" });
      await newRow.scrollTo("center", true);

      tabla.alert("Registro creado con éxito");
      setTimeout(()=>tabla.clearAlert(), 1200);
    } catch (err) {
      tabla.alert("Error: " + err.message);
      setTimeout(()=>tabla.clearAlert(), 2000);
    }
  } else if (action === "borrar") {
    const id = cell.getRow().getData().id;
    if (!confirm(`¿Eliminar ID ${id}?`)) return;
    try {
      const res = await fetch(`${BASE}?table=${tablaBD}&id=${encodeURIComponent(id)}`, {
        method:"DELETE",
        credentials:"same-origin",
      });
      if (!res.ok) return alert(await res.text());
      cell.getRow().delete();
    } catch (err) {
      alert("Error: " + err.message);
      setTimeout(()=>tabla.clearAlert(), 2000);
    }
  }
}

async function eventoClickCabecera(e, tabla) {
  const btn = e.target.closest("button");
  if (!btn) return;
  e.preventDefault();
  btn.classList.add("disabled", "pe-none");
  setTimeout(() => btn.classList.remove("disabled", "pe-none"), 500);
  switch (btn.id) {
    case "u-reload":
      tabla.replaceData(tabla.datos);
      break;
    case "u-add":
      const rowComp = await tabla.addRow({}, true);
      tabla.getColumns().forEach(col => {
        if (col.getDefinition()?.editable !== undefined) {
            rowComp.getCell(col.getField())?.edit(true);
        }
      });
      break;
    case "u-filter":
      activo = btn.getAttribute("aria-pressed") === "true";
      tabla.getColumns().forEach(col => {
        if (col.getDefinition()?.filtrable) {
          if (activo) {
            col.updateDefinition({
              headerFilter: col.getDefinition()?.editor ?? "input",        // o "select" según columna or list
            });
          } else {
            col.setHeaderFilterValue("");
            col.updateDefinition({
              headerFilter: false,
            });
          }
        }
      });
      tabla.element.querySelector(".tabulator-header-filter input")?.focus();
      break;
    case "u-editar":
      activo = btn.getAttribute("aria-pressed") === "true";
      tabla.getColumns().forEach(col => {
        if (col.getDefinition()?.editable !== undefined) {
            col.updateDefinition({ editable: activo });
        }
      });
      break;
  }
}

// ====== WINBOX ======
function crearWinBox(contenido, opciones={}) {
  opciones.y = opciones.y ? (opciones.y + 56) : "center";

  const wb = new WinBox({
    title: "WinBox",
    root: document.getElementById("escritorio"),
    x: "center",
    y: "center",
    top: 56,
    right: 0,
    bottom: 40,
    left: 0,
    width: "800px",
    height: "520px",
    mount: contenido,
    onclose: () => {
      if (CLOSE_PRESERVES_STATE) { wb.hide(); return true; } // oculta, no destruye
      windowsRegistry.delete(KEY); // destruye: borra del registro
    },
    ...opciones,
  });

  return wb;
}

// ====== CREACION DE TABULATOR ======
function crearTabla(KEY, contenedor, configuracion) {
    const tablaHTML = crearElemento("div", { class: "contenedor-tabla" });
    contenedor.appendChild(tablaHTML);

    const tabla = new Tabulator(tablaHTML, {
    height: "100%",
    width: "100%",
    layout: "fitColumns",
    index: "id",
    persistenceID: `${KEY}-table`,
    persistence:{
      sort:true,
      columns:true,
    },
    placeholder: "Sin datos",
    ...configuracion,
  });

  return tabla;
}

// ====== BUSCADOR GLOBAL EJEMPLO ======
function crearBuscadorGlobal() {
  // buscador global
  //<input id="q" class="form-control form-control-sm" placeholder="Buscar...">
  const q = document.getElementById("q");
  const debounce = (fn, ms=200) => { let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a),ms); }; };

  q.addEventListener("input", debounce(() => {
    const term = q.value.trim().toLowerCase();
    if (!term) return tabla.clearFilter(true);     // limpia todo
    tabla.setFilter([
      { field:"username", type:"like", value:term },
      { field:"fullname", type:"like", value:term },
      { field:"email",    type:"like", value:term },
    ], "or");
  }, 200));
}

function crearBotonesGenericos(tipo) {
  switch(tipo) {
    case "u-reload":
      return crearElemento("button", {
        id: "u-reload",
        class: "btn btn-sm btn-outline-secondary",
        content: "Refrescar"
      });
    case "u-add":
      return crearElemento("button", {
        id: "u-add",
        class: "btn btn-sm btn-success",
        content: "Nuevo"
      });
    case "u-filter":
      return crearElemento("button", {
        id: "u-filter",
        class: "btn btn-sm btn-outline-secondary",
        content: "<i class=\"bi bi-funnel\"></i> Filtros",
        "data-bs-toggle": "button",
        "aria-pressed": "false",
        autocomplete: "off"
      });
    case "u-editar":
      return crearElemento("button", {
        id: "u-editar",
        class: "btn btn-sm btn-outline-info",
        content: "<i class=\"bi bi-lock\"></i><i class=\"bi bi-unlock\"></i> Editar",
        "data-bs-toggle": "button",
        "aria-pressed": "false",
        autocomplete: "off"
      });
    case "contenedor-botones-derecha":
      return crearElemento("div", {
        class: "ms-auto d-flex gap-2"
      });
    default:
      return null;
  }
}


/**
 * Crea un elemento HTML genérico de forma sencilla.
 * @param {string} tag - Tipo de elemento, ej: 'div', 'span', 'input'
 * @param {object} [opts] - Opcional: configuración del elemento
 * @param {string} [opts.id] - ID del elemento
 * @param {string|string[]} [opts.class] - Clase(s) CSS
 * @param {string|Node} [opts.content] - Texto o nodo hijo
 * @param {object} [opts.otros] - Cualquier otro atributo HTML (title, type, value, etc.)
 * @returns {HTMLElement} - El elemento creado
 */
function crearElemento(tag, opts = {}) {
  const el = document.createElement(tag);

  if (opts.id) el.id = opts.id;
  if (opts.class) {
    const clases = Array.isArray(opts.class) ? opts.class : opts.class.split(/\s+/);
    el.classList.add(...clases.filter(Boolean));
  }

  if (opts.content !== undefined && opts.content !== null) {
    if (opts.content instanceof Node) el.appendChild(opts.content);
    else el.innerHTML = opts.content;
  }

  // Aplica cualquier otro atributo genérico
  for (const [k, v] of Object.entries(opts)) {
    if (["id", "class", "content"].includes(k)) continue;
    if (v !== undefined && v !== null) el.setAttribute(k, v);
  }

  return el;
}
