function prepararEventosEnvinado() {
}

async function cargarVistaEnvinado() {
    await cargarVistaProductosPorFiltros({
        listaId: "envinado-lista",
        resumenId: "envinado-resumen",
        tipos: ["BOTA"],
        pedidoEstado: 2,
        pedidoDestino: "ENVINADO",
        estadosProducto: [1, 2, 4],
        etiquetaResumen: "botas",
        textoVacio: "No hay botas para envinado.",
    });
}
