-- v0.2 / DML 002
-- Backfill de datos tras cambios de estructura.

-- ordenes_fabricacion.descripcion y fecha_finalizacion
UPDATE `ordenes_fabricacion`
SET `descripcion` = COALESCE(NULLIF(`descripcion`, ''), CONCAT('Orden ', COALESCE(`numero`, `id`))),
    `fecha_finalizacion` = COALESCE(`fecha_finalizacion`, `fecha`);

-- lineas_fabricacion.material_id desde tipos_producto.id_material (si aún existe)
SET @col = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'tipos_producto'
    AND column_name = 'id_material'
);
SET @sql = IF(
  @col = 0,
  'SELECT 1',
  'UPDATE `lineas_fabricacion` lf
   JOIN `tipos_producto` tp ON tp.`id` = lf.`tipo_producto_id`
   SET lf.`material_id` = tp.`id_material`
   WHERE lf.`material_id` IS NULL'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
