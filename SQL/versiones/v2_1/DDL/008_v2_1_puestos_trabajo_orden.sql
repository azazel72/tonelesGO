-- puestos_trabajo: agregar columna orden y nuevo puesto BATIDERO MEDIA TARDE.

SET @orden_existe := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'puestos_trabajo'
    AND COLUMN_NAME = 'orden'
);

SET @sql_orden := IF(
  @orden_existe = 0,
  'ALTER TABLE `puestos_trabajo` ADD COLUMN `orden` int(11) NOT NULL DEFAULT 0 AFTER `fabricacion`',
  'SELECT 1'
);

PREPARE stmt_orden FROM @sql_orden;
EXECUTE stmt_orden;
DEALLOCATE PREPARE stmt_orden;

INSERT IGNORE INTO `puestos_trabajo` (`id`, `nombre`, `orden`, `es_maquinaria`, `fabricacion`, `activo`, `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted`, `deleted_at`, `deleted_by`) VALUES
(20, 'BATIDERO MEDIA TARDE', 6, 1, 1, 1, '2025-11-23 16:56:45', NULL, NULL, NULL, 0, NULL, NULL);

UPDATE `puestos_trabajo` SET `orden` = 1 WHERE `id` = 1;
UPDATE `puestos_trabajo` SET `orden` = 2 WHERE `id` = 2;
UPDATE `puestos_trabajo` SET `orden` = 3 WHERE `id` = 3;
UPDATE `puestos_trabajo` SET `orden` = 4 WHERE `id` = 4;
UPDATE `puestos_trabajo` SET `orden` = 5 WHERE `id` = 5;
UPDATE `puestos_trabajo` SET `orden` = 6 WHERE `id` = 22;
UPDATE `puestos_trabajo` SET `orden` = 7 WHERE `id` = 6;
UPDATE `puestos_trabajo` SET `orden` = 8 WHERE `id` = 7;
UPDATE `puestos_trabajo` SET `orden` = 9 WHERE `id` = 8;
UPDATE `puestos_trabajo` SET `orden` = 10 WHERE `id` = 9;
UPDATE `puestos_trabajo` SET `orden` = 11 WHERE `id` = 10;
UPDATE `puestos_trabajo` SET `orden` = 12 WHERE `id` = 11;
UPDATE `puestos_trabajo` SET `orden` = 13 WHERE `id` = 12;
UPDATE `puestos_trabajo` SET `orden` = 14 WHERE `id` = 13;
UPDATE `puestos_trabajo` SET `orden` = 15 WHERE `id` = 14;
UPDATE `puestos_trabajo` SET `orden` = 16 WHERE `id` = 15;
UPDATE `puestos_trabajo` SET `orden` = 17 WHERE `id` = 16;
UPDATE `puestos_trabajo` SET `orden` = 18 WHERE `id` = 17;
UPDATE `puestos_trabajo` SET `orden` = 19 WHERE `id` = 18;
UPDATE `puestos_trabajo` SET `orden` = 20 WHERE `id` = 19;
UPDATE `puestos_trabajo` SET `orden` = 21 WHERE `id` = 20;
UPDATE `puestos_trabajo` SET `orden` = 22 WHERE `id` = 21;