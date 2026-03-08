-- v0.4.001
-- Agrega pedidos.cantidad_fabricada si no existe.

SET @col := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'pedidos'
    AND column_name = 'cantidad_fabricada'
);

SET @sql := IF(
  @col = 0,
  'ALTER TABLE `pedidos` ADD COLUMN `cantidad_fabricada` int(11) NOT NULL DEFAULT 0 AFTER `cantidad`',
  'SELECT 1'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

