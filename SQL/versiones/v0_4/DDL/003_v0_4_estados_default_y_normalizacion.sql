-- v0.4.003
-- Para todas las tablas con columna `estado`:
-- 1) Default de `estado` = 1
-- 2) Registros con estado NULL o 0 -> 1

DROP PROCEDURE IF EXISTS sp_v04_normalizar_estados;
DELIMITER $$
CREATE PROCEDURE sp_v04_normalizar_estados()
BEGIN
  DECLARE done INT DEFAULT 0;
  DECLARE v_table VARCHAR(128);

  DECLARE cur CURSOR FOR
    SELECT table_name
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND column_name = 'estado';

  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

  OPEN cur;
  read_loop: LOOP
    FETCH cur INTO v_table;
    IF done = 1 THEN
      LEAVE read_loop;
    END IF;

    -- Default = 1
    SET @sql = CONCAT(
      'ALTER TABLE `', v_table, '` ALTER COLUMN `estado` SET DEFAULT 1'
    );
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;

    -- Datos existentes 0/NULL -> 1
    SET @sql = CONCAT(
      'UPDATE `', v_table, '` ',
      'SET `estado` = 1 ',
      'WHERE `estado` IS NULL OR `estado` = 0'
    );
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END LOOP;
  CLOSE cur;
END$$
DELIMITER ;

CALL sp_v04_normalizar_estados();
DROP PROCEDURE IF EXISTS sp_v04_normalizar_estados;

