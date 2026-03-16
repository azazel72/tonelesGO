// ======= BOTONES DE LA COLUMNA DE ACCIONES EN TABLAS =======
async function getCellClick(e, cell) {
  e.preventDefault();
  console.log("click en acciones");
  const action = e.target.closest("button")?.getAttribute("data-action-row");
  const tabla = cell.getTable();
  const storeKey = tabla.DATA_STORE || "maestros";
  const store = DATOS?.[storeKey] ?? null;
  const maestro = store?.[tabla.KEY] ?? null;
  const row = cell.getRow();
  switch (action) {
    case "guardar":
      const datos = row.getData();
      respuesta = await wsRequest("insertar_maestro", { tabla: tabla.KEY, ...datos });
      console.log(respuesta);
      if (respuesta?.id) {
        if (maestro) {
          maestro[respuesta.id] = respuesta;
        }
        row.update(respuesta);
        row.reformat();
        row.getElement().classList.remove('nuevo-registro');
        if (tabla.KEY === "pedidos") {
          actualizarLineasFabricacionEditorOrdenes?.();
        }
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
          if (maestro) {
            delete maestro[id];
          }
          row.delete();
          if (tabla.KEY === "pedidos") {
            actualizarLineasFabricacionEditorOrdenes?.();
          }
        }
      } else {
        row.delete();
      }
      break;
    case "planificacion_entradas":
      {
        const data = row.getData();
        console.log("Abrir gestion de planificacion de entradas para evento ID", data?.id);
        openListadoEntradasPlanificacionWin({
          año: data?.["año"],
          proveedor_id: data?.proveedor_id,
          forceReload: true,
        });
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
      {
        const key = tabla.KEY;
        const par = windowsRegistry.get(key);
        if (par?.wb) {
          par.wb.hide();
          windowsRegistry.delete(key);
        }
        window.__reloadKey = key;
        if (tabla.DATA_STORE === "fabricacion") {
          send("fabricacion", {});
        } else {
          send("maestros", {});
        }
      }
      break;
    case "u-add":
      if (tabla.element.querySelector('.nuevo-registro')) {
        alert("Por favor, complete el registro nuevo antes de crear otro.");
        return;
      }
      {
        const nuevosDatos = tabla.KEY === "pedidos" ? { destino: "CLIENTE" } : {};
        const rowComp = await tabla.addRow(nuevosDatos, true);
        rowComp.scrollTo("center", true);
        rowComp.getElement().classList.add('nuevo-registro');
      }
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
                    col.updateDefinition({
                      headerFilter: "input",
                    });
                  }
                }
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
    case "u-export-excel":
      if (!window.XLSX) {
        alert("No está cargada la librería de Excel.");
        return;
      }
      tabla.download("xlsx", `${obtenerNombreDescargaTabla(tabla)}.xlsx`, {
        sheetName: obtenerNombreHojaExcel(tabla),
      });
      break;
    case "u-export-pdf":
      if (!window.jspdf?.jsPDF) {
        alert("No está cargada la librería de PDF.");
        return;
      }
      tabla.download("pdf", `${obtenerNombreDescargaTabla(tabla)}.pdf`, {
        orientation: "landscape",
        title: tabla.KEY || "Datos",
        autoTable: {
          styles: { fontSize: 8 },
          headStyles: { fillColor: [52, 58, 64] },
        },
      });
      break;
  }
}






