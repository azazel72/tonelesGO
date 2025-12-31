
function prepararEventosFabricacion() {
    document.querySelector("#vista_fabricacion table#tabla_ordenes_fabricacion tbody").addEventListener("click", function (event) {
        const fila = event.target.closest("tr");
        console.log(fila);
        if (!fila) return;
        seleccionarFabricacion(fila);
    });

    document.querySelector("#vista_fabricacion table#tabla_contenido_orden_fabricacion").addEventListener("click", function (event) {
        const fila = event.target.closest("tr");
        console.log(fila);
        if (!fila) return;
        seleccionarContenidoOrden(fila);
    });

}

function seleccionarFabricacion(fila) {
    vista_fabricacion = document.getElementById("vista_fabricacion");
    vista_fabricacion.setAttribute("modo", "contenido_orden");
}

function seleccionarContenidoOrden(fila) {
    console.log(fila);
    if (fila.closest("tfoot")) {
        vista_fabricacion = document.getElementById("vista_fabricacion");
        vista_fabricacion.setAttribute("modo", "listado_ordenes");
    } else {
        mostrarLotesMateriales(fila);
    }
}

function mostrarLotesMateriales(fila) {
    const modal = new bootstrap.Modal(document.getElementById('miModal2'));
    modal.show();
}

