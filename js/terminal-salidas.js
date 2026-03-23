function prepararEventosSalidas() {
}

async function cargarVistaSalidas() {
    await cargarVistaProductosPorFiltros({
        listaId: "salidas-lista",
        resumenId: "salidas-resumen",
        tipos: ["BOTA"],
        pedidoEstado: 2,
        pedidoDestino: "CLIENTE",
        estadosProducto: [1, 2, 3],
        etiquetaResumen: "botas",
        textoVacio: "No hay botas para salidas.",
        renderizador: renderizarVistaProductosPorPedido,
    });
}
