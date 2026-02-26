-- v0.3 / DML 003
-- Backfill de duelas.tipo_producto_id segun medida detectada en descripcion.
-- Solo rellena cuando tipo_producto_id es NULL.

UPDATE `duelas` d
JOIN (
  SELECT
    d2.`id`,
    CASE
      WHEN d2.`descripcion` LIKE '%1300x%' OR d2.`descripcion` LIKE '%1.30%' THEN (
        SELECT tp.`id` FROM `tipos_producto` tp
        WHERE tp.`tipo` = 'DUELA' AND tp.`codigo` = 'DU130' LIMIT 1
      )
      WHEN d2.`descripcion` LIKE '%1150x%' OR d2.`descripcion` LIKE '%1.15%' THEN (
        SELECT tp.`id` FROM `tipos_producto` tp
        WHERE tp.`tipo` = 'DUELA' AND tp.`codigo` = 'DU115' LIMIT 1
      )
      WHEN d2.`descripcion` LIKE '%1000x%' OR d2.`descripcion` LIKE '%1.00%' OR d2.`descripcion` LIKE '% 1 %' THEN (
        SELECT tp.`id` FROM `tipos_producto` tp
        WHERE tp.`tipo` = 'DUELA' AND tp.`codigo` = 'DU100' LIMIT 1
      )
      WHEN d2.`descripcion` LIKE '%950x%' OR d2.`descripcion` LIKE '%0.95%' THEN (
        SELECT tp.`id` FROM `tipos_producto` tp
        WHERE tp.`tipo` = 'DUELA' AND tp.`codigo` = 'DU095' LIMIT 1
      )
      WHEN d2.`descripcion` LIKE '%850x%' OR d2.`descripcion` LIKE '%0.85%' THEN (
        SELECT tp.`id` FROM `tipos_producto` tp
        WHERE tp.`tipo` = 'DUELA' AND tp.`codigo` = 'DU085' LIMIT 1
      )
      WHEN d2.`descripcion` LIKE '%800x%' OR d2.`descripcion` LIKE '%0.80%' THEN (
        SELECT tp.`id` FROM `tipos_producto` tp
        WHERE tp.`tipo` = 'DUELA' AND tp.`codigo` = 'DU080' LIMIT 1
      )
      WHEN d2.`descripcion` LIKE '%700x%' OR d2.`descripcion` LIKE '%0.70%' THEN (
        SELECT tp.`id` FROM `tipos_producto` tp
        WHERE tp.`tipo` = 'DUELA' AND tp.`codigo` = 'DU070' LIMIT 1
      )
      WHEN d2.`descripcion` LIKE '%600x%' OR d2.`descripcion` LIKE '%0.60%' THEN (
        SELECT tp.`id` FROM `tipos_producto` tp
        WHERE tp.`tipo` = 'DUELA' AND tp.`codigo` = 'DU060' LIMIT 1
      )
      WHEN d2.`descripcion` LIKE '%500x%' OR d2.`descripcion` LIKE '%0.50%' THEN (
        SELECT tp.`id` FROM `tipos_producto` tp
        WHERE tp.`tipo` = 'DUELA' AND tp.`codigo` = 'DU050' LIMIT 1
      )
      WHEN d2.`descripcion` LIKE '%450x%' OR d2.`descripcion` LIKE '%0.45%' THEN (
        SELECT tp.`id` FROM `tipos_producto` tp
        WHERE tp.`tipo` = 'DUELA' AND tp.`codigo` = 'DU045' LIMIT 1
      )
      ELSE NULL
    END AS `tipo_producto_id_nuevo`
  FROM `duelas` d2
  WHERE d2.`tipo_producto_id` IS NULL
) m ON m.`id` = d.`id`
SET d.`tipo_producto_id` = m.`tipo_producto_id_nuevo`
WHERE d.`tipo_producto_id` IS NULL
  AND m.`tipo_producto_id_nuevo` IS NOT NULL;

-- Reporte de pendientes no clasificados (opcional)
SELECT d.`id`, d.`descripcion`
FROM `duelas` d
WHERE d.`tipo_producto_id` IS NULL
ORDER BY d.`id`;
