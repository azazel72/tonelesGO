-- v2.1.007
-- Permitir trazabilidad_fabricacion sin fabricacion semanal seleccionada

SET @col_nullable = (
  SELECT IS_NULLABLE
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'trazabilidad_fabricacion'
    AND column_name = 'fabricacion_semanal_id'
  LIMIT 1
);
SET @sql = IF(
  @col_new = 1 AND @col_nullable = 'NO',
  'ALTER TABLE `trazabilidad_fabricacion` MODIFY COLUMN `fabricacion_semanal_id` int(11) NULL',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;