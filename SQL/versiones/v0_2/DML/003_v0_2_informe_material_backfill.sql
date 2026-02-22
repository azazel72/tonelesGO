-- v0.2 / DML 003
-- Backfill para informe de material.

UPDATE `palets` p
JOIN `lineas_entrada` le ON le.`id` = p.`linea_entrada_id`
SET p.`duela_tipo_id` = le.`duela_id`
WHERE p.`duela_tipo_id` IS NULL;
