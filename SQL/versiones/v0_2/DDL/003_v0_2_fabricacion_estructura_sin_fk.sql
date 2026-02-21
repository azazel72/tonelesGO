-- v0.2 / DDL 003
-- Cambios de estructura solicitados (sin FKs nuevos).

-- ordenes_fabricacion:
-- - elimina cliente_id
-- - añade descripcion corta y fecha_finalizacion
SET @col = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'ordenes_fabricacion'
    AND column_name = 'descripcion'
);
SET @sql = IF(@col = 0, 'ALTER TABLE `ordenes_fabricacion` ADD COLUMN `descripcion` varchar(120) NOT NULL DEFAULT '''' AFTER `numero`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'ordenes_fabricacion'
    AND column_name = 'fecha_finalizacion'
);
SET @sql = IF(@col = 0, 'ALTER TABLE `ordenes_fabricacion` ADD COLUMN `fecha_finalizacion` date DEFAULT NULL AFTER `fecha`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @fk = (
  SELECT CONSTRAINT_NAME
  FROM information_schema.referential_constraints
  WHERE constraint_schema = DATABASE()
    AND table_name = 'ordenes_fabricacion'
    AND constraint_name = 'fk_ordenes_fabricacion_clientes'
  LIMIT 1
);
SET @sql = IF(@fk IS NULL, 'SELECT 1', 'ALTER TABLE `ordenes_fabricacion` DROP FOREIGN KEY `fk_ordenes_fabricacion_clientes`');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx = (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'ordenes_fabricacion'
    AND index_name = 'fk_ordenes_fabricacion_clientes'
);
SET @sql = IF(@idx = 0, 'SELECT 1', 'ALTER TABLE `ordenes_fabricacion` DROP INDEX `fk_ordenes_fabricacion_clientes`');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'ordenes_fabricacion'
    AND column_name = 'cliente_id'
);
SET @sql = IF(@col = 0, 'SELECT 1', 'ALTER TABLE `ordenes_fabricacion` DROP COLUMN `cliente_id`');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- tipos_producto:
-- - elimina id_material
-- - añade consumo decimal(10,2)
SET @col = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'tipos_producto'
    AND column_name = 'consumo'
);
SET @sql = IF(@col = 0, 'ALTER TABLE `tipos_producto` ADD COLUMN `consumo` decimal(10,2) NOT NULL DEFAULT 0.00 AFTER `descripcion`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @fk = (
  SELECT CONSTRAINT_NAME
  FROM information_schema.referential_constraints
  WHERE constraint_schema = DATABASE()
    AND table_name = 'tipos_producto'
    AND constraint_name = 'fk_tipos_producto_materiales'
  LIMIT 1
);
SET @sql = IF(@fk IS NULL, 'SELECT 1', 'ALTER TABLE `tipos_producto` DROP FOREIGN KEY `fk_tipos_producto_materiales`');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx = (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'tipos_producto'
    AND index_name = 'fk_tipos_producto_materiales'
);
SET @sql = IF(@idx = 0, 'SELECT 1', 'ALTER TABLE `tipos_producto` DROP INDEX `fk_tipos_producto_materiales`');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'tipos_producto'
    AND column_name = 'id_material'
);
SET @sql = IF(@col = 0, 'SELECT 1', 'ALTER TABLE `tipos_producto` DROP COLUMN `id_material`');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- lineas_fabricacion, productos y botas ahora llevan material_id.
SET @col = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'lineas_fabricacion'
    AND column_name = 'material_id'
);
SET @sql = IF(@col = 0, 'ALTER TABLE `lineas_fabricacion` ADD COLUMN `material_id` int(11) DEFAULT NULL AFTER `tipo_producto_id`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'productos'
    AND column_name = 'material_id'
);
SET @sql = IF(@col = 0, 'ALTER TABLE `productos` ADD COLUMN `material_id` int(11) DEFAULT NULL AFTER `tipo`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'botas'
    AND column_name = 'material_id'
);
SET @sql = IF(@col = 0, 'ALTER TABLE `botas` ADD COLUMN `material_id` int(11) DEFAULT NULL AFTER `codigo`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
