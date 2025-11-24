console.log("gestion-cuadrantes.js loaded");

// ====== CREAR VENTANA CUADRANTES ======
function openCuadrantesWin() {
  let wb = comprobarVentanaAbierta("cuadrantes");
  if (wb) return wb;

  const configuracionCuadrantes = {
    KEY: "cuadrantes",
    winbox: {
      tipo: "cuadrantes",
      options: {
        title: "Planificador de puestos de trabajo",
        x: 0,
        y: 56,
        width: "100%",
        height: "100%",
        background: "#343a40",
      }
    },
    tabulator: {
      height: "auto",
      layout: "fitColumns",
      columns: crearColumnasCuadrantes(DATOS.cuadrantes).map(col => ({
        ...col,
        formatter: (cell) => {
          const el = cell.getElement();   // elemento real de la celda Tabulator

          el.classList.add("celda-cuadrante");

          el.addEventListener("dragenter", (e) => {
            e.preventDefault();                      // muy importante
            el.classList.add("drop-target");
          });

          el.addEventListener("dragover", (e) => {
            e.preventDefault();                      // sin esto no hay drop
            e.dataTransfer.dropEffect = "copy";
            // por si acaso, mantener la clase:
            el.classList.add("drop-target");
          });

          el.addEventListener("dragleave", (e) => {
            // cuando el ratón sale de la celda, quitamos el estilo
            el.classList.remove("drop-target");
          });

          el.addEventListener("drop", (e) => {
            e.preventDefault();
            el.classList.remove("drop-target");

            const id = e.dataTransfer.getData("usuario_id");
            const nombre = e.dataTransfer.getData("usuario_nombre");
            if (!id) return;

            const pill = document.createElement("span");
            pill.className = "badge rounded-pill m-1";
            pill.textContent = nombre;

            const bg = getPillColorByIndex(Number(id));       // tu función
            const fg = getContrastTextColor(bg);              // tu función
            pill.style.backgroundColor = bg;
            pill.style.color = fg;

            el.appendChild(pill);

            guardarAsignacion(id, cell.getRow().getData().id, cell.getField());
          });

          return "";
        },
      })),
      data: Object.values(DATOS.maestros?.puestos_trabajo ?? {}),
    },
  }

  wb = crearVentanaCuadrantes(configuracionCuadrantes);

  wb.maximize();
  
  return wb;
}

function guardarAsignacion(usuarioId, puestoId, fecha) {
    fetch("/api/cuadrante-detalle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            usuario_id: usuarioId,
            puesto_id: puestoId,
            fecha: fecha
        })
    });
}


// ====== MUESTRA LA VENTANA DE CUADRANTES ======
function mostrar_cuadrantes(response) {
  DATOS.cuadrantes = response.data ?? [];
  
  if (response.data && windowsRegistry.has("cuadrantes")) {
    const { wb, table } = windowsRegistry.get("cuadrantes");


    
    console.log(table);

    //tablaEntradas.setData(DATOS.cuadrantes.planificacion);
    
    openCuadrantesWin();
  }
}

// ====== FIN CREAR VENTANA ENTRADAS ======

// --- UTILIDADES ---

// === construcción de columnas ===
function crearColumnasCuadrantes(cuadrantes) {
  const columnas = [
    { title: "ID", field: "id", visible: false },
    { title: "Puesto", field: "nombre", width: 150, frozen: true },
    { title: "Jue", field: "nombre" },
    { title: "Vie", field: "nombre" },
    { title: "Lun", field: "nombre" },
    { title: "Mar", field: "nombre" },
    { title: "Mié", field: "nombre" },
  ];
  return columnas;
}

function crearVentanaCuadrantes(configuracion, show=true) {
   // CREACION DE WINBOX
  const contenedor = crearElemento("div", { class: "contenedor-winbox" });

  const plantilla = document.getElementById("plantilla_cuadrantes");
  const contenido = plantilla.content.cloneNode(true);
  contenedor.appendChild(contenido);

  const listaUsuarios = contenedor.querySelector("#listaUsuarios");
  completarEmpleadosCuadrantes(configuracion.KEY, listaUsuarios, DATOS.maestros.usuarios, configuracion);

  // Ventana
  const wb = crearWinBox(configuracion.KEY, contenedor, configuracion.winbox.options);
  if (show) {
    wb.show();
    wb.focus();
  }

  // Tabulator
  const tablaCuadrante = contenedor.querySelector("#tablaCuadrante");
  const tabla = crearTabla("cuadrantes", tablaCuadrante, configuracion.tabulator);

  windowsRegistry.set(configuracion.KEY, { wb: wb, table: tabla });

  agregarEventosCuadrantes(wb, configuracion, contenedor);

  /*
  tabla.element.addEventListener("dragover", e => { 
    console.log(e.target);
    e.preventDefault(); 
  
  });
  tabla.element.addEventListener("drop", e => { console.log(e.target) });
*/

  return wb;
}

function completarEmpleadosCuadrantes(key, listaUsuarios, usuarios, configuracion) {
  listaUsuarios.innerHTML = "";
  Object.values(usuarios).forEach(element => {
    if (element.empleado) {
      const pill = crearElemento("div",
        { value: element.id,
          class: "usuario-pill badge m-1 p-2",
          draggable: "true",
          "data-user-id": element.id,
          content: element.nombre,
          style: getPillColorByIndex(element.id),
        }
      );
      listaUsuarios.appendChild(pill);
    }
  });
  listaUsuarios.addEventListener("dragstart", (e) => {
    const pill = e.target.closest(".usuario-pill");
    if (pill) {
      e.dataTransfer.setData("usuario_id", pill.getAttribute("data-user-id"));
      //e.dataTransfer.setData("usuario_id", pill.dataset.userId); // alternativa
      e.dataTransfer.setData("usuario_nombre", pill.textContent.trim());
    }
  });
}

function agregarEventosCuadrantes(wb, configuracion, contenedor) {




/*
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
*/

  const input_fecha_cuadrantes = contenedor.querySelector('#u-cargar-cuadrantes-input');

  contenedor.querySelector("#u-cargar-cuadrantes")?.addEventListener("click", async () => {
    if (!input_fecha_cuadrantes.checkValidity()) {
      alert("Fecha inválida");
      input_fecha_cuadrantes.focus();
      return;
    }
    send("cargar_cuadrantes", { fecha: input_fecha_cuadrantes.value });
   
  });
  contenedor.querySelector("#u-actualizar-cuadrantes").addEventListener("click", async () => {
    if (!input_fecha_cuadrantes.checkValidity()) {
      alert("Fecha inválida");
      input_fecha_cuadrantes.focus();
      return;
    }
    send("actualizar_cuadrantes", { fecha: input_fecha_cuadrantes.value });
  });
  
  input_fecha_cuadrantes.value = obtenerAnteriorDiaSemana().toISOString().split("T")[0];
}

function obtenerAnteriorDiaSemana(dia_objetivo = 4, fecha = new Date()) {
    const d = new Date(fecha);
    const dia = d.getDay(); // 0=Dom, 1=Lun, 2=Mar, 3=Mié, 4=Jue, 5=Vie, 6=Sáb

    // Si es miércoles → lo devolvemos tal cual
    if (dia === dia_objetivo) return d;

    // Si es otro día, retroceder los días necesarios
    const diferencia = (dia - dia_objetivo + 7) % 7; 
    d.setDate(d.getDate() - diferencia);

    return d;
}

const PILL_COLORS = [
  "#e57373", "#f06292", "#ba68c8", "#9575cd", "#7986cb",
  "#64b5f6", "#4fc3f7", "#4dd0e1", "#4db6ac", "#81c784",
  "#aed581", "#dce775", "#fff176", "#ffd54f", "#ffb74d",
  "#ff8a65", "#d32f2f", "#c2185b", "#7b1fa2", "#512da8",
  "#303f9f", "#1976d2", "#0288d1", "#0097a7", "#00796b",
  "#388e3c", "#689f38", "#afb42b", "#fbc02d", "#ffa000",
  "#f57c00", "#e64a19", "#5d4037", "#455a64", "#8d6e63",
  "#90a4ae", "#c0ca33", "#00acc1", "#00897b"
];
function getPillColorByIndex(i) {
  const color_fondo = PILL_COLORS[i % PILL_COLORS.length];
  const color_texto = getContrastTextColor(color_fondo);
  //return { background: color_fondo, color: color_texto };
  return `background: ${color_fondo}; color: ${color_texto};`;
}

function getContrastTextColor(hexColor) {
  // hexColor tipo "#rrggbb"
  const hex = hexColor.replace("#", "");

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // YIQ: percepción humana de brillo
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;

  // si es claro → texto negro, si es oscuro → texto blanco
  return yiq >= 128 ? "#000000" : "#ffffff";
}
