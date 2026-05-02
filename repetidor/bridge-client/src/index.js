import process from 'node:process';
import { setTimeout as delay } from 'node:timers/promises';
import WebSocket from 'ws';
import 'dotenv/config';

const config = {
  bridgeUrl: process.env.BRIDGE_URL || 'ws://127.0.0.1:7001/bridge',
  targetBaseUrl: process.env.TARGET_BASE_URL || 'ws://127.0.0.1:5000',
  reconnectDelayMs: Number(process.env.RECONNECT_DELAY_MS || 3000),
  handshakeTimeoutMs: Number(process.env.HANDSHAKE_TIMEOUT_MS || 10000)
};

let bridgeSocket = null;
const upstreams = new Map();

function log(...args) {
  console.log(new Date().toISOString(), '[bridge-client]', ...args);
}

function buildTargetUrl(pathname = '/', search = '') {
  const url = new URL(config.targetBaseUrl);
  url.pathname = pathname || '/';
  url.search = search || '';
  return url.toString();
}

function sendBridgeMessage(message) {
  if (!bridgeSocket || bridgeSocket.readyState !== WebSocket.OPEN) {
    return false;
  }

  bridgeSocket.send(JSON.stringify(message));
  return true;
}

function cleanupUpstream(sessionId, code = 1011, reason = 'bridge unavailable') {
  const state = upstreams.get(sessionId);
  if (!state) {
    return;
  }

  upstreams.delete(sessionId);

  if (
    state.socket.readyState === WebSocket.OPEN ||
    state.socket.readyState === WebSocket.CONNECTING
  ) {
    state.socket.close(code, reason.slice(0, 123));
  }
}

function closeAllUpstreams(code = 1011, reason = 'bridge disconnected') {
  for (const sessionId of upstreams.keys()) {
    cleanupUpstream(sessionId, code, reason);
  }
}

function handleOpenRequest(message) {
  const { sessionId, pathname, search, protocols = [] } = message;

  if (!sessionId || upstreams.has(sessionId)) {
    sendBridgeMessage({
      type: 'open_error',
      sessionId,
      error: 'invalid or duplicate sessionId'
    });
    return;
  }

  const targetUrl = buildTargetUrl(pathname, search);
  const socket = new WebSocket(targetUrl, protocols, {
    handshakeTimeout: config.handshakeTimeoutMs
  });

  const state = {
    socket,
    opened: false
  };

  upstreams.set(sessionId, state);
  log('opening upstream', sessionId, targetUrl);

  socket.on('open', () => {
    state.opened = true;
    sendBridgeMessage({
      type: 'opened',
      sessionId
    });
  });

  socket.on('message', (data, isBinary) => {
    sendBridgeMessage({
      type: 'data',
      sessionId,
      isBinary,
      payload: Buffer.from(data).toString('base64')
    });
  });

  socket.on('close', (code, reasonBuffer) => {
    const reason = reasonBuffer.toString();
    upstreams.delete(sessionId);

    sendBridgeMessage({
      type: 'closed',
      sessionId,
      code,
      reason
    });
  });

  socket.on('error', (error) => {
    log('upstream error', sessionId, error.message);
    sendBridgeMessage({
      type: state.opened ? 'error' : 'open_error',
      sessionId,
      error: error.message
    });
  });
}

function handleData(message) {
  const state = upstreams.get(message.sessionId);
  if (!state || state.socket.readyState !== WebSocket.OPEN) {
    return;
  }

  const payload = Buffer.from(message.payload || '', 'base64');
  state.socket.send(payload, { binary: Boolean(message.isBinary) });
}

function handleClose(message) {
  const state = upstreams.get(message.sessionId);
  if (!state) {
    return;
  }

  upstreams.delete(message.sessionId);
  state.socket.close(message.code || 1000, (message.reason || '').slice(0, 123));
}

function handleBridgeMessage(raw) {
  let message;

  try {
    message = JSON.parse(raw.toString());
  } catch (error) {
    log('invalid bridge message', error.message);
    return;
  }

  switch (message.type) {
    case 'open':
      handleOpenRequest(message);
      break;
    case 'data':
      handleData(message);
      break;
    case 'close':
      handleClose(message);
      break;
    case 'ping':
      sendBridgeMessage({ type: 'pong', timestamp: message.timestamp });
      break;
    default:
      log('ignored bridge message type', message.type);
      break;
  }
}

async function connectBridge() {
  while (true) {
    await new Promise((resolve) => {
      log('connecting to bridge', config.bridgeUrl);
      const socket = new WebSocket(config.bridgeUrl);
      bridgeSocket = socket;

      socket.on('open', () => {
        log('bridge connected');
        socket.send(
          JSON.stringify({
            type: 'hello',
            role: 'bridge-client'
          })
        );
      });

      socket.on('message', (data) => {
        handleBridgeMessage(data);
      });

      socket.on('close', (code, reasonBuffer) => {
        const reason = reasonBuffer.toString();
        log('bridge closed', code, reason);
        if (bridgeSocket === socket) {
          bridgeSocket = null;
        }

        closeAllUpstreams(1011, 'bridge disconnected');
        resolve();
      });

      socket.on('error', (error) => {
        log('bridge error', error.message);
      });
    });

    await delay(config.reconnectDelayMs);
  }
}

connectBridge().catch((error) => {
  log('fatal error', error);
  process.exitCode = 1;
});
