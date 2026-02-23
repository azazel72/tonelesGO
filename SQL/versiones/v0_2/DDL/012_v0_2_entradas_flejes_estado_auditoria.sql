-- v0.2 / DDL 012
-- Entradas flejes: estado + columnas de auditoria.

SET @col = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'entradas_flejes'
    AND column_name = 'estado'
);
SET @sql = IF(@col = 0, 'ALTER TABLE `entradas_flejes` ADD COLUMN `estado` int(11) NOT NULL DEFAULT 0 AFTER `restante`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'entradas_flejes'
    AND column_name = 'created_at'
);
SET @sql = IF(@col = 0, 'ALTER TABLE `entradas_flejes` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT current_timestamp() AFTER `estado`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'entradas_flejes'
    AND column_name = 'updated_at'
);
SET @sql = IF(@col = 0, 'ALTER TABLE `entradas_flejes` ADD COLUMN `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() AFTER `created_at`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'entradas_flejes'
    AND column_name = 'deleted_at'
);
SET @sql = IF(@col = 0, 'ALTER TABLE `entradas_flejes` ADD COLUMN `deleted_at` timestamp NULL DEFAULT NULL AFTER `updated_at`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'entradas_flejes'
    AND column_name = 'is_deleted'
);
SET @sql = IF(@col = 0, 'ALTER TABLE `entradas_flejes` ADD COLUMN `is_deleted` tinyint(1) NOT NULL DEFAULT 0 AFTER `deleted_at`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'entradas_flejes'
    AND column_name = 'created_by'
);
SET @sql = IF(@col = 0, 'ALTER TABLE `entradas_flejes` ADD COLUMN `created_by` varchar(100) NOT NULL DEFAULT ''system'' AFTER `is_deleted`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'entradas_flejes'
    AND column_name = 'updated_by'
);
SET @sql = IF(@col = 0, 'ALTER TABLE `entradas_flejes` ADD COLUMN `updated_by` varchar(100) NOT NULL DEFAULT ''system'' AFTER `created_by`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'entradas_flejes'
    AND column_name = 'deleted_by'
);
SET @sql = IF(@col = 0, 'ALTER TABLE `entradas_flejes` ADD COLUMN `deleted_by` varchar(100) DEFAULT NULL AFTER `updated_by`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

