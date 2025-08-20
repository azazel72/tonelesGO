
function prepararEventosExpedicion() {
    document.querySelector("#vista_expedicion table#tabla_ordenes_venta tbody").addEventListener("click", function (event) {
        const fila = event.target.closest("tr");
        console.log(fila);
        if (!fila) return;
        seleccionarVenta(fila);
    });

    document.querySelector("#vista_expedicion table#tabla_contenido_orden_venta").addEventListener("click", function (event) {
        const fila = event.target.closest("tr");
        console.log(fila);
        if (!fila) return;
        seleccionarContenidoVenta(fila);
    });

}

function seleccionarVenta(fila) {
    vista_expedicion = document.getElementById("vista_expedicion");
    vista_expedicion.setAttribute("modo", "contenido_venta");
}

function seleccionarContenidoVenta(fila) {
    console.log(fila);
    if (fila.closest("tfoot")) {
        vista_expedicion = document.getElementById("vista_expedicion");
        vista_expedicion.setAttribute("modo", "listado_ventas");
    } else {
        mostrarToneles(fila);
    }
}

function mostrarToneles(fila) {
    const modal = new bootstrap.Modal(document.getElementById('miModal3'));
    modal.show();
}

