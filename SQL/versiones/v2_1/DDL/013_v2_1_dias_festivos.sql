CREATE TABLE IF NOT EXISTS dias_festivos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATE NOT NULL,
    UNIQUE KEY uq_dias_festivos_fecha (fecha)
);
