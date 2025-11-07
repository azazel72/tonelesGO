// ====== CREAR VENTANA ENTRADAS ======
function openEntradasWin(datos = []) {
  const KEY = "entradas";

  if (REUSE_SINGLE && windowsRegistry.has(KEY)) {
    const { wb, table } = windowsRegistry.get(KEY);
    if (datos.length > 0) {
      console.log(datos[0]);
      table.replaceData(datos);
    }
    wb.show();
    wb.focus();
    return wb;
  }

  const title = "Planificador de entradas";
  
  const columns = crearColumnasEntradas(DATOS.maestros.proveedores);

  const options = {
    winbox: {
      x: "center",
      y: "center",
      width: "800px",
      height: "520px",
    }
  };

  // Contenedor del contenido
  const mount = document.createElement("div");
  mount.style.height = "100%";
  mount.style.display = "flex";
  mount.style.flexDirection = "column";

  // Cabecera simple
  const header = document.createElement("div");
  header.className = "p-2 border-bottom d-flex gap-2 align-items-center";
  header.innerHTML = `
    <button class="btn btn-sm btn-outline-secondary"><span id="u-cargar-entradas">Consultar </span>
    <input id='u-cargar-entradas-input' class='text-center' type='number' min='1970' max='2199'></input>
    </button>
    <div class="ms-auto d-flex gap-2">
    <button id="u-add-providers" class="btn btn-sm btn-outline-success">Actualizar proveedores</button>
    </div>
  `;
  mount.appendChild(header);
  header.querySelector("#u-cargar-entradas-input").value = new Date().getFullYear();

  // Zona tabla
  const tableEl = document.createElement("div");
  tableEl.style.flex = "1 1 auto";
  tableEl.style.minHeight = "0";
  mount.appendChild(tableEl);

  const tableEl2 = document.createElement("div");
  tableEl2.style.flex = "1 1 auto";
  tableEl2.style.minHeight = "0";
  mount.appendChild(tableEl2);

  console.log(columns);




  // Tabulator
  const tabla = new Tabulator(tableEl, {
    height: "100%",
    layout: "fitColumns",
    index: "id",
    columns: columns,
    data: datos,
    /*
    persistenceID: `${KEY}-table`,
    persistence:{
      sort:true,
      filter:true,
      columns:true,
    },*/
    placeholder: "Sin datos",
    columnDefaults: { editable:true, editor:"input", headerHozAlign:"center" },
    // Pie de tabla visible
    footerElement: "<div class='pie-totales'>Totales en el pie (suma por columna)</div>",
    });

  tabla.datos = datos;

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
});

  const tabla2 = new Tabulator(tableEl2, {
    height: "100%",
    layout: "fitColumns",
    index: "id",
    columns: columns,
    data: datos,
    /*
    persistenceID: `${KEY}-table`,
    persistence:{
      sort:true,
      filter:true,
      columns:true,
    },*/
    placeholder: "Sin datos",
    columnDefaults: { editable:true, editor:"input", headerHozAlign:"center" },
    // Pie de tabla visible
    footerElement: "<div class='pie-totales'>Totales en el pie (suma por columna)</div>",
    });

  tabla2.datos = datos;


// Ventana
  const wb = new WinBox({
    title: title,
    root: document.getElementById("escritorio"),
    top: 56,
    right: 0,
    bottom: 40,
    left: 0,
    mount: mount,
    onclose: () => {
      if (CLOSE_PRESERVES_STATE) { wb.hide(); return true; } // oculta, no destruye
      windowsRegistry.delete(KEY); // destruye: borra del registro
    },
    ...options.winbox,
  });

  // Botones cabecera
  header.querySelector("#u-cargar-entradas")?.addEventListener("click", () => {
    cargar_entradas(wb, tabla);
  });
  header.querySelector("#u-add-providers").addEventListener("click", async () => {
    agregar_entradas_proveedores(wb, tabla);
  });
  // Guarda en registro (para reusar)
  windowsRegistry.set(KEY, { wb, table: tabla });

  wb.maximize();
  
  return wb;
}


function cargar_entradas(wb, tabla) {
  var input = document.getElementById('u-cargar-entradas-input');
  if (!input.checkValidity()) {
    alert("Año inválido");
    input.focus();
    return;
  }
  send("cargar_entradas", { año: input.value });
}

function mostrar_entradas(response) {
    if (response.data && windowsRegistry.has("entradas")) {
      const { wb, table } = windowsRegistry.get("entradas");
      openEntradasWin(response.data.plan_camiones || []);
    }
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
function crearColumnasEntradas(proveedores){
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
  ];
}


