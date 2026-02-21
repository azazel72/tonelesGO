-- v0.2 / DML 001
-- Seed hardcodeado por entidad, sin depender de la tabla `estados`.
-- Luego se podan los no usados en cada entidad.

-- Catálogo base hardcodeado (mismo contenido en cada entidad)
-- 0 Sin estado
-- 1 Proceso de produccion
-- 2 Zona de carga
-- 3 En camino
-- 4 Envinado
-- 5 Vuelta a reparación
-- 6 Destino definitivo

DELETE FROM `estados_ordenes_fabricacion`;
INSERT INTO `estados_ordenes_fabricacion` (`id`, `descripcion`) VALUES
(0, 'Sin estado'),
(1, 'Proceso de produccion'),
(2, 'Zona de carga'),
(3, 'En camino'),
(4, 'Envinado'),
(5, 'Vuelta a reparación'),
(6, 'Destino definitivo');

DELETE FROM `estados_lineas_fabricacion`;
INSERT INTO `estados_lineas_fabricacion` (`id`, `descripcion`) VALUES
(0, 'Sin estado'),
(1, 'Proceso de produccion'),
(2, 'Zona de carga'),
(3, 'En camino'),
(4, 'Envinado'),
(5, 'Vuelta a reparación'),
(6, 'Destino definitivo');

DELETE FROM `estados_botas`;
INSERT INTO `estados_botas` (`id`, `descripcion`) VALUES
(0, 'Sin estado'),
(1, 'Proceso de produccion'),
(2, 'Zona de carga'),
(3, 'En camino'),
(4, 'Envinado'),
(5, 'Vuelta a reparación'),
(6, 'Destino definitivo');

DELETE FROM `estados_trazabilidad_fabricacion`;
INSERT INTO `estados_trazabilidad_fabricacion` (`id`, `descripcion`) VALUES
(0, 'Sin estado'),
(1, 'Proceso de produccion'),
(2, 'Zona de carga'),
(3, 'En camino'),
(4, 'Envinado'),
(5, 'Vuelta a reparación'),
(6, 'Destino definitivo');

