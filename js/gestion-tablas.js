// ====== MODO "crear siempre nueva" (opcional) ======
// Si prefieres SIEMPRE nueva ventana fresca:
// - Pon REUSE_SINGLE = false
// - (Opcional) cambia el título con un contador/fecha para distinguir instancias

// ====== CONFIG ======
const BASE = "/paezlobato/api/index.php";       // <-- ajusta la ruta real a tu index.php
const REUSE_SINGLE = true;                 // true = una ventana que se reusa
const CLOSE_PRESERVES_STATE = true;        // true = cerrar SOLO oculta (conserva datos)
// ====== REGISTRO DE VENTANAS ======
const windowsRegistry = new Map(); // key -> { wb, table }


// ====== CREAR VENTANA GENERICA ======
function crearVentana(configuracion, show=true) {
 
  // CREACION DE WINBOX
  const contenedor = crearElemento("div", { class: "contenedor-winbox" });
  const cabecera = crearCabeceraVentana(configuracion);
  contenedor.appendChild(cabecera);

  // Ventana
  const wb = crearWinBox(configuracion.KEY, contenedor, configuracion.winbox.options);
  if (show) {
    wb.show();
    wb.focus();
  }

  // Tabulator
  const tabla = crearTabla(configuracion.KEY, contenedor, configuracion.tabulator.options);

  windowsRegistry.set(configuracion.KEY, { wb, table: tabla });

  agregarEventosWinBox(wb, tabla, cabecera, configuracion);
  agregarEventosTabla(wb, tabla, cabecera, configuracion);

  return wb;
}

let CeldaAcciones;

window.addEventListener("load", () => {
  CeldaAcciones = {
    title:"Acciones", width:100, headerSort:false, hozAlign:"center",
    formatter: getFormatter,
    cellClick: getCellClick,
  };
});

function getFormatter(cell) {
  const d = cell.getRow().getData();
  return d.id === undefined
    ? `<button class="btn btn-sm btn-outline-primary" data-action-row="crear"><i class="bi bi-plus-lg"></i></button>`
    : `<button class="btn btn-sm btn-outline-danger" data-action-row="borrar"><i class="bi bi-trash"></i></button>`;
}



// ====== WINBOX ======
function crearWinBox(KEY, contenido, opciones={}) {
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
    /*
    persistenceID: `${KEY}-table`,
    persistence:{
      sort:true,
      columns:true,
    },
    */
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
    case "u-cargar-entradas":
      return crearElemento("button", {
        id: "u-cargar-entradas",
        class: "btn btn-sm btn-outline-secondary",
        content: "Consultar"
      });
    case "u-add-providers":
      return crearElemento("button", {
        id: "u-add-providers",
        class: "btn btn-sm btn-outline-success",
        content: "Actualizar proveedores"
      });
    case "u-cargar-entradas-input":
      return crearElemento("input", {
        id: "u-cargar-entradas-input",
        class: "form-control-sm",
        type: "number",
        min: 1970,
        max: 2199,
        placeholder: "Año"
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

function cerrarVentanasMaestros() {
  const clavesMaestros = [
    "usuarios",
    "proveedores",
    "clientes",
    "instalaciones",
    "ubicaciones",
    "estados",
    "materiales",
    "entradas",
    "salidas",
  ];
  for (const clave of clavesMaestros) {
    const par = windowsRegistry.get(clave);
    par?.wb?.hide();
  }
}

function crearCabeceraVentana(configuracion) {
  const cabecera = crearElemento("div", { class: "cabecera p-2 border-bottom d-flex gap-2 align-items-center" });

  switch(configuracion.winbox.tipo) {
    case "generico":
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
      break;
    case "entradas":
      const botonCargar = crearBotonesGenericos("u-cargar-entradas");
      const inputAño    = crearBotonesGenericos("u-cargar-entradas-input");
      const botonAgregarProveedores = crearBotonesGenericos("u-add-providers");
      const contenedorDerecha2 = crearBotonesGenericos("contenedor-botones-derecha");
      contenedorDerecha2.appendChild(botonAgregarProveedores);
      cabecera.appendChild(botonCargar);
      cabecera.appendChild(inputAño);
      cabecera.appendChild(contenedorDerecha2);
      break;
  }

  return cabecera;
}

function agregarEventosWinBox(wb, tabla, cabecera, configuracion) {
  cabecera.addEventListener("click", (e) => {
    eventoClickCabecera(e, tabla, cabecera);
  });
}

function agregarEventosTabla(wb, tabla, cabecera, configuracion) {
  tabla.on("cellEdited", async (cell) => {
    const row = cell.getRow().getData();
    if (!row.id) return;
    activo = wb.body.querySelector("#u-editar")?.getAttribute("aria-pressed") === "true";
    console.log("activo", activo);
    if (!activo) return;

    // comunicar cambios al backend
    const d = cell.getRow().getData();
    const f = cell.getField();
    const t = configuracion.KEY;
    send("modificar_celda", { tabla: t, id: d.id, campo: f, valor: d[f] });
    //try { cell.getRow().update(await res.json()); } catch {}
  });
}

function comprobarVentanaAbierta(clave) {
  if (REUSE_SINGLE && windowsRegistry.has(clave)) {
    const par = windowsRegistry.get(clave);
    par.wb.show();
    par.wb.focus();
    return par.wb;
  } else {
    return null;
  }
}