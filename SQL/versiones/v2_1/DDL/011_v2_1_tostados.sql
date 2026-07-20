CREATE TABLE IF NOT EXISTS tostados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descripcion VARCHAR(100) NOT NULL
);

SET @schema_name = DATABASE();

SET @sql = IF(
    (
        SELECT COUNT(*)
        FROM information_schema.columns
        WHERE table_schema = @schema_name
          AND table_name = 'pedidos'
          AND column_name = 'tostado_id'
    ) = 0,
    'ALTER TABLE pedidos ADD COLUMN tostado_id INT NULL AFTER material_id',
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
          AND table_name = 'fabricacion_semanal'
          AND column_name = 'tostado_id'
    ) = 0,
    'ALTER TABLE fabricacion_semanal ADD COLUMN tostado_id INT NULL AFTER material_id',
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
          AND table_name = 'productos'
          AND column_name = 'tostado_id'
    ) = 0,
    'ALTER TABLE productos ADD COLUMN tostado_id INT NULL AFTER material_id',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
    (
        SELECT COUNT(*)
        FROM information_schema.table_constraints
        WHERE table_schema = @schema_name
          AND table_name = 'pedidos'
          AND constraint_name = 'fk_pedidos_tostado'
    ) = 0,
    'ALTER TABLE pedidos ADD CONSTRAINT fk_pedidos_tostado FOREIGN KEY (tostado_id) REFERENCES tostados(id)',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
    (
        SELECT COUNT(*)
        FROM information_schema.table_constraints
        WHERE table_schema = @schema_name
          AND table_name = 'productos'
          AND constraint_name = 'fk_productos_tostado'
    ) = 0,
    'ALTER TABLE productos ADD CONSTRAINT fk_productos_tostado FOREIGN KEY (tostado_id) REFERENCES tostados(id)',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
    (
        SELECT COUNT(*)
        FROM information_schema.table_constraints
        WHERE table_schema = @schema_name
          AND table_name = 'fabricacion_semanal'
          AND constraint_name = 'fk_fabricacion_semanal_tostado'
    ) = 0,
    'ALTER TABLE fabricacion_semanal ADD CONSTRAINT fk_fabricacion_semanal_tostado FOREIGN KEY (tostado_id) REFERENCES tostados(id)',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

INSERT INTO tostados (descripcion)
SELECT 'tostado ligero'
WHERE NOT EXISTS (SELECT 1 FROM tostados WHERE descripcion = 'tostado ligero');

INSERT INTO tostados (descripcion)
SELECT 'tostado medio'
WHERE NOT EXISTS (SELECT 1 FROM tostados WHERE descripcion = 'tostado medio');

INSERT INTO tostados (descripcion)
SELECT 'tostado medio alto'
WHERE NOT EXISTS (SELECT 1 FROM tostados WHERE descripcion = 'tostado medio alto');

INSERT INTO tostados (descripcion)
SELECT 'tostado alto'
WHERE NOT EXISTS (SELECT 1 FROM tostados WHERE descripcion = 'tostado alto');

INSERT INTO tostados (descripcion)
SELECT 'tostado fuerte'
WHERE NOT EXISTS (SELECT 1 FROM tostados WHERE descripcion = 'tostado fuerte');
