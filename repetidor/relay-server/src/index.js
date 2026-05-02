import process from 'node:process';
import { randomUUID } from 'node:crypto';
import { WebSocketServer, WebSocket } from 'ws';
import 'dotenv/config';

const config = {
  bridgePort: Number(process.env.BRIDGE_PORT || 7001),
  mobilePort: Number(process.env.MOBILE_PORT || 7002),
  bridgePath: process.env.BRIDGE_PATH || '/bridge'
};

let bridgeSocket = null;
const mobileSessions = new Map();

function log(...args) {
  console.log(new Date().toISOString(), '[relay-server]', ...args);
}

function sendBridgeMessage(message) {
  if (!bridgeSocket || bridgeSocket.readyState !== WebSocket.OPEN) {
    return false;
  }

  bridgeSocket.send(JSON.stringify(message));
  return true;
}

function closeAllMobiles(code = 1011, reason = 'bridge unavailable') {
  for (const [sessionId, session] of mobileSessions.entries()) {
    mobileSessions.delete(sessionId);
    session.socket.close(code, reason.slice(0, 123));
  }
}

function closeMobile(sessionId, code = 1000, reason = '') {
  const session = mobileSessions.get(sessionId);
  if (!session) {
    return;
  }

  mobileSessions.delete(sessionId);
  if (
    session.socket.readyState === WebSocket.OPEN ||
    session.socket.readyState === WebSocket.CONNECTING
  ) {
    session.socket.close(code, reason.slice(0, 123));
  }
}

function handleBridgeMessage(raw) {
  let message;

  try {
    message = JSON.parse(raw.toString());
  } catch (error) {
    log('invalid bridge payload', error.message);
    return;
  }

  const session = mobileSessions.get(message.sessionId);

  switch (message.type) {
    case 'hello':
      log('bridge client identified');
      break;
    case 'opened':
      if (session) {
        session.opened = true;
      }
      break;
    case 'data':
      if (!session || session.socket.readyState !== WebSocket.OPEN) {
        return;
      }

      session.socket.send(Buffer.from(message.payload || '', 'base64'), {
        binary: Boolean(message.isBinary)
      });
      break;
    case 'closed':
      closeMobile(message.sessionId, message.code || 1000, message.reason || '');
      break;
    case 'open_error':
      log('open error', message.sessionId, message.error);
      closeMobile(message.sessionId, 1011, message.error || 'upstream open error');
      break;
    case 'error':
      log('stream error', message.sessionId, message.error);
      closeMobile(message.sessionId, 1011, message.error || 'upstream error');
      break;
    case 'pong':
      break;
    default:
      log('ignored bridge message type', message.type);
      break;
  }
}

const bridgeWss = new WebSocketServer({
  port: config.bridgePort,
  path: config.bridgePath
});

bridgeWss.on('connection', (socket, request) => {
  if (bridgeSocket) {
    log('rejecting extra bridge connection from', request.socket.remoteAddress);
    socket.close(1013, 'bridge already connected');
    return;
  }

  bridgeSocket = socket;
  log('bridge connected from', request.socket.remoteAddress);

  socket.on('message', (data) => {
    handleBridgeMessage(data);
  });

  socket.on('close', (code, reasonBuffer) => {
    const reason = reasonBuffer.toString();
    log('bridge disconnected', code, reason);
    if (bridgeSocket === socket) {
      bridgeSocket = null;
    }

    closeAllMobiles(1011, 'bridge disconnected');
  });

  socket.on('error', (error) => {
    log('bridge error', error.message);
  });
});

const mobileWss = new WebSocketServer({
  port: config.mobilePort
});

mobileWss.on('connection', (socket, request) => {
  if (!bridgeSocket || bridgeSocket.readyState !== WebSocket.OPEN) {
    socket.close(1013, 'bridge unavailable');
    return;
  }

  const sessionId = randomUUID();
  const url = new URL(request.url, `ws://${request.headers.host || 'localhost'}`);
  const protocolsHeader = request.headers['sec-websocket-protocol'] || '';
  const protocols = protocolsHeader
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  mobileSessions.set(sessionId, {
    socket,
    opened: false
  });

  log('mobile connected', sessionId, url.pathname + url.search);
  sendBridgeMessage({
    type: 'open',
    sessionId,
    pathname: url.pathname,
    search: url.search,
    protocols
  });

  socket.on('message', (data, isBinary) => {
    if (!mobileSessions.has(sessionId)) {
      return;
    }

    sendBridgeMessage({
      type: 'data',
      sessionId,
      isBinary,
      payload: Buffer.from(data).toString('base64')
    });
  });

  socket.on('close', (code, reasonBuffer) => {
    const reason = reasonBuffer.toString();
    const stillTracked = mobileSessions.delete(sessionId);
    log('mobile disconnected', sessionId, code, reason);

    if (stillTracked && bridgeSocket && bridgeSocket.readyState === WebSocket.OPEN) {
      sendBridgeMessage({
        type: 'close',
        sessionId,
        code,
        reason
      });
    }
  });

  socket.on('error', (error) => {
    log('mobile error', sessionId, error.message);
  });
});

log(`bridge listener ws://0.0.0.0:${config.bridgePort}${config.bridgePath}`);
log(`mobile listener ws://0.0.0.0:${config.mobilePort}`);
