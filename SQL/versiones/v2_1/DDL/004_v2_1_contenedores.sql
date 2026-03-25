CREATE TABLE IF NOT EXISTS `contenedores` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `contenedor` varchar(64) NOT NULL,
  `pedido_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_contenedores_pedido_id` (`pedido_id`),
  CONSTRAINT `fk_contenedores_pedidos`
    FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @col_existe := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'productos'
    AND column_name = 'contenedor_id'
);
SET @sql := IF(
  @col_existe = 0,
  'ALTER TABLE `productos` ADD COLUMN `contenedor_id` int(11) NULL AFTER `ubicacion_id`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_existe := (
  SELECT COUNT(*)
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'productos'
    AND index_name = 'idx_productos_contenedor_id'
);
SET @sql := IF(
  @idx_existe = 0,
  'ALTER TABLE `productos` ADD INDEX `idx_productos_contenedor_id` (`contenedor_id`)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @fk_existe := (
  SELECT COUNT(*)
  FROM information_schema.referential_constraints
  WHERE constraint_schema = DATABASE()
    AND table_name = 'productos'
    AND constraint_name = 'fk_productos_contenedores'
);
SET @sql := IF(
  @fk_existe = 0,
  'ALTER TABLE `productos` ADD CONSTRAINT `fk_productos_contenedores` FOREIGN KEY (`contenedor_id`) REFERENCES `contenedores` (`id`) ON UPDATE CASCADE',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
