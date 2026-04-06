CREATE TABLE IF NOT EXISTS `analiticas` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `fecha` DATE NOT NULL,
  `descripcion` VARCHAR(255) NOT NULL,
  `estado` VARCHAR(20) NOT NULL DEFAULT 'ACTIVA',
  `grado_alcoholico` VARCHAR(64) DEFAULT NULL,
  `ph` VARCHAR(64) DEFAULT NULL,
  `acidez_total` VARCHAR(64) DEFAULT NULL,
  `acidez_volatil` VARCHAR(64) DEFAULT NULL,
  `so2_libre` VARCHAR(64) DEFAULT NULL,
  `so2_total` VARCHAR(64) DEFAULT NULL,
  `azucar_residual` VARCHAR(64) DEFAULT NULL,
  `temperatura` VARCHAR(64) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_analiticas_estado` (`estado`),
  KEY `idx_analiticas_fecha` (`fecha`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `bota_envinada_analitica` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `producto_id` INT NOT NULL,
  `analitica_id` INT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_bota_envinada_analitica_producto` (`producto_id`),
  KEY `idx_bota_envinada_analitica_analitica` (`analitica_id`),
  CONSTRAINT `fk_bota_envinada_analitica_producto`
    FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_bota_envinada_analitica_analitica`
    FOREIGN KEY (`analitica_id`) REFERENCES `analiticas` (`id`)
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `bota_envinada_archivo` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `producto_id` INT NOT NULL,
  `archivo_subido_id` INT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_bota_envinada_archivo` (`producto_id`, `archivo_subido_id`),
  KEY `idx_bota_envinada_archivo_archivo` (`archivo_subido_id`),
  CONSTRAINT `fk_bota_envinada_archivo_producto`
    FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_bota_envinada_archivo_archivo`
    FOREIGN KEY (`archivo_subido_id`) REFERENCES `archivos_subidos` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

UPDATE `estados_productos`
SET `descripcion` = 'Pendiente de envinar'
WHERE `id` = 3;
