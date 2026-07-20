SET @schema_name = DATABASE();

SET @sql = IF(
    (
        SELECT COUNT(*)
        FROM information_schema.columns
        WHERE table_schema = @schema_name
          AND table_name = 'puestos_trabajo'
          AND column_name = 'es_maquinaria'
    ) = 1,
    'ALTER TABLE puestos_trabajo CHANGE COLUMN es_maquinaria listado TINYINT(1) NOT NULL DEFAULT 0',
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
          AND column_name = 'listado'
    ) = 0,
    'ALTER TABLE puestos_trabajo ADD COLUMN listado TINYINT(1) NOT NULL DEFAULT 0 AFTER orden',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
