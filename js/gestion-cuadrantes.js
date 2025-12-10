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
    { title: "Jue", field: jue, formatter: formatterColumnasCuadrante, variableHeight: true, cssClass: "celda-cuadrante"},
    { title: "Vie", field: vie, formatter: formatterColumnasCuadrante, variableHeight: true, cssClass: "celda-cuadrante"},
    { title: "Lun", field: lun, formatter: formatterColumnasCuadrante, variableHeight: true, cssClass: "celda-cuadrante"},
    { title: "Mar", field: mar, formatter: formatterColumnasCuadrante, variableHeight: true, cssClass: "celda-cuadrante"},
    { title: "Mié", field: mie, formatter: formatterColumnasCuadrante, variableHeight: true, cssClass: "celda-cuadrante"},
  ];
  return columnas;
}

function formatterColumnasCuadrante(cell, formatterParams, onRendered) {
  
  onRendered(function() {
    const el = cell.getElement();
    const value = cell.getValue() || [];

    el.innerHTML = "";

    // Pintar cada pill
    value.forEach((detalle, index) => {
      debugger;
      const pill = crearElemento("div",
        {
          id: detalle.id,
          class: "usuario-pill badge m-1 p-2",
          draggable: "true",
          "data-user-id": detalle.user_id,
          content: buscar_usuario_por_id(detalle.user_id)?.nombre ?? "Usuario no encontrado",
          style: getPillColorByIndex(detalle.user_id),
        }
      );

      // info para el drag
      pill.dataset.id = detalle.id;
      pill.dataset.userId = detalle.user_id;
      pill.dataset.nombre = buscar_usuario_por_id(detalle.user_id)?.nombre ?? "Usuario no encontrado";
      pill.dataset.rowId = cell.getRow().getData().id;
      pill.dataset.field = cell.getField();
      pill.dataset.index = index;

      console.log(pill.dataset.userId, pill.dataset.nombre, pill.dataset.rowId, pill.dataset.field)

      pill.addEventListener("dragstart", (e) => {
        console.log(pill.dataset.userId, pill.dataset.nombre, pill.dataset.rowId, pill.dataset.field)
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("tipo", "pill-cuadrante");
        e.dataTransfer.setData("userId", pill.dataset.userId);
        e.dataTransfer.setData("nombre", pill.dataset.nombre);
        e.dataTransfer.setData("rowId", pill.dataset.rowId);
        e.dataTransfer.setData("field", pill.dataset.field);
        console.log(pill.dataset.userId, pill.dataset.nombre, pill.dataset.rowId, pill.dataset.field);
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

function manejarDropEnCelda(e, cellDestino) {
  const id = e.dataTransfer.getData("id");
  const userId = e.dataTransfer.getData("userId");
  if (!userId) return;
  const tipo = e.dataTransfer.getData("tipo");
  const nombre = e.dataTransfer.getData("nombre");
  const rowIdOrigen = e.dataTransfer.getData("rowId");
  const fieldOrigen = e.dataTransfer.getData("field");

  const tabla = cellDestino.getRow().getTable();
  const fieldDestino = cellDestino.getField();
  const rowDestino = cellDestino.getRow();
  const dataRowDestino = rowDestino.getData();

  if (rowIdOrigen == rowDestino.getData().id && fieldOrigen == fieldDestino) {
    console.log("Mismo origen y destino, no hacer nada");
    return;
  }

  const arrDestino = Array.isArray(dataRowDestino[fieldDestino]) ? dataRowDestino[fieldDestino] : [];

  let accion = "actualizar";

  //if (tipo === "pill-cuadrante") {
  if (rowIdOrigen && fieldOrigen) {
    const rowOrigen = tabla.getRow(rowIdOrigen);
    const dataOrigen = rowOrigen.getData();
    const arrOrigen = Array.isArray(dataOrigen[fieldOrigen]) ? dataOrigen[fieldOrigen] : [];

    // quitar del origen
    const nuevaOrigen = arrOrigen.filter(p => String(p.id) !== String(userId));
    rowOrigen.update({ [fieldOrigen]: nuevaOrigen });
  } else {
    accion = "insertar";
  }

  let detalle = null;

  // evitar duplicados en destino
  const yaExiste = arrDestino.some(p => String(p.id) === String(userId));
  if (!yaExiste) {
    switch (accion) {
      case "actualizar":
        detalle = actualizarDetalleCuadrante({
          id: id,
          cuadrante_id: DATOS.cuadrante.id,
          puesto_id: dataRowDestino.id,
          fecha: fieldDestino,
          usuario_id: Number(userId),
        });
        break;
      case "insertar":
        detalle = insertarDetalleCuadrante({
          cuadrante_id: DATOS.cuadrante.id,
          puesto_id: dataRowDestino.id,
          fecha: fieldDestino,
          usuario_id: Number(userId),
        });
        break;
    }
    if (!detalle) {
      console.error("Error al procesar el detalle del cuadrante");
      return;
    }
    const nuevaDestino = arrDestino.concat(detalle);
    rowDestino.update({ [fieldDestino]: nuevaDestino });
    //faltaria actualizar el cuadrante en DATOS.cuadrante.detalles
  }
  //cellDestino.checkHeight();
  //rowDestino.normalizeHeight(); 
}


function crearDatosCuadrantes(cuadrante) {
  if (!cuadrante?.fecha_inicio) return [];

  const jue = sumarDiasYYYYMMDD(cuadrante?.fecha_inicio, 0);
  const vie = sumarDiasYYYYMMDD(cuadrante?.fecha_inicio, 1);
  const lun = sumarDiasYYYYMMDD(cuadrante?.fecha_inicio, 4);
  const mar = sumarDiasYYYYMMDD(cuadrante?.fecha_inicio, 5);
  const mie = sumarDiasYYYYMMDD(cuadrante?.fecha_inicio, 6);
  console.log("XXX", cuadrante);
  console.log(jue);
  const datos = Object.values(DATOS.maestros.puestos_trabajo).map(puesto => ({
    id: puesto.id,
    nombre: puesto.nombre,
    [jue]: cuadrante.detalles.filter(d => d.puesto_id === puesto.id && d.fecha === jue).map(d => {
      return DATOS.maestros.usuarios[d.usuario_id];
    }),
    [vie]: cuadrante.detalles.filter(d => d.puesto_id === puesto.id && d.fecha === vie).map(d => {
      return DATOS.maestros.usuarios[d.usuario_id];
    }),
    [lun]: cuadrante.detalles.filter(d => d.puesto_id === puesto.id && d.fecha === lun).map(d => {
      return DATOS.maestros.usuarios[d.usuario_id];
    }),
    [mar]: cuadrante.detalles.filter(d => d.puesto_id === puesto.id && d.fecha === mar).map(d => {
      return DATOS.maestros.usuarios[d.usuario_id];
    }),
    [mie]: cuadrante.detalles.filter(d => d.puesto_id === puesto.id && d.fecha === mie).map(d => {
      return DATOS.maestros.usuarios[d.usuario_id];
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
          "data-user-id": element.id,
          "data-nombre": element.nombre,
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
      e.dataTransfer.setData("userId", pill.dataset.userId);
      e.dataTransfer.setData("tipo", "pill-listado");
      e.dataTransfer.setData("nombre", pill.dataset.nombre);
    }
  });
  listaUsuarios.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  });
  listaUsuarios.addEventListener("drop", (e) => {
    e.preventDefault();
    console.log("Buscar el origen y eliminarlo de la tabla");

    const tipo = e.dataTransfer.getData("tipo");
    const userId = e.dataTransfer.getData("userId");
    const rowIdOrigen = e.dataTransfer.getData("rowId");
    const fieldOrigen = e.dataTransfer.getData("field");

    if (tipo !== "pill-cuadrante" || !rowIdOrigen || !fieldOrigen || !userId) return;

    const tabla = windowsRegistry.get(key).table;
    const rowOrigen = tabla.getRow(rowIdOrigen);
    const dataOrigen = rowOrigen.getData();
    const arrOrigen = Array.isArray(dataOrigen[fieldOrigen]) ? dataOrigen[fieldOrigen] : [];

    // quitar del cuadrante
    const nuevaOrigen = arrOrigen.filter(p => String(p.id) !== String(userId));
    rowOrigen.update({ [fieldOrigen]: nuevaOrigen });
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