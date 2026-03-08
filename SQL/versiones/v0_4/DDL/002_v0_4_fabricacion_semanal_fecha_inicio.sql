-- v0.4.002
-- Agrega fabricacion_semanal.fecha_inicio si no existe.

SET @col := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'fabricacion_semanal'
    AND column_name = 'fecha_inicio'
);

SET @sql := IF(
  @col = 0,
  'ALTER TABLE `fabricacion_semanal` ADD COLUMN `fecha_inicio` date NULL AFTER `pedido_id`',
  'SELECT 1'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

