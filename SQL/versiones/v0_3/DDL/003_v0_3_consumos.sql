-- v0.3 / DDL 003
-- Nueva tabla consumos.

CREATE TABLE IF NOT EXISTS `consumos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `bota_id` int(11) NOT NULL,
  `consumible_id` int(11) NOT NULL,
  `consumo` decimal(12,4) NOT NULL DEFAULT 0.0000,
  PRIMARY KEY (`id`),
  KEY `idx_consumos_bota_id` (`bota_id`),
  KEY `idx_consumos_consumible_id` (`consumible_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

SET @col = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'consumos'
    AND column_name = 'consumo'
);
SET @sql = IF(
  @col = 0,
  'ALTER TABLE `consumos` ADD COLUMN `consumo` decimal(12,4) NOT NULL DEFAULT 0.0000 AFTER `consumible_id`',
  'ALTER TABLE `consumos` MODIFY COLUMN `consumo` decimal(12,4) NOT NULL DEFAULT 0.0000'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @fk = (
  SELECT CONSTRAINT_NAME
  FROM information_schema.referential_constraints
  WHERE constraint_schema = DATABASE()
    AND table_name = 'consumos'
    AND constraint_name = 'fk_consumos_bota'
  LIMIT 1
);
SET @sql = IF(
  @fk IS NULL,
  'ALTER TABLE `consumos` ADD CONSTRAINT `fk_consumos_bota` FOREIGN KEY (`bota_id`) REFERENCES `tipos_producto` (`id`) ON UPDATE CASCADE',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @fk = (
  SELECT CONSTRAINT_NAME
  FROM information_schema.referential_constraints
  WHERE constraint_schema = DATABASE()
    AND table_name = 'consumos'
    AND constraint_name = 'fk_consumos_consumible'
  LIMIT 1
);
SET @sql = IF(
  @fk IS NULL,
  'ALTER TABLE `consumos` ADD CONSTRAINT `fk_consumos_consumible` FOREIGN KEY (`consumible_id`) REFERENCES `tipos_producto` (`id`) ON UPDATE CASCADE',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
