SET @schema_name = DATABASE();

SET @sql = IF(
    (
        SELECT COUNT(*)
        FROM information_schema.columns
        WHERE table_schema = @schema_name
          AND table_name = 'puestos_trabajo'
          AND column_name = 'activo'
    ) = 1,
    'ALTER TABLE puestos_trabajo DROP COLUMN activo',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
