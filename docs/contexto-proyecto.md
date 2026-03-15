# Contexto Proyecto

## Resumen
`paezlobato` es una aplicacion web interna para gestion de fabricacion, recepcion, ubicacion, expedicion, cuadrantes y maestros.

Hay dos frontends principales:
- `index.html`: terminal operativo.
- `gestion.html`: interfaz de gestion/administracion con ventanas `WinBox` y tablas `Tabulator`.

El backend expone un WebSocket y usa `sqlmodel` sobre MySQL.

## Estructura Principal
- `index.html`: pantallas operativas del terminal.
- `gestion.html`: carga todos los modulos JS de gestion.
- `js/`: logica del frontend.
- `css/`: estilos del frontend.
- `servidor/`: backend, colector, rutas WS, modelos, DTOs y persistencia.
- `SQL/versiones/`: migraciones SQL ordenadas por version.

## Frontend Gestion
### Flujo base
- `js/gestion.js`:
  - mantiene `DATOS`.
  - define acciones del menu.
  - recibe respuestas WS `maestros` y `fabricacion`.
- `js/gestion-tablas.js`:
  - crea ventanas genericas.
  - crea tablas `Tabulator`.
  - registra eventos comunes de guardar, editar, filtros y recarga.
- `js/gestion-eventos-ui.js`:
  - gestiona botones de acciones por fila: insertar y borrar.
- `js/gestion-eventos-ws.js`:
  - enruta mensajes WS.

### Patron de ventanas genericas
Cada entidad suele tener un archivo `js/gestion-*.js` con una funcion `open...Win()`.

La configuracion habitual:
- `KEY`: nombre de tabla/ventana.
- `data_key`: `maestros` o `fabricacion`.
- `winbox.tipo`: normalmente `generico`.
- `tabulator.options.columns`: columnas de la tabla.
- `tabulator.options.data`: `Object.values(DATOS.... || {})`.

## Backend
### Flujo base
- `servidor/conexiones/crud_routes.py`:
  - recibe acciones WS.
  - responde al cliente.
  - emite `fabricacion_actualizar` a pantallas registradas con `set_pantalla`.
- `servidor/logica/acciones.py`:
  - mapa de acciones WS a metodos de `Colector`.
- `servidor/colector.py`:
  - carga maestros y fabricacion.
  - implementa CRUD generico.
  - contiene consultas especificas.
- `servidor/persistencia/generic_repository.py`:
  - operaciones basicas `list_all`, `insert`, `update`, `delete`.
- `servidor/persistencia/db.py`:
  - crea conexion o sesion.
  - no guarda configuraciones de busqueda.

### Modelado
- Modelos SQLModel en `servidor/modelos/`.
- DTOs en `servidor/dominio/`.
- Para cambios de campos suele haber que tocar:
  - modelo DB
  - DTO
  - SQL de migracion si aplica
  - columnas del frontend si el dato debe verse/editarse

## Fabricacion
### Entidades clave
- `pedidos`
- `fabricacion_semanal`
- `tipos_producto`
- `botas`
- `consumos`
- `trazabilidad_fabricacion`

### Archivos importantes
- `js/gestion-pedidos.js`
- `js/gestion-fabricacion-semanal.js`
- `js/gestion-pedidos-fabricacion.js`
- `js/terminal-fabricacion.js`
- `servidor/modelos/fabricacion/pedido_db.py`
- `servidor/dominio/fabricacion/pedido_dto.py`

## Estado actual relevante
### Pedidos
- `pedidos` tiene `cliente_id`.
- La ventana estandar de pedidos incluye `numero`.
- El modelo y DTO de pedidos ya contemplan `cliente_id`.
- La migracion SQL esta en:
  - `SQL/versiones/v0_4/DDL/012_v0_4_pedidos_cliente.sql`
  - enlazada desde `SQL/versiones/v0_4/main.sql`

### Planificacion de pedidos
- Existe una ventana especifica `planificacion_pedidos`.
- Archivo principal: `js/gestion-pedidos-fabricacion.js`.
- Objetivo de esta ventana:
  - listar pedidos con filtros
  - seleccionar uno
  - ver sus lineas de `fabricacion_semanal`
- Debe mantenerse separada de la ventana estandar `pedidos`.

### Filtros de planificacion_pedidos
Requisitos activos:
- `estado`, `cliente` y `tipo de bota`: multiseleccion.
- `material`: seleccion simple.
- por defecto: estados `Pendiente` y `Produccion`.
- la primera carga debe consultar al backend con filtros.
- `fabricacion_semanal` no debe cargarse hasta seleccionar pedido.

### Edicion en planificacion_pedidos
Requisitos activos:
- no editable por defecto.
- cada tabla debe tener su boton `Editar`.
- la tabla de fabricacion semanal debe quedar deshabilitada hasta seleccionar pedido.

## Convenciones utiles
- Para buscar texto/archivos, preferir `rg`.
- Para ediciones manuales, usar `apply_patch`.
- No asumir que `git status` funcionara sin configurar `safe.directory`.
- El proyecto usa mucho CRUD generico; antes de crear logica nueva, comprobar si basta con:
  - añadir campo al modelo/DTO
  - añadir columna al frontend
  - reutilizar `modificar_maestro`, `insertar_maestro`, `eliminar_maestro`

## Puntos delicados
- `fabricacion_actualizar` no siempre repinta una ventana abierta por si solo; a veces hace falta refresco explicito en frontend.
- Las ventanas personalizadas fuera del patron generico pueden romperse facilmente si duplican demasiada logica de Tabulator.
- Conviene simplificar y reutilizar patron generico siempre que no rompa el objetivo funcional.

## Recomendacion de trabajo futuro
Cuando se toque una funcionalidad, revisar en este orden:
1. modelo/DTO
2. accion WS
3. consulta en `Colector`
4. ventana JS afectada
5. refresco tras `fabricacion_actualizar` o `maestros`
6. validacion con `node --check` o `py_compile`
