# Puente WebSocket simple

Este workspace contiene dos aplicaciones Node.js totalmente independientes:

- `relay-server`: va en la VPS. Acepta una sola conexion del puente y multiples conexiones de moviles.
- `bridge-client`: va en la red interna. Se conecta al `relay-server` y abre conexiones reales contra tu servidor WebSocket interno.

## Flujo

1. Un movil se conecta a `relay-server`.
2. `relay-server` genera un `sessionId` y se lo comunica a `bridge-client`.
3. `bridge-client` abre una nueva conexion WebSocket hacia tu servidor interno (`TARGET_BASE_URL`).
4. Los mensajes del movil se reenvian por el canal puente hasta esa nueva conexion interna.
5. Las respuestas del servidor interno vuelven por el canal puente y `relay-server` las entrega al movil correcto.
6. Si cae la conexion entre `bridge-client` y `relay-server`, `relay-server` cierra todas las conexiones de moviles.

## Instalacion

En cada app:

```powershell
cd relay-server
npm install

cd ../bridge-client
npm install
```

## Configuracion

### VPS: `relay-server`

Copiar `relay-server/.env.example` y definir:

```env
BRIDGE_PORT=7001
MOBILE_PORT=7002
BRIDGE_PATH=/bridge
```

### Red interna: `bridge-client`

Copiar `bridge-client/.env.example` y definir:

```env
BRIDGE_URL=ws://tu-vps:7001/bridge
TARGET_BASE_URL=ws://127.0.0.1:5000
RECONNECT_DELAY_MS=3000
HANDSHAKE_TIMEOUT_MS=10000
```

`TARGET_BASE_URL` es la URL base del WebSocket real. El `pathname` y la query del movil se conservan, así que si el movil entra por ejemplo a `/canal?id=9`, la conexion interna saldrá a `ws://127.0.0.1:5000/canal?id=9`.

## Ejecucion

```powershell
cd relay-server
npm start
```

```powershell
cd bridge-client
npm start
```

## Notas

- El protocolo puente usa mensajes JSON y empaqueta binarios en base64.
- Se soportan multiples moviles simultaneos y una sola conexion de puente.
- Si tu servidor interno exige headers especiales distintos de path/query/subprotocolos, habria que añadirlos al protocolo.
