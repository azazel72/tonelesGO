-- v0.2 / DDL 002
-- Reasignación de FKs de estado a catálogo por entidad.

SET @fk = (
  SELECT CONSTRAINT_NAME
  FROM information_schema.referential_constraints
  WHERE constraint_schema = DATABASE()
    AND table_name = 'ordenes_fabricacion'
    AND constraint_name = 'fk_ordenes_fabricacion_estados'
  LIMIT 1
);
SET @sql = IF(@fk IS NULL, 'SELECT 1', 'ALTER TABLE `ordenes_fabricacion` DROP FOREIGN KEY `fk_ordenes_fabricacion_estados`');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @fk = (
  SELECT CONSTRAINT_NAME
  FROM information_schema.referential_constraints
  WHERE constraint_schema = DATABASE()
    AND table_name = 'lineas_fabricacion'
    AND constraint_name = 'fk_lineas_fabricacion_estados'
  LIMIT 1
);
SET @sql = IF(@fk IS NULL, 'SELECT 1', 'ALTER TABLE `lineas_fabricacion` DROP FOREIGN KEY `fk_lineas_fabricacion_estados`');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @fk = (
  SELECT CONSTRAINT_NAME
  FROM information_schema.referential_constraints
  WHERE constraint_schema = DATABASE()
    AND table_name = 'botas'
    AND constraint_name = 'fk_botas_estados'
  LIMIT 1
);
SET @sql = IF(@fk IS NULL, 'SELECT 1', 'ALTER TABLE `botas` DROP FOREIGN KEY `fk_botas_estados`');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @fk = (
  SELECT CONSTRAINT_NAME
  FROM information_schema.referential_constraints
  WHERE constraint_schema = DATABASE()
    AND table_name = 'trazabilidad_fabricacion'
    AND constraint_name = 'fk_trazabilidad_fabricacion_estados'
  LIMIT 1
);
SET @sql = IF(@fk IS NULL, 'SELECT 1', 'ALTER TABLE `trazabilidad_fabricacion` DROP FOREIGN KEY `fk_trazabilidad_fabricacion_estados`');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @fk = (
  SELECT CONSTRAINT_NAME
  FROM information_schema.referential_constraints
  WHERE constraint_schema = DATABASE()
    AND table_name = 'ordenes_fabricacion'
    AND constraint_name = 'fk_ordenes_fabricacion_estados_entidad'
  LIMIT 1
);
SET @sql = IF(
  @fk IS NULL,
  'ALTER TABLE `ordenes_fabricacion` ADD CONSTRAINT `fk_ordenes_fabricacion_estados_entidad` FOREIGN KEY (`estado`) REFERENCES `estados_ordenes_fabricacion` (`id`) ON UPDATE CASCADE',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @fk = (
  SELECT CONSTRAINT_NAME
  FROM information_schema.referential_constraints
  WHERE constraint_schema = DATABASE()
    AND table_name = 'lineas_fabricacion'
    AND constraint_name = 'fk_lineas_fabricacion_estados_entidad'
  LIMIT 1
);
SET @sql = IF(
  @fk IS NULL,
  'ALTER TABLE `lineas_fabricacion` ADD CONSTRAINT `fk_lineas_fabricacion_estados_entidad` FOREIGN KEY (`estado`) REFERENCES `estados_lineas_fabricacion` (`id`) ON UPDATE CASCADE',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @fk = (
  SELECT CONSTRAINT_NAME
  FROM information_schema.referential_constraints
  WHERE constraint_schema = DATABASE()
    AND table_name = 'botas'
    AND constraint_name = 'fk_botas_estados_entidad'
  LIMIT 1
);
SET @sql = IF(
  @fk IS NULL,
  'ALTER TABLE `botas` ADD CONSTRAINT `fk_botas_estados_entidad` FOREIGN KEY (`estado`) REFERENCES `estados_botas` (`id`) ON UPDATE CASCADE',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @fk = (
  SELECT CONSTRAINT_NAME
  FROM information_schema.referential_constraints
  WHERE constraint_schema = DATABASE()
    AND table_name = 'trazabilidad_fabricacion'
    AND constraint_name = 'fk_trazabilidad_fabricacion_estados_entidad'
  LIMIT 1
);
SET @sql = IF(
  @fk IS NULL,
  'ALTER TABLE `trazabilidad_fabricacion` ADD CONSTRAINT `fk_trazabilidad_fabricacion_estados_entidad` FOREIGN KEY (`estado`) REFERENCES `estados_trazabilidad_fabricacion` (`id`) ON UPDATE CASCADE',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
