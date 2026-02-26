-- v0.3 / DML 002
-- Seed de tipos_producto para DUELA.

INSERT INTO `tipos_producto` (`tipo`, `codigo`, `descripcion`)
SELECT 'DUELA', 'DU130', 'Duela 1.30'
WHERE NOT EXISTS (
  SELECT 1 FROM `tipos_producto` WHERE `tipo` = 'DUELA' AND `codigo` = 'DU130'
);

INSERT INTO `tipos_producto` (`tipo`, `codigo`, `descripcion`)
SELECT 'DUELA', 'DU115', 'Duela 1.15'
WHERE NOT EXISTS (
  SELECT 1 FROM `tipos_producto` WHERE `tipo` = 'DUELA' AND `codigo` = 'DU115'
);

INSERT INTO `tipos_producto` (`tipo`, `codigo`, `descripcion`)
SELECT 'DUELA', 'DU100', 'Duela 1.00'
WHERE NOT EXISTS (
  SELECT 1 FROM `tipos_producto` WHERE `tipo` = 'DUELA' AND `codigo` = 'DU100'
);

INSERT INTO `tipos_producto` (`tipo`, `codigo`, `descripcion`)
SELECT 'DUELA', 'DU080', 'Duela 0.80'
WHERE NOT EXISTS (
  SELECT 1 FROM `tipos_producto` WHERE `tipo` = 'DUELA' AND `codigo` = 'DU080'
);

INSERT INTO `tipos_producto` (`tipo`, `codigo`, `descripcion`)
SELECT 'DUELA', 'DU070', 'Duela 0.70'
WHERE NOT EXISTS (
  SELECT 1 FROM `tipos_producto` WHERE `tipo` = 'DUELA' AND `codigo` = 'DU070'
);

INSERT INTO `tipos_producto` (`tipo`, `codigo`, `descripcion`)
SELECT 'DUELA', 'DU095', 'Duela 0.95'
WHERE NOT EXISTS (
  SELECT 1 FROM `tipos_producto` WHERE `tipo` = 'DUELA' AND `codigo` = 'DU095'
);

INSERT INTO `tipos_producto` (`tipo`, `codigo`, `descripcion`)
SELECT 'DUELA', 'DU085', 'Duela 0.85'
WHERE NOT EXISTS (
  SELECT 1 FROM `tipos_producto` WHERE `tipo` = 'DUELA' AND `codigo` = 'DU085'
);

INSERT INTO `tipos_producto` (`tipo`, `codigo`, `descripcion`)
SELECT 'DUELA', 'DU060', 'Duela 0.60'
WHERE NOT EXISTS (
  SELECT 1 FROM `tipos_producto` WHERE `tipo` = 'DUELA' AND `codigo` = 'DU060'
);

INSERT INTO `tipos_producto` (`tipo`, `codigo`, `descripcion`)
SELECT 'DUELA', 'DU050', 'Duela 0.50'
WHERE NOT EXISTS (
  SELECT 1 FROM `tipos_producto` WHERE `tipo` = 'DUELA' AND `codigo` = 'DU050'
);

INSERT INTO `tipos_producto` (`tipo`, `codigo`, `descripcion`)
SELECT 'DUELA', 'DU045', 'Duela 0.45'
WHERE NOT EXISTS (
  SELECT 1 FROM `tipos_producto` WHERE `tipo` = 'DUELA' AND `codigo` = 'DU045'
);
