const actions = {
async nuevo() {
    const payload = { nombre:"Nuevo", apellidos:"Usuario", email:"", telefono:"", edad:0, activo:true };
    const res = await fetch(API_URL, {
    method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(await res.text());
    const creada = await res.json();
    tabla.addData([creada], true);
},

refrescar() {
    tabla.replaceData(API_URL);
},

async "eliminar-seleccion"() {
    const rows = tabla.getSelectedRows();
    if (!rows.length) { alert("Selecciona al menos una fila."); return; }
    if (!confirm(`¿Eliminar ${rows.length} registro(s)?`)) return;
    for (const r of rows) {
    const id = r.getData().id;
    const res = await fetch(`${API_URL}?id=${encodeURIComponent(id)}`, { method:"DELETE" });
    if (!res.ok) throw new Error(await res.text());
    r.delete();
    }
},

// Acción con parámetros vía data-*
filtrar(el) {
    const field = el.dataset.filterField;
    const op    = el.dataset.filterOp || "=";
    const value = el.dataset.filterValue;
    tabla.setFilter(field, op, value);
},
};

// Delegación de eventos (un solo listener para toda la página)
document.addEventListener("click", async (ev) => {
const el = ev.target.closest("[data-action]");
if (!el) return;
ev.preventDefault();

const action = el.dataset.action;
const fn = actions[action];
if (!fn) {
    console.warn("Acción no encontrada:", action);
    return;
}

// Manejo uniforme de errores y estado de UI
try {
    el.classList.add("disabled", "pe-none"); // evita clics repetidos
    await fn(el);                             // pasa el elemento por si necesita data-*
} catch (e) {
    console.error(e);
    alert("Error: " + (e.message || e));
} finally {
    el.classList.remove("disabled", "pe-none");
}
});


