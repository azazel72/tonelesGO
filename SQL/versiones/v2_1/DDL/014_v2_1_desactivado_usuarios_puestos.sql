SET @schema_name = DATABASE();

SET @sql = IF(
    (
        SELECT COUNT(*)
        FROM information_schema.columns
        WHERE table_schema = @schema_name
          AND table_name = 'usuarios'
          AND column_name = 'desactivado'
    ) = 0,
    'ALTER TABLE usuarios ADD COLUMN desactivado TINYINT(1) NOT NULL DEFAULT 0 AFTER empleado',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
    (
        SELECT COUNT(*)
        FROM information_schema.columns
        WHERE table_schema = @schema_name
          AND table_name = 'puestos_trabajo'
          AND column_name = 'desactivado'
    ) = 0,
    'ALTER TABLE puestos_trabajo ADD COLUMN desactivado TINYINT(1) NOT NULL DEFAULT 0 AFTER fabricacion',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
