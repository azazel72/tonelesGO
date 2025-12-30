// ====== CREAR VENTANA PLANIFICACION ENTRADAS ======
function openPlanificacionEntradasWin() {
  let wb = comprobarVentanaAbierta("planificacion_entradas");
  if (wb) return wb;

  const configuracionEntradas = {
    KEY: "planificacion_entradas",
    winbox: {
      tipo: "planificacion_entradas",
      options: {
        title: "Planificacion de entradas",
        x: 0,
        y: 56,
        width: "100%",
        height: "100%",
      }
    },
    tabulator: {
      planificacion_entradas: {
        options: {
          editable: true,
          height: "auto",
          columns: crearColumnasPlanificacionEntradas(DATOS.maestros.proveedores),
          data: DATOS.planificacion_entradas.planificacion?.length ? DATOS.planificacion_entradas.planificacion : [],
          columnDefaults: { headerHozAlign:"center" },
        },
      },
      materiales: {
        options: {
          editable: true,
          height: "auto",
          columns: crearColumnasMateriales(),
          data: DATOS.planificacion_entradas.desglose?.length ? DATOS.planificacion_entradas.desglose : [],
          columnDefaults: {
            resizable: false,
          },      
        },
      },
    },
  }

  wb = crearVentanaPlanificacionEntradas(configuracionEntradas);

  wb.maximize();
  
  return wb;
}


// ====== MUESTRA LA VENTANA DE PLANIFICACION ENTRADAS ======
function mostrar_planificacion_entradas(response) {
  DATOS.planificacion_entradas.plan_camiones = response.data?.plan_camiones || [];
  DATOS.planificacion_entradas.plan_facturacion = response.data?.plan_facturacion || {};
  DATOS.planificacion_entradas.plan_materiales = response.data?.plan_materiales || [];
  DATOS.planificacion_entradas.planificacion = Object.values(DATOS.planificacion_entradas.plan_camiones || {});
  DATOS.planificacion_entradas.desglose = [DATOS.planificacion_entradas.plan_facturacion, ...DATOS.planificacion_entradas.plan_materiales];

  if (response.data && windowsRegistry.has("planificacion_entradas")) {
    const { wb, table } = windowsRegistry.get("planificacion_entradas");
    console.log(table);
    const tablaPlanificacionEntradas = table[0];
    const tablaMateriales = table[1];
    tablaPlanificacionEntradas.setData(DATOS.planificacion_entradas.planificacion);
    tablaMateriales.setData(DATOS.planificacion_entradas.desglose);
    openPlanificacionEntradasWin();
  }
}

// ====== ACCIONES BOTONES CABECERA ======
function cargar_planificacion_entradas(wb, tabla) {
  var input = document.getElementById('u-cargar-planificacion-entradas-input');
  if (!input.checkValidity()) {
    alert("Año inválido");
    input.focus();
    return;
  }
  send("cargar_planificacion_entradas", { año: input.value });
}
function agregar_planificacion_entradas(wb, tabla) {
  var input = document.getElementById('u-cargar-planificacion-entradas-input');
  if (!input.checkValidity()) {
    alert("Año inválido");
    input.focus();
    return;
  }
  send("agregar_planificacion_entradas", { año: input.value });
}


// ====== FIN CREAR VENTANA ENTRADAS ======

// --- UTILIDADES ---

function sumMeses(data, sufijo){ // sufijo: "previsto" | "confirmado"
  return MESES.reduce((acc,[pre]) => acc + (Number(data[`${pre}_${sufijo}`]) || 0), 0);
}

// === construcción de columnas ===
function crearColumnasPlanificacionEntradas(proveedores) {
  const identificacion = {
    title: "Identificación",
    frozen:true,
    headerSort: false,
    columns: [
      { title: "ID", field: "id", visible: false },                // oculto
      {
        title: "Proveedor", field: "proveedor_id", width: 250,
        formatter: (cell) => {
          const id = cell.getValue();
          const prov = proveedores?.[id];
          return prov?.nombre ?? `#${id ?? "?"}`;
        },
        bottomCalc: () => "Totales",
        bottomCalcFormatter: (cell) => {
          const el = cell.getElement();
          el.classList.add("calc-label");
          return "Totales";
        },
      },
      { title: "Año", field: "año", visible: false },              // oculto
    ],
  };

  // Grupo Totales (de entrada)
  const totalesPlanificacionEntradas = {
    title: "Totales",
    frozen:true,
    headerSort: false,
    columns: [
      { title: "Pa", field: "total_pactados", cssClass:"col-pactados",
        width: 75, ...input_cero,
        bottomCalc:"sum", bottomCalcParams:{precision:false} },
      { title: "De", field: "total_descontar", cssClass:"col-descontar",
        width: 75, ...input_cero,
        bottomCalc:"sum", bottomCalcParams:{precision:false} },
      {
        title:"Pr", field:"total_previstos", width: 75, hozAlign:"right",
        // Mostramos el cálculo y coloreamos si no coincide con la suma por meses
        formatter: (cell) => {
          const row = cell.getRow();
          const d = row.getData();
          const valor = (Number(d.total_pactados)||0) - (Number(d.total_descontar)||0);
          const sumaMeses = sumMeses(d, "previsto");
          const el = cell.getElement();
          el.classList.toggle("mismatch", valor !== sumaMeses);
          return valor;
        },
        // Sumatorio en el pie (debe recalcularse igual que el formatter)
        bottomCalc: (values, data) => {
          // sumatorio de (pactados - descontar) por fila
          return data.reduce((acc,d)=>
            acc + ((Number(d.total_pactados)||0) - (Number(d.total_descontar)||0)), 0);
        },
      },
      {
        title:"En", field:"total_entregados", width: 75, hozAlign:"right",
        formatter: (cell) => {
          const d = cell.getRow().getData();
          return sumMeses(d, "confirmado");
        },
        bottomCalc: (values, data) => {
          return data.reduce((acc,d)=> acc + sumMeses(d,"confirmado"), 0);
        },
      },        
    ],
  };

  // Meses (editable)
  const gruposMeses = MESES.map(([pre, titulo]) => ({
    title: titulo,
    columns: [
      { title:"P", field:`${pre}_previsto`, ...input_cero,
        cssClass:"col-previsto", bottomCalc:"sum", bottomCalcParams:{precision:false} },
      { title:"C", field:`${pre}_confirmado`, ...input_cero,
        cssClass:"col-confirmado", bottomCalc:"sum", bottomCalcParams:{precision:false} },
    ],
  }));

  return [
    identificacion,
    totalesPlanificacionEntradas,
    ...gruposMeses,
    PlanificacionEntradasAcciones,
  ];
}

function crearColumnasMateriales() {
  const columns = [
    { title: "ID", frozen: true, field: "id", visible: false },
    { title: "", frozen: true, field: "tipo_material", width: 250, cssClass:"col-material",
      formatter: (cell) => {
        const row_title = cell.getRow().getData().tipo_material;
        if (row_title) {
          return cell.getValue();
        } else {
          return "A Facturar aprox.:";
        }
      },
    },
    { title: "Año", frozen: true, field: "año", visible: false },
    { title: "Pa", frozen: true, field: "total_pactados", cssClass:"col-pactados",
      width: 75, ...parametros_meses,
    },
    { title: "De", frozen: true, field: "total_descontar", cssClass:"col-descontar",
      width: 75, ...parametros_meses,
    },        
    {
      title:"Pr", frozen: true, field:"total_previstos", cssClass:"col-total-previstos",
      width: 75, hozAlign:"right", 
      formatter: (cell) => {
        const row_title = cell.getRow().getData().tipo_material;
        if (row_title) {
          return "TOTAL";
        } else {
          return "";
        }
      },
    },
    {
      title:"En", frozen: true, field:"total_entregados", cssClass:"col-total-entregados",
      hozAlign:"right", 
      editable: true,
      editor:"input",
      width: 75, 
      formatter: (cell) => {
        const row_title = cell.getRow().getData().tipo_material;
        if (row_title == "FLEJE" || !row_title) {
          return cell.getValue();
        } else {
          const v = (Number(cell.getValue()) || 0) + " KG";
          return v;
        }
      },
      editorParams: {
        selectContents: true,
      },
    },        
    { title:"Enero", field:"enero", ...parametros_meses },
    { title:"Febrero", field:"febrero", ...parametros_meses },
    { title:"Marzo", field:"marzo", ...parametros_meses },
    { title:"Abril", field:"abril", ...parametros_meses },
    { title:"Mayo", field:"mayo", ...parametros_meses },
    { title:"Junio", field:"junio", ...parametros_meses },
    { title:"Julio", field:"julio", ...parametros_meses },
    { title:"Agosto", field:"agosto", ...parametros_meses },
    { title:"Septiembre", field:"septiembre", ...parametros_meses },
    { title:"Octubre", field:"octubre", ...parametros_meses },
    { title:"Noviembre", field:"noviembre", ...parametros_meses },
    { title:"Diciembre", field:"diciembre", ...parametros_meses },
    { title:"Acciones", width:100, headerSort:false, hozAlign:"center"},
  ];

  return columns;
}

const parametros_meses = {
  hozAlign:"right",
  editable: true,
  editor:"number",
};

const input_cero = {
  hozAlign: "right",
  editable: true,
  editor:"number",
  formatter: (cell) => {
    const v = Number(cell.getValue()) || "0";
    return v;
  },
};


function crearVentanaPlanificacionEntradas(configuracion, show=true) {
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
  const tablaPlanificacionEntradas = crearTabla("planificacion_entradas", contenedor, configuracion.tabulator.planificacion_entradas.options);
  const tablaMateriales = crearTabla("materiales", contenedor, configuracion.tabulator.materiales.options);

  windowsRegistry.set(configuracion.KEY, { wb: wb, table: [tablaPlanificacionEntradas, tablaMateriales] });

  agregarEventosWinBox(wb, tablaPlanificacionEntradas, cabecera, configuracion);
  agregarEventosTablaPlanificacionEntradas(wb, tablaPlanificacionEntradas, cabecera, configuracion);
  agregarEventosTablaMateriales(wb, tablaMateriales, cabecera, configuracion);
  agregarSincronizacionTablas(tablaPlanificacionEntradas, tablaMateriales);

  return wb;
}

function agregarEventosTablaPlanificacionEntradas(wb, tabla, cabecera, configuracion) {
  tabla.on("cellEdited", async (cell) => {
    const f = cell.getField();
    if (!/_previsto$|_confirmado$|^total_(pactados|descontar)$/.test(f)) return;

    const row = cell.getRow();
    const d = row.getData();
    const total_previstos  = (Number(d.total_pactados)||0) - (Number(d.total_descontar)||0);
    const total_entregados = MESES.reduce((a,[pre]) => a + (Number(d[`${pre}_confirmado`])||0), 0);

    row.update({ total_previstos, total_entregados }).then(() => {
      // marca mismatch en "Pr"
      const pr = row.getCell("total_previstos");
      if (pr) {
        const sumaPrevMeses = MESES.reduce((a,[pre]) => a + (Number(d[`${pre}_previsto`])||0), 0);
        pr.getElement().classList.toggle("mismatch", total_previstos !== sumaPrevMeses);
      }
    });

    // comunicar cambios al backend
    resultado = await wsRequest("modificar_entrada", { tabla: tabla.KEY, id: d.id, campo: f, valor: d[f], valores: d });
    console.log(resultado);
    cell.setValue(resultado["valor"]); // actualizar con valor confirmado por el servidor
    if (resultado?.id != d.id) {
      alert("Error al guardar los cambios en el servidor.");
    }
  });

  cabecera.querySelector("#u-cargar-planificacion-entradas")?.addEventListener("click", () => {
    cargar_planificacion_entradas(wb, tabla);
  });
  cabecera.querySelector("#u-add-providers").addEventListener("click", async () => {
    agregar_planificacion_entradas(wb, tabla);
  });
  cabecera.querySelector("#u-cargar-planificacion-entradas-input").value = new Date().getFullYear();
}

function agregarEventosTablaMateriales(wb, tablaMateriales, cabecera, configuracion) {
  tablaMateriales.on("cellEdited", (cell) => {
    const f = cell.getField();
    const row = cell.getRow();
    const d = row.getData();

    if (d.tipo_material) {
      send("modificar_material", { tablaMateriales: tablaMateriales.KEY, id: d.id, campo: f, valor: d[f], valores: d });
    } else {
      send("modificar_facturacion", { tablaMateriales: tablaMateriales.KEY, id: d.id, campo: f, valor: d[f], valores: d });
    }

  });
}


let PlanificacionEntradasAcciones;

window.addEventListener("load", () => {
  PlanificacionEntradasAcciones = {
    title:"Acciones", width:100, headerSort:false, hozAlign:"center",
    formatter: getFormatterPlanificacionEntradasAcciones,
    cellClick: getCellClick,
  };
});

function getFormatterPlanificacionEntradasAcciones(cell) {
  const d = cell.getRow().getData();
  return `<button class="btn btn-sm btn-outline-primary" data-action-row="planificacion_entradas"><i class="bi bi-file-earmark-arrow-up"></i></button>` +
    `<button class="btn btn-sm btn-outline-danger" data-action-row="borrar"><i class="bi bi-trash"></i></button>`;
}



/////////////////// SINCRONIZACIÓN COLUMNAS ///////////////////
function agregarSincronizacionTablas(masterTable, slaveTable) {

  masterTable.on("tableBuilt", (...a) => {

    masterTable.on("columnResized", (column) => {
      syncGroupWidthsByTitle(masterTable, slaveTable, column);
    });

    masterTable.on("renderComplete", () => {
      syncGroupWidthsByTitle(masterTable, slaveTable);
    });

    let lock = false;

    masterTable.on("scrollHorizontal", function(left){
      if (lock) return;
      lock = true;
      const slaveHolder  = slaveTable.element?.querySelector(".tabulator-tableholder");
      slaveHolder.scrollLeft = left;
      lock = false;
    });
    slaveTable.on("scrollHorizontal", function(left){
      if (lock) return;
      lock = true;
      const masterHolder = masterTable.element?.querySelector(".tabulator-tableholder");
      masterHolder.scrollLeft = left;
      lock = false;
    });
  });
}

const ColumnasTablasPlanificacionEntradas = {"Identificación": "tipo_material", "Totales": {"total_pactados": "total_pactados", "total_descontar": "total_descontar", "total_previstos": "total_previstos", "total_entregados": "total_entregados"},
"Enero":"enero","Febrero":"febrero","Marzo":"marzo","Abril":"abril","Mayo":"mayo","Junio":"junio","Julio":"julio","Agosto":"agosto","Septiembre":"septiembre","Octubre":"octubre","Noviembre":"noviembre","Diciembre":"diciembre",
"Acciones": ""};

function syncGroupWidthsByTitle(masterTable, slaveTable, column=null) {
  const columnas = masterTable.getColumnLayout();
  let col_cambiada = column ? column.getParentColumn().getDefinition().title : null;
  columnas.forEach(col => {
    if (column && col.title !== col_cambiada) return;
    let destino = ColumnasTablasPlanificacionEntradas[col.title];
    try {
      if (destino) {
        if (typeof(destino) === "object" && column) {
            col_cambiada = column.getField();
            destino = destino[col_cambiada];
            const slaveCol = slaveTable.getColumn(destino);
            if (slaveCol) {
              const width = column.getWidth();
              slaveCol.updateDefinition({ width: width });
          }
        } else {
          const slaveCol = slaveTable.getColumn(destino);
          if (slaveCol) {
            const totalWidth = col.columns.reduce((acc, subCol) => acc + (subCol.visible ? Number(subCol.width) : 0), 0);
            slaveCol.updateDefinition({ width: totalWidth });
          }
        }
      }
    } catch (e) {
      console.error("Error sincronizando columna:", destino, e);    
    }
  });
  //slaveTable.redraw(true);
}
