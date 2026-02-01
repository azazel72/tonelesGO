-- Auditoría sin procedimiento ni PREPARE (compatible con phpMyAdmin)
-- Ejecutar este script directamente para añadir columnas, índices y triggers en todas las tablas
-- Ajusta @audit_user si quieres registrar otro usuario en los campos *_by

USE `paezlobato`;
SET @audit_user = 'admin';

DELIMITER $$

-- === clientes ===
ALTER TABLE `clientes`
  ADD COLUMN IF NOT EXISTS `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS `created_by` VARCHAR(100) NOT NULL DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS `updated_by` VARCHAR(100) NOT NULL DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS `deleted_by` VARCHAR(100) NULL;
DROP INDEX IF EXISTS `idx_clientes_is_deleted` ON `clientes`;
DROP INDEX IF EXISTS `idx_clientes_deleted_at` ON `clientes`;
ALTER TABLE `clientes`
  ADD INDEX `idx_clientes_is_deleted` (`is_deleted`),
  ADD INDEX `idx_clientes_deleted_at` (`deleted_at`);
DROP TRIGGER IF EXISTS `clientes_bi`;
DROP TRIGGER IF EXISTS `clientes_bu`;
CREATE TRIGGER `clientes_bi` BEFORE INSERT ON `clientes` FOR EACH ROW
BEGIN
  IF NEW.created_at IS NULL THEN SET NEW.created_at = CURRENT_TIMESTAMP(); END IF;
  SET NEW.updated_at = NEW.created_at;
  SET NEW.created_by = COALESCE(@audit_user, 'system');
  SET NEW.updated_by = NEW.created_by;
  IF NEW.is_deleted IS NULL THEN SET NEW.is_deleted = 0; END IF;
  IF NEW.is_deleted = 1 THEN
    IF NEW.deleted_at IS NULL THEN SET NEW.deleted_at = CURRENT_TIMESTAMP(); END IF;
    SET NEW.deleted_by = COALESCE(@audit_user, 'system');
  ELSE
    SET NEW.deleted_at = NULL;
    SET NEW.deleted_by = NULL;
  END IF;
END$$
CREATE TRIGGER `clientes_bu` BEFORE UPDATE ON `clientes` FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP();
  SET NEW.updated_by = COALESCE(@audit_user, 'system');
  IF NEW.is_deleted IS NULL THEN SET NEW.is_deleted = 0; END IF;
  IF (NEW.is_deleted = 1 AND OLD.is_deleted = 0) OR (NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL) THEN
    SET NEW.is_deleted = 1;
    IF NEW.deleted_at IS NULL THEN SET NEW.deleted_at = CURRENT_TIMESTAMP(); END IF;
    SET NEW.deleted_by = COALESCE(@audit_user, 'system');
  END IF;
  IF (NEW.is_deleted = 0 AND OLD.is_deleted = 1) OR (NEW.deleted_at IS NULL AND OLD.deleted_at IS NOT NULL) THEN
    SET NEW.is_deleted = 0;
    SET NEW.deleted_at = NULL;
    SET NEW.deleted_by = NULL;
  END IF;
END$$

-- === cuadrantes ===
ALTER TABLE `cuadrantes`
  ADD COLUMN IF NOT EXISTS `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS `created_by` VARCHAR(100) NOT NULL DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS `updated_by` VARCHAR(100) NOT NULL DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS `deleted_by` VARCHAR(100) NULL;
DROP INDEX IF EXISTS `idx_cuadrantes_is_deleted` ON `cuadrantes`;
DROP INDEX IF EXISTS `idx_cuadrantes_deleted_at` ON `cuadrantes`;
ALTER TABLE `cuadrantes`
  ADD INDEX `idx_cuadrantes_is_deleted` (`is_deleted`),
  ADD INDEX `idx_cuadrantes_deleted_at` (`deleted_at`);
DROP TRIGGER IF EXISTS `cuadrantes_bi`;
DROP TRIGGER IF EXISTS `cuadrantes_bu`;
CREATE TRIGGER `cuadrantes_bi` BEFORE INSERT ON `cuadrantes` FOR EACH ROW
BEGIN
  IF NEW.created_at IS NULL THEN SET NEW.created_at = CURRENT_TIMESTAMP(); END IF;
  SET NEW.updated_at = NEW.created_at;
  SET NEW.created_by = COALESCE(@audit_user, 'system');
  SET NEW.updated_by = NEW.created_by;
  IF NEW.is_deleted IS NULL THEN SET NEW.is_deleted = 0; END IF;
  IF NEW.is_deleted = 1 THEN
    IF NEW.deleted_at IS NULL THEN SET NEW.deleted_at = CURRENT_TIMESTAMP(); END IF;
    SET NEW.deleted_by = COALESCE(@audit_user, 'system');
  ELSE
    SET NEW.deleted_at = NULL;
    SET NEW.deleted_by = NULL;
  END IF;
END$$
CREATE TRIGGER `cuadrantes_bu` BEFORE UPDATE ON `cuadrantes` FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP();
  SET NEW.updated_by = COALESCE(@audit_user, 'system');
  IF NEW.is_deleted IS NULL THEN SET NEW.is_deleted = 0; END IF;
  IF (NEW.is_deleted = 1 AND OLD.is_deleted = 0) OR (NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL) THEN
    SET NEW.is_deleted = 1;
    IF NEW.deleted_at IS NULL THEN SET NEW.deleted_at = CURRENT_TIMESTAMP(); END IF;
    SET NEW.deleted_by = COALESCE(@audit_user, 'system');
  END IF;
  IF (NEW.is_deleted = 0 AND OLD.is_deleted = 1) OR (NEW.deleted_at IS NULL AND OLD.deleted_at IS NOT NULL) THEN
    SET NEW.is_deleted = 0;
    SET NEW.deleted_at = NULL;
    SET NEW.deleted_by = NULL;
  END IF;
END$$

-- === cuadrante_detalles ===
ALTER TABLE `cuadrante_detalles`
  ADD COLUMN IF NOT EXISTS `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS `created_by` VARCHAR(100) NOT NULL DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS `updated_by` VARCHAR(100) NOT NULL DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS `deleted_by` VARCHAR(100) NULL;
DROP INDEX IF EXISTS `idx_cuadrante_detalles_is_deleted` ON `cuadrante_detalles`;
DROP INDEX IF EXISTS `idx_cuadrante_detalles_deleted_at` ON `cuadrante_detalles`;
ALTER TABLE `cuadrante_detalles`
  ADD INDEX `idx_cuadrante_detalles_is_deleted` (`is_deleted`),
  ADD INDEX `idx_cuadrante_detalles_deleted_at` (`deleted_at`);
DROP TRIGGER IF EXISTS `cuadrante_detalles_bi`;
DROP TRIGGER IF EXISTS `cuadrante_detalles_bu`;
CREATE TRIGGER `cuadrante_detalles_bi` BEFORE INSERT ON `cuadrante_detalles` FOR EACH ROW
BEGIN
  IF NEW.created_at IS NULL THEN SET NEW.created_at = CURRENT_TIMESTAMP(); END IF;
  SET NEW.updated_at = NEW.created_at;
  SET NEW.created_by = COALESCE(@audit_user, 'system');
  SET NEW.updated_by = NEW.created_by;
  IF NEW.is_deleted IS NULL THEN SET NEW.is_deleted = 0; END IF;
  IF NEW.is_deleted = 1 THEN
    IF NEW.deleted_at IS NULL THEN SET NEW.deleted_at = CURRENT_TIMESTAMP(); END IF;
    SET NEW.deleted_by = COALESCE(@audit_user, 'system');
  ELSE
    SET NEW.deleted_at = NULL;
    SET NEW.deleted_by = NULL;
  END IF;
END$$
CREATE TRIGGER `cuadrante_detalles_bu` BEFORE UPDATE ON `cuadrante_detalles` FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP();
  SET NEW.updated_by = COALESCE(@audit_user, 'system');
  IF NEW.is_deleted IS NULL THEN SET NEW.is_deleted = 0; END IF;
  IF (NEW.is_deleted = 1 AND OLD.is_deleted = 0) OR (NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL) THEN
    SET NEW.is_deleted = 1;
    IF NEW.deleted_at IS NULL THEN SET NEW.deleted_at = CURRENT_TIMESTAMP(); END IF;
    SET NEW.deleted_by = COALESCE(@audit_user, 'system');
  END IF;
  IF (NEW.is_deleted = 0 AND OLD.is_deleted = 1) OR (NEW.deleted_at IS NULL AND OLD.deleted_at IS NOT NULL) THEN
    SET NEW.is_deleted = 0;
    SET NEW.deleted_at = NULL;
    SET NEW.deleted_by = NULL;
  END IF;
END$$

-- === estados ===
ALTER TABLE `estados`
  ADD COLUMN IF NOT EXISTS `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS `created_by` VARCHAR(100) NOT NULL DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS `updated_by` VARCHAR(100) NOT NULL DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS `deleted_by` VARCHAR(100) NULL;
DROP INDEX IF EXISTS `idx_estados_is_deleted` ON `estados`;
DROP INDEX IF EXISTS `idx_estados_deleted_at` ON `estados`;
ALTER TABLE `estados`
  ADD INDEX `idx_estados_is_deleted` (`is_deleted`),
  ADD INDEX `idx_estados_deleted_at` (`deleted_at`);
DROP TRIGGER IF EXISTS `estados_bi`;
DROP TRIGGER IF EXISTS `estados_bu`;
CREATE TRIGGER `estados_bi` BEFORE INSERT ON `estados` FOR EACH ROW
BEGIN
  IF NEW.created_at IS NULL THEN SET NEW.created_at = CURRENT_TIMESTAMP(); END IF;
  SET NEW.updated_at = NEW.created_at;
  SET NEW.created_by = COALESCE(@audit_user, 'system');
  SET NEW.updated_by = NEW.created_by;
  IF NEW.is_deleted IS NULL THEN SET NEW.is_deleted = 0; END IF;
  IF NEW.is_deleted = 1 THEN
    IF NEW.deleted_at IS NULL THEN SET NEW.deleted_at = CURRENT_TIMESTAMP(); END IF;
    SET NEW.deleted_by = COALESCE(@audit_user, 'system');
  ELSE
    SET NEW.deleted_at = NULL;
    SET NEW.deleted_by = NULL;
  END IF;
END$$
CREATE TRIGGER `estados_bu` BEFORE UPDATE ON `estados` FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP();
  SET NEW.updated_by = COALESCE(@audit_user, 'system');
  IF NEW.is_deleted IS NULL THEN SET NEW.is_deleted = 0; END IF;
  IF (NEW.is_deleted = 1 AND OLD.is_deleted = 0) OR (NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL) THEN
    SET NEW.is_deleted = 1;
    IF NEW.deleted_at IS NULL THEN SET NEW.deleted_at = CURRENT_TIMESTAMP(); END IF;
    SET NEW.deleted_by = COALESCE(@audit_user, 'system');
  END IF;
  IF (NEW.is_deleted = 0 AND OLD.is_deleted = 1) OR (NEW.deleted_at IS NULL AND OLD.deleted_at IS NOT NULL) THEN
    SET NEW.is_deleted = 0;
    SET NEW.deleted_at = NULL;
    SET NEW.deleted_by = NULL;
  END IF;
END$$

-- === instalaciones ===
ALTER TABLE `instalaciones`
  ADD COLUMN IF NOT EXISTS `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS `created_by` VARCHAR(100) NOT NULL DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS `updated_by` VARCHAR(100) NOT NULL DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS `deleted_by` VARCHAR(100) NULL;
DROP INDEX IF EXISTS `idx_instalaciones_is_deleted` ON `instalaciones`;
DROP INDEX IF EXISTS `idx_instalaciones_deleted_at` ON `instalaciones`;
ALTER TABLE `instalaciones`
  ADD INDEX `idx_instalaciones_is_deleted` (`is_deleted`),
  ADD INDEX `idx_instalaciones_deleted_at` (`deleted_at`);
DROP TRIGGER IF EXISTS `instalaciones_bi`;
DROP TRIGGER IF EXISTS `instalaciones_bu`;
CREATE TRIGGER `instalaciones_bi` BEFORE INSERT ON `instalaciones` FOR EACH ROW
BEGIN
  IF NEW.created_at IS NULL THEN SET NEW.created_at = CURRENT_TIMESTAMP(); END IF;
  SET NEW.updated_at = NEW.created_at;
  SET NEW.created_by = COALESCE(@audit_user, 'system');
  SET NEW.updated_by = NEW.created_by;
  IF NEW.is_deleted IS NULL THEN SET NEW.is_deleted = 0; END IF;
  IF NEW.is_deleted = 1 THEN
    IF NEW.deleted_at IS NULL THEN SET NEW.deleted_at = CURRENT_TIMESTAMP(); END IF;
    SET NEW.deleted_by = COALESCE(@audit_user, 'system');
  ELSE
    SET NEW.deleted_at = NULL;
    SET NEW.deleted_by = NULL;
  END IF;
END$$
CREATE TRIGGER `instalaciones_bu` BEFORE UPDATE ON `instalaciones` FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP();
  SET NEW.updated_by = COALESCE(@audit_user, 'system');
  IF NEW.is_deleted IS NULL THEN SET NEW.is_deleted = 0; END IF;
  IF (NEW.is_deleted = 1 AND OLD.is_deleted = 0) OR (NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL) THEN
    SET NEW.is_deleted = 1;
    IF NEW.deleted_at IS NULL THEN SET NEW.deleted_at = CURRENT_TIMESTAMP(); END IF;
    SET NEW.deleted_by = COALESCE(@audit_user, 'system');
  END IF;
  IF (NEW.is_deleted = 0 AND OLD.is_deleted = 1) OR (NEW.deleted_at IS NULL AND OLD.deleted_at IS NOT NULL) THEN
    SET NEW.is_deleted = 0;
    SET NEW.deleted_at = NULL;
    SET NEW.deleted_by = NULL;
  END IF;
END$$

-- === plan_camiones ===
ALTER TABLE `plan_camiones`
  ADD COLUMN IF NOT EXISTS `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS `created_by` VARCHAR(100) NOT NULL DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS `updated_by` VARCHAR(100) NOT NULL DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS `deleted_by` VARCHAR(100) NULL;
DROP INDEX IF EXISTS `idx_plan_camiones_is_deleted` ON `plan_camiones`;
DROP INDEX IF EXISTS `idx_plan_camiones_deleted_at` ON `plan_camiones`;
ALTER TABLE `plan_camiones`
  ADD INDEX `idx_plan_camiones_is_deleted` (`is_deleted`),
  ADD INDEX `idx_plan_camiones_deleted_at` (`deleted_at`);
DROP TRIGGER IF EXISTS `plan_camiones_bi`;
DROP TRIGGER IF EXISTS `plan_camiones_bu`;
CREATE TRIGGER `plan_camiones_bi` BEFORE INSERT ON `plan_camiones` FOR EACH ROW
BEGIN
  IF NEW.created_at IS NULL THEN SET NEW.created_at = CURRENT_TIMESTAMP(); END IF;
  SET NEW.updated_at = NEW.created_at;
  SET NEW.created_by = COALESCE(@audit_user, 'system');
  SET NEW.updated_by = NEW.created_by;
  IF NEW.is_deleted IS NULL THEN SET NEW.is_deleted = 0; END IF;
  IF NEW.is_deleted = 1 THEN
    IF NEW.deleted_at IS NULL THEN SET NEW.deleted_at = CURRENT_TIMESTAMP(); END IF;
    SET NEW.deleted_by = COALESCE(@audit_user, 'system');
  ELSE
    SET NEW.deleted_at = NULL;
    SET NEW.deleted_by = NULL;
  END IF;
END$$
CREATE TRIGGER `plan_camiones_bu` BEFORE UPDATE ON `plan_camiones` FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP();
  SET NEW.updated_by = COALESCE(@audit_user, 'system');
  IF NEW.is_deleted IS NULL THEN SET NEW.is_deleted = 0; END IF;
  IF (NEW.is_deleted = 1 AND OLD.is_deleted = 0) OR (NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL) THEN
    SET NEW.is_deleted = 1;
    IF NEW.deleted_at IS NULL THEN SET NEW.deleted_at = CURRENT_TIMESTAMP(); END IF;
    SET NEW.deleted_by = COALESCE(@audit_user, 'system');
  END IF;
  IF (NEW.is_deleted = 0 AND OLD.is_deleted = 1) OR (NEW.deleted_at IS NULL AND OLD.deleted_at IS NOT NULL) THEN
    SET NEW.is_deleted = 0;
    SET NEW.deleted_at = NULL;
    SET NEW.deleted_by = NULL;
  END IF;
END$$

-- === plan_facturacion ===
ALTER TABLE `plan_facturacion`
  ADD COLUMN IF NOT EXISTS `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS `created_by` VARCHAR(100) NOT NULL DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS `updated_by` VARCHAR(100) NOT NULL DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS `deleted_by` VARCHAR(100) NULL;
DROP INDEX IF EXISTS `idx_plan_facturacion_is_deleted` ON `plan_facturacion`;
DROP INDEX IF EXISTS `idx_plan_facturacion_deleted_at` ON `plan_facturacion`;
ALTER TABLE `plan_facturacion`
  ADD INDEX `idx_plan_facturacion_is_deleted` (`is_deleted`),
  ADD INDEX `idx_plan_facturacion_deleted_at` (`deleted_at`);
DROP TRIGGER IF EXISTS `plan_facturacion_bi`;
DROP TRIGGER IF EXISTS `plan_facturacion_bu`;
CREATE TRIGGER `plan_facturacion_bi` BEFORE INSERT ON `plan_facturacion` FOR EACH ROW
BEGIN
  IF NEW.created_at IS NULL THEN SET NEW.created_at = CURRENT_TIMESTAMP(); END IF;
  SET NEW.updated_at = NEW.created_at;
  SET NEW.created_by = COALESCE(@audit_user, 'system');
  SET NEW.updated_by = NEW.created_by;
  IF NEW.is_deleted IS NULL THEN SET NEW.is_deleted = 0; END IF;
  IF NEW.is_deleted = 1 THEN
    IF NEW.deleted_at IS NULL THEN SET NEW.deleted_at = CURRENT_TIMESTAMP(); END IF;
    SET NEW.deleted_by = COALESCE(@audit_user, 'system');
  ELSE
    SET NEW.deleted_at = NULL;
    SET NEW.deleted_by = NULL;
  END IF;
END$$
CREATE TRIGGER `plan_facturacion_bu` BEFORE UPDATE ON `plan_facturacion` FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP();
  SET NEW.updated_by = COALESCE(@audit_user, 'system');
  IF NEW.is_deleted IS NULL THEN SET NEW.is_deleted = 0; END IF;
  IF (NEW.is_deleted = 1 AND OLD.is_deleted = 0) OR (NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL) THEN
    SET NEW.is_deleted = 1;
    IF NEW.deleted_at IS NULL THEN SET NEW.deleted_at = CURRENT_TIMESTAMP(); END IF;
    SET NEW.deleted_by = COALESCE(@audit_user, 'system');
  END IF;
  IF (NEW.is_deleted = 0 AND OLD.is_deleted = 1) OR (NEW.deleted_at IS NULL AND OLD.deleted_at IS NOT NULL) THEN
    SET NEW.is_deleted = 0;
    SET NEW.deleted_at = NULL;
    SET NEW.deleted_by = NULL;
  END IF;
END$$

-- === plan_material ===
ALTER TABLE `plan_material`
  ADD COLUMN IF NOT EXISTS `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS `created_by` VARCHAR(100) NOT NULL DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS `updated_by` VARCHAR(100) NOT NULL DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS `deleted_by` VARCHAR(100) NULL;
DROP INDEX IF EXISTS `idx_plan_material_is_deleted` ON `plan_material`;
DROP INDEX IF EXISTS `idx_plan_material_deleted_at` ON `plan_material`;
ALTER TABLE `plan_material`
  ADD INDEX `idx_plan_material_is_deleted` (`is_deleted`),
  ADD INDEX `idx_plan_material_deleted_at` (`deleted_at`);
DROP TRIGGER IF EXISTS `plan_material_bi`;
DROP TRIGGER IF EXISTS `plan_material_bu`;
CREATE TRIGGER `plan_material_bi` BEFORE INSERT ON `plan_material` FOR EACH ROW
BEGIN
  IF NEW.created_at IS NULL THEN SET NEW.created_at = CURRENT_TIMESTAMP(); END IF;
  SET NEW.updated_at = NEW.created_at;
  SET NEW.created_by = COALESCE(@audit_user, 'system');
  SET NEW.updated_by = NEW.created_by;
  IF NEW.is_deleted IS NULL THEN SET NEW.is_deleted = 0; END IF;
  IF NEW.is_deleted = 1 THEN
    IF NEW.deleted_at IS NULL THEN SET NEW.deleted_at = CURRENT_TIMESTAMP(); END IF;
    SET NEW.deleted_by = COALESCE(@audit_user, 'system');
  ELSE
    SET NEW.deleted_at = NULL;
    SET NEW.deleted_by = NULL;
  END IF;
END$$
CREATE TRIGGER `plan_material_bu` BEFORE UPDATE ON `plan_material` FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP();
  SET NEW.updated_by = COALESCE(@audit_user, 'system');
  IF NEW.is_deleted IS NULL THEN SET NEW.is_deleted = 0; END IF;
  IF (NEW.is_deleted = 1 AND OLD.is_deleted = 0) OR (NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL) THEN
    SET NEW.is_deleted = 1;
    IF NEW.deleted_at IS NULL THEN SET NEW.deleted_at = CURRENT_TIMESTAMP(); END IF;
    SET NEW.deleted_by = COALESCE(@audit_user, 'system');
  END IF;
  IF (NEW.is_deleted = 0 AND OLD.is_deleted = 1) OR (NEW.deleted_at IS NULL AND OLD.deleted_at IS NOT NULL) THEN
    SET NEW.is_deleted = 0;
    SET NEW.deleted_at = NULL;
    SET NEW.deleted_by = NULL;
  END IF;
END$$

-- === proveedores ===
ALTER TABLE `proveedores`
  ADD COLUMN IF NOT EXISTS `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS `created_by` VARCHAR(100) NOT NULL DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS `updated_by` VARCHAR(100) NOT NULL DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS `deleted_by` VARCHAR(100) NULL;
DROP INDEX IF EXISTS `idx_proveedores_is_deleted` ON `proveedores`;
DROP INDEX IF EXISTS `idx_proveedores_deleted_at` ON `proveedores`;
ALTER TABLE `proveedores`
  ADD INDEX `idx_proveedores_is_deleted` (`is_deleted`),
  ADD INDEX `idx_proveedores_deleted_at` (`deleted_at`);
DROP TRIGGER IF EXISTS `proveedores_bi`;
DROP TRIGGER IF EXISTS `proveedores_bu`;
CREATE TRIGGER `proveedores_bi` BEFORE INSERT ON `proveedores` FOR EACH ROW
BEGIN
  IF NEW.created_at IS NULL THEN SET NEW.created_at = CURRENT_TIMESTAMP(); END IF;
  SET NEW.updated_at = NEW.created_at;
  SET NEW.created_by = COALESCE(@audit_user, 'system');
  SET NEW.updated_by = NEW.created_by;
  IF NEW.is_deleted IS NULL THEN SET NEW.is_deleted = 0; END IF;
  IF NEW.is_deleted = 1 THEN
    IF NEW.deleted_at IS NULL THEN SET NEW.deleted_at = CURRENT_TIMESTAMP(); END IF;
    SET NEW.deleted_by = COALESCE(@audit_user, 'system');
  ELSE
    SET NEW.deleted_at = NULL;
    SET NEW.deleted_by = NULL;
  END IF;
END$$
CREATE TRIGGER `proveedores_bu` BEFORE UPDATE ON `proveedores` FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP();
  SET NEW.updated_by = COALESCE(@audit_user, 'system');
  IF NEW.is_deleted IS NULL THEN SET NEW.is_deleted = 0; END IF;
  IF (NEW.is_deleted = 1 AND OLD.is_deleted = 0) OR (NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL) THEN
    SET NEW.is_deleted = 1;
    IF NEW.deleted_at IS NULL THEN SET NEW.deleted_at = CURRENT_TIMESTAMP(); END IF;
    SET NEW.deleted_by = COALESCE(@audit_user, 'system');
  END IF;
  IF (NEW.is_deleted = 0 AND OLD.is_deleted = 1) OR (NEW.deleted_at IS NULL AND OLD.deleted_at IS NOT NULL) THEN
    SET NEW.is_deleted = 0;
    SET NEW.deleted_at = NULL;
    SET NEW.deleted_by = NULL;
  END IF;
END$$

-- === puestos_trabajo ===
ALTER TABLE `puestos_trabajo`
  ADD COLUMN IF NOT EXISTS `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS `created_by` VARCHAR(100) NOT NULL DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS `updated_by` VARCHAR(100) NOT NULL DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS `deleted_by` VARCHAR(100) NULL;
DROP INDEX IF EXISTS `idx_puestos_trabajo_is_deleted` ON `puestos_trabajo`;
DROP INDEX IF EXISTS `idx_puestos_trabajo_deleted_at` ON `puestos_trabajo`;
ALTER TABLE `puestos_trabajo`
  ADD INDEX `idx_puestos_trabajo_is_deleted` (`is_deleted`),
  ADD INDEX `idx_puestos_trabajo_deleted_at` (`deleted_at`);
DROP TRIGGER IF EXISTS `puestos_trabajo_bi`;
DROP TRIGGER IF EXISTS `puestos_trabajo_bu`;
CREATE TRIGGER `puestos_trabajo_bi` BEFORE INSERT ON `puestos_trabajo` FOR EACH ROW
BEGIN
  IF NEW.created_at IS NULL THEN SET NEW.created_at = CURRENT_TIMESTAMP(); END IF;
  SET NEW.updated_at = NEW.created_at;
  SET NEW.created_by = COALESCE(@audit_user, 'system');
  SET NEW.updated_by = NEW.created_by;
  IF NEW.is_deleted IS NULL THEN SET NEW.is_deleted = 0; END IF;
  IF NEW.is_deleted = 1 THEN
    IF NEW.deleted_at IS NULL THEN SET NEW.deleted_at = CURRENT_TIMESTAMP(); END IF;
    SET NEW.deleted_by = COALESCE(@audit_user, 'system');
  ELSE
    SET NEW.deleted_at = NULL;
    SET NEW.deleted_by = NULL;
  END IF;
END$$
CREATE TRIGGER `puestos_trabajo_bu` BEFORE UPDATE ON `puestos_trabajo` FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP();
  SET NEW.updated_by = COALESCE(@audit_user, 'system');
  IF NEW.is_deleted IS NULL THEN SET NEW.is_deleted = 0; END IF;
  IF (NEW.is_deleted = 1 AND OLD.is_deleted = 0) OR (NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL) THEN
    SET NEW.is_deleted = 1;
    IF NEW.deleted_at IS NULL THEN SET NEW.deleted_at = CURRENT_TIMESTAMP(); END IF;
    SET NEW.deleted_by = COALESCE(@audit_user, 'system');
  END IF;
  IF (NEW.is_deleted = 0 AND OLD.is_deleted = 1) OR (NEW.deleted_at IS NULL AND OLD.deleted_at IS NOT NULL) THEN
    SET NEW.is_deleted = 0;
    SET NEW.deleted_at = NULL;
    SET NEW.deleted_by = NULL;
  END IF;
END$$

-- === roles ===
ALTER TABLE `roles`
  ADD COLUMN IF NOT EXISTS `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS `created_by` VARCHAR(100) NOT NULL DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS `updated_by` VARCHAR(100) NOT NULL DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS `deleted_by` VARCHAR(100) NULL;
DROP INDEX IF EXISTS `idx_roles_is_deleted` ON `roles`;
DROP INDEX IF EXISTS `idx_roles_deleted_at` ON `roles`;
ALTER TABLE `roles`
  ADD INDEX `idx_roles_is_deleted` (`is_deleted`),
  ADD INDEX `idx_roles_deleted_at` (`deleted_at`);
DROP TRIGGER IF EXISTS `roles_bi`;
DROP TRIGGER IF EXISTS `roles_bu`;
CREATE TRIGGER `roles_bi` BEFORE INSERT ON `roles` FOR EACH ROW
BEGIN
  IF NEW.created_at IS NULL THEN SET NEW.created_at = CURRENT_TIMESTAMP(); END IF;
  SET NEW.updated_at = NEW.created_at;
  SET NEW.created_by = COALESCE(@audit_user, 'system');
  SET NEW.updated_by = NEW.created_by;
  IF NEW.is_deleted IS NULL THEN SET NEW.is_deleted = 0; END IF;
  IF NEW.is_deleted = 1 THEN
    IF NEW.deleted_at IS NULL THEN SET NEW.deleted_at = CURRENT_TIMESTAMP(); END IF;
    SET NEW.deleted_by = COALESCE(@audit_user, 'system');
  ELSE
    SET NEW.deleted_at = NULL;
    SET NEW.deleted_by = NULL;
  END IF;
END$$
CREATE TRIGGER `roles_bu` BEFORE UPDATE ON `roles` FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP();
  SET NEW.updated_by = COALESCE(@audit_user, 'system');
  IF NEW.is_deleted IS NULL THEN SET NEW.is_deleted = 0; END IF;
  IF (NEW.is_deleted = 1 AND OLD.is_deleted = 0) OR (NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL) THEN
    SET NEW.is_deleted = 1;
    IF NEW.deleted_at IS NULL THEN SET NEW.deleted_at = CURRENT_TIMESTAMP(); END IF;
    SET NEW.deleted_by = COALESCE(@audit_user, 'system');
  END IF;
  IF (NEW.is_deleted = 0 AND OLD.is_deleted = 1) OR (NEW.deleted_at IS NULL AND OLD.deleted_at IS NOT NULL) THEN
    SET NEW.is_deleted = 0;
    SET NEW.deleted_at = NULL;
    SET NEW.deleted_by = NULL;
  END IF;
END$$

-- === ubicaciones ===
ALTER TABLE `ubicaciones`
  ADD COLUMN IF NOT EXISTS `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS `created_by` VARCHAR(100) NOT NULL DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS `updated_by` VARCHAR(100) NOT NULL DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS `deleted_by` VARCHAR(100) NULL;
DROP INDEX IF EXISTS `idx_ubicaciones_is_deleted` ON `ubicaciones`;
DROP INDEX IF EXISTS `idx_ubicaciones_deleted_at` ON `ubicaciones`;
ALTER TABLE `ubicaciones`
  ADD INDEX `idx_ubicaciones_is_deleted` (`is_deleted`),
  ADD INDEX `idx_ubicaciones_deleted_at` (`deleted_at`);
DROP TRIGGER IF EXISTS `ubicaciones_bi`;
DROP TRIGGER IF EXISTS `ubicaciones_bu`;
CREATE TRIGGER `ubicaciones_bi` BEFORE INSERT ON `ubicaciones` FOR EACH ROW
BEGIN
  IF NEW.created_at IS NULL THEN SET NEW.created_at = CURRENT_TIMESTAMP(); END IF;
  SET NEW.updated_at = NEW.created_at;
  SET NEW.created_by = COALESCE(@audit_user, 'system');
  SET NEW.updated_by = NEW.created_by;
  IF NEW.is_deleted IS NULL THEN SET NEW.is_deleted = 0; END IF;
  IF NEW.is_deleted = 1 THEN
    IF NEW.deleted_at IS NULL THEN SET NEW.deleted_at = CURRENT_TIMESTAMP(); END IF;
    SET NEW.deleted_by = COALESCE(@audit_user, 'system');
  ELSE
    SET NEW.deleted_at = NULL;
    SET NEW.deleted_by = NULL;
  END IF;
END$$
CREATE TRIGGER `ubicaciones_bu` BEFORE UPDATE ON `ubicaciones` FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP();
  SET NEW.updated_by = COALESCE(@audit_user, 'system');
  IF NEW.is_deleted IS NULL THEN SET NEW.is_deleted = 0; END IF;
  IF (NEW.is_deleted = 1 AND OLD.is_deleted = 0) OR (NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL) THEN
    SET NEW.is_deleted = 1;
    IF NEW.deleted_at IS NULL THEN SET NEW.deleted_at = CURRENT_TIMESTAMP(); END IF;
    SET NEW.deleted_by = COALESCE(@audit_user, 'system');
  END IF;
  IF (NEW.is_deleted = 0 AND OLD.is_deleted = 1) OR (NEW.deleted_at IS NULL AND OLD.deleted_at IS NOT NULL) THEN
    SET NEW.is_deleted = 0;
    SET NEW.deleted_at = NULL;
    SET NEW.deleted_by = NULL;
  END IF;
END$$

-- === usuarios ===
ALTER TABLE `usuarios`
  ADD COLUMN IF NOT EXISTS `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS `created_by` VARCHAR(100) NOT NULL DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS `updated_by` VARCHAR(100) NOT NULL DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS `deleted_by` VARCHAR(100) NULL;
DROP INDEX IF EXISTS `idx_usuarios_is_deleted` ON `usuarios`;
DROP INDEX IF EXISTS `idx_usuarios_deleted_at` ON `usuarios`;
ALTER TABLE `usuarios`
  ADD INDEX `idx_usuarios_is_deleted` (`is_deleted`),
  ADD INDEX `idx_usuarios_deleted_at` (`deleted_at`);
DROP TRIGGER IF EXISTS `usuarios_bi`;
DROP TRIGGER IF EXISTS `usuarios_bu`;
CREATE TRIGGER `usuarios_bi` BEFORE INSERT ON `usuarios` FOR EACH ROW
BEGIN
  IF NEW.created_at IS NULL THEN SET NEW.created_at = CURRENT_TIMESTAMP(); END IF;
  SET NEW.updated_at = NEW.created_at;
  SET NEW.created_by = COALESCE(@audit_user, 'system');
  SET NEW.updated_by = NEW.created_by;
  IF NEW.is_deleted IS NULL THEN SET NEW.is_deleted = 0; END IF;
  IF NEW.is_deleted = 1 THEN
    IF NEW.deleted_at IS NULL THEN SET NEW.deleted_at = CURRENT_TIMESTAMP(); END IF;
    SET NEW.deleted_by = COALESCE(@audit_user, 'system');
  ELSE
    SET NEW.deleted_at = NULL;
    SET NEW.deleted_by = NULL;
  END IF;
END$$
CREATE TRIGGER `usuarios_bu` BEFORE UPDATE ON `usuarios` FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP();
  SET NEW.updated_by = COALESCE(@audit_user, 'system');
  IF NEW.is_deleted IS NULL THEN SET NEW.is_deleted = 0; END IF;
  IF (NEW.is_deleted = 1 AND OLD.is_deleted = 0) OR (NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL) THEN
    SET NEW.is_deleted = 1;
    IF NEW.deleted_at IS NULL THEN SET NEW.deleted_at = CURRENT_TIMESTAMP(); END IF;
    SET NEW.deleted_by = COALESCE(@audit_user, 'system');
  END IF;
  IF (NEW.is_deleted = 0 AND OLD.is_deleted = 1) OR (NEW.deleted_at IS NULL AND OLD.deleted_at IS NOT NULL) THEN
    SET NEW.is_deleted = 0;
    SET NEW.deleted_at = NULL;
    SET NEW.deleted_by = NULL;
  END IF;
END$$

-- === materiales ===
ALTER TABLE `materiales`
  ADD COLUMN IF NOT EXISTS `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS `created_by` VARCHAR(100) NOT NULL DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS `updated_by` VARCHAR(100) NOT NULL DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS `deleted_by` VARCHAR(100) NULL;
DROP INDEX IF EXISTS `idx_materiales_is_deleted` ON `materiales`;
DROP INDEX IF EXISTS `idx_materiales_deleted_at` ON `materiales`;
ALTER TABLE `materiales`
  ADD INDEX `idx_materiales_is_deleted` (`is_deleted`),
  ADD INDEX `idx_materiales_deleted_at` (`deleted_at`);
DROP TRIGGER IF EXISTS `materiales_bi`;
DROP TRIGGER IF EXISTS `materiales_bu`;
CREATE TRIGGER `materiales_bi` BEFORE INSERT ON `materiales` FOR EACH ROW
BEGIN
  IF NEW.created_at IS NULL THEN SET NEW.created_at = CURRENT_TIMESTAMP(); END IF;
  SET NEW.updated_at = NEW.created_at;
  SET NEW.created_by = COALESCE(@audit_user, 'system');
  SET NEW.updated_by = NEW.created_by;
  IF NEW.is_deleted IS NULL THEN SET NEW.is_deleted = 0; END IF;
  IF NEW.is_deleted = 1 THEN
    IF NEW.deleted_at IS NULL THEN SET NEW.deleted_at = CURRENT_TIMESTAMP(); END IF;
    SET NEW.deleted_by = COALESCE(@audit_user, 'system');
  ELSE
    SET NEW.deleted_at = NULL;
    SET NEW.deleted_by = NULL;
  END IF;
END$$
CREATE TRIGGER `materiales_bu` BEFORE UPDATE ON `materiales` FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP();
  SET NEW.updated_by = COALESCE(@audit_user, 'system');
  IF NEW.is_deleted IS NULL THEN SET NEW.is_deleted = 0; END IF;
  IF (NEW.is_deleted = 1 AND OLD.is_deleted = 0) OR (NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL) THEN
    SET NEW.is_deleted = 1;
    IF NEW.deleted_at IS NULL THEN SET NEW.deleted_at = CURRENT_TIMESTAMP(); END IF;
    SET NEW.deleted_by = COALESCE(@audit_user, 'system');
  END IF;
  IF (NEW.is_deleted = 0 AND OLD.is_deleted = 1) OR (NEW.deleted_at IS NULL AND OLD.deleted_at IS NOT NULL) THEN
    SET NEW.is_deleted = 0;
    SET NEW.deleted_at = NULL;
    SET NEW.deleted_by = NULL;
  END IF;
END$$

-- === duelas ===
ALTER TABLE `duelas`
  ADD COLUMN IF NOT EXISTS `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS `created_by` VARCHAR(100) NOT NULL DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS `updated_by` VARCHAR(100) NOT NULL DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS `deleted_by` VARCHAR(100) NULL;
DROP INDEX IF EXISTS `idx_duelas_is_deleted` ON `duelas`;
DROP INDEX IF EXISTS `idx_duelas_deleted_at` ON `duelas`;
ALTER TABLE `duelas`
  ADD INDEX `idx_duelas_is_deleted` (`is_deleted`),
  ADD INDEX `idx_duelas_deleted_at` (`deleted_at`);
DROP TRIGGER IF EXISTS `duelas_bi`;
DROP TRIGGER IF EXISTS `duelas_bu`;
CREATE TRIGGER `duelas_bi` BEFORE INSERT ON `duelas` FOR EACH ROW
BEGIN
  IF NEW.created_at IS NULL THEN SET NEW.created_at = CURRENT_TIMESTAMP(); END IF;
  SET NEW.updated_at = NEW.created_at;
  SET NEW.created_by = COALESCE(@audit_user, 'system');
  SET NEW.updated_by = NEW.created_by;
  IF NEW.is_deleted IS NULL THEN SET NEW.is_deleted = 0; END IF;
  IF NEW.is_deleted = 1 THEN
    IF NEW.deleted_at IS NULL THEN SET NEW.deleted_at = CURRENT_TIMESTAMP(); END IF;
    SET NEW.deleted_by = COALESCE(@audit_user, 'system');
  ELSE
    SET NEW.deleted_at = NULL;
    SET NEW.deleted_by = NULL;
  END IF;
END$$
CREATE TRIGGER `duelas_bu` BEFORE UPDATE ON `duelas` FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP();
  SET NEW.updated_by = COALESCE(@audit_user, 'system');
  IF NEW.is_deleted IS NULL THEN SET NEW.is_deleted = 0; END IF;
  IF (NEW.is_deleted = 1 AND OLD.is_deleted = 0) OR (NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL) THEN
    SET NEW.is_deleted = 1;
    IF NEW.deleted_at IS NULL THEN SET NEW.deleted_at = CURRENT_TIMESTAMP(); END IF;
    SET NEW.deleted_by = COALESCE(@audit_user, 'system');
  END IF;
  IF (NEW.is_deleted = 0 AND OLD.is_deleted = 1) OR (NEW.deleted_at IS NULL AND OLD.deleted_at IS NOT NULL) THEN
    SET NEW.is_deleted = 0;
    SET NEW.deleted_at = NULL;
    SET NEW.deleted_by = NULL;
  END IF;
END$$

-- === entradas ===
ALTER TABLE `entradas`
  ADD COLUMN IF NOT EXISTS `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS `created_by` VARCHAR(100) NOT NULL DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS `updated_by` VARCHAR(100) NOT NULL DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS `deleted_by` VARCHAR(100) NULL;
DROP INDEX IF EXISTS `idx_entradas_is_deleted` ON `entradas`;
DROP INDEX IF EXISTS `idx_entradas_deleted_at` ON `entradas`;
ALTER TABLE `entradas`
  ADD INDEX `idx_entradas_is_deleted` (`is_deleted`),
  ADD INDEX `idx_entradas_deleted_at` (`deleted_at`);
DROP TRIGGER IF EXISTS `entradas_bi`;
DROP TRIGGER IF EXISTS `entradas_bu`;
CREATE TRIGGER `entradas_bi` BEFORE INSERT ON `entradas` FOR EACH ROW
BEGIN
  IF NEW.created_at IS NULL THEN SET NEW.created_at = CURRENT_TIMESTAMP(); END IF;
  SET NEW.updated_at = NEW.created_at;
  SET NEW.created_by = COALESCE(@audit_user, 'system');
  SET NEW.updated_by = NEW.created_by;
  IF NEW.is_deleted IS NULL THEN SET NEW.is_deleted = 0; END IF;
  IF NEW.is_deleted = 1 THEN
    IF NEW.deleted_at IS NULL THEN SET NEW.deleted_at = CURRENT_TIMESTAMP(); END IF;
    SET NEW.deleted_by = COALESCE(@audit_user, 'system');
  ELSE
    SET NEW.deleted_at = NULL;
    SET NEW.deleted_by = NULL;
  END IF;
END$$
CREATE TRIGGER `entradas_bu` BEFORE UPDATE ON `entradas` FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP();
  SET NEW.updated_by = COALESCE(@audit_user, 'system');
  IF NEW.is_deleted IS NULL THEN SET NEW.is_deleted = 0; END IF;
  IF (NEW.is_deleted = 1 AND OLD.is_deleted = 0) OR (NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL) THEN
    SET NEW.is_deleted = 1;
    IF NEW.deleted_at IS NULL THEN SET NEW.deleted_at = CURRENT_TIMESTAMP(); END IF;
    SET NEW.deleted_by = COALESCE(@audit_user, 'system');
  END IF;
  IF (NEW.is_deleted = 0 AND OLD.is_deleted = 1) OR (NEW.deleted_at IS NULL AND OLD.deleted_at IS NOT NULL) THEN
    SET NEW.is_deleted = 0;
    SET NEW.deleted_at = NULL;
    SET NEW.deleted_by = NULL;
  END IF;
END$$

-- === lineas_entrada ===
ALTER TABLE `lineas_entrada`
  ADD COLUMN IF NOT EXISTS `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS `created_by` VARCHAR(100) NOT NULL DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS `updated_by` VARCHAR(100) NOT NULL DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS `deleted_by` VARCHAR(100) NULL;
DROP INDEX IF EXISTS `idx_lineas_entrada_is_deleted` ON `lineas_entrada`;
DROP INDEX IF EXISTS `idx_lineas_entrada_deleted_at` ON `lineas_entrada`;
ALTER TABLE `lineas_entrada`
  ADD INDEX `idx_lineas_entrada_is_deleted` (`is_deleted`),
  ADD INDEX `idx_lineas_entrada_deleted_at` (`deleted_at`);
DROP TRIGGER IF EXISTS `lineas_entrada_bi`;
DROP TRIGGER IF EXISTS `lineas_entrada_bu`;
CREATE TRIGGER `lineas_entrada_bi` BEFORE INSERT ON `lineas_entrada` FOR EACH ROW
BEGIN
  IF NEW.created_at IS NULL THEN SET NEW.created_at = CURRENT_TIMESTAMP(); END IF;
  SET NEW.updated_at = NEW.created_at;
  SET NEW.created_by = COALESCE(@audit_user, 'system');
  SET NEW.updated_by = NEW.created_by;
  IF NEW.is_deleted IS NULL THEN SET NEW.is_deleted = 0; END IF;
  IF NEW.is_deleted = 1 THEN
    IF NEW.deleted_at IS NULL THEN SET NEW.deleted_at = CURRENT_TIMESTAMP(); END IF;
    SET NEW.deleted_by = COALESCE(@audit_user, 'system');
  ELSE
    SET NEW.deleted_at = NULL;
    SET NEW.deleted_by = NULL;
  END IF;
END$$
CREATE TRIGGER `lineas_entrada_bu` BEFORE UPDATE ON `lineas_entrada` FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP();
  SET NEW.updated_by = COALESCE(@audit_user, 'system');
  IF NEW.is_deleted IS NULL THEN SET NEW.is_deleted = 0; END IF;
  IF (NEW.is_deleted = 1 AND OLD.is_deleted = 0) OR (NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL) THEN
    SET NEW.is_deleted = 1;
    IF NEW.deleted_at IS NULL THEN SET NEW.deleted_at = CURRENT_TIMESTAMP(); END IF;
    SET NEW.deleted_by = COALESCE(@audit_user, 'system');
  END IF;
  IF (NEW.is_deleted = 0 AND OLD.is_deleted = 1) OR (NEW.deleted_at IS NULL AND OLD.deleted_at IS NOT NULL) THEN
    SET NEW.is_deleted = 0;
    SET NEW.deleted_at = NULL;
    SET NEW.deleted_by = NULL;
  END IF;
END$$

-- === palets ===
ALTER TABLE `palets`
  ADD COLUMN IF NOT EXISTS `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS `created_by` VARCHAR(100) NOT NULL DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS `updated_by` VARCHAR(100) NOT NULL DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS `deleted_by` VARCHAR(100) NULL;
DROP INDEX IF EXISTS `idx_palets_is_deleted` ON `palets`;
DROP INDEX IF EXISTS `idx_palets_deleted_at` ON `palets`;
ALTER TABLE `palets`
  ADD INDEX `idx_palets_is_deleted` (`is_deleted`),
  ADD INDEX `idx_palets_deleted_at` (`deleted_at`);
DROP TRIGGER IF EXISTS `palets_bi`;
DROP TRIGGER IF EXISTS `palets_bu`;
CREATE TRIGGER `palets_bi` BEFORE INSERT ON `palets` FOR EACH ROW
BEGIN
  IF NEW.created_at IS NULL THEN SET NEW.created_at = CURRENT_TIMESTAMP(); END IF;
  SET NEW.updated_at = NEW.created_at;
  SET NEW.created_by = COALESCE(@audit_user, 'system');
  SET NEW.updated_by = NEW.created_by;
  IF NEW.is_deleted IS NULL THEN SET NEW.is_deleted = 0; END IF;
  IF NEW.is_deleted = 1 THEN
    IF NEW.deleted_at IS NULL THEN SET NEW.deleted_at = CURRENT_TIMESTAMP(); END IF;
    SET NEW.deleted_by = COALESCE(@audit_user, 'system');
  ELSE
    SET NEW.deleted_at = NULL;
    SET NEW.deleted_by = NULL;
  END IF;
END$$
CREATE TRIGGER `palets_bu` BEFORE UPDATE ON `palets` FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP();
  SET NEW.updated_by = COALESCE(@audit_user, 'system');
  IF NEW.is_deleted IS NULL THEN SET NEW.is_deleted = 0; END IF;
  IF (NEW.is_deleted = 1 AND OLD.is_deleted = 0) OR (NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL) THEN
    SET NEW.is_deleted = 1;
    IF NEW.deleted_at IS NULL THEN SET NEW.deleted_at = CURRENT_TIMESTAMP(); END IF;
    SET NEW.deleted_by = COALESCE(@audit_user, 'system');
  END IF;
  IF (NEW.is_deleted = 0 AND OLD.is_deleted = 1) OR (NEW.deleted_at IS NULL AND OLD.deleted_at IS NOT NULL) THEN
    SET NEW.is_deleted = 0;
    SET NEW.deleted_at = NULL;
    SET NEW.deleted_by = NULL;
  END IF;
END$$

-- === productos ===
ALTER TABLE `productos`
  ADD COLUMN IF NOT EXISTS `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS `created_by` VARCHAR(100) NOT NULL DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS `updated_by` VARCHAR(100) NOT NULL DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS `deleted_by` VARCHAR(100) NULL;
DROP INDEX IF EXISTS `idx_productos_is_deleted` ON `productos`;
DROP INDEX IF EXISTS `idx_productos_deleted_at` ON `productos`;
ALTER TABLE `productos`
  ADD INDEX `idx_productos_is_deleted` (`is_deleted`),
  ADD INDEX `idx_productos_deleted_at` (`deleted_at`);
DROP TRIGGER IF EXISTS `productos_bi`;
DROP TRIGGER IF EXISTS `productos_bu`;
CREATE TRIGGER `productos_bi` BEFORE INSERT ON `productos` FOR EACH ROW
BEGIN
  IF NEW.created_at IS NULL THEN SET NEW.created_at = CURRENT_TIMESTAMP(); END IF;
  SET NEW.updated_at = NEW.created_at;
  SET NEW.created_by = COALESCE(@audit_user, 'system');
  SET NEW.updated_by = NEW.created_by;
  IF NEW.is_deleted IS NULL THEN SET NEW.is_deleted = 0; END IF;
  IF NEW.is_deleted = 1 THEN
    IF NEW.deleted_at IS NULL THEN SET NEW.deleted_at = CURRENT_TIMESTAMP(); END IF;
    SET NEW.deleted_by = COALESCE(@audit_user, 'system');
  ELSE
    SET NEW.deleted_at = NULL;
    SET NEW.deleted_by = NULL;
  END IF;
END$$
CREATE TRIGGER `productos_bu` BEFORE UPDATE ON `productos` FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP();
  SET NEW.updated_by = COALESCE(@audit_user, 'system');
  IF NEW.is_deleted IS NULL THEN SET NEW.is_deleted = 0; END IF;
  IF (NEW.is_deleted = 1 AND OLD.is_deleted = 0) OR (NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL) THEN
    SET NEW.is_deleted = 1;
    IF NEW.deleted_at IS NULL THEN SET NEW.deleted_at = CURRENT_TIMESTAMP(); END IF;
    SET NEW.deleted_by = COALESCE(@audit_user, 'system');
  END IF;
  IF (NEW.is_deleted = 0 AND OLD.is_deleted = 1) OR (NEW.deleted_at IS NULL AND OLD.deleted_at IS NOT NULL) THEN
    SET NEW.is_deleted = 0;
    SET NEW.deleted_at = NULL;
    SET NEW.deleted_by = NULL;
  END IF;
END$$

-- === archivos_subidos ===
ALTER TABLE `archivos_subidos`
  ADD COLUMN IF NOT EXISTS `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS `created_by` VARCHAR(100) NOT NULL DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS `updated_by` VARCHAR(100) NOT NULL DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS `deleted_by` VARCHAR(100) NULL;
DROP INDEX IF EXISTS `idx_archivos_subidos_is_deleted` ON `archivos_subidos`;
DROP INDEX IF EXISTS `idx_archivos_subidos_deleted_at` ON `archivos_subidos`;
ALTER TABLE `archivos_subidos`
  ADD INDEX `idx_archivos_subidos_is_deleted` (`is_deleted`),
  ADD INDEX `idx_archivos_subidos_deleted_at` (`deleted_at`);
DROP TRIGGER IF EXISTS `archivos_subidos_bi`;
DROP TRIGGER IF EXISTS `archivos_subidos_bu`;
CREATE TRIGGER `archivos_subidos_bi` BEFORE INSERT ON `archivos_subidos` FOR EACH ROW
BEGIN
  IF NEW.created_at IS NULL THEN SET NEW.created_at = CURRENT_TIMESTAMP(); END IF;
  SET NEW.updated_at = NEW.created_at;
  SET NEW.created_by = COALESCE(@audit_user, 'system');
  SET NEW.updated_by = NEW.created_by;
  IF NEW.is_deleted IS NULL THEN SET NEW.is_deleted = 0; END IF;
  IF NEW.is_deleted = 1 THEN
    IF NEW.deleted_at IS NULL THEN SET NEW.deleted_at = CURRENT_TIMESTAMP(); END IF;
    SET NEW.deleted_by = COALESCE(@audit_user, 'system');
  ELSE
    SET NEW.deleted_at = NULL;
    SET NEW.deleted_by = NULL;
  END IF;
END$$
CREATE TRIGGER `archivos_subidos_bu` BEFORE UPDATE ON `archivos_subidos` FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP();
  SET NEW.updated_by = COALESCE(@audit_user, 'system');
  IF NEW.is_deleted IS NULL THEN SET NEW.is_deleted = 0; END IF;
  IF (NEW.is_deleted = 1 AND OLD.is_deleted = 0) OR (NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL) THEN
    SET NEW.is_deleted = 1;
    IF NEW.deleted_at IS NULL THEN SET NEW.deleted_at = CURRENT_TIMESTAMP(); END IF;
    SET NEW.deleted_by = COALESCE(@audit_user, 'system');
  END IF;
  IF (NEW.is_deleted = 0 AND OLD.is_deleted = 1) OR (NEW.deleted_at IS NULL AND OLD.deleted_at IS NOT NULL) THEN
    SET NEW.is_deleted = 0;
    SET NEW.deleted_at = NULL;
    SET NEW.deleted_by = NULL;
  END IF;
END$$

-- === ordenes_fabricacion ===
ALTER TABLE `ordenes_fabricacion`
  ADD COLUMN IF NOT EXISTS `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS `created_by` VARCHAR(100) NOT NULL DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS `updated_by` VARCHAR(100) NOT NULL DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS `deleted_by` VARCHAR(100) NULL;
DROP INDEX IF EXISTS `idx_ordenes_fabricacion_is_deleted` ON `ordenes_fabricacion`;
DROP INDEX IF EXISTS `idx_ordenes_fabricacion_deleted_at` ON `ordenes_fabricacion`;
ALTER TABLE `ordenes_fabricacion`
  ADD INDEX `idx_ordenes_fabricacion_is_deleted` (`is_deleted`),
  ADD INDEX `idx_ordenes_fabricacion_deleted_at` (`deleted_at`);
DROP TRIGGER IF EXISTS `ordenes_fabricacion_bi`;
DROP TRIGGER IF EXISTS `ordenes_fabricacion_bu`;
CREATE TRIGGER `ordenes_fabricacion_bi` BEFORE INSERT ON `ordenes_fabricacion` FOR EACH ROW
BEGIN
  IF NEW.created_at IS NULL THEN SET NEW.created_at = CURRENT_TIMESTAMP(); END IF;
  SET NEW.updated_at = NEW.created_at;
  SET NEW.created_by = COALESCE(@audit_user, 'system');
  SET NEW.updated_by = NEW.created_by;
  IF NEW.is_deleted IS NULL THEN SET NEW.is_deleted = 0; END IF;
  IF NEW.is_deleted = 1 THEN
    IF NEW.deleted_at IS NULL THEN SET NEW.deleted_at = CURRENT_TIMESTAMP(); END IF;
    SET NEW.deleted_by = COALESCE(@audit_user, 'system');
  ELSE
    SET NEW.deleted_at = NULL;
    SET NEW.deleted_by = NULL;
  END IF;
END$$
CREATE TRIGGER `ordenes_fabricacion_bu` BEFORE UPDATE ON `ordenes_fabricacion` FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP();
  SET NEW.updated_by = COALESCE(@audit_user, 'system');
  IF NEW.is_deleted IS NULL THEN SET NEW.is_deleted = 0; END IF;
  IF (NEW.is_deleted = 1 AND OLD.is_deleted = 0) OR (NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL) THEN
    SET NEW.is_deleted = 1;
    IF NEW.deleted_at IS NULL THEN SET NEW.deleted_at = CURRENT_TIMESTAMP(); END IF;
    SET NEW.deleted_by = COALESCE(@audit_user, 'system');
  END IF;
  IF (NEW.is_deleted = 0 AND OLD.is_deleted = 1) OR (NEW.deleted_at IS NULL AND OLD.deleted_at IS NOT NULL) THEN
    SET NEW.is_deleted = 0;
    SET NEW.deleted_at = NULL;
    SET NEW.deleted_by = NULL;
  END IF;
END$$

-- === tipos_producto ===
ALTER TABLE `tipos_producto`
  ADD COLUMN IF NOT EXISTS `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS `created_by` VARCHAR(100) NOT NULL DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS `updated_by` VARCHAR(100) NOT NULL DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS `deleted_by` VARCHAR(100) NULL;
DROP INDEX IF EXISTS `idx_tipos_producto_is_deleted` ON `tipos_producto`;
DROP INDEX IF EXISTS `idx_tipos_producto_deleted_at` ON `tipos_producto`;
ALTER TABLE `tipos_producto`
  ADD INDEX `idx_tipos_producto_is_deleted` (`is_deleted`),
  ADD INDEX `idx_tipos_producto_deleted_at` (`deleted_at`);
DROP TRIGGER IF EXISTS `tipos_producto_bi`;
DROP TRIGGER IF EXISTS `tipos_producto_bu`;
CREATE TRIGGER `tipos_producto_bi` BEFORE INSERT ON `tipos_producto` FOR EACH ROW
BEGIN
  IF NEW.created_at IS NULL THEN SET NEW.created_at = CURRENT_TIMESTAMP(); END IF;
  SET NEW.updated_at = NEW.created_at;
  SET NEW.created_by = COALESCE(@audit_user, 'system');
  SET NEW.updated_by = NEW.created_by;
  IF NEW.is_deleted IS NULL THEN SET NEW.is_deleted = 0; END IF;
  IF NEW.is_deleted = 1 THEN
    IF NEW.deleted_at IS NULL THEN SET NEW.deleted_at = CURRENT_TIMESTAMP(); END IF;
    SET NEW.deleted_by = COALESCE(@audit_user, 'system');
  ELSE
    SET NEW.deleted_at = NULL;
    SET NEW.deleted_by = NULL;
  END IF;
END$$
CREATE TRIGGER `tipos_producto_bu` BEFORE UPDATE ON `tipos_producto` FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP();
  SET NEW.updated_by = COALESCE(@audit_user, 'system');
  IF NEW.is_deleted IS NULL THEN SET NEW.is_deleted = 0; END IF;
  IF (NEW.is_deleted = 1 AND OLD.is_deleted = 0) OR (NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL) THEN
    SET NEW.is_deleted = 1;
    IF NEW.deleted_at IS NULL THEN SET NEW.deleted_at = CURRENT_TIMESTAMP(); END IF;
    SET NEW.deleted_by = COALESCE(@audit_user, 'system');
  END IF;
  IF (NEW.is_deleted = 0 AND OLD.is_deleted = 1) OR (NEW.deleted_at IS NULL AND OLD.deleted_at IS NOT NULL) THEN
    SET NEW.is_deleted = 0;
    SET NEW.deleted_at = NULL;
    SET NEW.deleted_by = NULL;
  END IF;
END$$

-- === lineas_fabricacion ===
ALTER TABLE `lineas_fabricacion`
  ADD COLUMN IF NOT EXISTS `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS `created_by` VARCHAR(100) NOT NULL DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS `updated_by` VARCHAR(100) NOT NULL DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS `deleted_by` VARCHAR(100) NULL;
DROP INDEX IF EXISTS `idx_lineas_fabricacion_is_deleted` ON `lineas_fabricacion`;
DROP INDEX IF EXISTS `idx_lineas_fabricacion_deleted_at` ON `lineas_fabricacion`;
ALTER TABLE `lineas_fabricacion`
  ADD INDEX `idx_lineas_fabricacion_is_deleted` (`is_deleted`),
  ADD INDEX `idx_lineas_fabricacion_deleted_at` (`deleted_at`);
DROP TRIGGER IF EXISTS `lineas_fabricacion_bi`;
DROP TRIGGER IF EXISTS `lineas_fabricacion_bu`;
CREATE TRIGGER `lineas_fabricacion_bi` BEFORE INSERT ON `lineas_fabricacion` FOR EACH ROW
BEGIN
  IF NEW.created_at IS NULL THEN SET NEW.created_at = CURRENT_TIMESTAMP(); END IF;
  SET NEW.updated_at = NEW.created_at;
  SET NEW.created_by = COALESCE(@audit_user, 'system');
  SET NEW.updated_by = NEW.created_by;
  IF NEW.is_deleted IS NULL THEN SET NEW.is_deleted = 0; END IF;
  IF NEW.is_deleted = 1 THEN
    IF NEW.deleted_at IS NULL THEN SET NEW.deleted_at = CURRENT_TIMESTAMP(); END IF;
    SET NEW.deleted_by = COALESCE(@audit_user, 'system');
  ELSE
    SET NEW.deleted_at = NULL;
    SET NEW.deleted_by = NULL;
  END IF;
END$$
CREATE TRIGGER `lineas_fabricacion_bu` BEFORE UPDATE ON `lineas_fabricacion` FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP();
  SET NEW.updated_by = COALESCE(@audit_user, 'system');
  IF NEW.is_deleted IS NULL THEN SET NEW.is_deleted = 0; END IF;
  IF (NEW.is_deleted = 1 AND OLD.is_deleted = 0) OR (NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL) THEN
    SET NEW.is_deleted = 1;
    IF NEW.deleted_at IS NULL THEN SET NEW.deleted_at = CURRENT_TIMESTAMP(); END IF;
    SET NEW.deleted_by = COALESCE(@audit_user, 'system');
  END IF;
  IF (NEW.is_deleted = 0 AND OLD.is_deleted = 1) OR (NEW.deleted_at IS NULL AND OLD.deleted_at IS NOT NULL) THEN
    SET NEW.is_deleted = 0;
    SET NEW.deleted_at = NULL;
    SET NEW.deleted_by = NULL;
  END IF;
END$$

-- === trazabilidad_procesado ===
ALTER TABLE `trazabilidad_procesado`
  ADD COLUMN IF NOT EXISTS `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS `created_by` VARCHAR(100) NOT NULL DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS `updated_by` VARCHAR(100) NOT NULL DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS `deleted_by` VARCHAR(100) NULL;
DROP INDEX IF EXISTS `idx_trazabilidad_procesado_is_deleted` ON `trazabilidad_procesado`;
DROP INDEX IF EXISTS `idx_trazabilidad_procesado_deleted_at` ON `trazabilidad_procesado`;
ALTER TABLE `trazabilidad_procesado`
  ADD INDEX `idx_trazabilidad_procesado_is_deleted` (`is_deleted`),
  ADD INDEX `idx_trazabilidad_procesado_deleted_at` (`deleted_at`);
DROP TRIGGER IF EXISTS `trazabilidad_procesado_bi`;
DROP TRIGGER IF EXISTS `trazabilidad_procesado_bu`;
CREATE TRIGGER `trazabilidad_procesado_bi` BEFORE INSERT ON `trazabilidad_procesado` FOR EACH ROW
BEGIN
  IF NEW.created_at IS NULL THEN SET NEW.created_at = CURRENT_TIMESTAMP(); END IF;
  SET NEW.updated_at = NEW.created_at;
  SET NEW.created_by = COALESCE(@audit_user, 'system');
  SET NEW.updated_by = NEW.created_by;
  IF NEW.is_deleted IS NULL THEN SET NEW.is_deleted = 0; END IF;
  IF NEW.is_deleted = 1 THEN
    IF NEW.deleted_at IS NULL THEN SET NEW.deleted_at = CURRENT_TIMESTAMP(); END IF;
    SET NEW.deleted_by = COALESCE(@audit_user, 'system');
  ELSE
    SET NEW.deleted_at = NULL;
    SET NEW.deleted_by = NULL;
  END IF;
END$$
CREATE TRIGGER `trazabilidad_procesado_bu` BEFORE UPDATE ON `trazabilidad_procesado` FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP();
  SET NEW.updated_by = COALESCE(@audit_user, 'system');
  IF NEW.is_deleted IS NULL THEN SET NEW.is_deleted = 0; END IF;
  IF (NEW.is_deleted = 1 AND OLD.is_deleted = 0) OR (NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL) THEN
    SET NEW.is_deleted = 1;
    IF NEW.deleted_at IS NULL THEN SET NEW.deleted_at = CURRENT_TIMESTAMP(); END IF;
    SET NEW.deleted_by = COALESCE(@audit_user, 'system');
  END IF;
  IF (NEW.is_deleted = 0 AND OLD.is_deleted = 1) OR (NEW.deleted_at IS NULL AND OLD.deleted_at IS NOT NULL) THEN
    SET NEW.is_deleted = 0;
    SET NEW.deleted_at = NULL;
    SET NEW.deleted_by = NULL;
  END IF;
END$$

-- === trazabilidad_fabricacion ===
ALTER TABLE `trazabilidad_fabricacion`
  ADD COLUMN IF NOT EXISTS `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS `created_by` VARCHAR(100) NOT NULL DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS `updated_by` VARCHAR(100) NOT NULL DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS `deleted_by` VARCHAR(100) NULL;
DROP INDEX IF EXISTS `idx_trazabilidad_fabricacion_is_deleted` ON `trazabilidad_fabricacion`;
DROP INDEX IF EXISTS `idx_trazabilidad_fabricacion_deleted_at` ON `trazabilidad_fabricacion`;
ALTER TABLE `trazabilidad_fabricacion`
  ADD INDEX `idx_trazabilidad_fabricacion_is_deleted` (`is_deleted`),
  ADD INDEX `idx_trazabilidad_fabricacion_deleted_at` (`deleted_at`);
DROP TRIGGER IF EXISTS `trazabilidad_fabricacion_bi`;
DROP TRIGGER IF EXISTS `trazabilidad_fabricacion_bu`;
CREATE TRIGGER `trazabilidad_fabricacion_bi` BEFORE INSERT ON `trazabilidad_fabricacion` FOR EACH ROW
BEGIN
  IF NEW.created_at IS NULL THEN SET NEW.created_at = CURRENT_TIMESTAMP(); END IF;
  SET NEW.updated_at = NEW.created_at;
  SET NEW.created_by = COALESCE(@audit_user, 'system');
  SET NEW.updated_by = NEW.created_by;
  IF NEW.is_deleted IS NULL THEN SET NEW.is_deleted = 0; END IF;
  IF NEW.is_deleted = 1 THEN
    IF NEW.deleted_at IS NULL THEN SET NEW.deleted_at = CURRENT_TIMESTAMP(); END IF;
    SET NEW.deleted_by = COALESCE(@audit_user, 'system');
  ELSE
    SET NEW.deleted_at = NULL;
    SET NEW.deleted_by = NULL;
  END IF;
END$$
CREATE TRIGGER `trazabilidad_fabricacion_bu` BEFORE UPDATE ON `trazabilidad_fabricacion` FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP();
  SET NEW.updated_by = COALESCE(@audit_user, 'system');
  IF NEW.is_deleted IS NULL THEN SET NEW.is_deleted = 0; END IF;
  IF (NEW.is_deleted = 1 AND OLD.is_deleted = 0) OR (NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL) THEN
    SET NEW.is_deleted = 1;
    IF NEW.deleted_at IS NULL THEN SET NEW.deleted_at = CURRENT_TIMESTAMP(); END IF;
    SET NEW.deleted_by = COALESCE(@audit_user, 'system');
  END IF;
  IF (NEW.is_deleted = 0 AND OLD.is_deleted = 1) OR (NEW.deleted_at IS NULL AND OLD.deleted_at IS NOT NULL) THEN
    SET NEW.is_deleted = 0;
    SET NEW.deleted_at = NULL;
    SET NEW.deleted_by = NULL;
  END IF;
END$$

-- === trazabilidad_producto ===
ALTER TABLE `trazabilidad_producto`
  ADD COLUMN IF NOT EXISTS `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS `created_by` VARCHAR(100) NOT NULL DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS `updated_by` VARCHAR(100) NOT NULL DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS `deleted_by` VARCHAR(100) NULL;
DROP INDEX IF EXISTS `idx_trazabilidad_producto_is_deleted` ON `trazabilidad_producto`;
DROP INDEX IF EXISTS `idx_trazabilidad_producto_deleted_at` ON `trazabilidad_producto`;
ALTER TABLE `trazabilidad_producto`
  ADD INDEX `idx_trazabilidad_producto_is_deleted` (`is_deleted`),
  ADD INDEX `idx_trazabilidad_producto_deleted_at` (`deleted_at`);
DROP TRIGGER IF EXISTS `trazabilidad_producto_bi`;
DROP TRIGGER IF EXISTS `trazabilidad_producto_bu`;
CREATE TRIGGER `trazabilidad_producto_bi` BEFORE INSERT ON `trazabilidad_producto` FOR EACH ROW
BEGIN
  IF NEW.created_at IS NULL THEN SET NEW.created_at = CURRENT_TIMESTAMP(); END IF;
  SET NEW.updated_at = NEW.created_at;
  SET NEW.created_by = COALESCE(@audit_user, 'system');
  SET NEW.updated_by = NEW.created_by;
  IF NEW.is_deleted IS NULL THEN SET NEW.is_deleted = 0; END IF;
  IF NEW.is_deleted = 1 THEN
    IF NEW.deleted_at IS NULL THEN SET NEW.deleted_at = CURRENT_TIMESTAMP(); END IF;
    SET NEW.deleted_by = COALESCE(@audit_user, 'system');
  ELSE
    SET NEW.deleted_at = NULL;
    SET NEW.deleted_by = NULL;
  END IF;
END$$
CREATE TRIGGER `trazabilidad_producto_bu` BEFORE UPDATE ON `trazabilidad_producto` FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP();
  SET NEW.updated_by = COALESCE(@audit_user, 'system');
  IF NEW.is_deleted IS NULL THEN SET NEW.is_deleted = 0; END IF;
  IF (NEW.is_deleted = 1 AND OLD.is_deleted = 0) OR (NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL) THEN
    SET NEW.is_deleted = 1;
    IF NEW.deleted_at IS NULL THEN SET NEW.deleted_at = CURRENT_TIMESTAMP(); END IF;
    SET NEW.deleted_by = COALESCE(@audit_user, 'system');
  END IF;
  IF (NEW.is_deleted = 0 AND OLD.is_deleted = 1) OR (NEW.deleted_at IS NULL AND OLD.deleted_at IS NOT NULL) THEN
    SET NEW.is_deleted = 0;
    SET NEW.deleted_at = NULL;
    SET NEW.deleted_by = NULL;
  END IF;
END$$

-- === botas ===
ALTER TABLE `botas`
  ADD COLUMN IF NOT EXISTS `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS `created_by` VARCHAR(100) NOT NULL DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS `updated_by` VARCHAR(100) NOT NULL DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS `deleted_by` VARCHAR(100) NULL;
DROP INDEX IF EXISTS `idx_botas_is_deleted` ON `botas`;
DROP INDEX IF EXISTS `idx_botas_deleted_at` ON `botas`;
ALTER TABLE `botas`
  ADD INDEX `idx_botas_is_deleted` (`is_deleted`),
  ADD INDEX `idx_botas_deleted_at` (`deleted_at`);
DROP TRIGGER IF EXISTS `botas_bi`;
DROP TRIGGER IF EXISTS `botas_bu`;
CREATE TRIGGER `botas_bi` BEFORE INSERT ON `botas` FOR EACH ROW
BEGIN
  IF NEW.created_at IS NULL THEN SET NEW.created_at = CURRENT_TIMESTAMP(); END IF;
  SET NEW.updated_at = NEW.created_at;
  SET NEW.created_by = COALESCE(@audit_user, 'system');
  SET NEW.updated_by = NEW.created_by;
  IF NEW.is_deleted IS NULL THEN SET NEW.is_deleted = 0; END IF;
  IF NEW.is_deleted = 1 THEN
    IF NEW.deleted_at IS NULL THEN SET NEW.deleted_at = CURRENT_TIMESTAMP(); END IF;
    SET NEW.deleted_by = COALESCE(@audit_user, 'system');
  ELSE
    SET NEW.deleted_at = NULL;
    SET NEW.deleted_by = NULL;
  END IF;
END$$
CREATE TRIGGER `botas_bu` BEFORE UPDATE ON `botas` FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP();
  SET NEW.updated_by = COALESCE(@audit_user, 'system');
  IF NEW.is_deleted IS NULL THEN SET NEW.is_deleted = 0; END IF;
  IF (NEW.is_deleted = 1 AND OLD.is_deleted = 0) OR (NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL) THEN
    SET NEW.is_deleted = 1;
    IF NEW.deleted_at IS NULL THEN SET NEW.deleted_at = CURRENT_TIMESTAMP(); END IF;
    SET NEW.deleted_by = COALESCE(@audit_user, 'system');
  END IF;
  IF (NEW.is_deleted = 0 AND OLD.is_deleted = 1) OR (NEW.deleted_at IS NULL AND OLD.deleted_at IS NOT NULL) THEN
    SET NEW.is_deleted = 0;
    SET NEW.deleted_at = NULL;
    SET NEW.deleted_by = NULL;
  END IF;
END$$

DELIMITER ;
