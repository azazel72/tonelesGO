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
      columns: crearColumnasCuadrantes(DATOS.cuadrante),
      data: crearDatosCuadrantes(DATOS.cuadrante),
    },
  }

  wb = crearVentanaCuadrantes(configuracionCuadrantes);

  wb.maximize();
  
  return wb;
}

// ====== MUESTRA LA VENTANA DE CUADRANTES ======
function mostrar_cuadrantes(response) {
  DATOS.cuadrante = response.data ?? [];
  
  if (response.data && windowsRegistry.has("cuadrantes")) {
    const { wb, table } = windowsRegistry.get("cuadrantes");

    table.setColumns(crearColumnasCuadrantes(DATOS.cuadrante));
    table.setData(crearDatosCuadrantes(DATOS.cuadrante));
    
    openCuadrantesWin();
  }
}

// ====== FIN CREAR VENTANA CUADRANTES ======

// --- UTILIDADES ---

// === construcción de columnas ===
function crearColumnasCuadrantes(cuadrante) {
  const jue = sumarDiasYYYYMMDD(cuadrante?.fecha_inicio, 0);
  const vie = sumarDiasYYYYMMDD(cuadrante?.fecha_inicio, 1);
  const lun = sumarDiasYYYYMMDD(cuadrante?.fecha_inicio, 4);
  const mar = sumarDiasYYYYMMDD(cuadrante?.fecha_inicio, 5);
  const mie = sumarDiasYYYYMMDD(cuadrante?.fecha_inicio, 6);

  const columnas = [
    { title: "ID", field: "id", visible: false },
    { title: "Puesto", field: "nombre", width: 150, frozen: true },
    { title: titulo_con_fecha("Jue", jue), field: jue, formatter: formatterColumnasCuadrante, variableHeight: true, cssClass: "celda-cuadrante"},
    { title: titulo_con_fecha("Vie", vie), field: vie, formatter: formatterColumnasCuadrante, variableHeight: true, cssClass: "celda-cuadrante"},
    { title: titulo_con_fecha("Lun", lun), field: lun, formatter: formatterColumnasCuadrante, variableHeight: true, cssClass: "celda-cuadrante"},
    { title: titulo_con_fecha("Mar", mar), field: mar, formatter: formatterColumnasCuadrante, variableHeight: true, cssClass: "celda-cuadrante"},
    { title: titulo_con_fecha("Mié", mie), field: mie, formatter: formatterColumnasCuadrante, variableHeight: true, cssClass: "celda-cuadrante"},
  ];
  return columnas;
}

function formatterColumnasCuadrante(cell, formatterParams, onRendered) {
  
  onRendered(function() {
    const el = cell.getElement();
    const value = cell.getValue() || [];
    const field = cell.getField();
    const rowId = cell.getRow().getData().id;
    el.innerHTML = "";

    // Pintar cada pill
    value.forEach((detalle, index) => {
      if (!detalle?.usuario_id) {
        console.log(Array.isArray(detalle));
        console.log(detalle);
        console.log(detalle?.usuario_id ?? "NADA");
        return;
      }

      const pill = crearElemento("div",
        {
          class: "usuario-pill badge m-1 p-2",
          draggable: "true",
          content: detalle.empleado?.nombre ?? "Usuario no encontrado",
          style: getPillColorByIndex(detalle.usuario_id),
        }
      );
      // info para el drag
      pill.dataset.detalle = JSON.stringify(detalle);

      pill.addEventListener("dragstart", (e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("tipo", "pill-cuadrante");
        e.dataTransfer.setData("detalle", JSON.stringify(detalle));
      });

      el.appendChild(pill);
    });

    // Bind de eventos de drop en la celda (una sola vez por elemento DOM)
    if (!el.dataset.dndBound) {
      el.dataset.dndBound = "1";

      el.addEventListener("dragenter", (e) => {
        e.preventDefault();
        el.classList.add("drop-target");
      });

      el.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        el.classList.add("drop-target");
      });

      el.addEventListener("dragleave", () => {
        el.classList.remove("drop-target");
      });

      el.addEventListener("drop", (e) => {
        e.preventDefault();
        el.classList.remove("drop-target");
        manejarDropEnCelda(e, cell);
      });
    }
  });
 
  return "";
}

async function manejarDropEnCelda(e, cellDestino) {
  let origen = JSON.parse(e.dataTransfer.getData("detalle"));

  const tipo = e.dataTransfer.getData("tipo");
  if (!origen.usuario_id) return;

  const tabla = cellDestino.getRow().getTable();
  const fieldDestino = cellDestino.getField();
  const rowDestino = cellDestino.getRow();
  const dataRowDestino = rowDestino.getData();
  let valoresDestino = cellDestino.getValue() || [];

  if (valoresDestino.some(e => e.usuario_id == origen.usuario_id)) {
    console.log("Ya existe el usuario en destino (repetido o misma celda origen destino)");
    return;
  }

  let nuevoDetalle = null;

  //if (tipo === "pill-cuadrante") {
  if (origen.puesto_id && origen.fecha) {
    //moviendo pildora del cuadrante
    const rowOrigen = tabla.getRow(origen.puesto_id);
    const dataOrigen = rowOrigen.getData();
    const valoresOrigen = dataOrigen[origen.fecha] ?? [];

    nuevoDetalle = await actualizarDetalleCuadrante({
      id: origen.id,
      cuadrante_id: origen.cuadrante_id,
      puesto_id: dataRowDestino.id,
      fecha: fieldDestino,
      usuario_id: Number(origen.usuario_id),
    });

    // quitar de la celda origen
    const nuevosValoresOrigen = valoresOrigen.filter(p => String(p.usuario_id) !== String(origen.usuario_id));
    rowOrigen.update({ [origen.fecha]: nuevosValoresOrigen });
  } else {
    nuevoDetalle = await insertarDetalleCuadrante({
      cuadrante_id: DATOS.cuadrante.id,
      puesto_id: dataRowDestino.id,
      fecha: fieldDestino,
      usuario_id: Number(origen.usuario_id),
    });
  }

  if (!nuevoDetalle) {
    console.error("Error al procesar el detalle del cuadrante");
    return;
  }

  nuevoDetalle.empleado = DATOS.maestros.usuarios[origen.usuario_id];
  const nuevaDestino = valoresDestino.concat(nuevoDetalle);
  rowDestino.update({ [fieldDestino]: nuevaDestino });
}

function crearDatosCuadrantes(cuadrante) {
  if (!cuadrante?.fecha_inicio) return [];

  const jue = sumarDiasYYYYMMDD(cuadrante?.fecha_inicio, 0);
  const vie = sumarDiasYYYYMMDD(cuadrante?.fecha_inicio, 1);
  const lun = sumarDiasYYYYMMDD(cuadrante?.fecha_inicio, 4);
  const mar = sumarDiasYYYYMMDD(cuadrante?.fecha_inicio, 5);
  const mie = sumarDiasYYYYMMDD(cuadrante?.fecha_inicio, 6);
  const datos = Object.values(DATOS.maestros.puestos_trabajo).map(puesto => ({
    id: puesto.id,
    nombre: puesto.nombre,
    [jue]: cuadrante.detalles.filter(d => d.puesto_id === puesto.id && d.fecha === jue).map(d => {
      return {...d, empleado: DATOS.maestros.usuarios[d.usuario_id]};
    }),
    [vie]: cuadrante.detalles.filter(d => d.puesto_id === puesto.id && d.fecha === vie).map(d => {
      return {...d, empleado: DATOS.maestros.usuarios[d.usuario_id]};
    }),
    [lun]: cuadrante.detalles.filter(d => d.puesto_id === puesto.id && d.fecha === lun).map(d => {
      return {...d, empleado: DATOS.maestros.usuarios[d.usuario_id]};
    }),
    [mar]: cuadrante.detalles.filter(d => d.puesto_id === puesto.id && d.fecha === mar).map(d => {
      return {...d, empleado: DATOS.maestros.usuarios[d.usuario_id]};
    }),
    [mie]: cuadrante.detalles.filter(d => d.puesto_id === puesto.id && d.fecha === mie).map(d => {
      return {...d, empleado: DATOS.maestros.usuarios[d.usuario_id]};
    }),
  }));
  console.log(datos);
  return datos;
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

  return wb;
}

function completarEmpleadosCuadrantes(key, listaUsuarios, usuarios, configuracion) {
  listaUsuarios.innerHTML = "";
  Object.values(usuarios).sort((a, b) =>
    a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })
  ).forEach(element => {
    if (element.empleado) {
      const pill = crearElemento("div",
        { value: element.id,
          class: "usuario-pill badge m-1 p-2",
          draggable: "true",
          content: element.nombre,
          style: getPillColorByIndex(element.id),
        }
      );
      pill.dataset.detalle = JSON.stringify({ empleado: element, usuario_id: element.id });
      listaUsuarios.appendChild(pill);
    }
  });
  listaUsuarios.addEventListener("dragstart", (e) => {
    const pill = e.target.closest(".usuario-pill");
    if (pill) {
      e.dataTransfer.setData("tipo", "pill-listado");
      e.dataTransfer.setData("detalle", pill.dataset.detalle);
    }
  });
  listaUsuarios.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  });
  listaUsuarios.addEventListener("drop", async (e) => {
    e.preventDefault();

    const tipo = e.dataTransfer.getData("tipo");
    let detalle = JSON.parse(e.dataTransfer.getData("detalle"));

    if (tipo !== "pill-cuadrante" || !detalle.fecha || !detalle.puesto_id || !detalle.usuario_id || !detalle.id) return;

    const tabla = windowsRegistry.get(key).table;
    const rowOrigen = tabla.getRow(detalle.puesto_id);
    const valores = rowOrigen.getData()[detalle.fecha] ?? [];

    // quitar del cuadrante
    let respuesta = await eliminarDetalleCuadrante({id: detalle.id});

    console.log(respuesta, valores);
    const nuevosValores = valores.filter(p => String(p.id) !== String(respuesta.id));
    console.log(nuevosValores);
    rowOrigen.update({ [detalle.fecha]: nuevosValores });
  });

}

function agregarEventosCuadrantes(wb, configuracion, contenedor) {
  const input_fecha_cuadrantes = contenedor.querySelector('#u-cargar-cuadrantes-input');

  contenedor.querySelector("#u-cargar-cuadrantes")?.addEventListener("click", async () => {
    if (!input_fecha_cuadrantes.checkValidity()) {
      alert("Fecha inválida");
      input_fecha_cuadrantes.focus();
      return;
    }
    send("cargar_cuadrantes", { fecha: input_fecha_cuadrantes.value });
   
  });

  contenedor.querySelector("#u-color_empleados-input").addEventListener("change", async () => {
    document.querySelector("#contenedor-cuadrante").classList.toggle("mismo-color");
  });

  contenedor.querySelector("#u-ancho_empleados-input").addEventListener("change", async () => {
    document.querySelector("#contenedor-cuadrante").classList.toggle("mismo-ancho");
  });

  input_fecha_cuadrantes.value = obtenerAnteriorDiaSemana().toISOString().split("T")[0];
}



async function actualizarDetalleCuadrante(detalles) {
  let respuesta = await wsRequest("actualizar_detalle_cuadrante", detalles);
  console.log(respuesta);
  return respuesta;
}

async function insertarDetalleCuadrante(detalles) {
  console.log(detalles);
  let respuesta = await wsRequest("insertar_detalle_cuadrante", detalles);
  console.log(respuesta);
  return respuesta;
}

async function eliminarDetalleCuadrante(detalles) {
  let respuesta = await wsRequest("eliminar_detalle_cuadrante",  detalles);
  console.log(respuesta);
  return respuesta;
}


function respuesta_cuadrantes(msg) {
  console.log("Respuesta cuadrantes:", msg);
  // Aquí podríamos actualizar DATOS.cuadrante.detalles si es necesario
}