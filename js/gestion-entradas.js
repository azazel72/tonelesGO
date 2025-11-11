// ====== CREAR VENTANA ENTRADAS ======
function openEntradasWin() {
  let wb = comprobarVentanaAbierta("entradas");
  if (wb) return wb;

  const configuracionEntradas = {
    KEY: "entradas",
    winbox: {
      tipo: "entradas",
      options: {
        title: "Planificador de entradas",
        x: 0,
        y: 56,
        width: "100%",
        height: "100%",
      }
    },
    tabulator: {
      entradas: {
        options: {
          columns: crearColumnasEntradas(DATOS.maestros.proveedores),
          data: DATOS.entradas.planificacion || [],
          columnDefaults: { editable:true, editor:"input", headerHozAlign:"center" },
          footerElement: "<div class='pie-totales'>Totales en el pie (suma por columna)</div>",
        },
      },
      materiales: {
        options: {
          columns: crearColumnasMateriales(),
          data: DATOS.entradas.plan_materiales || [],
        },
      },
    },
  }

  wb = crearVentanaEntradas(configuracionEntradas);

  wb.maximize();
  
  return wb;
}


// ====== MUESTRA LA VENTANA DE ENTRADAS ======
function mostrar_entradas(response) {
  console.log(response);
  DATOS.entradas.plan_camiones = response.data?.plan_camiones || [];
  DATOS.entradas.plan_facturacion = response.data?.plan_facturacion || {};
  DATOS.entradas.plan_materiales = response.data?.plan_materiales || [];
  DATOS.entradas.planificacion = Object.values(DATOS.entradas.plan_camiones || {});
  DATOS.entradas.desglose = [DATOS.entradas.plan_facturacion, ...DATOS.entradas.plan_materiales];
  console.log(DATOS.entradas.planificacion);
  console.log(DATOS.entradas.desglose);
  DATOS.entradas.planificacion.push({})

    if (response.data && windowsRegistry.has("entradas")) {
      const { wb, table } = windowsRegistry.get("entradas");
      console.log(table);
      const tablaEntradas = table[0];
      const tablaMateriales = table[1];
      tablaEntradas.setData(DATOS.entradas.planificacion);
      tablaMateriales.setData(DATOS.entradas.desglose);
      openEntradasWin();
    }
}

// ====== ACCIONES BOTONES CABECERA ======
function cargar_entradas(wb, tabla) {
  var input = document.getElementById('u-cargar-entradas-input');
  if (!input.checkValidity()) {
    alert("Año inválido");
    input.focus();
    return;
  }
  send("cargar_entradas", { año: input.value });
}
function agregar_entradas_proveedores(wb, tabla) {
  var input = document.getElementById('u-cargar-entradas-input');
  if (!input.checkValidity()) {
    alert("Año inválido");
    input.focus();
    return;
  }
  send("agregar_entradas_proveedores", { año: input.value });
}


// ====== FIN CREAR VENTANA ENTRADAS ======

// --- UTILIDADES ---

function sumMeses(data, sufijo){ // sufijo: "previsto" | "confirmado"
  return MESES.reduce((acc,[pre]) => acc + (Number(data[`${pre}_${sufijo}`]) || 0), 0);
}

// === construcción de columnas ===
function crearColumnasEntradas(proveedores) {
  // Grupo Identificación (sin ID visible)
  const identificacion = {
    title: "Identificación",
    frozen:true,
    headerSort: false,
    columns: [
      { title: "ID", field: "id", visible: false },                // oculto
      {
        title: "Proveedor", field: "proveedor_id", width: 200,
        editable: false, cssClass: "col-proveedor",
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
  const totalesEntrada = {
    title: "Totales",
    frozen:true,
    headerSort: false,
    columns: [
      { title: "Pa", field: "total_pactados", hozAlign: "right", cssClass:"col-pactados",
        formatter: (cell) => {
          const v = Number(cell.getValue()) || 0;
          return v;
        },
        bottomCalc:"sum", bottomCalcParams:{precision:false} },
      { title: "De", field: "total_descontar", hozAlign: "right", cssClass:"col-descontar",
        formatter: (cell) => {
          const v = Number(cell.getValue()) || 0;
          return v;
        },        
        bottomCalc:"sum", bottomCalcParams:{precision:false} },
      {
        title:"Pr", field:"total_previstos", hozAlign:"right",
        editable:false, cssClass:"col-total-previstos",
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
        title:"En", field:"total_entregados", hozAlign:"right",
        editable:false, cssClass:"col-total-entregados",
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
      { title:"P", field:`${pre}_previsto`, hozAlign:"right",
        formatter: (cell) => {
          const v = Number(cell.getValue()) || 0;
          return v;
        },
        cssClass:"col-previsto", bottomCalc:"sum", bottomCalcParams:{precision:false} },
      { title:"C", field:`${pre}_confirmado`, hozAlign:"right",
        formatter: (cell) => {
          const v = Number(cell.getValue()) || 0;
          return v;
        },
        cssClass:"col-confirmado", bottomCalc:"sum", bottomCalcParams:{precision:false} },
    ],
  }));

  return [
    identificacion,
    totalesEntrada,
    ...gruposMeses,
    CeldaAcciones,
  ];
}

function crearColumnasMateriales() {
   // Grupo Identificación (sin ID visible)
  const columns = [
    { title: "ID", frozen: true, field: "id", visible: false },
    { title: "Material", frozen: true, field: "tipo_material", width: 200,
      accessor: (value, data, type, params, column, row) =>{
        console.log(value, data, type, params, column, row);  
        return value >= params.legalAge;
      },
    },
    { title: "Año", frozen: true, field: "año", visible: false },
    { title: "Pa", frozen: true, field: "total_pactados", hozAlign: "right", cssClass:"col-pactados",
      formatter: (cell) => {
        const v = Number(cell.getValue()) || 0;
        return v;
      },
    },
    { title: "De", frozen: true, field: "total_descontar", hozAlign: "right", cssClass:"col-descontar",
      formatter: (cell) => {
        const v = Number(cell.getValue()) || 0;
        return v;
      },        
    },
    {
      title:"Pr", frozen: true, field:"total_previstos", hozAlign:"right", cssClass:"col-total-previstos",
      formatter: (cell) => {
        return "TOTAL";
      },
    },
    {
      title:"En", frozen: true, field:"total_entregados", hozAlign:"right", cssClass:"col-total-entregados",
    },        
    { title:"Enero", field:"enero", hozAlign:"right" },
    { title:"Febrero", field:"febrero", hozAlign:"right" },
    { title:"Marzo", field:"marzo", hozAlign:"right" },
    { title:"Abril", field:"abril", hozAlign:"right" },
    { title:"Mayo", field:"mayo", hozAlign:"right" },
    { title:"Junio", field:"junio", hozAlign:"right" },
    { title:"Julio", field:"julio", hozAlign:"right" },
    { title:"Agosto", field:"agosto", hozAlign:"right" },
    { title:"Septiembre", field:"septiembre", hozAlign:"right" },
    { title:"Octubre", field:"octubre", hozAlign:"right" },
    { title:"Noviembre", field:"noviembre", hozAlign:"right" },
    { title:"Diciembre", field:"diciembre", hozAlign:"right" },
    CeldaAcciones,
  ];

  return columns;
}

function crearVentanaEntradas(configuracion, show=true) {
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
  const tablaEntradas = crearTabla(configuracion.KEY, contenedor, configuracion.tabulator.entradas.options);
  const tablaMateriales = crearTabla(configuracion.KEY, contenedor, configuracion.tabulator.materiales.options);

  windowsRegistry.set(configuracion.KEY, { wb: wb, table: [tablaEntradas, tablaMateriales] });
  console.log(windowsRegistry);

  agregarEventosWinBox(wb, tablaEntradas, cabecera, configuracion);
  agregarEventosTablaEntradas(wb, tablaEntradas, cabecera, configuracion);
  agregarEventosTablaMateriales(wb, tablaMateriales, cabecera, configuracion);
/*
  tablaEntradas.on("tableBuilt", () => initialSync(tablaEntradas, tablaMateriales));
  tablaEntradas.on("columnResized", (column) => {
    const field = column.getField();              // p.ej. "ene_exp" o "ene_ent"
    const m = field && field.split("_")[0];       // "ene"
    if (m) setBottomMonthWidth(m);
  });
*/
  return wb;
}

function agregarEventosTablaEntradas(wb, tabla, cabecera, configuracion) {
  tabla.on("cellEdited", (cell) => {
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
    send("modificar_entrada_planificacion", { id: d.id, campo: f, valor: d[f] });
  });

  cabecera.querySelector("#u-cargar-entradas")?.addEventListener("click", () => {
    cargar_entradas(wb, tabla);
  });
  cabecera.querySelector("#u-add-providers").addEventListener("click", async () => {
    agregar_entradas_proveedores(wb, tabla);
  });
  cabecera.querySelector("#u-cargar-entradas-input").value = new Date().getFullYear();
}

function agregarEventosTablaMateriales(wb, tablaMateriales, cabecera, configuracion) {


}

// helper: suma anchos de las dos subcolumnas de un mes
function setBottomMonthWidth(topTable, botTable, shortMonth, longMonth){
  const exp = topTable.getColumn(`${shortMonth}_previsto`);
  const ent = topTable.getColumn(`${shortMonth}_confirmado`);
  if (!exp || !ent) return;
  const w = exp.getWidth() + ent.getWidth();
  const col = botTable.getColumn(longMonth);
  col && col.setWidth(w);
}

// sincroniza todas al construir
function initialSync(topTable, botTable){
  [["ene","enero"],["feb","febrero"],["mar","marzo"],["abr","abril"],["may","mayo"],["jun","junio"],["jul","julio"],["ago","agosto"],["sep","septiembre"],["oct","octubre"],["nov","noviembre"],["dic","diciembre"]]
    .forEach(([shortMonth, longMonth]) => setBottomMonthWidth(topTable, botTable, shortMonth, longMonth));
  // columnas fijas iguales en ambas
  const fijoTop = topTable.getColumn("producto");
  const fijoBot = botTable.getColumn("producto");
  if (fijoTop && fijoBot) fijoBot.setWidth(fijoTop.getWidth());
}
