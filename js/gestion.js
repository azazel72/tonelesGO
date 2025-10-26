window.onload = () => {
    const actions = {
        async "ver-usuarios"() {
            await openUsuariosWin();
        },

        async "ver-proveedores"() {
            await openProveedoresWin();
        },

        async "ver-clientes"() {
            console.log("Crear nuevo registro");
        },

        async "ver-materiales"() {
            console.log("Crear nuevo registro");
        },

        async "ver-entradas"() {
            console.log("Crear nuevo registro");
        },
        async "ver-salidas"() {
            console.log("Crear nuevo registro");
        },
        // Acción con parámetros vía data-*
        filtrar(el) {
            const field = el.dataset.filterField;
            const op    = el.dataset.filterOp || "=";
            const value = el.dataset.filterValue;
            console.log(field, op, value);
        },
    };

    // Delegación de eventos (un solo listener para toda la página)
    document.addEventListener("click", async (ev) => {
        const el = ev.target.closest("[data-action]");
        if (!el) return;
        ev.preventDefault();

        const action = el?.dataset?.action ?? "";
        const fn = actions[action];
        if (!fn) {
            console.warn("Acción no encontrada:", action);
            return;
        }

        // Manejo uniforme de errores y estado de UI
        try {
            console.log(el);
            el.classList.add("disabled", "pe-none"); // evita clics repetidos
            await fn();                             // pasa el elemento por si necesita data-*
        } catch (e) {
            console.error(e);
            alert("Error: " + (e.message || e));
        } finally {
            el.classList.remove("disabled", "pe-none");
        }
    });
}



function f() {

// URL del backend PHP
const API_URL = "api.php";

// Definir tabla
const tabla = new Tabulator("#tabla", {
    height: "100%",
    layout: "fitColumns",
    index: "id",              // clave primaria
    ajaxURL: API_URL,         // GET datos
    ajaxConfig: "GET",
    placeholder: "Sin datos",
    columns: [
    { title: "ID", field: "id", hozAlign: "right", width: 80, headerSort:false, editor:false }, // ID no editable (clave)
    { title: "Nombre", field: "nombre", editor: "input" },
    { title: "Apellidos", field: "apellidos", editor: "input" },
    { title: "Email", field: "email", editor: "input" },
    { title: "Teléfono", field: "telefono", editor: "input" },
    { title: "Edad", field: "edad", hozAlign: "right", editor: "number", validator:["integer", {type:"min", parameters:{min:0}}] },
    { title: "Acciones", field: "acciones", width: 100, headerSort:false, hozAlign:"center",
        formatter: () => `<button class="btn btn-sm btn-outline-danger" title="Eliminar"><i class="bi bi-trash"></i></button>`,
        cellClick: async (e, cell) => {
        const row = cell.getRow().getData();
        if (!confirm(`¿Eliminar a ${row.nombre} ${row.apellidos}?`)) return;
        try {
            const res = await fetch(API_URL + "?id=" + encodeURIComponent(row.id), { method: "DELETE" });
            if (!res.ok) throw new Error(await res.text());
            cell.getRow().delete();
        } catch (err) {
            alert("Error al eliminar: " + err.message);
        }
        }
    },
    ],
});

// Guardar al editar una celda (PUT)
tabla.on("cellEdited", async (cell) => {
    const data = cell.getRow().getData();
    try {
    const res = await fetch(API_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    const updated = await res.json();
    // Aseguramos reflejar datos normalizados desde el servidor
    cell.getRow().update(updated);
    } catch (err) {
    alert("Error al guardar: " + err.message);
    // Opcional: revertir valor
    tabla.replaceData(API_URL);
    }
});

// Botón: añadir persona (POST)
document.getElementById("btn-add").addEventListener("click", async () => {
    const nueva = {
    nombre: "Nuevo",
    apellidos: "Usuario",
    email: "",
    telefono: "",
    edad: 0
    };
    try {
    const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nueva),
    });
    if (!res.ok) throw new Error(await res.text());
    const creada = await res.json();
    tabla.addData([creada], true); // al inicio
    } catch (err) {
    alert("Error al crear: " + err.message);
    }
});

// Botón: refrescar
document.getElementById("btn-refresh").addEventListener("click", () => tabla.replaceData(API_URL));

}