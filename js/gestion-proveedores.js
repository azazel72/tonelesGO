// ====== CREAR VENTANA PROVEEDORES ======
function openProveedoresWin(el) {
  const KEY = "proveedores";
  const title = "Proveedores";
  const tablaBD = "proveedores";
  const columns = [
      { title:"ID", field:"id", width:70, hozAlign:"right", headerSort:false },
      { title:"Nombre", field:"name", editor:"input", headerFilter:"input" },
      { title:"Acciones", width:100, headerSort:false, hozAlign:"center",
        formatter: () => `<button class="btn btn-sm btn-outline-danger"><i class="bi bi-trash"></i></button>`,
        cellClick: async (e, cell) => {
          const id = cell.getRow().getData().id;
          if (!confirm(`¿Eliminar ID ${id}?`)) return;
          const res = await fetch(`${BASE}?table=proveedores&id=${encodeURIComponent(id)}`, {
            method:"DELETE",
            credentials:"same-origin",
          });
          if (!res.ok) return alert(await res.text());
          cell.getRow().delete();
        }
      },
    ];

  return crearWinBox(KEY, title, tablaBD, columns);
}
