CREATE TABLE IF NOT EXISTS `trazabilidad_movimientos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fabricacion_semanal_id` int(11) NOT NULL,
  `palet_origen_id` int(11) NOT NULL,
  `palet_destino_id` int(11) NOT NULL,
  `cantidad` decimal(10,3) NOT NULL DEFAULT 0.000,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `created_by` varchar(100) NOT NULL DEFAULT 'system',
  `updated_by` varchar(100) NOT NULL DEFAULT 'system',
  `deleted_by` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_traz_mov_fabricacion_semanal_id` (`fabricacion_semanal_id`),
  KEY `idx_traz_mov_palet_origen_id` (`palet_origen_id`),
  KEY `idx_traz_mov_palet_destino_id` (`palet_destino_id`),
  CONSTRAINT `fk_traz_mov_fabricacion_semanal`
    FOREIGN KEY (`fabricacion_semanal_id`) REFERENCES `fabricacion_semanal` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_traz_mov_palet_origen`
    FOREIGN KEY (`palet_origen_id`) REFERENCES `palets` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_traz_mov_palet_destino`
    FOREIGN KEY (`palet_destino_id`) REFERENCES `palets` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
