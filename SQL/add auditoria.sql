ALTER TABLE mi_tabla
  -- sellos de tiempo
  ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- borrado lógico (dos campos)
  ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL,
  ADD COLUMN is_deleted TINYINT(1) NOT NULL DEFAULT 0,

  -- usuario actor
  ADD COLUMN created_by VARCHAR(100) NOT NULL DEFAULT 'system',
  ADD COLUMN updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
  ADD COLUMN deleted_by VARCHAR(100) NULL,

  -- índices útiles
  ADD INDEX idx_mi_tabla_is_deleted (is_deleted),
  ADD INDEX idx_mi_tabla_deleted_at (deleted_at);

