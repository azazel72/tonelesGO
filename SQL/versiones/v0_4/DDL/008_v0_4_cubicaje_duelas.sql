-- v0.4.008
-- Tabla cubicaje por tipo de producto DUELA.

CREATE TABLE IF NOT EXISTS `cubicaje` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tipo_producto_id` int(11) NOT NULL,
  `cubicaje_estandar` decimal(10,3) NOT NULL DEFAULT 0.000,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_cubicaje_tipo_producto_id` (`tipo_producto_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET @fk = (
  SELECT COUNT(*) FROM information_schema.table_constraints
  WHERE table_schema = DATABASE()
    AND table_name = 'cubicaje'
    AND constraint_name = 'fk_cubicaje_tipos_producto'
    AND constraint_type = 'FOREIGN KEY'
);
SET @sql = IF(
  @fk = 0,
  'ALTER TABLE `cubicaje` ADD CONSTRAINT `fk_cubicaje_tipos_producto` FOREIGN KEY (`tipo_producto_id`) REFERENCES `tipos_producto` (`id`) ON UPDATE CASCADE',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

INSERT INTO `cubicaje` (`tipo_producto_id`, `cubicaje_estandar`)
SELECT tp.id, 0.000
FROM `tipos_producto` tp
WHERE UPPER(tp.tipo) = 'DUELA'
  AND NOT EXISTS (
    SELECT 1
    FROM `cubicaje` c
    WHERE c.tipo_producto_id = tp.id
  );
