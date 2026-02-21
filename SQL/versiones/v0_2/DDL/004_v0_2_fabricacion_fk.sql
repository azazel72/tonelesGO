-- v0.2 / DDL 004
-- FKs nuevas de material_id.

SET @idx = (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'lineas_fabricacion'
    AND index_name = 'fk_lineas_fabricacion_materiales'
);
SET @sql = IF(@idx = 0, 'ALTER TABLE `lineas_fabricacion` ADD KEY `fk_lineas_fabricacion_materiales` (`material_id`)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx = (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'productos'
    AND index_name = 'fk_productos_materiales'
);
SET @sql = IF(@idx = 0, 'ALTER TABLE `productos` ADD KEY `fk_productos_materiales` (`material_id`)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx = (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'botas'
    AND index_name = 'fk_botas_materiales'
);
SET @sql = IF(@idx = 0, 'ALTER TABLE `botas` ADD KEY `fk_botas_materiales` (`material_id`)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @fk = (
  SELECT CONSTRAINT_NAME
  FROM information_schema.referential_constraints
  WHERE constraint_schema = DATABASE()
    AND table_name = 'lineas_fabricacion'
    AND constraint_name = 'fk_lineas_fabricacion_materiales'
  LIMIT 1
);
SET @sql = IF(
  @fk IS NULL,
  'ALTER TABLE `lineas_fabricacion` ADD CONSTRAINT `fk_lineas_fabricacion_materiales` FOREIGN KEY (`material_id`) REFERENCES `materiales` (`id`) ON UPDATE CASCADE',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @fk = (
  SELECT CONSTRAINT_NAME
  FROM information_schema.referential_constraints
  WHERE constraint_schema = DATABASE()
    AND table_name = 'productos'
    AND constraint_name = 'fk_productos_materiales'
  LIMIT 1
);
SET @sql = IF(
  @fk IS NULL,
  'ALTER TABLE `productos` ADD CONSTRAINT `fk_productos_materiales` FOREIGN KEY (`material_id`) REFERENCES `materiales` (`id`) ON UPDATE CASCADE',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @fk = (
  SELECT CONSTRAINT_NAME
  FROM information_schema.referential_constraints
  WHERE constraint_schema = DATABASE()
    AND table_name = 'botas'
    AND constraint_name = 'fk_botas_materiales'
  LIMIT 1
);
SET @sql = IF(
  @fk IS NULL,
  'ALTER TABLE `botas` ADD CONSTRAINT `fk_botas_materiales` FOREIGN KEY (`material_id`) REFERENCES `materiales` (`id`) ON UPDATE CASCADE',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
