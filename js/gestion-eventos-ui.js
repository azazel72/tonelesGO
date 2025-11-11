// ======= BOTONES DE LA COLUMNA DE ACCIONES EN TABLAS =======
async function getCellClick(e, cell) {
  console.log("click en acciones");
  const action = e.target.closest("button")?.getAttribute("data-action-row");
  const tabla = cell.getTable();
  const tablaBD = tabla.options.ajaxURL.match(/table=([^&]+)/)[1];
  if (action === "crear") {
    const row = cell.getRow();
    const data = row.getData();
    try {
      const res = await fetch(`${BASE}?table=${tablaBD}`, {
        method: "POST",
        credentials:"same-origin",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error(await res.text());
      const wrap = await res.json();
      const created = wrap.data ?? wrap;

      row.update(created);
      const newRow = await tabla.addRow(row.getData());
      row.delete();

      //await newRow.getElement().scrollIntoView({ behavior: "smooth", block: "center" });
      await newRow.scrollTo("center", true);

      tabla.alert("Registro creado con éxito");
      setTimeout(()=>tabla.clearAlert(), 1200);
    } catch (err) {
      tabla.alert("Error: " + err.message);
      setTimeout(()=>tabla.clearAlert(), 2000);
    }
  } else if (action === "borrar") {
    const id = cell.getRow().getData().id;
    if (!confirm(`¿Eliminar ID ${id}?`)) return;
    try {
      const res = await fetch(`${BASE}?table=${tablaBD}&id=${encodeURIComponent(id)}`, {
        method:"DELETE",
        credentials:"same-origin",
      });
      if (!res.ok) return alert(await res.text());
      cell.getRow().delete();
    } catch (err) {
      alert("Error: " + err.message);
      setTimeout(()=>tabla.clearAlert(), 2000);
    }
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
      const rowComp = await tabla.addRow({}, true);
      tabla.getColumns().forEach(col => {
        if (col.getDefinition()?.editable !== undefined) {
            rowComp.getCell(col.getField())?.edit(true);
        }
      });
      break;
    case "u-filter":
      activo = btn.getAttribute("aria-pressed") === "true";
      tabla.getColumns().forEach(col => {
        console.log(col);
        if (col.getElement().classList.contains("filtrable")) {
          if (activo) {
            col.updateDefinition({
              headerFilter: col.getDefinition()?.editor ?? "input",        // o "select" según columna or list
            });
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
      activo = btn.getAttribute("aria-pressed") === "true";
      tabla.getColumns().forEach(col => {
        if (col.getDefinition()?.editable !== undefined) {
            col.updateDefinition({ editable: activo });
        }
      });
      break;
  }
}