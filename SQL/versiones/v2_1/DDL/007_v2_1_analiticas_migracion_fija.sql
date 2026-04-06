SET @tabla_analiticas_vino = (
  SELECT COUNT(*)
  FROM information_schema.tables
  WHERE table_schema = DATABASE()
    AND table_name = 'analiticas_vino'
);

SET @tabla_analiticas = (
  SELECT COUNT(*)
  FROM information_schema.tables
  WHERE table_schema = DATABASE()
    AND table_name = 'analiticas'
);

SET @sql = IF(
  @tabla_analiticas_vino = 1 AND @tabla_analiticas = 0,
  'RENAME TABLE `analiticas_vino` TO `analiticas`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

ALTER TABLE `analiticas`
  ADD COLUMN IF NOT EXISTS `grado_alcoholico` VARCHAR(64) NULL AFTER `estado`,
  ADD COLUMN IF NOT EXISTS `ph` VARCHAR(64) NULL AFTER `grado_alcoholico`,
  ADD COLUMN IF NOT EXISTS `acidez_total` VARCHAR(64) NULL AFTER `ph`,
  ADD COLUMN IF NOT EXISTS `acidez_volatil` VARCHAR(64) NULL AFTER `acidez_total`,
  ADD COLUMN IF NOT EXISTS `so2_libre` VARCHAR(64) NULL AFTER `acidez_volatil`,
  ADD COLUMN IF NOT EXISTS `so2_total` VARCHAR(64) NULL AFTER `so2_libre`,
  ADD COLUMN IF NOT EXISTS `azucar_residual` VARCHAR(64) NULL AFTER `so2_total`,
  ADD COLUMN IF NOT EXISTS `temperatura` VARCHAR(64) NULL AFTER `azucar_residual`;

SET @tabla_valores = (
  SELECT COUNT(*)
  FROM information_schema.tables
  WHERE table_schema = DATABASE()
    AND table_name = 'analiticas_vino_valores'
);

SET @sql = IF(
  @tabla_valores = 1,
  "UPDATE `analiticas` a
   LEFT JOIN (
     SELECT analitica_id,
            MAX(CASE WHEN clave = 'grado_alcoholico' THEN valor END) AS grado_alcoholico,
            MAX(CASE WHEN clave = 'ph' THEN valor END) AS ph,
            MAX(CASE WHEN clave = 'acidez_total' THEN valor END) AS acidez_total,
            MAX(CASE WHEN clave = 'acidez_volatil' THEN valor END) AS acidez_volatil,
            MAX(CASE WHEN clave = 'so2_libre' THEN valor END) AS so2_libre,
            MAX(CASE WHEN clave = 'so2_total' THEN valor END) AS so2_total,
            MAX(CASE WHEN clave = 'azucar_residual' THEN valor END) AS azucar_residual,
            MAX(CASE WHEN clave = 'temperatura' THEN valor END) AS temperatura
     FROM `analiticas_vino_valores`
     GROUP BY analitica_id
   ) v ON v.analitica_id = a.id
   SET a.grado_alcoholico = COALESCE(a.grado_alcoholico, v.grado_alcoholico),
       a.ph = COALESCE(a.ph, v.ph),
       a.acidez_total = COALESCE(a.acidez_total, v.acidez_total),
       a.acidez_volatil = COALESCE(a.acidez_volatil, v.acidez_volatil),
       a.so2_libre = COALESCE(a.so2_libre, v.so2_libre),
       a.so2_total = COALESCE(a.so2_total, v.so2_total),
       a.azucar_residual = COALESCE(a.azucar_residual, v.azucar_residual),
       a.temperatura = COALESCE(a.temperatura, v.temperatura)",
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @fk_analitica = (
  SELECT constraint_name
  FROM information_schema.table_constraints
  WHERE table_schema = DATABASE()
    AND table_name = 'bota_envinada_analitica'
    AND constraint_type = 'FOREIGN KEY'
    AND constraint_name = 'fk_bota_envinada_analitica_analitica'
  LIMIT 1
);

SET @sql = IF(
  @fk_analitica IS NOT NULL,
  'ALTER TABLE `bota_envinada_analitica` DROP FOREIGN KEY `fk_bota_envinada_analitica_analitica`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

ALTER TABLE `bota_envinada_analitica`
  ADD CONSTRAINT `fk_bota_envinada_analitica_analitica`
    FOREIGN KEY (`analitica_id`) REFERENCES `analiticas` (`id`)
    ON DELETE RESTRICT;

SET @sql = IF(
  @tabla_valores = 1,
  'DROP TABLE `analiticas_vino_valores`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

UPDATE `estados_productos`
SET `descripcion` = 'Pendiente de envinar'
WHERE `id` = 3;
