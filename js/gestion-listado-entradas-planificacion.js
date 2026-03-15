// ====== LISTADO ENTRADAS DESDE PLANIFICACION ======
function openListadoEntradasPlanificacionWin(contexto = {}) {
  if (!asegurarFabricacionCargada("tipos_producto", "listado_entradas_planificacion")) return null;
  const wb = comprobarVentanaAbierta("listado_entradas_planificacion");
  if (wb) {
    if (contexto.forceReload) {
      const par = windowsRegistry.get("listado_entradas_planificacion");
      par?.wb?.hide();
      windowsRegistry.delete("listado_entradas_planificacion");
    } else {
      return wb;
    }
  }

  const proveedores = DATOS.maestros?.proveedores || {};
  const proveedorInicial = contexto.proveedor_id ?? "";
  const añoInicial = contexto.año ?? new Date().getFullYear();

  const contenedor = crearElemento("div", { class: "contenedor-winbox listado-entradas-planificacion" });

  const layout = crearElemento("div", { class: "listado-entradas-planificacion-body" });
  const left = crearElemento("div", { class: "listado-entradas-planificacion-col" });
  const right = crearElemento("div", { class: "listado-entradas-planificacion-col" });
  layout.appendChild(left);
  layout.appendChild(right);
  contenedor.appendChild(layout);

  const leftHeader = crearElemento("div", { class: "listado-entradas-planificacion-header" });

  const botonConsultar = crearElemento("button", {
    id: "u-cargar-entradas-planificacion",
    class: "btn btn-sm btn-outline-secondary",
    content: "Consultar"
  });
  const inputAnno = crearElemento("input", {
    id: "u-cargar-entradas-planificacion-anno",
    class: "form-control-sm",
    type: "number",
    min: 1970,
    max: 2199,
  });
  inputAnno.value = añoInicial;

  const selectProveedor = crearElemento("select", {
    id: "u-cargar-entradas-planificacion-proveedor",
    class: "form-select form-select-sm",
  });
  const opcionTodos = crearElemento("option", { value: "", content: "Todos los proveedores" });
  selectProveedor.appendChild(opcionTodos);
  Object.values(proveedores).forEach((prov) => {
    const opt = crearElemento("option", { value: prov.id, content: prov.nombre });
    if (String(prov.id) === String(proveedorInicial)) {
      opt.selected = true;
    }
    selectProveedor.appendChild(opt);
  });

  leftHeader.appendChild(botonConsultar);
  leftHeader.appendChild(inputAnno);
  leftHeader.appendChild(selectProveedor);
  left.appendChild(leftHeader);

  const botonNuevaEntrada = crearElemento("button", {
    class: "btn btn-sm btn-outline-success",
    content: "<i class=\"bi bi-plus-lg me-1\"></i> Nueva entrada"
  });
  const botonFiltroEntradas = crearElemento("button", {
    class: "btn btn-sm btn-outline-secondary",
    content: "<i class=\"bi bi-funnel\"></i> Filtros",
    "data-bs-toggle": "button",
    "aria-pressed": "false",
  });
  const botonEditarEntradas = crearElemento("button", {
    class: "btn btn-sm btn-outline-info",
    content: "<i class=\"bi bi-lock\"></i><i class=\"bi bi-unlock\"></i> Editar",
    "data-bs-toggle": "button",
    "aria-pressed": "false",
  });
  leftHeader.appendChild(botonNuevaEntrada);
  leftHeader.appendChild(botonFiltroEntradas);
  leftHeader.appendChild(botonEditarEntradas);

  const archivosHeader = crearElemento("div", { class: "listado-entradas-planificacion-header listado-entradas-planificacion-header-right" });
  const selectArchivos = crearElemento("select", {
    id: "u-archivos-planificacion-selector",
    class: "form-select form-select-sm",
  });
  selectArchivos.appendChild(crearElemento("option", { value: "", content: "Seleccione una entrada" }));
  const botonSubir = crearElemento("button", {
    class: "btn btn-sm btn-outline-primary",
    content: "<i class=\"bi bi-cloud-arrow-up me-1\"></i> Subir documento"
  });
  const botonVer = crearElemento("button", {
    class: "btn btn-sm btn-outline-secondary",
    content: "<i class=\"bi bi-file-earmark-pdf me-1\"></i> Ver"
  });
  const botonEliminarArchivo = crearElemento("button", {
    class: "btn btn-sm btn-outline-danger",
    content: "<i class=\"bi bi-trash me-1\"></i> Eliminar"
  });
  archivosHeader.appendChild(selectArchivos);
  archivosHeader.appendChild(botonSubir);
  archivosHeader.appendChild(botonVer);
  archivosHeader.appendChild(botonEliminarArchivo);
  right.appendChild(archivosHeader);

  const archivosSelectRow = crearElemento("div", { class: "listado-entradas-planificacion-select-row" });
  archivosSelectRow.appendChild(selectArchivos);
  right.appendChild(archivosSelectRow);

  const lineasHeader = crearElemento("div", { class: "listado-entradas-planificacion-header listado-entradas-planificacion-header-right" });
  const botonNuevaLinea = crearElemento("button", {
    class: "btn btn-sm btn-outline-success",
    content: "<i class=\"bi bi-plus-lg me-1\"></i> Nueva linea"
  });
  const botonFiltroLineas = crearElemento("button", {
    class: "btn btn-sm btn-outline-secondary",
    content: "<i class=\"bi bi-funnel\"></i> Filtros",
    "data-bs-toggle": "button",
    "aria-pressed": "false",
  });
  const botonEditarLineas = crearElemento("button", {
    class: "btn btn-sm btn-outline-info",
    content: "<i class=\"bi bi-lock\"></i><i class=\"bi bi-unlock\"></i> Editar",
    "data-bs-toggle": "button",
    "aria-pressed": "false",
  });
  lineasHeader.appendChild(botonNuevaLinea);
  lineasHeader.appendChild(botonFiltroLineas);
  lineasHeader.appendChild(botonEditarLineas);
  right.appendChild(lineasHeader);

  const leftTable = crearElemento("div", { class: "listado-entradas-planificacion-table" });
  const rightTable = crearElemento("div", { class: "listado-entradas-planificacion-table" });
  left.appendChild(leftTable);
  right.appendChild(rightTable);

  const win = crearWinBox("listado_entradas_planificacion", contenedor, {
    title: "Listado de entradas",
    width: "100%",
    height: "100%",
    x: 0,
    y: 56,
    class: ["modern", "no-full"],
  });
  win.show();
  win.focus();
  win.maximize();

  let lineasBloqueadas = false;
  let entradaSeleccionada = null;

  const proveedoresValores = Object.values(proveedores).reduce((acc, prov) => {
    acc[prov.id] = prov.nombre;
    return acc;
  }, {});

  const tiposProductoValores = Object.values(DATOS?.fabricacion?.tipos_producto ?? {})
    .filter((tipo) => String(tipo?.tipo || "").toUpperCase() === "DUELA")
    .reduce((acc, tipo) => {
    acc[tipo.id] = tipo.descripcion || tipo.codigo || String(tipo.id);
    return acc;
  }, {});

  const materialesValores = Object.values(DATOS?.maestros?.materiales ?? {}).reduce((acc, material) => {
    acc[material.id] = material.descripcion;
    return acc;
  }, {});

  function esVerdadero(valor) {
    return valor === true || valor === 1 || valor === "1";
  }

  function esCheckEditable(cell) {
    const def = cell.getColumn().getDefinition();
    const tablaEditableActual = Boolean(cell.getTable()?.options?.editable);
    if (typeof def.editable === "function") {
      return Boolean(def.editable(cell));
    }
    if (def.editable !== undefined) {
      return Boolean(def.editable);
    }
    return tablaEditableActual;
  }

  function toggleCheckCell(cell) {
    if (!esCheckEditable(cell)) return;
    const nuevo = esVerdadero(cell.getValue()) ? 0 : 1;
    cell.setValue(nuevo);
  }

  const parametrosCheck = {
    hozAlign: "center",
    formatter: "tickCross",
    esCheck: true,
    editor: false,
    cellClick: (e, cell) => {
      e.preventDefault();
      toggleCheckCell(cell);
    },
  };

  const tablaEntradas = new Tabulator(leftTable, {
    height: "100%",
    layout: "fitColumns",
    selectable: 1,
    index: "id",
    editable: false,
    columns: [
      { title: "ID", field: "id", width: 70, hozAlign: "right", cssClass: "filtrable" },
      { title: "Numero", field: "numero", width: 130, editor: "input", editable: tablaEditable, cssClass: "filtrable" },
      {
        title: "Fecha",
        field: "fecha",
        width: 120,
        editor: "input",
        editable: tablaEditable,
        cssClass: "filtrable",
        formatter: (cell) => {
          const v = cell.getValue();
          if (!v) return "";
          // Muestra en formato DD-MM-YYYY, manteniendo entrada base YYYY-MM-DD para el editor
          const d = new Date(v);
          if (Number.isNaN(d.getTime())) return v;
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, "0");
          const dd = String(d.getDate()).padStart(2, "0");
          return `${dd}-${mm}-${yyyy}`;
        },
        editorParams: { elementAttributes: { type: "date" } },
      },
      {
        title: "Proveedor",
        field: "proveedor_id",
        editor: "list",
        editable: tablaEditable,
        editorParams: {
          values: proveedoresValores,
          clearable: false,
        },
        cssClass: "filtrable",
        formatter: (cell) => {
          const id = cell.getValue();
          if (id === null || id === undefined || id === "") return "";
          const prov = proveedores[id];
          return prov?.nombre ?? "";
        },
      },
      { title: "Entregado", field: "entregado", width: 110, editable: tablaEditable, cssClass: "filtrable", ...parametrosCheck },
      { title: "Anulado", field: "anulado", width: 90, editable: tablaEditable, cssClass: "filtrable", ...parametrosCheck },
      CeldaAcciones,
    ],
    placeholder: "Sin datos",
  });
  tablaEntradas.KEY = "entradas";

  const CeldaAccionesLineas = {
    title: "Acciones",
    width: 100,
    headerSort: false,
    hozAlign: "center",
    formatter: getFormatter,
    cellClick: (e, cell) => {
      if (lineasBloqueadas) {
        e.preventDefault();
        alert("Las lineas estan bloqueadas para entradas entregadas o anuladas.");
        return;
      }
      getCellClick(e, cell);
    },
  };

  const tablaLineas = new Tabulator(rightTable, {
    height: "100%",
    layout: "fitColumns",
    index: "id",
    editable: false,
    columns: [
      { title: "ID", field: "id", width: 70, hozAlign: "right", cssClass: "filtrable" },
      {
        title: "Tipo producto",
        field: "tipo_producto_id",
        editor: "list",
        editable: (cell) => !lineasBloqueadas && tablaEditable(cell),
        editorParams: {
          values: tiposProductoValores,
          clearable: true,
          autocomplete: true,
          allowEmpty: true,
          listOnEmpty: true,
        },
        cssClass: "filtrable",
        formatter: (cell) => {
          const id = cell.getValue();
          if (id === null || id === undefined || id === "") return "";
          return DATOS?.fabricacion?.tipos_producto?.[id]?.descripcion ?? "";
        },
      },
      {
        title: "Material",
        field: "material_id",
        editor: "list",
        editable: (cell) => !lineasBloqueadas && tablaEditable(cell),
        editorParams: {
          values: materialesValores,
          clearable: true,
          autocomplete: true,
          allowEmpty: true,
          listOnEmpty: true,
        },
        cssClass: "filtrable",
        formatter: (cell) => {
          const id = cell.getValue();
          if (id === null || id === undefined || id === "") return "";
          return DATOS?.maestros?.materiales?.[id]?.descripcion ?? "";
        },
      },
      { title: "Bultos", field: "bultos", width: 90, hozAlign: "right", editor: "number", editable: (cell) => !lineasBloqueadas && tablaEditable(cell), cssClass: "filtrable" },
      { title: "Kilos", field: "kilos", width: 90, hozAlign: "right", editor: "number", editable: (cell) => !lineasBloqueadas && tablaEditable(cell), cssClass: "filtrable" },
      { title: "Bultos entregados", field: "bultos_entregados", width: 140, hozAlign: "right", editor: "number", editable: (cell) => !lineasBloqueadas && tablaEditable(cell), cssClass: "filtrable" },
      { title: "Verificado", field: "verificado", width: 110, editable: (cell) => !lineasBloqueadas && tablaEditable(cell), cssClass: "filtrable", ...parametrosCheck },
      CeldaAccionesLineas,
    ],
    placeholder: "Sin datos",
  });
  tablaLineas.KEY = "lineas_entrada";

  function actualizarEstadoLineas() {
    const bloqueado = !entradaSeleccionada || lineasBloqueadas;
    botonNuevaLinea.disabled = bloqueado;
    botonEditarLineas.disabled = bloqueado;
    if (bloqueado) {
      botonEditarLineas.setAttribute("aria-pressed", "false");
      tablaLineas.options.editable = false;
    }
  }

  async function filtrarEntradas() {
    const año = Number(inputAnno.value);
    const proveedorId = selectProveedor.value ? Number(selectProveedor.value) : null;
    try {
      const entradas = await wsRequest("listar_entradas_planificacion", {
        año: año,
        proveedor_id: proveedorId,
      });
      tablaEntradas.setData(entradas || []);
      if (entradas?.length) {
        const primera = entradas[0];
        tablaEntradas.selectRow(primera.id);
        entradaSeleccionada = primera;
        lineasBloqueadas = esVerdadero(primera.entregado) || esVerdadero(primera.anulado);
        actualizarEstadoLineas();
        await cargarLineas(primera.id);
        await cargarArchivos(primera.id);
      } else {
        entradaSeleccionada = null;
        lineasBloqueadas = false;
        actualizarEstadoLineas();
        tablaLineas.setData([]);
        selectArchivos.innerHTML = "";
        selectArchivos.appendChild(crearElemento("option", { value: "", content: "Sin entradas" }));
      }
    } catch (err) {
      console.error(err);
      alert("Error al cargar entradas: " + err.message);
    }
  }

  function actualizarNombreArchivo(archivos) {
    selectArchivos.innerHTML = "";
    if (!archivos?.length) {
      selectArchivos.appendChild(crearElemento("option", { value: "", content: "Sin archivos" }));
      return;
    }
    archivos.sort((a, b) => Number(b.id) - Number(a.id)).forEach((archivo) => {
      const label = `${archivo.id} - ${archivo.nombre_original || archivo.nombre_archivo}`;
      selectArchivos.appendChild(crearElemento("option", { value: archivo.id, content: label }));
    });
  }

  async function cargarLineas(entradaId) {
    try {
      const lineas = await wsRequest("listar_lineas_entrada", { entrada_id: entradaId });
      tablaLineas.setData(lineas || []);
    } catch (err) {
      console.error(err);
      alert("Error al cargar lineas: " + err.message);
    }
  }

  async function cargarArchivos(entradaId) {
    try {
      const archivos = await wsRequest("listar_archivos_entidad", {
        entidad: "entradas",
        entidad_id: entradaId,
      });
      actualizarNombreArchivo(archivos || []);
    } catch (err) {
      console.error(err);
      alert("Error al cargar archivos: " + err.message);
    }
  }

  async function seleccionarEntrada(row) {
    const data = row.getData();
    if (!data?.id) return;
    const el = row.getElement();
    if (el?.classList?.contains("tabulator-selected")) return;
    tablaEntradas.deselectRow();
    row.select();
    entradaSeleccionada = data;
    lineasBloqueadas = esVerdadero(data.entregado) || esVerdadero(data.anulado);
    actualizarEstadoLineas();
    await cargarLineas(data.id);
    await cargarArchivos(data.id);
  }

  function esClickAccion(eventTarget) {
    return Boolean(eventTarget?.closest?.("button[data-action-row]"));
  }

  tablaEntradas.on("rowClick", async (e, row) => {
    if (esClickAccion(e.target)) return;
    await seleccionarEntrada(row);
  });

  tablaEntradas.on("rowTap", async (e, row) => {
    if (esClickAccion(e.target)) return;
    await seleccionarEntrada(row);
  });

  function normalizarValor(valor) {
    if (valor === null || valor === undefined) return "";
    return String(valor);
  }

  let ignorarEdicion = false;

  async function guardarEdicion(cell, tablaNombre) {
    if (ignorarEdicion) return;
    const row = cell.getRow().getData();
    if (!row.id) return;
    const f = cell.getField();
    const nuevo = cell.getValue();
    const anterior = cell.getOldValue();

    if (normalizarValor(nuevo) === "" || normalizarValor(nuevo) === normalizarValor(anterior)) {
      ignorarEdicion = true;
      cell.setValue(anterior, true);
      ignorarEdicion = false;
      return;
    }

    const resultado = await wsRequest("modificar_maestro", {
      tabla: tablaNombre,
      id: row.id,
      campo: f,
      valor: row[f],
      valores: row,
    });
    if (resultado?.id != row.id) {
      alert("Error al guardar los cambios en " + tablaNombre + ".");
    }
  }

  tablaEntradas.on("cellEdited", async (cell) => {
    await guardarEdicion(cell, "entradas");
  });

  tablaLineas.on("cellEdited", async (cell) => {
    await guardarEdicion(cell, "lineas_entrada");
  });

  botonConsultar.addEventListener("click", filtrarEntradas);
  selectProveedor.addEventListener("change", filtrarEntradas);

  function aplicarFiltros(tabla, activo) {
    tabla.getColumns().forEach((col) => {
      if (!col.getElement().classList.contains("filtrable")) return;
      if (activo) {
        const def = col.getDefinition();
        const tipoEditor = def?.editor ?? (def?.esCheck ? "tickCross" : "input");
        switch (tipoEditor) {
          case "tickCross":
            col.updateDefinition({
              headerFilter: "list",
              headerFilterParams: {
                values: {
                  "": "Todos",
                  "true": "Si",
                  "false": "No",
                },
              },
              headerFilterFunc: (headerValue, rowValue) => {
                if (headerValue === "" || headerValue == null) return true;
                const filterBool = headerValue === "true";
                return rowValue === filterBool;
              },
              headerFilterFuncParams: {},
            });
            break;
          default:
            {
              const def = col.getDefinition();
              if (def?.editor === "list") {
                col.updateDefinition({
                  headerFilter: "list",
                  headerFilterParams: {
                    values: def?.editorParams?.values ?? {},
                    clearable: true,
                  },
                });
              } else {
                col.updateDefinition({ headerFilter: "input" });
              }
            }
        }
      } else {
        col.setHeaderFilterValue("");
        col.updateDefinition({ headerFilter: false });
      }
    });
    if (activo) {
      tabla.element.querySelector(".tabulator-header-filter input")?.focus();
    }
  }

  botonFiltroEntradas.addEventListener("click", () => {
    const activo = botonFiltroEntradas.getAttribute("aria-pressed") === "true";
    aplicarFiltros(tablaEntradas, activo);
  });
  botonEditarEntradas.addEventListener("click", () => {
    tablaEntradas.options.editable = botonEditarEntradas.getAttribute("aria-pressed") === "true";
  });
  botonFiltroLineas.addEventListener("click", () => {
    const activo = botonFiltroLineas.getAttribute("aria-pressed") === "true";
    aplicarFiltros(tablaLineas, activo);
  });
  botonEditarLineas.addEventListener("click", () => {
    if (!entradaSeleccionada || lineasBloqueadas) {
      botonEditarLineas.setAttribute("aria-pressed", "false");
      tablaLineas.options.editable = false;
      return;
    }
    tablaLineas.options.editable = botonEditarLineas.getAttribute("aria-pressed") === "true";
  });

  botonNuevaEntrada.addEventListener("click", async () => {
    if (tablaEntradas.element.querySelector(".nuevo-registro")) {
      alert("Complete el registro nuevo antes de crear otro.");
      return;
    }
    const proveedorId = selectProveedor.value ? Number(selectProveedor.value) : null;
    const rowData = {
      proveedor_id: proveedorId || undefined,
      fecha: new Date().toISOString().slice(0, 10),
      entregado: false,
      anulado: false,
    };
    const row = await tablaEntradas.addRow(rowData, true);
    row.getElement().classList.add("nuevo-registro");
  });

  botonNuevaLinea.addEventListener("click", async () => {
    if (!entradaSeleccionada?.id) {
      alert("Seleccione una entrada primero.");
      return;
    }
    if (lineasBloqueadas) {
      alert("Las lineas estan bloqueadas para entradas entregadas o anuladas.");
      return;
    }
    if (tablaLineas.element.querySelector(".nuevo-registro")) {
      alert("Complete el registro nuevo antes de crear otro.");
      return;
    }
    const rowData = {
      entrada_id: entradaSeleccionada.id,
      tipo_producto_id: null,
      material_id: null,
      bultos: 0,
      kilos: 0,
      bultos_entregados: 0,
      verificado: false,
    };
    const row = await tablaLineas.addRow(rowData, true);
    row.getElement().classList.add("nuevo-registro");
  });

  botonSubir.addEventListener("click", () => {
    const selected = tablaEntradas.getSelectedData()[0];
    if (!selected?.id) {
      alert("Seleccione una entrada primero.");
      return;
    }
    openSubirArchivoWin({
      ventanaTitulo: "Subir documento de entrada",
      titulo: `Entrada ${selected.numero || selected.id}`,
      mensaje: "Adjunta el documento en PDF o JPG.",
      entidad: "entradas",
      entidadId: selected.id,
    });
  });

  botonVer.addEventListener("click", () => {
    if (!entradaSeleccionada?.id) {
      alert("Seleccione una entrada primero.");
      return;
    }
    const archivoId = selectArchivos.value;
    if (!archivoId) {
      alert("No hay documentos asociados.");
      return;
    }
    window.open(`./api/archivo_get.php?id=${archivoId}`, "_blank");
  });

  botonEliminarArchivo.addEventListener("click", async () => {
    if (!entradaSeleccionada?.id) {
      alert("Seleccione una entrada primero.");
      return;
    }
    const archivoId = selectArchivos.value;
    if (!archivoId) {
      alert("Seleccione un archivo.");
      return;
    }
    if (!confirm(`¿Eliminar archivo ID ${archivoId}?`)) return;
    try {
      const resp = await fetch("./api/archivo_delete.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `id=${encodeURIComponent(archivoId)}`,
      });
      const data = await resp.json();
      if (!resp.ok || data.error) {
        throw new Error(data.error || `Error HTTP ${resp.status}`);
      }
      await cargarArchivos(entradaSeleccionada.id);
    } catch (err) {
      console.error(err);
      alert("Error al eliminar archivo: " + err.message);
    }
  });

  filtrarEntradas();

  windowsRegistry.set("listado_entradas_planificacion", { wb: win, table: [tablaEntradas, tablaLineas] });
  return win;
}
