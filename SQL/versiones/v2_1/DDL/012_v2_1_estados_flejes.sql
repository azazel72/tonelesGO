CREATE TABLE IF NOT EXISTS estados_flejes (
    id INT PRIMARY KEY,
    descripcion VARCHAR(100) NOT NULL
);

INSERT INTO estados_flejes (id, descripcion)
SELECT 0, 'Inactivo'
WHERE NOT EXISTS (SELECT 1 FROM estados_flejes WHERE id = 0);

INSERT INTO estados_flejes (id, descripcion)
SELECT 1, 'Activo'
WHERE NOT EXISTS (SELECT 1 FROM estados_flejes WHERE id = 1);

INSERT INTO estados_flejes (id, descripcion)
SELECT 2, 'Consumido'
WHERE NOT EXISTS (SELECT 1 FROM estados_flejes WHERE id = 2);
