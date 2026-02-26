-- v0.3 / DDL 002
-- Duelas: nuevo campo tipo_producto_id (FK a tipos_producto).
-- Tipos de producto: eliminar columna consumo.

SET @col = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'duelas'
    AND column_name = 'tipo_producto_id'
);
SET @sql = IF(@col = 0, 'ALTER TABLE `duelas` ADD COLUMN `tipo_producto_id` int(11) DEFAULT NULL AFTER `material_id`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx = (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'duelas'
    AND index_name = 'idx_duelas_tipo_producto_id'
);
SET @sql = IF(@idx = 0, 'ALTER TABLE `duelas` ADD KEY `idx_duelas_tipo_producto_id` (`tipo_producto_id`)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @fk = (
  SELECT CONSTRAINT_NAME
  FROM information_schema.referential_constraints
  WHERE constraint_schema = DATABASE()
    AND table_name = 'duelas'
    AND constraint_name = 'fk_duelas_tipos_producto'
  LIMIT 1
);
SET @sql = IF(
  @fk IS NULL,
  'ALTER TABLE `duelas` ADD CONSTRAINT `fk_duelas_tipos_producto` FOREIGN KEY (`tipo_producto_id`) REFERENCES `tipos_producto` (`id`) ON UPDATE CASCADE',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'tipos_producto'
    AND column_name = 'consumo'
);
SET @sql = IF(@col = 0, 'SELECT 1', 'ALTER TABLE `tipos_producto` DROP COLUMN `consumo`');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
