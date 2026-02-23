-- v0.2 / DDL 008
-- Nueva entidad entradas_flejes + campo tipo en tipos_producto.

CREATE TABLE IF NOT EXISTS `entradas_flejes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL,
  `tipo_producto_id` int(11) NOT NULL,
  `lote` varchar(120) NOT NULL,
  `peso` decimal(10,2) NOT NULL DEFAULT 0.00,
  `consumido` decimal(10,2) NOT NULL DEFAULT 0.00,
  `restante` decimal(10,2) NOT NULL DEFAULT 0.00,
  `estado` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `created_by` varchar(100) NOT NULL DEFAULT 'system',
  `updated_by` varchar(100) NOT NULL DEFAULT 'system',
  `deleted_by` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_entradas_flejes_fecha` (`fecha`),
  KEY `idx_entradas_flejes_tipo_producto` (`tipo_producto_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET @col = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'tipos_producto'
    AND column_name = 'tipo'
);
SET @sql = IF(@col = 0, 'ALTER TABLE `tipos_producto` ADD COLUMN `tipo` varchar(30) NOT NULL DEFAULT '''' AFTER `id`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
