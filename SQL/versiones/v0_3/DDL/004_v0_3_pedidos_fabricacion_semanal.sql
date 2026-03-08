-- Renombre definitivo de dominio Fabricacion:
-- ordenes_fabricacion -> pedidos
-- lineas_fabricacion -> fabricacion_semanal
-- estados_ordenes_fabricacion -> estados_pedidos
-- estados_lineas_fabricacion -> estados_fabricacion_semanal

SET @tbl = (
  SELECT COUNT(*)
  FROM information_schema.tables
  WHERE table_schema = DATABASE()
    AND table_name = 'ordenes_fabricacion'
);
SET @tbl_new = (
  SELECT COUNT(*)
  FROM information_schema.tables
  WHERE table_schema = DATABASE()
    AND table_name = 'pedidos'
);
SET @sql = IF(@tbl = 1 AND @tbl_new = 0, 'RENAME TABLE `ordenes_fabricacion` TO `pedidos`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @tbl = (
  SELECT COUNT(*)
  FROM information_schema.tables
  WHERE table_schema = DATABASE()
    AND table_name = 'lineas_fabricacion'
);
SET @tbl_new = (
  SELECT COUNT(*)
  FROM information_schema.tables
  WHERE table_schema = DATABASE()
    AND table_name = 'fabricacion_semanal'
);
SET @sql = IF(@tbl = 1 AND @tbl_new = 0, 'RENAME TABLE `lineas_fabricacion` TO `fabricacion_semanal`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @tbl = (
  SELECT COUNT(*)
  FROM information_schema.tables
  WHERE table_schema = DATABASE()
    AND table_name = 'estados_ordenes_fabricacion'
);
SET @tbl_new = (
  SELECT COUNT(*)
  FROM information_schema.tables
  WHERE table_schema = DATABASE()
    AND table_name = 'estados_pedidos'
);
SET @sql = IF(@tbl = 1 AND @tbl_new = 0, 'RENAME TABLE `estados_ordenes_fabricacion` TO `estados_pedidos`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @tbl = (
  SELECT COUNT(*)
  FROM information_schema.tables
  WHERE table_schema = DATABASE()
    AND table_name = 'estados_lineas_fabricacion'
);
SET @tbl_new = (
  SELECT COUNT(*)
  FROM information_schema.tables
  WHERE table_schema = DATABASE()
    AND table_name = 'estados_fabricacion_semanal'
);
SET @sql = IF(@tbl = 1 AND @tbl_new = 0, 'RENAME TABLE `estados_lineas_fabricacion` TO `estados_fabricacion_semanal`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Campos nuevos en pedidos
SET @col = (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'pedidos'
    AND column_name = 'tipo_producto_id'
);
SET @sql = IF(@col = 0, 'ALTER TABLE `pedidos` ADD COLUMN `tipo_producto_id` int(11) DEFAULT NULL AFTER `numero`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col = (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'pedidos'
    AND column_name = 'material_id'
);
SET @sql = IF(@col = 0, 'ALTER TABLE `pedidos` ADD COLUMN `material_id` int(11) DEFAULT NULL AFTER `tipo_producto_id`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col = (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'pedidos'
    AND column_name = 'cantidad'
);
SET @sql = IF(@col = 0, 'ALTER TABLE `pedidos` ADD COLUMN `cantidad` int(11) NOT NULL DEFAULT 0 AFTER `material_id`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Renombrar orden_id -> pedido_id en fabricacion_semanal
SET @col_orden = (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'fabricacion_semanal'
    AND column_name = 'orden_id'
);
SET @col_pedido = (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'fabricacion_semanal'
    AND column_name = 'pedido_id'
);
SET @sql = IF(
  @col_orden = 1 AND @col_pedido = 0,
  'ALTER TABLE `fabricacion_semanal` CHANGE COLUMN `orden_id` `pedido_id` int(11) NOT NULL',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col = (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'fabricacion_semanal'
    AND column_name = 'pedido_id'
);
SET @sql = IF(@col = 0, 'ALTER TABLE `fabricacion_semanal` ADD COLUMN `pedido_id` int(11) NOT NULL AFTER `id`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx = (
  SELECT COUNT(*)
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'fabricacion_semanal'
    AND index_name = 'idx_fabricacion_semanal_pedido_id'
);
SET @sql = IF(@idx = 0, 'ALTER TABLE `fabricacion_semanal` ADD INDEX `idx_fabricacion_semanal_pedido_id` (`pedido_id`)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @fk = (
  SELECT CONSTRAINT_NAME
  FROM information_schema.referential_constraints
  WHERE constraint_schema = DATABASE()
    AND table_name = 'fabricacion_semanal'
    AND constraint_name = 'fk_fabricacion_semanal_pedidos'
  LIMIT 1
);
SET @sql = IF(
  @fk IS NULL,
  'ALTER TABLE `fabricacion_semanal` ADD CONSTRAINT `fk_fabricacion_semanal_pedidos` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`) ON UPDATE CASCADE',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
