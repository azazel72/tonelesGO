-- v2.1.009
-- productos_operarios: ampliar codigo_batidero a manana, media tarde y tarde.

SET @chk = (
  SELECT COUNT(*) FROM information_schema.table_constraints
  WHERE table_schema = DATABASE()
    AND table_name = 'productos_operarios'
    AND constraint_name = 'chk_productos_operarios_codigo_batidero'
    AND constraint_type = 'CHECK'
);
SET @sql = IF(@chk > 0,
  'ALTER TABLE `productos_operarios` DROP CONSTRAINT `chk_productos_operarios_codigo_batidero`',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

ALTER TABLE `productos_operarios`
  ADD CONSTRAINT `chk_productos_operarios_codigo_batidero`
  CHECK (`codigo_batidero` IS NULL OR `codigo_batidero` IN (11,12,13,21,22,23,31,32,33,41,42,43,51,52,53));
