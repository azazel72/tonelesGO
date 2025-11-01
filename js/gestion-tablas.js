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
function crearWinBox(KEY, title, tablaBD, columns, options={}) {
  // Reusar
  if (REUSE_SINGLE && windowsRegistry.has(KEY)) {
    const { wb } = windowsRegistry.get(KEY);
    wb.show();
    wb.focus();
    return wb;
  }

  if (!options.winbox?.x) options.winbox.x = "center";
  options.winbox.y = options.winbox?.y ? (options.winbox.y + 56) : "center";
  if (!options.winbox.width) options.winbox.width = "800px";
  if (!options.winbox.height) options.winbox.height = "520px";



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
    <div class="ms-auto d-flex gap-2">
    <button id="u-filter" class="btn btn-sm btn-outline-secondary" 
            data-bs-toggle="button" aria-pressed="false" autocomplete="off">
      <i class="bi bi-funnel"></i> Filtros
    </button>
    <button id="u-editar" class="btn btn-sm btn-outline-info"
            data-bs-toggle="button" aria-pressed="false" autocomplete="off">
      <i class="bi bi-lock"></i><i class="bi bi-unlock"></i> Editar
    </button>
    </div>
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
    root: document.getElementById("escritorio"),
    top: 56,
    right: 0,
    bottom: 40,
    left: 0,
    ...options.winbox,
    mount: mount,
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
    paginationSize: 5,                      // por defecto
    paginationDataSent: {                    // cómo manda Tabulator los params
      page: "page",
      size: "per_page",
    },
    paginationDataReceived: {                // cómo interpreta la respuesta
      last_page: "meta.total_pages",         // ruta al total de páginas
      data: "data",                          // ruta al array de datos (Tabulator usará data de ajaxResponse, ok)
    },
  */
    persistenceID: `${KEY}-table`,
    persistence:{
      sort:true,
      filter:true,
      columns:true,
    },
    persistenceID:"examplePerststance",
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
    const row = cell.getRow().getData();
    if (!row.id) return;
    activo = wb.body.querySelector("#u-editar")?.getAttribute("aria-pressed") === "true";
    console.log("activo", activo);
    if (!activo) return;
    const res = await fetch(`${BASE}?table=${tablaBD}&id=${encodeURIComponent(row.id)}`, {
      method: "PUT",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(row),
    });
    if (!res.ok) { alert(await res.text()); tabla.replaceData(); return; }
    try { cell.getRow().update(await res.json()); } catch {}
  });

  // Botones cabecera
  header.querySelector("#u-reload").addEventListener("click", () => tabla.replaceData());
  header.querySelector("#u-add").addEventListener("click", async () => {
    const rowComp = await tabla.addRow({}, true);
    tabla.getColumns().forEach(col => {
      if (col.getDefinition()?.editable !== undefined) {
          rowComp.getCell(col.getField())?.edit(true);
      }
    });
  });
  //activacion de filtros
  header.querySelector("#u-filter").addEventListener("click", async (e) => {
    activo = e.target.closest("#u-filter").getAttribute("aria-pressed") === "true";
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
  });
  //activar modo edicion
  header.querySelector("#u-editar").addEventListener("click", (e) => {
    activo = e.target.closest("#u-editar").getAttribute("aria-pressed") === "true";
    tabla.getColumns().forEach(col => {
      if (col.getDefinition()?.editable !== undefined) {
          col.updateDefinition({ editable: activo });
      }
    });
  });
  // Guarda en registro (para reusar)
  windowsRegistry.set(KEY, { wb, table: tabla });
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
