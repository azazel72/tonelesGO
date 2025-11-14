// ======= BOTONES DE LA COLUMNA DE ACCIONES EN TABLAS =======
async function getCellClick(e, cell) {
  e.preventDefault();
  console.log("click en acciones");
  const action = e.target.closest("button")?.getAttribute("data-action-row");
  const tabla = cell.getTable();
  const row = cell.getRow();
  switch (action) {
    case "guardar":
      const datos = row.getData();
      respuesta = await wsRequest("insertar_maestro", { tabla: tabla.KEY, ...datos });
      console.log(respuesta);
      if (respuesta?.id) {
        DATOS.maestros[tabla.KEY][respuesta.id] = respuesta;
        row.update(respuesta);
        row.reformat();
        row.getElement().classList.remove('nuevo-registro');
      } else {
        row.delete();
        alert("Error al guardar el registro.");
      }
      break;
    case "borrar":
      const id = row.getData().id;
      if (id) {
        if (!confirm(`¿Eliminar ID ${id}?`)) return;
        respuesta = await wsRequest("eliminar_maestro", { tabla: tabla.KEY, id: id });
        if (respuesta?.id == id) {
          row.delete();
        }
      } else {
        row.delete();
      }
      break;
  }
}

// ====== EVENTOS DE CABECERA DE TABLAS =======
async function eventoClickCabecera(e, tabla, cabecera) {
  const btn = e.target.closest("button");
  if (!btn) return;
  e.preventDefault();
  btn.classList.add("disabled", "pe-none");
  setTimeout(() => btn.classList.remove("disabled", "pe-none"), 500);
  switch (btn.id) {
    case "u-reload":
      tabla.redraw(true); 
      break;
    case "u-add":
      if (tabla.element.querySelector('.nuevo-registro')) {
        alert("Por favor, complete el registro nuevo antes de crear otro.");
        return;
      }
      const rowComp = await tabla.addRow({}, true);
      rowComp.scrollTo("center", true);
      rowComp.getElement().classList.add('nuevo-registro');
      break;
    case "u-filter":
      activo = btn.getAttribute("aria-pressed") === "true";
      tabla.getColumns().forEach(col => {
        console.log(col);
        if (col.getElement().classList.contains("filtrable")) {
          if (activo) {
            switch (col.getDefinition()?.editor ?? "input") {
              case "tickCross":
                col.updateDefinition({
                  headerFilter: "list",
                  headerFilterParams: {
                    values: {
                      "": "Todos",   // <-- sin filtro
                      "true": "Sí",
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
                col.updateDefinition({
                  headerFilter: "input", //col.getDefinition()?.editor ?? "input",        // o "select" según columna or list
                });
            }
          } else {
            col.setHeaderFilterValue("");
            col.updateDefinition({
              headerFilter: false,
            });
          }
        }
      });
      tabla.element.querySelector(".tabulator-header-filter input")?.focus();
      break;
    case "u-editar":
      tabla.options.editable = btn.getAttribute("aria-pressed") === "true";
      break;
  }
}
