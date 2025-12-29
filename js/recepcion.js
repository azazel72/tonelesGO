function prepararEventosRecepcion() {
    document.querySelector("#vista_recepcion table#tabla_entradas_recepcion tbody").addEventListener("click", function (event) {
        const fila = event.target.closest("tr");
        if (!fila) return;
        seleccionarRecepcion(fila);
    });

    document.querySelector("#vista_recepcion table#tabla_contenido_entrada_recepcion").addEventListener("click", function (event) {
        const fila = event.target.closest("tr");
        if (!fila) return;
        seleccionarContenidoEntrada(fila);
    });

}

function seleccionarRecepcion(fila) {
    //lógica para seleccionar una recepción

    vista_recepcion = document.getElementById("vista_recepcion");
    vista_recepcion.setAttribute("modo", "contenido_entrada");

}

function seleccionarContenidoEntrada(fila) {
    console.log(fila);
    if (fila.closest("tfoot")) {
        vista_recepcion = document.getElementById("vista_recepcion");
        vista_recepcion.setAttribute("modo", "listado_entradas");
    } else {
        imprimirEtiquetaEntradaRecepcion(fila);
    }
}

function imprimirEtiquetaEntradaRecepcion(fila) {
    const modal = new bootstrap.Modal(document.getElementById('miModal'));
    modal.show();
}

function modificar(id, cambio) {
    const el = document.getElementById(id);
    let valor = parseInt(el.textContent);
    valor = Math.max(1, valor + cambio); // evita números negativos o cero
    el.textContent = valor;
}