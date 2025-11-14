async function POST(url, body = {}) {
    try {
        const res = await fetch(url, {
            method:"POST",
            credentials:"same-origin",
            headers:{ "Content-Type":"application/json" },
            body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error(await res.text());
        return await res.json();
    } catch (error) {
        console.error("Error en la petición POST:", error);
    }
}

async function GET(url) {
    try {
        const res = await fetch(url, { method:"GET", credentials:"same-origin" });
        if (!res.ok) throw new Error(await res.text());
        return await res.json();
    } catch {
        throw new Error("Error de conexión al servidor");
    }
}

const genId = () => (crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2));

function conectar(url, { onOpen, onClose, onMessage, maxDelayMs = 15000 } = {}) {
  let ws, backoff = 500, closedByUser = false;

  const connect = () => {

    setWsState('connecting');

    ws = new WebSocket(url);

    ws.onopen = () => {
      backoff = 500;
      onOpen?.(ws);
    };

    ws.onmessage = (ev) => onMessage?.(ev.data);

    ws.onclose = () => {
      onClose?.();
      if (!closedByUser) {
        const delay = Math.min(backoff, maxDelayMs);
        setTimeout(connect, delay);
        backoff *= 2;
      }
    };

    ws.onerror = () => {
      try { ws.close(); } catch {}
    };
  };

  connect();

  return {
    get socket() { return ws; },
    close() { closedByUser = true; try { ws?.close(); } catch {} },
  };
}

function send(action, data) {
  var msg = JSON.stringify({ action: action, data: data });
  var ws = conn && conn.socket;
  if (ws && ws.readyState === WebSocket.OPEN) ws.send(msg);
  else alert("No conectado al servidor.");
}

async function wsRequest(action, data={}) {
  return new Promise((resolve, reject) => {
    const requestId = genId();
    const msg = JSON.stringify({ action: action, data: data, request_id: requestId });
    const ws = conn && conn.socket;
    if (ws && ws.readyState === WebSocket.OPEN) {
      pendingWsRequests.set(requestId, { resolve, reject });
      ws.send(msg);
      setTimeout(() => {
        if (pendingWsRequests.has(requestId)) {
          pendingWsRequests.delete(requestId);
          reject(new Error("Timeout en la solicitud WebSocket"));
        }
      }, timeoutWsRequestMs);
    } else {
      reject(new Error("WebSocket no está conectado"));
    }
  });
}