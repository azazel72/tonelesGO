function openSubirArchivoWin(options = {}) {
    const ventanaTitulo = options?.ventanaTitulo || "Subir archivos";
    const titulo = options?.titulo || "";
    const mensaje = options?.mensaje || "";
    const entidad = options?.entidad || "";
    const entidadId = options?.entidadId ?? "";

    const content = document.createElement("div");
    content.classList.add("upload-winbox");
    content.innerHTML = `
      <div class="upload-layout">
        <form id="upload-form" class="upload-panel d-flex flex-column gap-2">
          <label class="small d-flex flex-column gap-1">
            Titulo:
            <input type="text" name="titulo" class="form-control form-control-sm" required>
          </label>
          <div class="upload-mensaje text-muted small"></div>

          <input type="hidden" name="entidad">
          <input type="hidden" name="entidad_id">

          <div class="upload-dropzone">
            Arrastra aqui archivos PDF o JPG, o haz clic para seleccionar
          </div>

          <input type="file" name="files[]" multiple accept=".pdf,image/jpeg" class="d-none">

          <div class="d-flex flex-column gap-1">
            <button type="submit" class="btn btn-sm btn-primary upload-submit">Subir</button>
            <div class="upload-status small text-muted"></div>
          </div>
        </form>

        <div class="upload-panel upload-panel-preview">
          <div class="upload-preview-area">
            <div class="small text-muted mb-1">Vista previa (primer PDF/JPG seleccionado):</div>
            <div class="upload-preview-content text-muted">No hay archivo seleccionado.</div>
          </div>
        </div>
      </div>
    `;

    const win = crearWinBox("subir_archivo", content, {
        title: ventanaTitulo,
        width: "920px",
        height: "560px",
        x: "center",
        y: 110,
        class: ["modern", "no-full"],
    });
    win.show();
    win.focus();

    const form = content.querySelector("#upload-form");
    const dropzone = content.querySelector(".upload-dropzone");
    const fileInput = content.querySelector('input[type="file"]');
    const status = content.querySelector(".upload-status");
    const previewArea = content.querySelector(".upload-preview-content");

    form.titulo.value = titulo;
    form.entidad.value = entidad;
    form.entidad_id.value = entidadId === null || entidadId === undefined ? "" : String(entidadId);
    const mensajeEl = content.querySelector(".upload-mensaje");
    if (mensaje) {
        mensajeEl.textContent = mensaje;
    } else {
        mensajeEl.classList.add("d-none");
    }

    const allowedMimes = new Set(["application/pdf", "image/jpeg"]);
    const allowedExt = new Set(["pdf", "jpg", "jpeg"]);
    let currentFiles = [];
    let previewUrl = null;

    function setStatus(message, color) {
        status.textContent = message;
        status.style.color = color || "#6c757d";
    }

    function isAllowedFile(file) {
        const name = (file.name || "").toLowerCase();
        const ext = name.includes(".") ? name.split(".").pop() : "";
        return allowedMimes.has(file.type) || allowedExt.has(ext);
    }

    function updateDropzoneText(files, source) {
        if (!files.length) {
            dropzone.textContent = "Arrastra aqui archivos PDF o JPG, o haz clic para seleccionar";
            return;
        }
        const suffix = source === "drop" ? "arrastrado(s)" : "seleccionado(s)";
        dropzone.textContent = `${files.length} archivo(s) ${suffix}`;
    }

    function renderPreview(files) {
        previewArea.innerHTML = "";

        if (!files || files.length === 0) {
            previewArea.textContent = "No hay archivo seleccionado.";
            return;
        }

        const file = files[0];
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        previewUrl = URL.createObjectURL(file);

        if (file.type.startsWith("image/")) {
            const img = document.createElement("img");
            img.src = previewUrl;
            previewArea.appendChild(img);
        } else if (file.type === "application/pdf") {
            const iframe = document.createElement("iframe");
            iframe.src = previewUrl;
            previewArea.appendChild(iframe);
        } else {
            previewArea.textContent = `Archivo: ${file.name} (no se puede previsualizar)`;
        }
    }

    function setFiles(files, source) {
        const validFiles = files.filter(isAllowedFile);
        if (!validFiles.length) {
            currentFiles = [];
            updateDropzoneText([], source);
            renderPreview([]);
            setStatus("Solo se permiten PDF o JPG.", "red");
            return;
        }
        currentFiles = validFiles;
        updateDropzoneText(currentFiles, source);
        renderPreview(currentFiles);

        if (validFiles.length !== files.length) {
            setStatus("Se omitieron archivos con formato no permitido.", "#b45309");
        } else {
            setStatus("");
        }
    }

    dropzone.addEventListener("click", () => {
        fileInput.click();
    });

    fileInput.addEventListener("change", (e) => {
        const files = Array.from(e.target.files || []);
        setFiles(files, "input");
    });

    dropzone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropzone.classList.add("is-dragover");
    });

    dropzone.addEventListener("dragleave", (e) => {
        e.preventDefault();
        dropzone.classList.remove("is-dragover");
    });

    dropzone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropzone.classList.remove("is-dragover");

        const files = Array.from(e.dataTransfer.files || []);
        if (!files.length) return;
        setFiles(files, "drop");

        const dt = new DataTransfer();
        currentFiles.forEach((f) => dt.items.add(f));
        fileInput.files = dt.files;
    });

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const tituloValue = form.titulo.value.trim();
        const entidadValue = form.entidad.value.trim();
        const entidadIdValue = form.entidad_id.value.trim();

        if (!tituloValue) {
            setStatus("Introduce un titulo.", "red");
            return;
        }
        if (!entidadValue || !entidadIdValue) {
            setStatus("Entidad o ID no definido.", "red");
            return;
        }
        if (!currentFiles.length) {
            setStatus("Selecciona al menos un archivo.", "red");
            return;
        }

        const formData = new FormData();
        formData.append("titulo", tituloValue);
        formData.append("entidad", entidadValue);
        formData.append("entidad_id", entidadIdValue);
        currentFiles.forEach((file) => formData.append("files[]", file));

        setStatus("Subiendo archivos.");

        try {
            const resp = await fetch("./api/upload.php", {
                method: "POST",
                body: formData,
            });

            const data = await resp.json();
            if (!resp.ok || data.error) {
                throw new Error(data.error || `Error HTTP ${resp.status}`);
            }

            const ids = data.data?.ids || [];
            setStatus(`Subida correcta (${ids.length}).`, "green");
        } catch (err) {
            console.error(err);
            setStatus(`Error en la subida: ${err.message}`, "red");
        }
    });
}
