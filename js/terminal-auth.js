const overlay = document.getElementById("login-overlay");
const box = document.getElementById("login-box");
const wsText = document.getElementById("ws-text");
const form = document.getElementById("login-form");
const loginButton = document.getElementById("login-button");
const passInput = document.getElementById("password");
const userInput = document.getElementById("username");
const loginFeedback = document.getElementById("login-feedback");

var conn = null;

const terminalAuthState = {
    autenticado: false,
    reconectando: false,
};

function conexionInicial() {
    conn = conectar(wsUrl, {
        onOpen: clienteConectado,
        onClose: clienteDesconectado,
        onMessage: routeMessage,
    });
    mostrarLogin();
    setFeedback("Esperando conexión con el servidor.");
}

function clienteConectado() {
    mostrarConectado();
    setFeedback("Conexión establecida. Esperando inicio de sesión.");
    console.log("Conectado al servidor");
}

function clienteDesconectado() {
    terminalAuthState.autenticado = false;
    terminalAuthState.reconectando = true;
    mostrarDesconectado();
    mostrarLogin();
    setFeedback("Sin conexión con el servidor. Reintentando…", true);
    console.log("Desconectado del servidor");
}

function setWsState(state) {
    box.classList.remove("ws--connecting", "ws--open", "ws--closed");
    box.classList.add(`ws--${state}`);
    loginButton.disabled = state !== "open";

    if (state === "open") {
        wsText.textContent = "Conectado";
        return;
    }
    if (state === "closed") {
        wsText.textContent = "Desconectado";
        return;
    }
    wsText.textContent = terminalAuthState.reconectando ? "Reintentando conexión…" : "Conectando…";
}

function mostrarLogin() {
    overlay.hidden = false;
    userInput.disabled = false;
    passInput.disabled = false;
    if (!userInput.value.trim()) {
        setTimeout(() => userInput.focus(), 50);
    }
}

function ocultarLogin() {
    overlay.hidden = true;
}

function mostrarConectado() {
    setWsState("open");
}

function mostrarDesconectado() {
    setWsState("closed");
}

function setFeedback(texto, isError = false) {
    if (!loginFeedback) return;
    loginFeedback.textContent = texto || "";
    loginFeedback.classList.toggle("is-error", isError);
}

function enviarLogin() {
    const usuario = userInput.value.trim();
    const clave = passInput.value.trim();
    const ws = conn && conn.socket;

    if (!ws || ws.readyState !== WebSocket.OPEN) {
        mostrarLogin();
        mostrarDesconectado();
        setFeedback("No hay conexión con el servidor. Espera a la reconexión.", true);
        return;
    }

    if (!usuario || !clave) {
        setFeedback("Introduce usuario y clave.", true);
        return;
    }

    setFeedback("Validando credenciales…");
    send("login", { user: usuario, pass: clave });
}

function respuesta_login(response) {
    if (!response?.data) {
        terminalAuthState.autenticado = false;
        mostrarLogin();
        setFeedback("No se pudo iniciar sesión.", true);
        return;
    }

    const token = response.data.access_token || response.data.token || null;
    if (token) {
        window.SharedAuthToken?.setToken?.(token);
    }

    terminalAuthState.autenticado = true;
    terminalAuthState.reconectando = false;
    passInput.value = "";
    setFeedback("");
    ocultarLogin();
    enviarPantalla?.();
    console.log("Inicio de sesión exitoso:", response.data);
}

if (form) {
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        enviarLogin();
    });
}

if (loginButton) {
    loginButton.addEventListener("click", (event) => {
        event.preventDefault();
        enviarLogin();
    });
}
