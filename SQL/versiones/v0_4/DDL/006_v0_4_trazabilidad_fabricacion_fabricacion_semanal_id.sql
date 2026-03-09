-- v0.4.006
-- Renombrar trazabilidad_fabricacion.linea_fabricacion_id -> fabricacion_semanal_id

SET @fk_old = (
  SELECT kcu.CONSTRAINT_NAME
  FROM information_schema.key_column_usage kcu
  WHERE kcu.table_schema = DATABASE()
    AND kcu.table_name = 'trazabilidad_fabricacion'
    AND kcu.column_name = 'linea_fabricacion_id'
    AND kcu.referenced_table_name = 'fabricacion_semanal'
  LIMIT 1
);
SET @sql = IF(@fk_old IS NULL, 'SELECT 1', CONCAT('ALTER TABLE `trazabilidad_fabricacion` DROP FOREIGN KEY `', @fk_old, '`'));
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_old = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'trazabilidad_fabricacion'
    AND column_name = 'linea_fabricacion_id'
);
SET @col_new = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'trazabilidad_fabricacion'
    AND column_name = 'fabricacion_semanal_id'
);
SET @sql = IF(
  @col_old = 1 AND @col_new = 0,
  'ALTER TABLE `trazabilidad_fabricacion` CHANGE COLUMN `linea_fabricacion_id` `fabricacion_semanal_id` int(11) NOT NULL',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx = (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'trazabilidad_fabricacion'
    AND column_name = 'fabricacion_semanal_id'
);
SET @sql = IF(@idx = 0, 'ALTER TABLE `trazabilidad_fabricacion` ADD KEY `idx_trazabilidad_fabricacion_fabricacion_semanal_id` (`fabricacion_semanal_id`)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @fk_new = (
  SELECT COUNT(*) FROM information_schema.table_constraints
  WHERE table_schema = DATABASE()
    AND table_name = 'trazabilidad_fabricacion'
    AND constraint_name = 'fk_trazabilidad_fabricacion_fabricacion_semanal'
    AND constraint_type = 'FOREIGN KEY'
);
SET @sql = IF(
  @fk_new = 0,
  'ALTER TABLE `trazabilidad_fabricacion` ADD CONSTRAINT `fk_trazabilidad_fabricacion_fabricacion_semanal` FOREIGN KEY (`fabricacion_semanal_id`) REFERENCES `fabricacion_semanal` (`id`) ON UPDATE CASCADE',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
