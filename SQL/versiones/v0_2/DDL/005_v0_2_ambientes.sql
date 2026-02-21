-- v0.2 / DDL 005
-- Nueva entidad de maestros: ambientes.

CREATE TABLE IF NOT EXISTS `ambientes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL,
  `toma` int(11) NOT NULL,
  `temperatura` decimal(6,2) NOT NULL,
  `humedad` decimal(6,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_ambientes_fecha_toma` (`fecha`, `toma`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
