const overlay = document.getElementById('login-overlay');
const box = document.getElementById('login-box');
const wsText = document.getElementById('ws-text');
const form = document.getElementById('login-form');
const loginButton = document.getElementById('login-button');
const passInput = document.getElementById('pass');
const userInput = document.getElementById('user');
const aliasToggleButton = document.getElementById('user-aliases-toggle');
const userAliasList = document.getElementById('user-aliases');

var conn = null;

function conexionInicial() {
    conn = conectar(wsUrl, {
        onOpen: clienteConectado,
        onClose: clienteDesconectado,
        onMessage: routeMessage,
    });
    mostrarLogin();
}

function clienteConectado() {
    mostrarConectado();
    cargarAliasesDisponibles();
    console.log("Conectado al servidor");
}

function clienteDesconectado() {
    if (document.getElementById("vista_tareas") && typeof mostrarSeccion === "function") {
        mostrarSeccion("vista_tareas");
    }
    mostrarDesconectado();
    if (overlay.hidden) mostrarLogin();
    console.log("Desconectado del servidor");
}

function setWsState(state /* 'connecting' | 'open' | 'closed' */) {
    box.classList.remove('ws--connecting','ws--open','ws--closed');
    box.classList.add(`ws--${state}`);
    wsText.textContent =
        state === 'open' ? 'Conectado' :
        state === 'closed' ? 'Desconectado' :
        'Conectando…';
}

function mostrarLogin() {
    overlay.hidden = false;

    setTimeout(() => {
    passInput.disabled = false;
    passInput.value = "";
    
    userInput.disabled = false;
    userInput.value = "";

    userInput.focus();
    }, 500);
}

function ocultarLogin() {
    overlay.hidden = true;
}

function setAliasListOpen(isOpen) {
    if (!userAliasList || !aliasToggleButton) return;
    const hasAliases = userAliasList.childElementCount > 0;
    const shouldOpen = Boolean(isOpen) && hasAliases;
    userAliasList.hidden = !shouldOpen;
    aliasToggleButton.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
}

function toggleAliasList() {
    if (!userAliasList) return;
    setAliasListOpen(userAliasList.hidden);
}

async function cargarAliasesDisponibles() {
    try {
        const aliases = await wsRequest("lista_aliases_usuarios", {});
        actualizarListadoAliases(aliases);
    } catch (error) {
        console.warn("No se pudieron cargar los alias de usuarios:", error);
    }
}

function seleccionarAlias(alias) {
    userInput.value = alias;
    userInput.focus();
    setAliasListOpen(false);
}

function actualizarListadoAliases(aliases) {
    if (!userAliasList) return;

    userAliasList.innerHTML = "";
    if (!Array.isArray(aliases)) return;

    userAliasList.hidden = aliases.length === 0;
    setAliasListOpen(false);

    const vistos = new Set();
    for (const alias of aliases) {
        const texto = (alias || "").toString().trim();
        if (!texto || vistos.has(texto.toLowerCase())) continue;
        vistos.add(texto.toLowerCase());

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'login-alias-pill';
        button.textContent = texto;
        button.addEventListener('click', () => seleccionarAlias(texto));
        userAliasList.appendChild(button);
    }
}

if (aliasToggleButton) {
    aliasToggleButton.addEventListener('click', (event) => {
        event.preventDefault();
        toggleAliasList();
    });
}

document.addEventListener('click', (event) => {
    if (!userAliasList || !aliasToggleButton) return;
    if (userAliasList.hidden) return;
    const target = event.target;
    if (userAliasList.contains(target) || aliasToggleButton.contains(target) || userInput.contains(target)) return;
    setAliasListOpen(false);
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setAliasListOpen(false);
});

function mostrarConectado() {
    setWsState('open');
    loginButton.disabled = false;
}

function mostrarDesconectado() {
    setWsState('closed');
    loginButton.disabled = true;
}

async function enviarLogin() {
    const usuario = userInput.value.trim();
    const clave = passInput.value.trim();

    if (!usuario || !clave) {
        alert("Por favor, ingrese usuario y clave.");
        return;
    }

    send("login", { user: usuario, pass: clave });
}

function enviarLogout() {
    const token = window.SharedAuthToken?.getToken?.();
    window.SharedAuthToken?.clearToken?.();
    send("logout", { token });
    userInput.value = "";
    passInput.value = "";
    document.getElementById('nav-username').innerText = "Usuario";
    conn?.close?.();
    mostrarLogin();
}

document.getElementById("btn-logout")?.addEventListener("click", () => {
    enviarLogout();
});


function respuesta_login(response) {
    if (response.data) {
        const token = response.data.access_token || response.data.token || null;
        if (token) {
            window.SharedAuthToken?.setToken?.(token);
        }
        actualizarListadoAliases(response.data.aliases);
        registrarUsuarioLogado(response.data);
        const nombreUsuario = response.data.fullname || response.data.nombre || response.data.alias || "Usuario";
        document.getElementById('nav-username').innerText = nombreUsuario;
        ocultarLogin();
        console.log("Inicio de sesión exitoso:", response.data);
        send("maestros", { });
    } else {
        alert("Error de autenticación: " + response.error);
    }
}
