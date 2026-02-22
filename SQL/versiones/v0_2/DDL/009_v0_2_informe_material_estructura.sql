-- v0.2 / DDL 009
-- Campos necesarios para informe de material.

SET @col = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'palets'
    AND column_name = 'duela_tipo_id'
);
SET @sql = IF(@col = 0, 'ALTER TABLE `palets` ADD COLUMN `duela_tipo_id` int(11) DEFAULT NULL AFTER `linea_entrada_id`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx = (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'palets'
    AND index_name = 'idx_palets_duela_tipo_id'
);
SET @sql = IF(@idx = 0, 'ALTER TABLE `palets` ADD KEY `idx_palets_duela_tipo_id` (`duela_tipo_id`)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'botas'
    AND column_name = 'tipo_producto_id'
);
SET @sql = IF(@col = 0, 'ALTER TABLE `botas` ADD COLUMN `tipo_producto_id` int(11) DEFAULT NULL AFTER `codigo`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx = (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'botas'
    AND index_name = 'idx_botas_tipo_producto_id'
);
SET @sql = IF(@idx = 0, 'ALTER TABLE `botas` ADD KEY `idx_botas_tipo_producto_id` (`tipo_producto_id`)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
