document.addEventListener("DOMContentLoaded", function () {

    // Selecciona todos los botones con la clase 'boton'
    const botones_tareas = document.querySelectorAll("section#vista_tareas .boton");

    // Itera sobre cada botón y agrega un evento de clic
    botones_tareas.forEach(function (boton) {
        boton.addEventListener("click", function () {
            mostrarSeccion(boton.getAttribute("mostrar"));
        });
    });

    // Selecciona todas las migas de pan
    const migasPan = document.querySelector("header nav ol");
    migasPan.addEventListener("click", function (event) {
        event.preventDefault();
        const miga = event.target.closest("li:not(.active)");
        if (!miga || !miga.hasAttribute("mostrar")) return; // Verifica que se haya hecho clic en una miga válida
        // Muestra la sección correspondiente al atributo 'mostrar' 
        mostrarSeccion(miga.getAttribute("mostrar"));
    });

    prepararEventosRecepcion();

    prepararEventosFabricacion();

    prepararEventosExpedicion();

    // Muestra la sección de tareas al cargar la página
    mostrarSeccion("vista_tareas");
});

function mostrarSeccion(id) {
    const seccionActiva = document.getElementById(id);
    if (seccionActiva) {
        // Oculta todas las secciones
        const secciones = document.querySelectorAll("section");
        secciones.forEach(function (seccion) {
            seccion.classList.remove("pagina-activa");
        });
        // Muestra la sección correspondiente
        seccionActiva.classList.add("pagina-activa");
        // Actualiza las migas de pan
        actualizarMigasPan(id);
    }
}

function actualizarMigasPan(mostrarSeccion) {
    const migasPan = document.querySelector("nav[aria-label='breadcrumb'] ol");
    migasPan.innerHTML = '';
    var nuevaMiga = crearMigaPan("Inicio", "vista_inicio");
    migasPan.appendChild(nuevaMiga);
    switch (mostrarSeccion) {
        case "vista_tareas":
            nuevaMiga = crearMigaPan("Tareas", mostrarSeccion, true);
            migasPan.appendChild(nuevaMiga);
            break;
        case "vista_recepcion":
            nuevaMiga = crearMigaPan("Tareas", "vista_tareas", false);
            migasPan.appendChild(nuevaMiga);
            nuevaMiga = crearMigaPan("Recepción", mostrarSeccion, true);
            migasPan.appendChild(nuevaMiga);
            break;
        case "vista_ubicacion":
            nuevaMiga = crearMigaPan("Tareas", "vista_tareas", false);
            migasPan.appendChild(nuevaMiga);
            nuevaMiga = crearMigaPan("Ubicación", mostrarSeccion, true);
            migasPan.appendChild(nuevaMiga);
            break;
        case "vista_fabricacion":
            nuevaMiga = crearMigaPan("Tareas", "vista_tareas", false);
            migasPan.appendChild(nuevaMiga);
            nuevaMiga = crearMigaPan("Fabricación", mostrarSeccion, true);
            migasPan.appendChild(nuevaMiga);
            break;
        case "vista_expedicion":
            nuevaMiga = crearMigaPan("Tareas", "vista_tareas", false);
            migasPan.appendChild(nuevaMiga);
            nuevaMiga = crearMigaPan("Expedición", mostrarSeccion, true);
            migasPan.appendChild(nuevaMiga);
            break;
    }
}

function crearMigaPan(nombre, mostrarSeccion, activo = false) {
    const nuevaMiga = document.createElement("li");
    nuevaMiga.classList.add("breadcrumb-item");
    nuevaMiga.setAttribute("mostrar", mostrarSeccion);
    if (activo) {
        nuevaMiga.innerHTML = nombre;
        nuevaMiga.classList.add("active");
        nuevaMiga.setAttribute("aria-current", "page");
    } else {
        nuevaMiga.innerHTML = `<a href="#">${nombre}</a>`;
    }
    return nuevaMiga;
}