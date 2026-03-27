function openPlanificacionPedidosWin() {
  if (!asegurarFabricacionCargada("tipos_producto", "planificacion_pedidos")) return null;

  const KEY = "planificacion_pedidos";
  const wb = comprobarVentanaAbierta(KEY);
  if (wb) return wb;

  const contenedor = crearElemento("div", { class: "contenedor-winbox pedidos-fabricacion-win" });
  contenedor.innerHTML = `
    <div class="pedidos-fabricacion-layout">
      <section class="pedidos-fabricacion-panel">
        <div class="pedidos-fabricacion-panel-header">
          <h5 class="pedidos-fabricacion-panel-title">Pedidos</h5>
          <span class="pedidos-fabricacion-panel-subtitle">Filtra y selecciona un pedido</span>
        </div>
        <div class="pedidos-fabricacion-filters">
          <div class="pedidos-fabricacion-filter">
            <label for="pf-filtro-estado">Estado <button type="button" class="btn btn-link btn-sm pedidos-fabricacion-clear" data-clear-filter="estado" title="Limpiar filtro"><i class="bi bi-x-circle"></i></button></label>
            <div id="pf-filtro-estado" class="pedidos-fabricacion-checklist"></div>
          </div>
          <div class="pedidos-fabricacion-filter pedidos-fabricacion-filter-stack">
            <div class="pedidos-fabricacion-filter-stack-item">
              <label for="pf-filtro-fecha">Fecha <button type="button" class="btn btn-link btn-sm pedidos-fabricacion-clear" data-clear-filter="fecha" title="Limpiar filtro"><i class="bi bi-x-circle"></i></button></label>
              <input id="pf-filtro-fecha" class="form-control form-control-sm" type="date" />
            </div>
            <div class="pedidos-fabricacion-filter-stack-item">
              <label for="pf-filtro-destino">Destino <button type="button" class="btn btn-link btn-sm pedidos-fabricacion-clear" data-clear-filter="destino" title="Limpiar filtro"><i class="bi bi-x-circle"></i></button></label>
              <div id="pf-filtro-destino" class="pedidos-fabricacion-checklist pedidos-fabricacion-checklist-compact"></div>
            </div>
          </div>
          <div class="pedidos-fabricacion-filter">
            <label for="pf-filtro-cliente">Cliente <button type="button" class="btn btn-link btn-sm pedidos-fabricacion-clear" data-clear-filter="cliente" title="Limpiar filtro"><i class="bi bi-x-circle"></i></button></label>
            <div id="pf-filtro-cliente" class="pedidos-fabricacion-checklist"></div>
          </div>
          <div class="pedidos-fabricacion-filter">
            <label for="pf-filtro-tipo">Tipo de bota <button type="button" class="btn btn-link btn-sm pedidos-fabricacion-clear" data-clear-filter="tipo" title="Limpiar filtro"><i class="bi bi-x-circle"></i></button></label>
            <div id="pf-filtro-tipo" class="pedidos-fabricacion-checklist"></div>
          </div>
          <div class="pedidos-fabricacion-filter">
            <label for="pf-filtro-material">Material <button type="button" class="btn btn-link btn-sm pedidos-fabricacion-clear" data-clear-filter="material" title="Limpiar filtro"><i class="bi bi-x-circle"></i></button></label>
            <div id="pf-filtro-material" class="pedidos-fabricacion-checklist"></div>
          </div>
        </div>
        <div class="pedidos-fabricacion-toolbar">
          <button type="button" id="pf-buscar-pedidos" class="btn btn-sm btn-outline-primary">Consultar</button>
          <button type="button" id="pf-limpiar-filtros" class="btn btn-sm btn-outline-secondary">Limpiar</button>
          <div class="dropdown">
            <button type="button" class="btn btn-sm btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">Columnas</button>
            <div class="dropdown-menu p-2" id="pf-columnas-pedidos"></div>
          </div>
          <button type="button" id="pf-editar-pedidos" class="btn btn-sm btn-outline-info" aria-pressed="false">
            <i class="bi bi-lock"></i><i class="bi bi-unlock"></i> Editar
          </button>
          <button type="button" id="pf-nuevo-pedido" class="btn btn-sm btn-success">Nuevo pedido</button>
          <span class="estado" id="pf-resumen-pedidos"></span>
        </div>
        <div id="pf-tabla-pedidos" class="pedidos-fabricacion-table"></div>
      </section>
      <section class="pedidos-fabricacion-panel">
        <div class="pedidos-fabricacion-panel-header">
          <h5 class="pedidos-fabricacion-panel-title">Fabricación semanal</h5>
          <span class="pedidos-fabricacion-panel-subtitle" id="pf-detalle-titulo">Sin pedido seleccionado</span>
        </div>
        <div class="pedidos-fabricacion-toolbar">
          <div class="dropdown">
            <button type="button" class="btn btn-sm btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">Columnas</button>
            <div class="dropdown-menu p-2" id="pf-columnas-fabricacion"></div>
          </div>
          <button type="button" id="pf-editar-fabricacion" class="btn btn-sm btn-outline-info" aria-pressed="false" disabled>
            <i class="bi bi-lock"></i><i class="bi bi-unlock"></i> Editar
          </button>
          <button type="button" id="pf-nueva-fabricacion" class="btn btn-sm btn-primary" disabled>Nueva orden semanal</button>
          <span class="estado" id="pf-resumen-fabricacion">Selecciona un pedido</span>
        </div>
        <div id="pf-tabla-fabricacion" class="pedidos-fabricacion-table"></div>
      </section>
    </div>
  `;

  const ventana = crearWinBox(KEY, contenedor, {
    title: "Planificacion pedidos",
    x: 110,
    y: 110,
    width: "1280px",
    height: "720px",
  });

  const registro = {
    wb: ventana,
    table: null,
    contenedor,
    filtros: {
      estado: contenedor.querySelector("#pf-filtro-estado"),
      fecha: contenedor.querySelector("#pf-filtro-fecha"),
      destino: contenedor.querySelector("#pf-filtro-destino"),
      cliente: contenedor.querySelector("#pf-filtro-cliente"),
      tipo: contenedor.querySelector("#pf-filtro-tipo"),
      material: contenedor.querySelector("#pf-filtro-material"),
    },
    pedidoSeleccionado: null,
    fabricacionSeleccionadaId: null,
    pedidosData: [],
    fabricacionData: [],
  };

  inicializarFiltrosPlanificacionPedidos(registro);
  registro.pedidosTable = crearTablaPlanificacionPedidos(contenedor.querySelector("#pf-tabla-pedidos"));
  registro.fabricacionTable = crearTablaPlanificacionFabricacion(contenedor.querySelector("#pf-tabla-fabricacion"));
  registro.pedidosTable.on("tableBuilt", () => {
    inicializarSelectorColumnasPlanificacion(registro.pedidosTable, contenedor.querySelector("#pf-columnas-pedidos"), "planificacion_pedidos.pedidos");
  });
  registro.fabricacionTable.on("tableBuilt", () => {
    inicializarSelectorColumnasPlanificacion(registro.fabricacionTable, contenedor.querySelector("#pf-columnas-fabricacion"), "planificacion_pedidos.fabricacion_semanal");
  });
  registro.table = registro.pedidosTable;
  windowsRegistry.set(KEY, registro);

  instalarEventosPlanificacionPedidos(registro);
  actualizarBotonesPedidosPlanificacion(registro);
  actualizarBotonesFabricacionPlanificacion(registro);
  cargarPedidosPlanificacion(registro);

  return ventana;
}

function crearTablaPlanificacionPedidos(elemento) {
  const tabla = new Tabulator(elemento, {
    key: "planificacion_pedidos_tabla",
    height: "100%",
    width: "100%",
    layout: "fitColumns",
    index: "id",
    placeholder: "Sin pedidos",
    editable: false,
    columns: construirColumnasPlanificacionPedidos(),
    data: [],
  });
  tabla.KEY = "pedidos";
  tabla.DATA_STORE = "fabricacion";
  tabla.__planEditable = false;
  tabla.element.classList.add("plan-editable-off");
  return tabla;
}

function crearTablaPlanificacionFabricacion(elemento) {
  const tabla = new Tabulator(elemento, {
    key: "planificacion_fabricacion_tabla",
    height: "100%",
    width: "100%",
    layout: "fitColumns",
    index: "id",
    placeholder: "Selecciona un pedido",
    editable: false,
    columns: construirColumnasPlanificacionFabricacion(),
    data: [],
  });
  tabla.KEY = "fabricacion_semanal";
  tabla.DATA_STORE = "fabricacion";
  tabla.__planEditable = false;
  tabla.element.classList.add("plan-editable-off");
  return tabla;
}

function construirColumnasPlanificacionPedidos() {
  const clientesDict = Object.values(DATOS?.maestros?.clientes ?? {}).map(({ id, nombre }) => ({ value: id, label: nombre || String(id) }));
  const tiposDict = Object.values(DATOS?.fabricacion?.tipos_producto ?? {}).map(({ id, descripcion, codigo }) => ({ value: id, label: descripcion || codigo || String(id) }));
  const materialesDict = Object.values(DATOS?.maestros?.materiales ?? {}).map(({ id, descripcion }) => ({ value: id, label: descripcion || String(id) }));
  const estadosDict = Object.values(DATOS?.maestros?.estados_pedidos ?? {}).map(({ id, descripcion }) => ({ value: id, label: descripcion || String(id) }));
  const destinosDict = [
    { value: "C", label: "CLIENTE" },
    { value: "E", label: "ENVINADO" },
  ];

  return [
    { title: "ID", field: "id", width: 70, hozAlign: "right" },
    { title: "Numero", field: "numero", editor: "input", editable: tablaEditablePlanificacion, minWidth: 110 },
    {
      title: "Cliente",
      field: "cliente_id",
      editor: "list",
      editorParams: { values: clientesDict, clearable: true, autocomplete: true, allowEmpty: true, listOnEmpty: true, freetext: false },
      editable: tablaEditablePlanificacion,
      formatter: (cell) => DATOS?.maestros?.clientes?.[cell.getValue()]?.nombre ?? cell.getValue(),
      minWidth: 150,
    },
    {
      title: "Destino",
      field: "destino",
      editor: "list",
      editorParams: { values: destinosDict, clearable: false, autocomplete: true, allowEmpty: false, listOnEmpty: true, freetext: false },
      editable: tablaEditablePlanificacion,
      formatter: (cell) => ({ C: "CLIENTE", E: "ENVINADO" }[String(cell.getValue() || "").trim().toUpperCase()] ?? cell.getValue()),
      width: 120,
    },
    { title: "Descripcion", field: "descripcion", editor: "input", editable: tablaEditablePlanificacion, minWidth: 180 },
    {
      title: "Tipo de bota",
      field: "tipo_producto_id",
      editor: "list",
      editorParams: { values: tiposDict, clearable: true, autocomplete: true, allowEmpty: true, listOnEmpty: true, freetext: false },
      editable: tablaEditablePlanificacion,
      formatter: (cell) => DATOS?.fabricacion?.tipos_producto?.[cell.getValue()]?.descripcion ?? cell.getValue(),
      minWidth: 150,
    },
    {
      title: "Material",
      field: "material_id",
      editor: "list",
      editorParams: { values: materialesDict, clearable: true, autocomplete: true, allowEmpty: true, listOnEmpty: true, freetext: false },
      editable: tablaEditablePlanificacion,
      formatter: (cell) => DATOS?.maestros?.materiales?.[cell.getValue()]?.descripcion ?? cell.getValue(),
      minWidth: 140,
    },
    { title: "Cantidad", field: "cantidad", editor: "number", editorParams: { min: 0, step: 1 }, editable: tablaEditablePlanificacion, hozAlign: "right", width: 95 },
    { title: "Fabricada", field: "cantidad_fabricada", editor: "number", editorParams: { min: 0, step: 1 }, editable: tablaEditablePlanificacion, hozAlign: "right", width: 95 },
    { title: "Fecha", field: "fecha", editor: "date", editable: tablaEditablePlanificacion, sorter: "date", width: 120 },
    { title: "Fin", field: "fecha_finalizacion", editor: "date", editable: tablaEditablePlanificacion, sorter: "date", width: 120 },
    {
      title: "Estado",
      field: "estado",
      editor: "list",
      editorParams: { values: estadosDict, clearable: true, autocomplete: true, allowEmpty: true, listOnEmpty: true, freetext: false },
      editable: tablaEditablePlanificacion,
      formatter: (cell) => DATOS?.maestros?.estados_pedidos?.[cell.getValue()]?.descripcion ?? cell.getValue(),
      width: 140,
    },
    construirColumnaAccionesPlanificacion(),
  ];
}

function construirColumnasPlanificacionFabricacion() {
  const estadosDict = Object.values(DATOS?.maestros?.estados_fabricacion_semanal ?? {}).map(({ id, descripcion }) => ({ value: id, label: descripcion || String(id) }));
  return [
    { title: "ID", field: "id", width: 70, hozAlign: "right" },
    { title: "Fecha inicio", field: "fecha_inicio", editor: "date", editable: tablaEditablePlanificacion, sorter: "date", width: 125 },
    {
      title: "Tipo",
      field: "tipo_producto_id",
      editable: false,
      formatter: (cell) => DATOS?.fabricacion?.tipos_producto?.[cell.getValue()]?.descripcion ?? cell.getValue(),
      minWidth: 150,
    },
    {
      title: "Material",
      field: "material_id",
      editable: false,
      formatter: (cell) => DATOS?.maestros?.materiales?.[cell.getValue()]?.descripcion ?? cell.getValue(),
      minWidth: 140,
    },
    { title: "Cantidad", field: "cantidad", editor: "number", editorParams: { min: 0, step: 1 }, editable: tablaEditablePlanificacion, hozAlign: "right", width: 95 },
    { title: "Fabricada", field: "cantidad_fabricada", editor: "number", editorParams: { min: 0, step: 1 }, editable: tablaEditablePlanificacion, hozAlign: "right", width: 95 },
    {
      title: "Estado",
      field: "estado",
      editor: "list",
      editorParams: { values: estadosDict, clearable: true, autocomplete: true, allowEmpty: true, listOnEmpty: true, freetext: false },
      editable: tablaEditablePlanificacion,
      formatter: (cell) => DATOS?.maestros?.estados_fabricacion_semanal?.[cell.getValue()]?.descripcion ?? cell.getValue(),
      minWidth: 140,
    },
    construirColumnaAccionesPlanificacion(),
  ];
}

function construirColumnaAccionesPlanificacion() {
  return {
    title: "Acciones",
    width: 100,
    headerSort: false,
    hozAlign: "center",
    formatter: (cell) => {
      const d = cell.getRow().getData();
      return d.id === undefined
        ? `<button class="btn btn-sm btn-outline-primary" data-action-row="guardar"><i class="bi bi-plus-lg"></i></button>`
        : `<button class="btn btn-sm btn-outline-danger" data-action-row="borrar"><i class="bi bi-trash"></i></button>`;
    },
    cellClick: onAccionPlanificacionCellClick,
  };
}

async function onAccionPlanificacionCellClick(e, cell) {
  const tabla = cell.getTable();
  const action = e.target.closest("button")?.getAttribute("data-action-row");
  if (!action) return;
  if (action === "borrar") {
    const id = cell.getRow().getData()?.id;
    if (!confirm(`¿Eliminar ID ${id}?`)) return;
  }
  const eraNuevo = cell.getRow().getData()?.id === undefined;
  await getCellClick(e, cell);
  const registro = windowsRegistry.get("planificacion_pedidos");
  if (!registro) return;
  if (tabla.KEY === "pedidos") {
    cargarPedidosPlanificacion(registro);
  } else if (tabla.KEY === "fabricacion_semanal" && registro.pedidoSeleccionado?.id) {
    cargarFabricacionPedidoPlanificacion(registro, registro.pedidoSeleccionado.id);
  }
  if (eraNuevo) {
    desactivarModoEdicionPlanificacion(registro, tabla.KEY);
  }
}

function tablaEditablePlanificacion(cell) {
  return Boolean(cell.getTable().__planEditable) || cell.getRow().getData().id === undefined;
}

function instalarEventosPlanificacionPedidos(registro) {
  const c = registro.contenedor;
  c.querySelector("#pf-buscar-pedidos")?.addEventListener("click", () => cargarPedidosPlanificacion(registro));
  c.querySelector("#pf-limpiar-filtros")?.addEventListener("click", () => {
    limpiarFiltrosPlanificacionPedidos(registro);
    cargarPedidosPlanificacion(registro);
  });
  c.querySelectorAll("[data-clear-filter]")?.forEach((btn) => {
    btn.addEventListener("click", () => {
      limpiarFiltroPlanificacionPedidos(registro, btn.getAttribute("data-clear-filter"));
      cargarPedidosPlanificacion(registro);
    });
  });
  c.querySelector("#pf-editar-pedidos")?.addEventListener("click", (e) => {
    toggleEditarPlanificacion(registro.pedidosTable, e.currentTarget);
    actualizarBotonesPedidosPlanificacion(registro);
  });
  c.querySelector("#pf-editar-fabricacion")?.addEventListener("click", (e) => {
    if (e.currentTarget.disabled) return;
    toggleEditarPlanificacion(registro.fabricacionTable, e.currentTarget);
    actualizarBotonesFabricacionPlanificacion(registro);
  });
  c.querySelector("#pf-nuevo-pedido")?.addEventListener("click", async () => {
    if (!registro.pedidosTable.__planEditable) {
      const botonEditar = c.querySelector("#pf-editar-pedidos");
      if (botonEditar) {
        botonEditar.setAttribute("aria-pressed", "true");
      }
      registro.pedidosTable.__planEditable = true;
      registro.pedidosTable.options.editable = true;
      registro.pedidosTable.redraw(true);
    }
    if (registro.pedidosTable.element.querySelector(".nuevo-registro")) return;
    restaurarTodasColumnasPlanificacion(
      registro.pedidosTable,
      "planificacion_pedidos.pedidos",
      registro.contenedor.querySelector("#pf-columnas-pedidos")
    );
    registro.pedidoSeleccionado = null;
    marcarFilaActivaPlanificacion(registro.pedidosTable, null);
    resetFabricacionPlanificacion(registro);
    const rowComp = await registro.pedidosTable.addRow(crearPedidoVacioPlanificacion(), true);
    rowComp.getElement().classList.add("nuevo-registro");
  });
  c.querySelector("#pf-nueva-fabricacion")?.addEventListener("click", async () => {
    if (!registro.pedidoSeleccionado?.id) return;
    if (!registro.fabricacionTable.__planEditable) {
      const botonEditar = c.querySelector("#pf-editar-fabricacion");
      if (botonEditar) {
        botonEditar.setAttribute("aria-pressed", "true");
      }
      registro.fabricacionTable.__planEditable = true;
      registro.fabricacionTable.options.editable = true;
      registro.fabricacionTable.redraw(true);
    }
    if (registro.fabricacionTable.element.querySelector(".nuevo-registro")) return;
    marcarFilaActivaPlanificacion(registro.fabricacionTable, null);
    registro.fabricacionSeleccionadaId = null;
    const rowComp = await registro.fabricacionTable.addRow(crearFabricacionVaciaPlanificacion(registro.pedidoSeleccionado), true);
    rowComp.getElement().classList.add("nuevo-registro");
  });

  registro.pedidosTable.on("rowClick", (_e, row) => {
    const pedido = row.getData();
    if (!pedido?.id) return;
    seleccionarPedidoPlanificacion(registro, pedido);
  });
  registro.pedidosTable.on("cellMouseDown", (e, cell) => {
    if (e.target.closest("button")) return;
    const pedido = cell.getRow().getData();
    if (!pedido?.id) return;
    seleccionarPedidoPlanificacion(registro, pedido);
  });
  registro.pedidosTable.on("cellClick", (e, cell) => {
    if (e.target.closest("button")) return;
    const pedido = cell.getRow().getData();
    if (!pedido?.id) return;
    seleccionarPedidoPlanificacion(registro, pedido);
  });

  registro.pedidosTable.on("cellEdited", async (cell) => {
    const fila = cell.getRow().getData();
    if (!fila?.id) return;
    await guardarEdicionPlanificacion(cell);
    cargarPedidosPlanificacion(registro);
  });
  registro.fabricacionTable.on("cellEdited", async (cell) => {
    const fila = cell.getRow().getData();
    if (!fila?.id) return;
    await guardarEdicionPlanificacion(cell);
    if (registro.pedidoSeleccionado?.id) {
      cargarFabricacionPedidoPlanificacion(registro, registro.pedidoSeleccionado.id);
    }
  });
  registro.fabricacionTable.on("rowClick", (_e, row) => {
    const linea = row.getData();
    if (!linea?.id) return;
    seleccionarLineaFabricacionPlanificacion(registro, linea);
  });
  registro.fabricacionTable.on("cellMouseDown", (e, cell) => {
    if (e.target.closest("button")) return;
    const linea = cell.getRow().getData();
    if (!linea?.id) return;
    seleccionarLineaFabricacionPlanificacion(registro, linea);
  });
  registro.fabricacionTable.on("cellClick", (e, cell) => {
    if (e.target.closest("button")) return;
    const linea = cell.getRow().getData();
    if (!linea?.id) return;
    seleccionarLineaFabricacionPlanificacion(registro, linea);
  });
}

async function guardarEdicionPlanificacion(cell) {
  const tabla = cell.getTable();
  if (tabla.__suppressCellEdited === true) return;
  const row = cell.getRow().getData();
  if (!row.id) return;
  const resultado = await wsRequest("modificar_maestro", { tabla: tabla.KEY, id: row.id, campo: cell.getField(), valor: row[cell.getField()], valores: row });
  if (resultado?.valores && typeof resultado.valores === "object") {
    tabla.__suppressCellEdited = true;
    try {
      await cell.getRow().update(resultado.valores);
    } finally {
      tabla.__suppressCellEdited = false;
    }
  }
}

function toggleEditarPlanificacion(tabla, boton) {
  const activo = boton.getAttribute("aria-pressed") === "true";
  boton.setAttribute("aria-pressed", activo ? "false" : "true");
  tabla.__planEditable = !activo;
  tabla.options.editable = !activo;
  tabla.element.classList.toggle("plan-editable-off", activo);
  tabla.element.classList.toggle("plan-editable-on", !activo);
  refrescarTablaPlanificacion(tabla);
}

function desactivarModoEdicionPlanificacion(registro, keyTabla) {
  if (!registro) return;
  if (keyTabla === "pedidos") {
    const boton = registro.contenedor.querySelector("#pf-editar-pedidos");
    if (!boton) return;
    boton.setAttribute("aria-pressed", "false");
    registro.pedidosTable.__planEditable = false;
    registro.pedidosTable.options.editable = false;
    registro.pedidosTable.element.classList.add("plan-editable-off");
    registro.pedidosTable.element.classList.remove("plan-editable-on");
    refrescarTablaPlanificacion(registro.pedidosTable);
    actualizarBotonesPedidosPlanificacion(registro);
    return;
  }
  if (keyTabla === "fabricacion_semanal") {
    const boton = registro.contenedor.querySelector("#pf-editar-fabricacion");
    if (!boton) return;
    boton.setAttribute("aria-pressed", "false");
    registro.fabricacionTable.__planEditable = false;
    registro.fabricacionTable.options.editable = false;
    registro.fabricacionTable.element.classList.add("plan-editable-off");
    registro.fabricacionTable.element.classList.remove("plan-editable-on");
    refrescarTablaPlanificacion(registro.fabricacionTable);
    actualizarBotonesFabricacionPlanificacion(registro);
  }
}

function inicializarFiltrosPlanificacionPedidos(registro) {
  poblarChecklistPlanificacion(registro.filtros.destino, "destino", [
    { value: "C", label: "CLIENTE" },
    { value: "E", label: "ENVINADO" },
  ]);
  poblarChecklistPlanificacion(registro.filtros.estado, "estado", Object.values(DATOS?.maestros?.estados_pedidos ?? {}).map((x) => ({ value: x.id, label: x.descripcion })));
  poblarChecklistPlanificacion(registro.filtros.cliente, "cliente", Object.values(DATOS?.maestros?.clientes ?? {}).map((x) => ({ value: x.id, label: x.nombre })));
  poblarChecklistPlanificacion(
    registro.filtros.tipo,
    "tipo",
    Object.values(DATOS?.fabricacion?.tipos_producto ?? {})
      .filter((x) => String(x?.tipo || "").toUpperCase() === "BOTA")
      .map((x) => ({ value: x.id, label: x.descripcion || x.codigo || String(x.id) }))
  );
  poblarChecklistPlanificacion(registro.filtros.material, "material", Object.values(DATOS?.maestros?.materiales ?? {}).map((x) => ({ value: x.id, label: x.descripcion })));
  seleccionarEstadosPorDefectoPlanificacion(registro.filtros.estado);
}

function poblarChecklistPlanificacion(contenedor, nombre, items) {
  const opciones = [];
  for (const item of items) {
    const value = escapeHtmlPedidoFabricacion(item.value);
    const label = escapeHtmlPedidoFabricacion(item.label);
    opciones.push(`
      <label class="pedidos-fabricacion-checkitem">
        <input type="checkbox" data-filter-group="${nombre}" value="${value}">
        <span>${label}</span>
      </label>
    `);
  }
  contenedor.innerHTML = opciones.join("");
}

function seleccionarEstadosPorDefectoPlanificacion(contenedor) {
  const normalizar = (txt) => String(txt || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const wanted = new Set(["pendiente", "produccion"]);
  for (const input of contenedor.querySelectorAll('input[type="checkbox"]')) {
    const texto = input.parentElement?.textContent || "";
    input.checked = wanted.has(normalizar(texto));
  }
}

function limpiarFiltrosPlanificacionPedidos(registro) {
  registro.filtros.fecha.value = "";
  desmarcarChecklistPlanificacion(registro.filtros.destino);
  desmarcarChecklistPlanificacion(registro.filtros.material);
  desmarcarChecklistPlanificacion(registro.filtros.cliente);
  desmarcarChecklistPlanificacion(registro.filtros.tipo);
  desmarcarChecklistPlanificacion(registro.filtros.estado);
  seleccionarEstadosPorDefectoPlanificacion(registro.filtros.estado);
}

function limpiarFiltroPlanificacionPedidos(registro, filtro) {
  switch (filtro) {
    case "fecha":
      registro.filtros.fecha.value = "";
      break;
    case "destino":
      desmarcarChecklistPlanificacion(registro.filtros.destino);
      break;
    case "material":
      desmarcarChecklistPlanificacion(registro.filtros.material);
      break;
    case "cliente":
      desmarcarChecklistPlanificacion(registro.filtros.cliente);
      break;
    case "tipo":
      desmarcarChecklistPlanificacion(registro.filtros.tipo);
      break;
    case "estado":
      desmarcarChecklistPlanificacion(registro.filtros.estado);
      break;
  }
}

function desmarcarChecklistPlanificacion(contenedor) {
  for (const input of contenedor.querySelectorAll('input[type="checkbox"]')) {
    input.checked = false;
  }
}

function obtenerValoresSeleccionadosPlanificacion(contenedor) {
  return Array.from(contenedor.querySelectorAll('input[type="checkbox"]:checked')).map((input) => input.value).filter(Boolean);
}

function obtenerFiltrosPlanificacionPedidos(registro) {
  return {
    estados: obtenerValoresSeleccionadosPlanificacion(registro.filtros.estado),
    fecha: registro.filtros.fecha.value || null,
    destinos: obtenerValoresSeleccionadosPlanificacion(registro.filtros.destino),
    clientes: obtenerValoresSeleccionadosPlanificacion(registro.filtros.cliente),
    tipos_producto: obtenerValoresSeleccionadosPlanificacion(registro.filtros.tipo),
    material_id: null,
    materiales: obtenerValoresSeleccionadosPlanificacion(registro.filtros.material),
  };
}

async function cargarPedidosPlanificacion(registro) {
  const pedidos = await wsRequest("listar_pedidos", obtenerFiltrosPlanificacionPedidos(registro)) || [];
  registro.pedidosData = pedidos;
  registro.pedidoSeleccionado = null;
  registro.pedidosTable.setData(pedidos);
  marcarFilaActivaPlanificacion(registro.pedidosTable, null);
  actualizarResumenPlanificacionPedidos(registro, pedidos.length);
  resetFabricacionPlanificacion(registro);
}

async function cargarFabricacionPedidoPlanificacion(registro, pedidoId) {
  const lineas = await wsRequest("listar_fabricacion_semanal", { pedido_id: pedidoId }) || [];
  registro.fabricacionData = lineas;
  registro.fabricacionSeleccionadaId = null;
  registro.fabricacionTable.setData(lineas);
  marcarFilaActivaPlanificacion(registro.fabricacionTable, null);
  registro.contenedor.querySelector("#pf-resumen-fabricacion").textContent = `${lineas.length} órdenes semanales`;
}

function seleccionarPedidoPlanificacion(registro, pedido) {
  const pedidoActualId = Number(registro.pedidoSeleccionado?.id || 0);
  const pedidoNuevoId = Number(pedido?.id || 0);
  if (!pedidoNuevoId) return;

  if (pedidoNuevoId && pedidoNuevoId === pedidoActualId) {
    marcarFilaActivaPlanificacion(registro.pedidosTable, pedido.id);
    actualizarBotonesFabricacionPlanificacion(registro);
    return;
  }

  registro.pedidoSeleccionado = pedido || null;
  if (!pedido?.id) {
    resetFabricacionPlanificacion(registro);
    return;
  }
  marcarFilaActivaPlanificacion(registro.pedidosTable, pedido.id);
  registro.contenedor.querySelector("#pf-detalle-titulo").textContent = getEtiquetaPedido(pedido) || `Pedido ${pedido.id}`;
  actualizarBotonesFabricacionPlanificacion(registro);
  cargarFabricacionPedidoPlanificacion(registro, pedido.id);
}

function resetFabricacionPlanificacion(registro) {
  registro.fabricacionData = [];
  registro.fabricacionSeleccionadaId = null;
  registro.fabricacionTable.setData([]);
  marcarFilaActivaPlanificacion(registro.fabricacionTable, null);
  registro.contenedor.querySelector("#pf-detalle-titulo").textContent = "Sin pedido seleccionado";
  registro.contenedor.querySelector("#pf-resumen-fabricacion").textContent = "Selecciona un pedido";
  const botonEditar = registro.contenedor.querySelector("#pf-editar-fabricacion");
  botonEditar.disabled = true;
  botonEditar.setAttribute("aria-pressed", "false");
  registro.fabricacionTable.__planEditable = false;
  registro.fabricacionTable.options.editable = false;
  actualizarBotonesFabricacionPlanificacion(registro);
}

function actualizarResumenPlanificacionPedidos(registro, total) {
  registro.contenedor.querySelector("#pf-resumen-pedidos").textContent = `${total} pedidos`;
}

function crearPedidoVacioPlanificacion() {
  const primerEstado = Object.values(DATOS?.maestros?.estados_pedidos ?? {})[0]?.id ?? null;
  return {
    numero: "",
    destino: "CLIENTE",
    cliente_id: null,
    descripcion: "",
    tipo_producto_id: null,
    material_id: null,
    cantidad: 0,
    cantidad_fabricada: 0,
    fecha: null,
    fecha_finalizacion: null,
    estado: primerEstado,
  };
}

function crearFabricacionVaciaPlanificacion(pedido) {
  const primerEstado = Object.values(DATOS?.maestros?.estados_fabricacion_semanal ?? {})[0]?.id ?? null;
  return {
    pedido_id: pedido.id,
    fecha_inicio: null,
    tipo_producto_id: pedido.tipo_producto_id ?? null,
    material_id: pedido.material_id ?? null,
    cantidad: Number(pedido.cantidad ?? 0) || 0,
    cantidad_fabricada: 0,
    estado: primerEstado,
  };
}

function refrescarPlanificacionPedidosWin() {
  const registro = windowsRegistry.get("planificacion_pedidos");
  if (!registro?.pedidosTable) return;
  if (registro.pedidoSeleccionado?.id) {
    const seleccionadoId = registro.pedidoSeleccionado.id;
    cargarPedidosPlanificacion(registro).then(() => {
      const pedido = registro.pedidosData.find((item) => Number(item.id) === Number(seleccionadoId));
      if (pedido) seleccionarPedidoPlanificacion(registro, pedido);
    });
    return;
  }
  cargarPedidosPlanificacion(registro);
}

function actualizarBotonesFabricacionPlanificacion(registro) {
  const botonEditar = registro.contenedor.querySelector("#pf-editar-fabricacion");
  const botonNuevo = registro.contenedor.querySelector("#pf-nueva-fabricacion");
  const hayPedido = Boolean(registro.pedidoSeleccionado?.id);
  botonEditar.disabled = !hayPedido;
  botonNuevo.disabled = !hayPedido;
}

function actualizarBotonesPedidosPlanificacion(registro) {
  const botonNuevo = registro.contenedor.querySelector("#pf-nuevo-pedido");
  if (!botonNuevo) return;
  botonNuevo.disabled = false;
}

function seleccionarLineaFabricacionPlanificacion(registro, linea) {
  const id = Number(linea?.id || 0);
  if (!id) return;
  registro.fabricacionSeleccionadaId = id;
  marcarFilaActivaPlanificacion(registro.fabricacionTable, id);
}

function inicializarSelectorColumnasPlanificacion(tabla, contenedor, storageKey) {
  if (!tabla || !contenedor) return;
  const columnas = tabla.getColumns().filter((col) => col.getField());
  const config = cargarConfigColumnasPlanificacion(storageKey);

  for (const col of columnas) {
    const field = col.getField();
    if (!field || !Object.prototype.hasOwnProperty.call(config, field)) continue;
    if (config[field]) col.show();
    else col.hide();
  }

  contenedor.innerHTML = `
    <button type="button" class="btn btn-sm btn-outline-secondary w-100 mb-2" data-show-all-columns="1">Mostrar todas</button>
  ` + columnas.map((col, index) => {
    const field = escapeHtmlPedidoFabricacion(col.getField());
    const title = escapeHtmlPedidoFabricacion(col.getDefinition().title || col.getField());
    return `
      <label class="dropdown-item-text pedidos-fabricacion-column-item">
        <input type="checkbox" data-column-field="${field}" ${col.isVisible() ? "checked" : ""} ${index === 0 ? 'disabled' : ""}>
        <span>${title}</span>
      </label>
    `;
  }).join("");

  contenedor.querySelector('[data-show-all-columns="1"]')?.addEventListener("click", () => {
    restaurarTodasColumnasPlanificacion(tabla, storageKey, contenedor);
  });

  contenedor.querySelectorAll("[data-column-field]").forEach((input) => {
    input.addEventListener("change", () => {
      const field = input.getAttribute("data-column-field");
      const column = tabla.getColumn(field);
      if (!column) return;
      if (input.checked) column.show();
      else column.hide();
      guardarConfigColumnasPlanificacion(
        storageKey,
        columnas.reduce((acc, col) => {
          const currentField = col.getField();
          if (!currentField) return acc;
          acc[currentField] = col.isVisible();
          return acc;
        }, {})
      );
    });
  });
}

function restaurarTodasColumnasPlanificacion(tabla, storageKey, contenedor) {
  const columnas = tabla.getColumns().filter((col) => col.getField());
  for (const col of columnas) {
    col.show();
  }
  guardarConfigColumnasPlanificacion(
    storageKey,
    columnas.reduce((acc, col) => {
      const field = col.getField();
      if (!field) return acc;
      acc[field] = true;
      return acc;
    }, {})
  );
  if (contenedor) {
    inicializarSelectorColumnasPlanificacion(tabla, contenedor, storageKey);
  }
}

function cargarConfigColumnasPlanificacion(storageKey) {
  if (!storageKey) return {};
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function guardarConfigColumnasPlanificacion(storageKey, config) {
  if (!storageKey) return;
  try {
    localStorage.setItem(storageKey, JSON.stringify(config || {}));
  } catch {}
}

function escapeHtmlPedidoFabricacion(valor) {
  return String(valor ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function marcarFilaActivaPlanificacion(tabla, id) {
  const idNum = Number(id || 0);
  for (const row of tabla.getRows()) {
    const rowId = Number(row.getData()?.id || 0);
    row.getElement()?.classList.toggle("fila-plan-activa", Boolean(idNum) && rowId === idNum);
  }
}

function refrescarTablaPlanificacion(tabla) {
  if (!tabla) return;
  tabla.redraw(true);
  for (const row of tabla.getRows()) {
    row.reformat();
  }
}
