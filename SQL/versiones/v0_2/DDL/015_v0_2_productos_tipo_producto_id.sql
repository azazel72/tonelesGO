-- v0.2 / DDL 015
-- Productos: nuevo campo tipo_producto_id nullable y relleno historico.

SET @col = (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'productos'
    AND column_name = 'tipo_producto_id'
);
SET @sql = IF(@col = 0, 'ALTER TABLE `productos` ADD COLUMN `tipo_producto_id` int(11) NULL AFTER `tipo`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx = (
  SELECT COUNT(*)
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'productos'
    AND index_name = 'idx_productos_tipo_producto_id'
);
SET @sql = IF(@idx = 0, 'ALTER TABLE `productos` ADD KEY `idx_productos_tipo_producto_id` (`tipo_producto_id`)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

UPDATE `productos` p
INNER JOIN `fabricacion_semanal` fs ON fs.`id` = p.`produccion_id`
SET
  p.`tipo_producto_id` = COALESCE(p.`tipo_producto_id`, fs.`tipo_producto_id`),
  p.`material_id` = COALESCE(p.`material_id`, fs.`material_id`)
WHERE p.`tipo_producto_id` IS NULL OR p.`material_id` IS NULL;

SET @fk = (
  SELECT constraint_name
  FROM information_schema.referential_constraints
  WHERE constraint_schema = DATABASE()
    AND table_name = 'productos'
    AND constraint_name = 'fk_productos_tipos_producto'
  LIMIT 1
);
SET @sql = IF(
  @fk IS NULL,
  'ALTER TABLE `productos` ADD CONSTRAINT `fk_productos_tipos_producto` FOREIGN KEY (`tipo_producto_id`) REFERENCES `tipos_producto` (`id`) ON UPDATE CASCADE',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
