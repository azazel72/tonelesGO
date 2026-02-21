-- v0.2 / DDL 007
-- Botas: renombrar columnas producto_*_id a fleje_*_id.

-- Añadir columnas fleje_*_id si no existen.
SET @col = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'botas'
    AND column_name = 'fleje_1_id'
);
SET @sql = IF(@col = 0, 'ALTER TABLE `botas` ADD COLUMN `fleje_1_id` int(11) DEFAULT NULL AFTER `tapa_producto_id`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'botas'
    AND column_name = 'fleje_2_id'
);
SET @sql = IF(@col = 0, 'ALTER TABLE `botas` ADD COLUMN `fleje_2_id` int(11) DEFAULT NULL AFTER `fleje_1_id`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'botas'
    AND column_name = 'fleje_3_id'
);
SET @sql = IF(@col = 0, 'ALTER TABLE `botas` ADD COLUMN `fleje_3_id` int(11) DEFAULT NULL AFTER `fleje_2_id`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'botas'
    AND column_name = 'fleje_4_id'
);
SET @sql = IF(@col = 0, 'ALTER TABLE `botas` ADD COLUMN `fleje_4_id` int(11) DEFAULT NULL AFTER `fleje_3_id`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'botas'
    AND column_name = 'fleje_5_id'
);
SET @sql = IF(@col = 0, 'ALTER TABLE `botas` ADD COLUMN `fleje_5_id` int(11) DEFAULT NULL AFTER `fleje_4_id`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Copiar datos si aún existen columnas antiguas producto_*_id.
SET @col = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'botas'
    AND column_name = 'producto_1_id'
);
SET @sql = IF(@col = 0, 'SELECT 1', 'UPDATE `botas` SET `fleje_1_id` = COALESCE(`fleje_1_id`, `producto_1_id`)');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'botas'
    AND column_name = 'producto_2_id'
);
SET @sql = IF(@col = 0, 'SELECT 1', 'UPDATE `botas` SET `fleje_2_id` = COALESCE(`fleje_2_id`, `producto_2_id`)');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'botas'
    AND column_name = 'producto_3_id'
);
SET @sql = IF(@col = 0, 'SELECT 1', 'UPDATE `botas` SET `fleje_3_id` = COALESCE(`fleje_3_id`, `producto_3_id`)');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'botas'
    AND column_name = 'producto_4_id'
);
SET @sql = IF(@col = 0, 'SELECT 1', 'UPDATE `botas` SET `fleje_4_id` = COALESCE(`fleje_4_id`, `producto_4_id`)');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'botas'
    AND column_name = 'producto_5_id'
);
SET @sql = IF(@col = 0, 'SELECT 1', 'UPDATE `botas` SET `fleje_5_id` = COALESCE(`fleje_5_id`, `producto_5_id`)');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Eliminar columnas antiguas si existen.
SET @col = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'botas'
    AND column_name = 'producto_1_id'
);
SET @sql = IF(@col = 0, 'SELECT 1', 'ALTER TABLE `botas` DROP COLUMN `producto_1_id`');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'botas'
    AND column_name = 'producto_2_id'
);
SET @sql = IF(@col = 0, 'SELECT 1', 'ALTER TABLE `botas` DROP COLUMN `producto_2_id`');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'botas'
    AND column_name = 'producto_3_id'
);
SET @sql = IF(@col = 0, 'SELECT 1', 'ALTER TABLE `botas` DROP COLUMN `producto_3_id`');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'botas'
    AND column_name = 'producto_4_id'
);
SET @sql = IF(@col = 0, 'SELECT 1', 'ALTER TABLE `botas` DROP COLUMN `producto_4_id`');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'botas'
    AND column_name = 'producto_5_id'
);
SET @sql = IF(@col = 0, 'SELECT 1', 'ALTER TABLE `botas` DROP COLUMN `producto_5_id`');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
