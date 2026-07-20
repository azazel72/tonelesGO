SET @schema_name = DATABASE();

SET @sql = IF(
    (
        SELECT COUNT(*)
        FROM information_schema.columns
        WHERE table_schema = @schema_name
          AND table_name = 'usuarios'
          AND column_name = 'activo'
    ) = 0,
    'ALTER TABLE usuarios ADD COLUMN activo TINYINT(1) NOT NULL DEFAULT 1 AFTER empleado',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

UPDATE usuarios SET activo = 1;

SET @sql = IF(
    (
        SELECT COUNT(*)
        FROM information_schema.columns
        WHERE table_schema = @schema_name
          AND table_name = 'usuarios'
          AND column_name = 'desactivado'
    ) = 1,
    'ALTER TABLE usuarios DROP COLUMN desactivado',
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
          AND column_name = 'activo'
    ) = 0,
    'ALTER TABLE puestos_trabajo ADD COLUMN activo TINYINT(1) NOT NULL DEFAULT 1 AFTER fabricacion',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

UPDATE puestos_trabajo SET activo = 1;

SET @sql = IF(
    (
        SELECT COUNT(*)
        FROM information_schema.columns
        WHERE table_schema = @schema_name
          AND table_name = 'puestos_trabajo'
          AND column_name = 'desactivado'
    ) = 1,
    'ALTER TABLE puestos_trabajo DROP COLUMN desactivado',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
