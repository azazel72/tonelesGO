async function openDocumentosBotasEnvinadasWin() {
  const existente = comprobarVentanaAbierta("documentos_botas_envinadas");
  if (existente) {
    await recargarDocumentosBotasEnvinadasWin();
    return existente;
  }

  const content = document.createElement("div");
  content.className = "contenedor-winbox";
  content.innerHTML = `
    <div class="cabecera p-2 border-bottom d-flex gap-2 align-items-center">
      <button type="button" class="btn btn-sm btn-outline-secondary" id="docs-envinado-recargar">Recargar</button>
      <button type="button" class="btn btn-sm btn-primary" id="docs-envinado-subir">Subir documento/foto</button>
      <button type="button" class="btn btn-sm btn-outline-info" id="docs-envinado-ver">Ver documentos</button>
      <div class="ms-auto small text-muted" id="docs-envinado-resumen"></div>
    </div>
    <div class="contenedor-tabla">
      <div id="docs-envinado-tabla" style="height:100%;"></div>
    </div>
  `;

  const wb = crearWinBox("documentos_botas_envinadas", content, {
    title: "Documentos botas envinadas",
    x: 180,
    y: 140,
    width: "1080px",
    height: "620px",
  });
  wb.show();
  wb.focus();

  const tabla = new Tabulator(content.querySelector("#docs-envinado-tabla"), {
    height: "100%",
    layout: "fitColumns",
    selectableRows: true,
    index: "id",
    placeholder: "Sin botas envinadas",
    columns: [
      { title: "ID", field: "id", width: 70, hozAlign: "right" },
      { title: "Codigo", field: "codigo", cssClass: "filtrable" },
      { title: "Ubicacion", field: "ubicacion", cssClass: "filtrable", widthGrow: 2 },
      { title: "Pedido", field: "pedido_numero", cssClass: "filtrable" },
      { title: "Cliente", field: "cliente_nombre", cssClass: "filtrable", widthGrow: 2 },
      { title: "Analitica", field: "analitica_descripcion", cssClass: "filtrable", widthGrow: 2 },
      { title: "Docs", field: "documentos_count", hozAlign: "right", width: 90 },
    ],
    data: [],
  });

  windowsRegistry.set("documentos_botas_envinadas", { wb, table: tabla });

  content.querySelector("#docs-envinado-recargar")?.addEventListener("click", async () => {
    await recargarDocumentosBotasEnvinadasWin();
  });

  content.querySelector("#docs-envinado-subir")?.addEventListener("click", async () => {
    const seleccionados = tabla.getSelectedData();
    if (!seleccionados.length) {
      alert("Selecciona al menos una bota envinada.");
      return;
    }
    const primera = seleccionados[0];
    openSubirArchivoWin({
      ventanaTitulo: "Subir documento botas envinadas",
      titulo: `Documento envinado ${new Date().toISOString().slice(0, 10)}`,
      mensaje: "El archivo se vinculara a todas las botas seleccionadas.",
      entidad: "productos_envinados",
      entidadId: primera.id,
      onUploaded: async (ids) => {
        await wsRequest("vincular_archivos_botas_envinadas", {
          archivo_ids: ids,
          producto_ids: seleccionados.map((item) => item.id),
        });
        await recargarDocumentosBotasEnvinadasWin();
      },
    });
  });

  content.querySelector("#docs-envinado-ver")?.addEventListener("click", async () => {
    const seleccionados = tabla.getSelectedData();
    if (seleccionados.length !== 1) {
      alert("Selecciona una única bota para ver sus documentos.");
      return;
    }
    const archivos = await wsRequest("listar_archivos_bota_envinada", { producto_id: seleccionados[0].id });
    if (!Array.isArray(archivos) || !archivos.length) {
      alert("No hay documentos asociados.");
      return;
    }
    archivos.forEach((archivo) => {
      if (archivo?.id) window.open(`./api/archivo_get.php?id=${archivo.id}`, "_blank");
    });
  });

  await recargarDocumentosBotasEnvinadasWin();
  return wb;
}

async function recargarDocumentosBotasEnvinadasWin() {
  const registro = windowsRegistry.get("documentos_botas_envinadas");
  const tabla = registro?.table;
  const resumen = registro?.wb?.body?.querySelector?.("#docs-envinado-resumen") || document.getElementById("docs-envinado-resumen");
  if (!tabla) return;
  try {
    const data = await wsRequest("listar_resumen_envinado", {});
    const filas = Array.isArray(data?.envinadas) ? data.envinadas : [];
    tabla.replaceData(filas);
    if (resumen) resumen.textContent = `${filas.length} botas envinadas`;
  } catch (err) {
    console.error("No se pudo cargar documentos de botas envinadas:", err);
    if (resumen) resumen.textContent = "Error cargando datos";
  }
}
