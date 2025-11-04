const overlay = document.getElementById('login-overlay');
const box = document.getElementById('login-box');
const wsText = document.getElementById('ws-text');
const form = document.getElementById('login-form');
const loginButton = document.getElementById('login-button');
const passInput = document.getElementById('pass');
const userInput = document.getElementById('user');

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
    console.log("Conectado al servidor");
}

function clienteDesconectado() {
    mostrarDesconectado();
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


function respuesta_login(response) {
    if (response.data) {
        document.getElementById('nav-username').innerText = response.data.fullname;
        ocultarLogin();
        console.log("Inicio de sesión exitoso:", response.data);
        send("maestros", { });
    } else {
        alert("Error de autenticación: " + response.error);
    }
}