-- Agrega pedidos.cliente_id y su FK si no existen.

SET @col = (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'pedidos'
    AND column_name = 'cliente_id'
);

SET @sql = IF(
  @col = 0,
  'ALTER TABLE `pedidos` ADD COLUMN `cliente_id` int(11) DEFAULT NULL AFTER `numero`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx = (
  SELECT COUNT(*)
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'pedidos'
    AND index_name = 'idx_pedidos_cliente_id'
);

SET @sql = IF(
  @idx = 0,
  'ALTER TABLE `pedidos` ADD INDEX `idx_pedidos_cliente_id` (`cliente_id`)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @fk = (
  SELECT COUNT(*)
  FROM information_schema.table_constraints
  WHERE table_schema = DATABASE()
    AND table_name = 'pedidos'
    AND constraint_name = 'fk_pedidos_clientes'
    AND constraint_type = 'FOREIGN KEY'
);

SET @sql = IF(
  @fk = 0,
  'ALTER TABLE `pedidos` ADD CONSTRAINT `fk_pedidos_clientes` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON UPDATE CASCADE',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
