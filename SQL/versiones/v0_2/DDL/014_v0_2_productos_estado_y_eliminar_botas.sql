-- v0.2 / DDL 014
-- Pasar el estado de botas a productos y renombrar el catalogo de estados.

SET @fk = (
  SELECT constraint_name
  FROM information_schema.referential_constraints
  WHERE constraint_schema = DATABASE()
    AND table_name = 'productos'
    AND constraint_name = 'fk_productos_estados_entidad'
  LIMIT 1
);
SET @sql = IF(@fk IS NULL, 'SELECT 1', 'ALTER TABLE `productos` DROP FOREIGN KEY `fk_productos_estados_entidad`');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @fk = (
  SELECT constraint_name
  FROM information_schema.referential_constraints
  WHERE constraint_schema = DATABASE()
    AND table_name = 'botas'
    AND constraint_name = 'fk_botas_estados_entidad'
  LIMIT 1
);
SET @sql = IF(@fk IS NULL, 'SELECT 1', 'ALTER TABLE `botas` DROP FOREIGN KEY `fk_botas_estados_entidad`');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @tabla_estados_botas = (
  SELECT COUNT(*)
  FROM information_schema.tables
  WHERE table_schema = DATABASE()
    AND table_name = 'estados_botas'
);
SET @tabla_estados_productos = (
  SELECT COUNT(*)
  FROM information_schema.tables
  WHERE table_schema = DATABASE()
    AND table_name = 'estados_productos'
);
SET @sql = IF(
  @tabla_estados_botas = 1 AND @tabla_estados_productos = 0,
  'RENAME TABLE `estados_botas` TO `estados_productos`',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col = (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'productos'
    AND column_name = 'estado'
);
SET @sql = IF(@col = 0, 'ALTER TABLE `productos` ADD COLUMN `estado` int(11) DEFAULT 1 AFTER `produccion_id`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx = (
  SELECT COUNT(*)
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'productos'
    AND index_name = 'idx_productos_estado'
);
SET @sql = IF(@idx = 0, 'ALTER TABLE `productos` ADD KEY `idx_productos_estado` (`estado`)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @tabla_botas = (
  SELECT COUNT(*)
  FROM information_schema.tables
  WHERE table_schema = DATABASE()
    AND table_name = 'botas'
);
SET @sql = IF(
  @tabla_botas = 0,
  'SELECT 1',
  'UPDATE `productos` p
   INNER JOIN `botas` b ON UPPER(TRIM(p.`codigo`)) = UPPER(TRIM(b.`codigo`))
   SET p.`estado` = COALESCE(NULLIF(b.`estado`, 0), NULLIF(p.`estado`, 0), 1)
   WHERE UPPER(TRIM(p.`tipo`)) = ''BOTA'''
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

UPDATE `productos`
SET `estado` = 1
WHERE `estado` IS NULL OR `estado` = 0;

UPDATE `productos` p
LEFT JOIN `estados_productos` ep ON ep.`id` = p.`estado`
SET p.`estado` = 1
WHERE ep.`id` IS NULL;

SET @fk = (
  SELECT constraint_name
  FROM information_schema.referential_constraints
  WHERE constraint_schema = DATABASE()
    AND table_name = 'productos'
    AND constraint_name = 'fk_productos_estados_entidad'
  LIMIT 1
);
SET @sql = IF(
  @fk IS NULL,
  'ALTER TABLE `productos` ADD CONSTRAINT `fk_productos_estados_entidad` FOREIGN KEY (`estado`) REFERENCES `estados_productos` (`id`) ON UPDATE CASCADE',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @fk = (
  SELECT constraint_name
  FROM information_schema.referential_constraints
  WHERE constraint_schema = DATABASE()
    AND table_name = 'botas'
    AND constraint_name = 'fk_botas_materiales'
  LIMIT 1
);
SET @sql = IF(@fk IS NULL, 'SELECT 1', 'ALTER TABLE `botas` DROP FOREIGN KEY `fk_botas_materiales`');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

DROP TABLE IF EXISTS `botas`;
