-- v0.2 / DDL 006
-- Ajustes en productos y botas.

-- productos: eliminar venta_id.
SET @col = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'productos'
    AND column_name = 'venta_id'
);
SET @sql = IF(@col = 0, 'SELECT 1', 'ALTER TABLE `productos` DROP COLUMN `venta_id`');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- botas: añadir 5 columnas nuevas para ids de productos.
SET @col = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'botas'
    AND column_name = 'producto_1_id'
);
SET @sql = IF(@col = 0, 'ALTER TABLE `botas` ADD COLUMN `producto_1_id` int(11) DEFAULT NULL AFTER `tapa_producto_id`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'botas'
    AND column_name = 'producto_2_id'
);
SET @sql = IF(@col = 0, 'ALTER TABLE `botas` ADD COLUMN `producto_2_id` int(11) DEFAULT NULL AFTER `producto_1_id`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'botas'
    AND column_name = 'producto_3_id'
);
SET @sql = IF(@col = 0, 'ALTER TABLE `botas` ADD COLUMN `producto_3_id` int(11) DEFAULT NULL AFTER `producto_2_id`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'botas'
    AND column_name = 'producto_4_id'
);
SET @sql = IF(@col = 0, 'ALTER TABLE `botas` ADD COLUMN `producto_4_id` int(11) DEFAULT NULL AFTER `producto_3_id`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'botas'
    AND column_name = 'producto_5_id'
);
SET @sql = IF(@col = 0, 'ALTER TABLE `botas` ADD COLUMN `producto_5_id` int(11) DEFAULT NULL AFTER `producto_4_id`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
