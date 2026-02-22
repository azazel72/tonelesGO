-- v0.2 / DDL 011
-- FK palets.estado -> estados_palets.id

SET @idx = (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'palets'
    AND index_name = 'fk_palets_estados_palets'
);
SET @sql = IF(@idx = 0, 'ALTER TABLE `palets` ADD KEY `fk_palets_estados_palets` (`estado`)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @fk = (
  SELECT CONSTRAINT_NAME
  FROM information_schema.referential_constraints
  WHERE constraint_schema = DATABASE()
    AND table_name = 'palets'
    AND constraint_name = 'fk_palets_estados_palets'
  LIMIT 1
);
SET @sql = IF(
  @fk IS NULL,
  'ALTER TABLE `palets` ADD CONSTRAINT `fk_palets_estados_palets` FOREIGN KEY (`estado`) REFERENCES `estados_palets` (`id`) ON UPDATE CASCADE',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
