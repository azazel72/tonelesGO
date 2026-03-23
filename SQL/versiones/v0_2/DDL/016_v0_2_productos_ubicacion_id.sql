-- v0.2 / DDL 016
-- Productos: nuevo campo ubicacion_id nullable.

SET @col = (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'productos'
    AND column_name = 'ubicacion_id'
);
SET @sql = IF(@col = 0, 'ALTER TABLE `productos` ADD COLUMN `ubicacion_id` int(11) NULL AFTER `material_id`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx = (
  SELECT COUNT(*)
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'productos'
    AND index_name = 'idx_productos_ubicacion_id'
);
SET @sql = IF(@idx = 0, 'ALTER TABLE `productos` ADD KEY `idx_productos_ubicacion_id` (`ubicacion_id`)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @fk = (
  SELECT constraint_name
  FROM information_schema.referential_constraints
  WHERE constraint_schema = DATABASE()
    AND table_name = 'productos'
    AND constraint_name = 'fk_productos_ubicaciones'
  LIMIT 1
);
SET @sql = IF(
  @fk IS NULL,
  'ALTER TABLE `productos` ADD CONSTRAINT `fk_productos_ubicaciones` FOREIGN KEY (`ubicacion_id`) REFERENCES `ubicaciones` (`id`) ON UPDATE CASCADE',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
