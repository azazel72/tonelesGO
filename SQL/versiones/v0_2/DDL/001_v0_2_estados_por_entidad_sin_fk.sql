-- v0.2 / DDL 001
-- Catálogos de estado por entidad (sin FKs).

CREATE TABLE IF NOT EXISTS `estados_ordenes_fabricacion` (
  `id` int(11) NOT NULL,
  `descripcion` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `estados_lineas_fabricacion` (
  `id` int(11) NOT NULL,
  `descripcion` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `estados_botas` (
  `id` int(11) NOT NULL,
  `descripcion` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `estados_trazabilidad_fabricacion` (
  `id` int(11) NOT NULL,
  `descripcion` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET @pk = (
  SELECT COUNT(*) FROM information_schema.table_constraints
  WHERE table_schema = DATABASE()
    AND table_name = 'estados_ordenes_fabricacion'
    AND constraint_type = 'PRIMARY KEY'
);
SET @sql = IF(@pk = 0, 'ALTER TABLE `estados_ordenes_fabricacion` ADD PRIMARY KEY (`id`)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @pk = (
  SELECT COUNT(*) FROM information_schema.table_constraints
  WHERE table_schema = DATABASE()
    AND table_name = 'estados_lineas_fabricacion'
    AND constraint_type = 'PRIMARY KEY'
);
SET @sql = IF(@pk = 0, 'ALTER TABLE `estados_lineas_fabricacion` ADD PRIMARY KEY (`id`)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @pk = (
  SELECT COUNT(*) FROM information_schema.table_constraints
  WHERE table_schema = DATABASE()
    AND table_name = 'estados_botas'
    AND constraint_type = 'PRIMARY KEY'
);
SET @sql = IF(@pk = 0, 'ALTER TABLE `estados_botas` ADD PRIMARY KEY (`id`)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @pk = (
  SELECT COUNT(*) FROM information_schema.table_constraints
  WHERE table_schema = DATABASE()
    AND table_name = 'estados_trazabilidad_fabricacion'
    AND constraint_type = 'PRIMARY KEY'
);
SET @sql = IF(@pk = 0, 'ALTER TABLE `estados_trazabilidad_fabricacion` ADD PRIMARY KEY (`id`)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

ALTER TABLE `estados_ordenes_fabricacion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `estados_lineas_fabricacion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `estados_botas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `estados_trazabilidad_fabricacion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
