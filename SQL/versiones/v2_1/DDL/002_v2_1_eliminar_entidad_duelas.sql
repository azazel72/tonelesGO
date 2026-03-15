-- Elimina la entidad duelas, sustituyendola por tipo_producto_id + material_id.

-- 1. Asegurar columnas nuevas en lineas_entrada.
SET @col = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'lineas_entrada'
    AND column_name = 'tipo_producto_id'
);
SET @sql = IF(@col = 0, 'ALTER TABLE `lineas_entrada` ADD COLUMN `tipo_producto_id` int(11) DEFAULT NULL AFTER `entrada_id`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'lineas_entrada'
    AND column_name = 'material_id'
);
SET @sql = IF(@col = 0, 'ALTER TABLE `lineas_entrada` ADD COLUMN `material_id` int(11) DEFAULT NULL AFTER `tipo_producto_id`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx = (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = DATABASE() AND table_name = 'lineas_entrada' AND index_name = 'idx_lineas_entrada_tipo_producto_id'
);
SET @sql = IF(@idx = 0, 'ALTER TABLE `lineas_entrada` ADD KEY `idx_lineas_entrada_tipo_producto_id` (`tipo_producto_id`)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx = (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = DATABASE() AND table_name = 'lineas_entrada' AND index_name = 'idx_lineas_entrada_material_id'
);
SET @sql = IF(@idx = 0, 'ALTER TABLE `lineas_entrada` ADD KEY `idx_lineas_entrada_material_id` (`material_id`)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @fk = (
  SELECT COUNT(*) FROM information_schema.table_constraints
  WHERE table_schema = DATABASE()
    AND table_name = 'lineas_entrada'
    AND constraint_name = 'fk_lineas_entrada_tipos_producto'
    AND constraint_type = 'FOREIGN KEY'
);
SET @sql = IF(@fk = 0,
  'ALTER TABLE `lineas_entrada` ADD CONSTRAINT `fk_lineas_entrada_tipos_producto` FOREIGN KEY (`tipo_producto_id`) REFERENCES `tipos_producto` (`id`) ON UPDATE CASCADE',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @fk = (
  SELECT COUNT(*) FROM information_schema.table_constraints
  WHERE table_schema = DATABASE()
    AND table_name = 'lineas_entrada'
    AND constraint_name = 'fk_lineas_entrada_materiales'
    AND constraint_type = 'FOREIGN KEY'
);
SET @sql = IF(@fk = 0,
  'ALTER TABLE `lineas_entrada` ADD CONSTRAINT `fk_lineas_entrada_materiales` FOREIGN KEY (`material_id`) REFERENCES `materiales` (`id`) ON UPDATE CASCADE',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 2. Backfill lineas_entrada desde duelas si la tabla sigue existiendo.
SET @duelas_existe = (
  SELECT COUNT(*) FROM information_schema.tables
  WHERE table_schema = DATABASE()
    AND table_name = 'duelas'
);
SET @sql = IF(@duelas_existe > 0,
  'UPDATE `lineas_entrada` le JOIN `duelas` d ON d.id = le.duela_id
   SET le.tipo_producto_id = COALESCE(le.tipo_producto_id, d.tipo_producto_id),
       le.material_id = COALESCE(le.material_id, d.material_id)
   WHERE le.duela_id IS NOT NULL',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 3. Backfill palets desde lineas_entrada y, como fallback, desde duelas.
UPDATE `palets` p
LEFT JOIN `lineas_entrada` le ON le.id = p.linea_entrada_id
SET
  p.tipo_producto_id = COALESCE(p.tipo_producto_id, le.tipo_producto_id),
  p.material_id = COALESCE(p.material_id, le.material_id)
WHERE p.linea_entrada_id IS NOT NULL;

SET @sql = IF(@duelas_existe > 0,
  'UPDATE `palets` p JOIN `duelas` d ON d.id = p.duela_tipo_id
   SET p.tipo_producto_id = COALESCE(p.tipo_producto_id, d.tipo_producto_id),
       p.material_id = COALESCE(p.material_id, d.material_id)
   WHERE p.duela_tipo_id IS NOT NULL',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 4. Eliminar FK/indices/columnas antiguas en lineas_entrada.
SET @fk = (
  SELECT COUNT(*) FROM information_schema.table_constraints
  WHERE table_schema = DATABASE()
    AND table_name = 'lineas_entrada'
    AND constraint_name = 'fk_lineas_entrada_duelas'
    AND constraint_type = 'FOREIGN KEY'
);
SET @sql = IF(@fk > 0, 'ALTER TABLE `lineas_entrada` DROP FOREIGN KEY `fk_lineas_entrada_duelas`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx = (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = DATABASE() AND table_name = 'lineas_entrada' AND index_name = 'fk_lineas_entrada_duelas'
);
SET @sql = IF(@idx > 0, 'ALTER TABLE `lineas_entrada` DROP INDEX `fk_lineas_entrada_duelas`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'lineas_entrada'
    AND column_name = 'duela_id'
);
SET @sql = IF(@col > 0, 'ALTER TABLE `lineas_entrada` DROP COLUMN `duela_id`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 5. Eliminar indice/columna antigua en palets.
SET @idx = (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = DATABASE() AND table_name = 'palets' AND index_name = 'idx_palets_duela_tipo_id'
);
SET @sql = IF(@idx > 0, 'ALTER TABLE `palets` DROP INDEX `idx_palets_duela_tipo_id`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'palets'
    AND column_name = 'duela_tipo_id'
);
SET @sql = IF(@col > 0, 'ALTER TABLE `palets` DROP COLUMN `duela_tipo_id`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 6. Eliminar la tabla duelas.
SET @sql = IF(@duelas_existe > 0, 'DROP TABLE `duelas`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
