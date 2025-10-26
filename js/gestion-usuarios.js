// ====== CREAR VENTANA USUARIOS ======
function openUsuariosWin(el) {
  const KEY = "usuarios";
  const title = "Usuarios";
  const tablaBD = "usuarios";
  const columns = [
      { title:"ID", field:"id", width:70, hozAlign:"right", headerSort:false },
      { title:"Alias", field:"username", editor:"input", headerFilter:"input" },
      { title:"Nombre", field:"fullname", editor:"input", headerFilter:"input" },
      { title:"Rol", field:"role", editor:"input" },

      { title:"Guardar", headerSort:false, width:100, hozAlign:"center",
        formatter:()=>`<button class="btn btn-sm btn-primary">Guardar</button>`,
        cellClick: async (e, cell) => {
          const row = cell.getRow();
          const data = row.getData();

          // 2) Validación cliente (rápida)
          const required = ["username, fullname, role"];
          const missing = required.filter(k => !String(data[k]||"").trim());
          if (missing.length){
            this.alert("Faltan: " + missing.join(", "));
            setTimeout(()=>this.clearAlert(), 1500);
            return;
          }

          try {
            const res = await fetch(`${BASE}?table=usuarios`, {
              method: "POST",
              credentials:"same-origin",
              headers: { "Content-Type":"application/json" },
              body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error(await res.text());
            const wrap = await res.json();
            const created = wrap.data ?? wrap;

            // 3) Sustituye la fila temporal por la creada (con ID real)
            row.update(created);
            tabla.alert("Creado ✅"); setTimeout(()=>tabla.clearAlert(), 1200);
          } catch (err) {
            tabla.alert("Error: " + err.message);
            setTimeout(()=>tabla.clearAlert(), 2000);
          }
        }      
      },

      { title:"Acciones", width:100, headerSort:false, hozAlign:"center",
        formatter: () => `<button class="btn btn-sm btn-outline-danger"><i class="bi bi-trash"></i></button>`,
        cellClick: async (e, cell) => {
          const id = cell.getRow().getData().id;
          if (!confirm(`¿Eliminar ID ${id}?`)) return;
          const res = await fetch(`${BASE}?table=usuarios&id=${encodeURIComponent(id)}`, {
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
