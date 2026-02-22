-- v0.2 / DDL 010
-- Palets: nuevos campos + catálogo estados_palets (sin FK).

CREATE TABLE IF NOT EXISTS `estados_palets` (
  `id` int(11) NOT NULL,
  `descripcion` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET @pk = (
  SELECT COUNT(*)
  FROM information_schema.table_constraints
  WHERE table_schema = DATABASE()
    AND table_name = 'estados_palets'
    AND constraint_type = 'PRIMARY KEY'
);
SET @sql = IF(@pk = 0, 'ALTER TABLE `estados_palets` ADD PRIMARY KEY (`id`)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

ALTER TABLE `estados_palets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

SET @col = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'palets'
    AND column_name = 'cubicaje'
);
SET @sql = IF(@col = 0, 'ALTER TABLE `palets` ADD COLUMN `cubicaje` decimal(10,2) NOT NULL DEFAULT 0.00 AFTER `duela_tipo_id`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'palets'
    AND column_name = 'consumido'
);
SET @sql = IF(@col = 0, 'ALTER TABLE `palets` ADD COLUMN `consumido` decimal(10,2) NOT NULL DEFAULT 0.00 AFTER `cubicaje`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'palets'
    AND column_name = 'estado'
);
SET @sql = IF(@col = 0, 'ALTER TABLE `palets` ADD COLUMN `estado` int(11) DEFAULT NULL AFTER `consumido`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
