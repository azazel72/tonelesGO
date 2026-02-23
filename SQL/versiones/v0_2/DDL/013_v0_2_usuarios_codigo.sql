-- v0.2 / DDL 013
-- Usuarios: nuevo campo codigo (2 chars) y backfill inicial con id en formato 00.

SET @col = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'usuarios'
    AND column_name = 'codigo'
);
SET @sql = IF(@col = 0, 'ALTER TABLE `usuarios` ADD COLUMN `codigo` varchar(2) NULL AFTER `id`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

UPDATE `usuarios`
SET `codigo` = LPAD(CAST(`id` AS CHAR), 2, '0')
WHERE (`codigo` IS NULL OR `codigo` = '')
  AND `id` IS NOT NULL;

