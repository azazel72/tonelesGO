(function () {
  const KEY = "paezlobato.auth.token";

  function getToken() {
    return localStorage.getItem(KEY);
  }

  function setToken(token) {
    if (!token) return;
    localStorage.setItem(KEY, token);
  }

  function clearToken() {
    localStorage.removeItem(KEY);
  }

  window.SharedAuthToken = {
    KEY,
    getToken,
    setToken,
    clearToken,
  };
})();

