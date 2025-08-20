function prepararEventosRecepcion() {
    document.querySelector("#vista_recepcion table#tabla_pedidos_recepcion tbody").addEventListener("click", function (event) {
        const fila = event.target.closest("tr");
        if (!fila) return;
        seleccionarRecepcion(fila);
    });

    document.querySelector("#vista_recepcion table#tabla_contenido_pedido_recepcion").addEventListener("click", function (event) {
        const fila = event.target.closest("tr");
        if (!fila) return;
        seleccionarContenidoPedido(fila);
    });

}

function seleccionarRecepcion(fila) {
    //lógica para seleccionar una recepción

    vista_recepcion = document.getElementById("vista_recepcion");
    vista_recepcion.setAttribute("modo", "contenido_pedido");

}

function seleccionarContenidoPedido(fila) {
    console.log(fila);
    if (fila.closest("tfoot")) {
        vista_recepcion = document.getElementById("vista_recepcion");
        vista_recepcion.setAttribute("modo", "listado_pedidos");
    } else {
        imprimirEtiquetaPedidoRecepcion(fila);
    }
}

function imprimirEtiquetaPedidoRecepcion(fila) {
    const modal = new bootstrap.Modal(document.getElementById('miModal'));
    modal.show();
}

function modificar(id, cambio) {
    const el = document.getElementById(id);
    let valor = parseInt(el.textContent);
    valor = Math.max(1, valor + cambio); // evita números negativos o cero
    el.textContent = valor;
}