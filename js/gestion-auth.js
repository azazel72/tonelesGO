const AUTH_URL = "./api/index.php"; // mismo index del Swagger

const $loginForm = document.getElementById("nav-login");
const $loginUser = document.getElementById("login-user");
const $loginPass = document.getElementById("login-pass");
const $btnLogin  = document.getElementById("btn-login");

const $userBox   = document.getElementById("nav-user");
const $userName  = document.getElementById("nav-username");
const $btnLogout = document.getElementById("btn-logout");

function setLoggedIn(data={}) {
sessionStorage.setItem("login", JSON.stringify(data));
$userName.textContent = data?.fullname || data?.username || "Sesión iniciada";
$loginForm.classList.add("d-none");
$userBox.classList.remove("d-none");
$userBox.classList.add("d-flex");
}
function setLoggedOut(){
sessionStorage.removeItem("login");
$userBox.classList.add("d-none");
$userBox.classList.remove("d-flex");
$loginForm.classList.remove("d-none");
$loginUser.value = "";
$loginPass.value = "";
}

// Al entrar: comprobamos si la sesión está viva intentando un endpoint protegido (ej: meta)
async function checkSession() {
try {
    const res = await fetch("./api/index.php?tables=1", { method:"GET", credentials:"same-origin" });
    if (res.ok) {
    setLoggedIn(sessionStorage.getItem("login") ? JSON.parse(sessionStorage.getItem("login")) : {});
    } else {
    setLoggedOut();
    }
} catch {
    setLoggedOut();
}
}

// Login (POST ./index.php?action=login con JSON)
$loginForm.addEventListener("submit", async (e) => {
e.preventDefault();
const username = ($loginUser.value || "").trim();
const password = ($loginPass.value || "").trim();
if (!username || !password) { alert("Introduce usuario y contraseña"); return; }

try {
    $btnLogin.disabled = true;
    const res = await fetch(AUTH_URL + "?action=login", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
    });
    if (!res.ok) throw new Error(await res.text());
    // Si tu backend devuelve JSON con el username, úsalo; si no, usamos el escrito
    let data = null;
    try { data = await res.json(); } catch {}
    setLoggedIn(data?.data ?? {});

    // (opcional) refrescar tabla tras login
    //if (window.tabla?.replaceData) window.tabla.replaceData();
} catch (err) {
    alert("Error de login: " + (err.message || err));
} finally {
    $btnLogin.disabled = false;
}
});

// Logout (POST ./index.php?action=logout)
$btnLogout.addEventListener("click", async () => {
try {
    await fetch(AUTH_URL + "?action=logout", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: "{}"
    });
} catch {}
setLoggedOut();
// (opcional) limpiar tabla al salir
//if (window.tabla?.clearData) window.tabla.clearData();
});

// Lógica inicial
checkSession();
