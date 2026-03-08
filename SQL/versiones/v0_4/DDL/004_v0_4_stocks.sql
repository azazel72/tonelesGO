-- v0.4.004
-- Tabla stocks para inventario por tipo/material/instalacion y estado de palets.

CREATE TABLE IF NOT EXISTS `stocks` (
  `id` int(11) NOT NULL,
  `tipo_producto` int(11) DEFAULT NULL,
  `id_material` int(11) DEFAULT NULL,
  `id_instalacion` int(11) DEFAULT NULL,
  `cantidad_stock` decimal(10,2) NOT NULL DEFAULT 0.00,
  `cantidad_consumida` decimal(10,2) NOT NULL DEFAULT 0.00,
  `estado_palets` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET @pk = (
  SELECT COUNT(*)
  FROM information_schema.table_constraints
  WHERE table_schema = DATABASE()
    AND table_name = 'stocks'
    AND constraint_type = 'PRIMARY KEY'
);
SET @sql = IF(@pk = 0, 'ALTER TABLE `stocks` ADD PRIMARY KEY (`id`)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

ALTER TABLE `stocks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

SET @idx = (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = DATABASE() AND table_name = 'stocks' AND index_name = 'idx_stocks_tipo_producto'
);
SET @sql = IF(@idx = 0, 'ALTER TABLE `stocks` ADD KEY `idx_stocks_tipo_producto` (`tipo_producto`)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx = (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = DATABASE() AND table_name = 'stocks' AND index_name = 'idx_stocks_id_material'
);
SET @sql = IF(@idx = 0, 'ALTER TABLE `stocks` ADD KEY `idx_stocks_id_material` (`id_material`)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx = (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = DATABASE() AND table_name = 'stocks' AND index_name = 'idx_stocks_id_instalacion'
);
SET @sql = IF(@idx = 0, 'ALTER TABLE `stocks` ADD KEY `idx_stocks_id_instalacion` (`id_instalacion`)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx = (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = DATABASE() AND table_name = 'stocks' AND index_name = 'idx_stocks_estado_palets'
);
SET @sql = IF(@idx = 0, 'ALTER TABLE `stocks` ADD KEY `idx_stocks_estado_palets` (`estado_palets`)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @fk = (
  SELECT COUNT(*) FROM information_schema.table_constraints
  WHERE table_schema = DATABASE()
    AND table_name = 'stocks'
    AND constraint_name = 'fk_stocks_tipos_producto'
    AND constraint_type = 'FOREIGN KEY'
);
SET @sql = IF(@fk = 0,
  'ALTER TABLE `stocks` ADD CONSTRAINT `fk_stocks_tipos_producto` FOREIGN KEY (`tipo_producto`) REFERENCES `tipos_producto` (`id`) ON UPDATE CASCADE',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @fk = (
  SELECT COUNT(*) FROM information_schema.table_constraints
  WHERE table_schema = DATABASE()
    AND table_name = 'stocks'
    AND constraint_name = 'fk_stocks_materiales'
    AND constraint_type = 'FOREIGN KEY'
);
SET @sql = IF(@fk = 0,
  'ALTER TABLE `stocks` ADD CONSTRAINT `fk_stocks_materiales` FOREIGN KEY (`id_material`) REFERENCES `materiales` (`id`) ON UPDATE CASCADE',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @fk = (
  SELECT COUNT(*) FROM information_schema.table_constraints
  WHERE table_schema = DATABASE()
    AND table_name = 'stocks'
    AND constraint_name = 'fk_stocks_instalaciones'
    AND constraint_type = 'FOREIGN KEY'
);
SET @sql = IF(@fk = 0,
  'ALTER TABLE `stocks` ADD CONSTRAINT `fk_stocks_instalaciones` FOREIGN KEY (`id_instalacion`) REFERENCES `instalaciones` (`id`) ON UPDATE CASCADE',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @fk = (
  SELECT COUNT(*) FROM information_schema.table_constraints
  WHERE table_schema = DATABASE()
    AND table_name = 'stocks'
    AND constraint_name = 'fk_stocks_estados_palets'
    AND constraint_type = 'FOREIGN KEY'
);
SET @sql = IF(@fk = 0,
  'ALTER TABLE `stocks` ADD CONSTRAINT `fk_stocks_estados_palets` FOREIGN KEY (`estado_palets`) REFERENCES `estados_palets` (`id`) ON UPDATE CASCADE',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
