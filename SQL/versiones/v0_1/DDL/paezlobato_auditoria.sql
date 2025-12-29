
-- Auditoria
-- Procedimiento y llamadas para columnas/triggers de auditoria

DELIMITER $$
--
-- Procedimientos
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `install_audit_for` (IN `p_schema` VARCHAR(64), IN `p_table` VARCHAR(64), IN `p_ensure_columns` BOOLEAN)   BEGIN
  DECLARE fq VARCHAR(260);
  DECLARE col_exists INT DEFAULT 0;
  DECLARE idx_exists INT DEFAULT 0;

  SET fq = CONCAT('`', p_schema, '`.`', p_table, '`');

  /* 1) Asegurar columnas/índices (opcional) */
  IF p_ensure_columns THEN
    /* created_at */
    SELECT COUNT(*) INTO col_exists FROM information_schema.columns
      WHERE table_schema=p_schema AND table_name=p_table AND column_name='created_at';
    IF col_exists = 0 THEN
      SET @sql := CONCAT('ALTER TABLE ', fq, ' ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP');
      PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
    END IF;

    /* updated_at */
    SELECT COUNT(*) INTO col_exists FROM information_schema.columns
      WHERE table_schema=p_schema AND table_name=p_table AND column_name='updated_at';
    IF col_exists = 0 THEN
      SET @sql := CONCAT('ALTER TABLE ', fq, ' ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
      PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
    END IF;

    /* deleted_at */
    SELECT COUNT(*) INTO col_exists FROM information_schema.columns
      WHERE table_schema=p_schema AND table_name=p_table AND column_name='deleted_at';
    IF col_exists = 0 THEN
      SET @sql := CONCAT('ALTER TABLE ', fq, ' ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL');
      PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
    END IF;

    /* is_deleted */
    SELECT COUNT(*) INTO col_exists FROM information_schema.columns
      WHERE table_schema=p_schema AND table_name=p_table AND column_name='is_deleted';
    IF col_exists = 0 THEN
      SET @sql := CONCAT('ALTER TABLE ', fq, ' ADD COLUMN is_deleted TINYINT(1) NOT NULL DEFAULT 0');
      PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
    END IF;

    /* created_by */
    SELECT COUNT(*) INTO col_exists FROM information_schema.columns
      WHERE table_schema=p_schema AND table_name=p_table AND column_name='created_by';
    IF col_exists = 0 THEN
      SET @sql := CONCAT('ALTER TABLE ', fq, ' ADD COLUMN created_by VARCHAR(100) NOT NULL DEFAULT ''system''');
      PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
    END IF;

    /* updated_by */
    SELECT COUNT(*) INTO col_exists FROM information_schema.columns
      WHERE table_schema=p_schema AND table_name=p_table AND column_name='updated_by';
    IF col_exists = 0 THEN
      SET @sql := CONCAT('ALTER TABLE ', fq, ' ADD COLUMN updated_by VARCHAR(100) NOT NULL DEFAULT ''system''');
      PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
    END IF;

    /* deleted_by */
    SELECT COUNT(*) INTO col_exists FROM information_schema.columns
      WHERE table_schema=p_schema AND table_name=p_table AND column_name='deleted_by';
    IF col_exists = 0 THEN
      SET @sql := CONCAT('ALTER TABLE ', fq, ' ADD COLUMN deleted_by VARCHAR(100) NULL');
      PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
    END IF;

    /* índice is_deleted */
    SELECT COUNT(*) INTO idx_exists FROM information_schema.statistics
      WHERE table_schema=p_schema AND table_name=p_table AND index_name=CONCAT('idx_', p_table, '_is_deleted');
    IF idx_exists = 0 THEN
      SET @sql := CONCAT('ALTER TABLE ', fq, ' ADD INDEX `idx_', p_table, '_is_deleted` (is_deleted)');
      PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
    END IF;

    /* índice deleted_at */
    SELECT COUNT(*) INTO idx_exists FROM information_schema.statistics
      WHERE table_schema=p_schema AND table_name=p_table AND index_name=CONCAT('idx_', p_table, '_deleted_at');
    IF idx_exists = 0 THEN
      SET @sql := CONCAT('ALTER TABLE ', fq, ' ADD INDEX `idx_', p_table, '_deleted_at` (deleted_at)');
      PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
    END IF;
  END IF;

  /* 2) Eliminar triggers previos si existen */
  SET @sql := CONCAT('DROP TRIGGER IF EXISTS `', p_schema, '`.`', p_table, '_bi`');
  PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

  SET @sql := CONCAT('DROP TRIGGER IF EXISTS `', p_schema, '`.`', p_table, '_bu`');
  PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

  /* 3) BEFORE INSERT */
  SET @sql := CONCAT(
    'CREATE TRIGGER `', p_schema, '`.`', p_table, '_bi` ',
    'BEFORE INSERT ON ', fq, ' FOR EACH ROW ',
    'BEGIN ',
    '  IF NEW.created_at IS NULL THEN SET NEW.created_at = CURRENT_TIMESTAMP(); END IF;',
    '  SET NEW.updated_at = NEW.created_at;',
    '  SET NEW.created_by = COALESCE(@audit_user, ''system'');',
    '  SET NEW.updated_by = NEW.created_by;',
    '  IF NEW.is_deleted IS NULL THEN SET NEW.is_deleted = 0; END IF;',
    '  IF NEW.is_deleted = 1 THEN ',
    '    IF NEW.deleted_at IS NULL THEN SET NEW.deleted_at = CURRENT_TIMESTAMP(); END IF;',
    '    SET NEW.deleted_by = COALESCE(@audit_user, ''system'');',
    '  ELSE ',
    '    SET NEW.deleted_at = NULL;',
    '    SET NEW.deleted_by = NULL;',
    '  END IF;',
    'END'
  );
  PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

  /* 4) BEFORE UPDATE */
  SET @sql := CONCAT(
    'CREATE TRIGGER `', p_schema, '`.`', p_table, '_bu` ',
    'BEFORE UPDATE ON ', fq, ' FOR EACH ROW ',
    'BEGIN ',
    '  SET NEW.updated_at = CURRENT_TIMESTAMP();',
    '  SET NEW.updated_by = COALESCE(@audit_user, ''system'');',
    '  IF NEW.is_deleted IS NULL THEN SET NEW.is_deleted = 0; END IF;',
    '  IF (NEW.is_deleted = 1 AND OLD.is_deleted = 0) ',
    '     OR (NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL) THEN ',
    '    SET NEW.is_deleted = 1;',
    '    IF NEW.deleted_at IS NULL THEN SET NEW.deleted_at = CURRENT_TIMESTAMP(); END IF;',
    '    SET NEW.deleted_by = COALESCE(@audit_user, ''system'');',
    '  END IF;',
    '  IF (NEW.is_deleted = 0 AND OLD.is_deleted = 1) ',
    '     OR (NEW.deleted_at IS NULL AND OLD.deleted_at IS NOT NULL) THEN ',
    '    SET NEW.is_deleted = 0;',
    '    SET NEW.deleted_at = NULL;',
    '    SET NEW.deleted_by = NULL;',
    '  END IF;',
    'END'
  );
  PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
END$$

DELIMITER ;

CALL install_audit_for('paezlobato','clientes', true);
CALL install_audit_for('paezlobato','cuadrantes', true);
CALL install_audit_for('paezlobato','cuadrante_detalles', true);
CALL install_audit_for('paezlobato','estados', true);
CALL install_audit_for('paezlobato','instalaciones', true);
CALL install_audit_for('paezlobato','plan_camiones', true);
CALL install_audit_for('paezlobato','plan_facturacion', true);
CALL install_audit_for('paezlobato','plan_material', true);
CALL install_audit_for('paezlobato','proveedores', true);
CALL install_audit_for('paezlobato','puestos_trabajo', true);
CALL install_audit_for('paezlobato','roles', true);
CALL install_audit_for('paezlobato','ubicaciones', true);
CALL install_audit_for('paezlobato','usuarios', true);
CALL install_audit_for('paezlobato','materiales', true);
CALL install_audit_for('paezlobato','duelas', true);
CALL install_audit_for('paezlobato','entradas', true);
CALL install_audit_for('paezlobato','lineas_entrada', true);
CALL install_audit_for('paezlobato','palets', true);
CALL install_audit_for('paezlobato','productos', true);
