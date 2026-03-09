-- v0.4.007
-- Ambientes: eliminar modelo por fila/toma y pasar a columnas:
-- temperatura_1..3, humedad_1..3

SET @tbl = (
  SELECT COUNT(*) FROM information_schema.tables
  WHERE table_schema = DATABASE()
    AND table_name = 'ambientes'
);

SET @col_toma = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'ambientes'
    AND column_name = 'toma'
);

-- Solo migramos si existe la tabla y aún está el modelo antiguo con `toma`.
SET @sql = IF(@tbl = 1 AND @col_toma = 1, '
  CREATE TABLE IF NOT EXISTS `ambientes_new` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `fecha` date NOT NULL,
    `temperatura_1` decimal(6,2) NOT NULL DEFAULT 0.00,
    `humedad_1` decimal(6,2) NOT NULL DEFAULT 0.00,
    `temperatura_2` decimal(6,2) NOT NULL DEFAULT 0.00,
    `humedad_2` decimal(6,2) NOT NULL DEFAULT 0.00,
    `temperatura_3` decimal(6,2) NOT NULL DEFAULT 0.00,
    `humedad_3` decimal(6,2) NOT NULL DEFAULT 0.00,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_ambientes_fecha` (`fecha`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(@tbl = 1 AND @col_toma = 1, '
  INSERT INTO `ambientes_new` (`fecha`, `temperatura_1`, `humedad_1`, `temperatura_2`, `humedad_2`, `temperatura_3`, `humedad_3`)
  SELECT
    a.`fecha`,
    COALESCE(MAX(CASE WHEN a.`toma` = 1 THEN a.`temperatura` END), 0.00) AS temperatura_1,
    COALESCE(MAX(CASE WHEN a.`toma` = 1 THEN a.`humedad` END), 0.00) AS humedad_1,
    COALESCE(MAX(CASE WHEN a.`toma` = 2 THEN a.`temperatura` END), 0.00) AS temperatura_2,
    COALESCE(MAX(CASE WHEN a.`toma` = 2 THEN a.`humedad` END), 0.00) AS humedad_2,
    COALESCE(MAX(CASE WHEN a.`toma` = 3 THEN a.`temperatura` END), 0.00) AS temperatura_3,
    COALESCE(MAX(CASE WHEN a.`toma` = 3 THEN a.`humedad` END), 0.00) AS humedad_3
  FROM `ambientes` a
  GROUP BY a.`fecha`
  ON DUPLICATE KEY UPDATE
    `temperatura_1` = VALUES(`temperatura_1`),
    `humedad_1` = VALUES(`humedad_1`),
    `temperatura_2` = VALUES(`temperatura_2`),
    `humedad_2` = VALUES(`humedad_2`),
    `temperatura_3` = VALUES(`temperatura_3`),
    `humedad_3` = VALUES(`humedad_3`);
', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(@tbl = 1 AND @col_toma = 1, 'RENAME TABLE `ambientes` TO `ambientes_old`, `ambientes_new` TO `ambientes`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
