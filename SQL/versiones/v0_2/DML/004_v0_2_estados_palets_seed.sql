-- v0.2 / DML 004
-- Seed estados_palets.

DELETE FROM `estados_palets`;
INSERT INTO `estados_palets` (`id`, `descripcion`) VALUES
  (1, 'Activo'),
  (2, 'Consumido'),
  (3, 'Bloqueado');
