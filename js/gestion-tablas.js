function crearTablaVacia() {
  const tabla = new Tabulator("#tabla", {
      height: "400px",
      layout: "fitColumns",
      placeholder: "Sin datos",
      data: [],                           // 👈 vacío
      columns: [
      ],
  });
}

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
function crearWinBox(KEY, title, tablaBD, columns) {
  // Reusar
  if (REUSE_SINGLE && windowsRegistry.has(KEY)) {
    const { wb } = windowsRegistry.get(KEY);
    wb.show();
    wb.focus();
    return wb;
  }

  // Contenedor del contenido
  const mount = document.createElement("div");
  mount.style.height = "100%";
  mount.style.display = "flex";
  mount.style.flexDirection = "column";

  // Cabecera simple
  const header = document.createElement("div");
  header.className = "p-2 border-bottom d-flex gap-2 align-items-center";
  header.innerHTML = `
    <button id="u-reload" class="btn btn-sm btn-outline-secondary">Refrescar</button>
    <button id="u-add" class="btn btn-sm btn-success">Nuevo</button>
  `;
  mount.appendChild(header);

  // Zona tabla
  const tableEl = document.createElement("div");
  tableEl.style.flex = "1 1 auto";
  tableEl.style.minHeight = "0";
  mount.appendChild(tableEl);

  // Ventana
  const wb = new WinBox({
    title: title,
    root: document.getElementById("content"),
    top: 56,
    right: 0,
    bottom: 40,
    left: 0,
    width: "800px",
    height: "520px",
    x: "center",
    y: "center",
    mount,
    onclose: () => {
      if (CLOSE_PRESERVES_STATE) { wb.hide(); return true; } // oculta, no destruye
      windowsRegistry.delete(KEY); // destruye: borra del registro
    },
  });

  // Tabulator
  const tabla = new Tabulator(tableEl, {
    height: "100%",
    layout: "fitColumns",
    index: "id",
    ajaxURL: `${BASE}?table=${tablaBD}&all=1`,
    ajaxConfig: "GET",
    ajaxConfigFetch: { credentials: "same-origin" },
    ajaxResponse: function(url, params, response) {
      this.metaInfo = response.meta;
      return response.data;
    },
    /*
      pagination: "remote",
  paginationSize: 25,                      // por defecto
  paginationDataSent: {                    // cómo manda Tabulator los params
    page: "page",
    size: "per_page",
  },
  paginationDataReceived: {                // cómo interpreta la respuesta
    last_page: "meta.total_pages",         // ruta al total de páginas
    data: "data",                          // ruta al array de datos (Tabulator usará data de ajaxResponse, ok)
  },
  */
    placeholder: "Sin datos",
    columns: columns,
  });

  // Guardar al editar
  /*
  tabla.on("cellEdited", async (cell) => {
    const row = cell.getRow().getData();
    const res = await fetch(`${BASE}?table=${tablaBD}&id=${encodeURIComponent(row.id)}`, {
      method: "PUT",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(row),
    });
    if (!res.ok) { alert(await res.text()); tabl.replaceData(); return; }
    try { cell.getRow().update(await res.json()); } catch {}
  });
  */

  tabla.on("cellEdited", async (cell) => {
    console.log(cell);
    const row = cell.getRow().getData();
    const res = await fetch(`${BASE}?table=${tablaBD}&id=${encodeURIComponent(row.id)}`, {
      method: "PUT",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(row),
    });
    if (!res.ok) { alert(await res.text()); tabl.replaceData(); return; }
    try { cell.getRow().update(await res.json()); } catch {}
  });


  // Botones cabecera
  header.querySelector("#u-reload").addEventListener("click", () => tabla.replaceData());
  header.querySelector("#u-add").addEventListener("click", async () => {
    tabla.addRow({ username:"", fullname:"", email:"" }, true);
  });

  // Guarda en registro (para reusar)
  windowsRegistry.set(KEY, { wb, table: tabla });
  return wb;
}

