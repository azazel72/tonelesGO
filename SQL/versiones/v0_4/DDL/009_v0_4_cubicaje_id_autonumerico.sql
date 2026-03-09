-- v0.4.009
-- Ajuste de cubicaje para tener id autonumerico propio
-- y mantener tipo_producto_id como clave unica externa.

SET @tiene_tabla = (
  SELECT COUNT(*)
  FROM information_schema.tables
  WHERE table_schema = DATABASE()
    AND table_name = 'cubicaje'
);

SET @tiene_id = (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'cubicaje'
    AND column_name = 'id'
);

SET @uq = (
  SELECT COUNT(*)
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'cubicaje'
    AND index_name = 'uq_cubicaje_tipo_producto_id'
);

SET @sql = IF(
  @tiene_tabla = 1 AND @tiene_id = 0 AND @uq = 0,
  'ALTER TABLE `cubicaje` ADD UNIQUE KEY `uq_cubicaje_tipo_producto_id` (`tipo_producto_id`)',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  @tiene_tabla = 1 AND @tiene_id = 0,
  'ALTER TABLE `cubicaje` DROP PRIMARY KEY, ADD COLUMN `id` int(11) NOT NULL AUTO_INCREMENT FIRST, ADD PRIMARY KEY (`id`)',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @uq = (
  SELECT COUNT(*)
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'cubicaje'
    AND index_name = 'uq_cubicaje_tipo_producto_id'
);

SET @sql = IF(
  @tiene_tabla = 1 AND @uq = 0,
  'ALTER TABLE `cubicaje` ADD UNIQUE KEY `uq_cubicaje_tipo_producto_id` (`tipo_producto_id`)',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
