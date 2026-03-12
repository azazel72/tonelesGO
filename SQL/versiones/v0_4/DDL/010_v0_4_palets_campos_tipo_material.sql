-- Palets: 3 decimales + campos tipo/material.

SET @col = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'palets'
    AND column_name = 'tipo_producto_id'
);
SET @sql = IF(@col = 0, 'ALTER TABLE `palets` ADD COLUMN `tipo_producto_id` int(11) DEFAULT NULL AFTER `duela_tipo_id`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'palets'
    AND column_name = 'material_id'
);
SET @sql = IF(@col = 0, 'ALTER TABLE `palets` ADD COLUMN `material_id` int(11) DEFAULT NULL AFTER `tipo_producto_id`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

ALTER TABLE `palets`
  MODIFY `cubicaje` decimal(10,3) NOT NULL DEFAULT 0.000,
  MODIFY `consumido` decimal(10,3) NOT NULL DEFAULT 0.000;

SET @idx = (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = DATABASE() AND table_name = 'palets' AND index_name = 'idx_palets_tipo_producto_id'
);
SET @sql = IF(@idx = 0, 'ALTER TABLE `palets` ADD KEY `idx_palets_tipo_producto_id` (`tipo_producto_id`)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx = (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = DATABASE() AND table_name = 'palets' AND index_name = 'idx_palets_material_id'
);
SET @sql = IF(@idx = 0, 'ALTER TABLE `palets` ADD KEY `idx_palets_material_id` (`material_id`)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @fk = (
  SELECT COUNT(*) FROM information_schema.table_constraints
  WHERE table_schema = DATABASE()
    AND table_name = 'palets'
    AND constraint_name = 'fk_palets_tipo_producto'
    AND constraint_type = 'FOREIGN KEY'
);
SET @sql = IF(@fk = 0,
  'ALTER TABLE `palets` ADD CONSTRAINT `fk_palets_tipo_producto` FOREIGN KEY (`tipo_producto_id`) REFERENCES `tipos_producto` (`id`) ON UPDATE CASCADE',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @fk = (
  SELECT COUNT(*) FROM information_schema.table_constraints
  WHERE table_schema = DATABASE()
    AND table_name = 'palets'
    AND constraint_name = 'fk_palets_material'
    AND constraint_type = 'FOREIGN KEY'
);
SET @sql = IF(@fk = 0,
  'ALTER TABLE `palets` ADD CONSTRAINT `fk_palets_material` FOREIGN KEY (`material_id`) REFERENCES `materiales` (`id`) ON UPDATE CASCADE',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Backfill de tipo/material en palets ya existentes en base a duelas.
UPDATE `palets` p
JOIN `duelas` d ON d.id = p.duela_tipo_id
SET
  p.tipo_producto_id = d.tipo_producto_id,
  p.material_id = d.material_id
WHERE p.duela_tipo_id IS NOT NULL;
