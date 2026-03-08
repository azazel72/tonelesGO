-- v0.4.005
-- productos_operarios: codigo_batidero nullable con dominio controlado.

SET @col = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'productos_operarios'
    AND column_name = 'codigo_batidero'
);
SET @sql = IF(@col = 0,
  'ALTER TABLE `productos_operarios` ADD COLUMN `codigo_batidero` int(11) NULL AFTER `usuario_id`',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @chk = (
  SELECT COUNT(*) FROM information_schema.table_constraints
  WHERE table_schema = DATABASE()
    AND table_name = 'productos_operarios'
    AND constraint_name = 'chk_productos_operarios_codigo_batidero'
    AND constraint_type = 'CHECK'
);
SET @sql = IF(@chk = 0,
  'ALTER TABLE `productos_operarios` ADD CONSTRAINT `chk_productos_operarios_codigo_batidero` CHECK (`codigo_batidero` IS NULL OR `codigo_batidero` IN (11,12,13,21,22,23))',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
