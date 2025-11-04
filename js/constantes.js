const wsScheme = location.protocol === "https:" ? "wss" : "ws";
const puertoWs = 5000;
const wsUrl = `${wsScheme}://${location.host}:${puertoWs}/ws`;
