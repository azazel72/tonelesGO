-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 11-11-2025 a las 01:14:16
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `paezlobato`
--

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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `clientes`
--

CREATE TABLE `clientes` (
  `id` int(11) NOT NULL,
  `nombre` varchar(128) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `clientes`
--

INSERT INTO `clientes` (`id`, `nombre`) VALUES
(13, 'Antonia'),
(5, 'Antonio'),
(12, 'Consolacion'),
(14, 'Francisco'),
(32, 'Inma'),
(11, 'Julio'),
(3, 'Manuel'),
(2, 'Miguel'),
(10, 'Paco'),
(4, 'Pepe'),
(1, 'Rafael'),
(9, 'sasdaasd'),
(22, 't0'),
(15, 't1'),
(21, 't10'),
(26, 't11'),
(20, 't15'),
(27, 't16'),
(28, 't17'),
(29, 't18'),
(30, 't19'),
(16, 'T2'),
(25, 't200'),
(31, 'T21'),
(23, 't25'),
(17, 't3'),
(18, 't4'),
(19, 't8');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estados`
--

CREATE TABLE `estados` (
  `id` int(11) NOT NULL,
  `descripcion` varchar(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `estados`
--

INSERT INTO `estados` (`id`, `descripcion`) VALUES
(6, 'Destino definitivo'),
(3, 'En camino'),
(4, 'Envinado'),
(1, 'Proceso de produccion'),
(5, 'Vuelta a reparación'),
(2, 'Zona de carga');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `instalaciones`
--

CREATE TABLE `instalaciones` (
  `id` int(11) NOT NULL,
  `nombre` varchar(60) NOT NULL,
  `tipo` varchar(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `instalaciones`
--

INSERT INTO `instalaciones` (`id`, `nombre`, `tipo`) VALUES
(1, 'Taller nuevo', 'B'),
(2, 'Taller viejo', 'M'),
(3, 'Sta Lucia', 'B'),
(4, 'Paez Morilla', 'M');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `plan_camiones`
--

CREATE TABLE `plan_camiones` (
  `id` int(11) NOT NULL,
  `año` year(4) NOT NULL,
  `proveedor_id` int(11) NOT NULL,
  `total_pactados` int(11) DEFAULT 0,
  `total_descontar` int(11) DEFAULT 0,
  `ene_previsto` int(11) DEFAULT 0,
  `ene_confirmado` int(11) DEFAULT 0,
  `feb_previsto` int(11) DEFAULT 0,
  `feb_confirmado` int(11) DEFAULT 0,
  `mar_previsto` int(11) DEFAULT 0,
  `mar_confirmado` int(11) DEFAULT 0,
  `abr_previsto` int(11) DEFAULT 0,
  `abr_confirmado` int(11) DEFAULT 0,
  `may_previsto` int(11) DEFAULT 0,
  `may_confirmado` int(11) DEFAULT 0,
  `jun_previsto` int(11) DEFAULT 0,
  `jun_confirmado` int(11) DEFAULT 0,
  `jul_previsto` int(11) DEFAULT 0,
  `jul_confirmado` int(11) DEFAULT 0,
  `ago_previsto` int(11) DEFAULT 0,
  `ago_confirmado` int(11) DEFAULT 0,
  `sep_previsto` int(11) DEFAULT 0,
  `sep_confirmado` int(11) DEFAULT 0,
  `oct_previsto` int(11) DEFAULT 0,
  `oct_confirmado` int(11) DEFAULT 0,
  `nov_previsto` int(11) DEFAULT 0,
  `nov_confirmado` int(11) DEFAULT 0,
  `dic_previsto` int(11) DEFAULT 0,
  `dic_confirmado` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `plan_camiones`
--

INSERT INTO `plan_camiones` (`id`, `año`, `proveedor_id`, `total_pactados`, `total_descontar`, `ene_previsto`, `ene_confirmado`, `feb_previsto`, `feb_confirmado`, `mar_previsto`, `mar_confirmado`, `abr_previsto`, `abr_confirmado`, `may_previsto`, `may_confirmado`, `jun_previsto`, `jun_confirmado`, `jul_previsto`, `jul_confirmado`, `ago_previsto`, `ago_confirmado`, `sep_previsto`, `sep_confirmado`, `oct_previsto`, `oct_confirmado`, `nov_previsto`, `nov_confirmado`, `dic_previsto`, `dic_confirmado`) VALUES
(1, '2025', 1, 10, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(2, '2025', 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(3, '2025', 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(4, '2025', 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(5, '2025', 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(6, '2025', 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(7, '2025', 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(8, '2025', 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(9, '2025', 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(10, '2025', 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(11, '2025', 11, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(12, '2026', 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(13, '2026', 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(14, '2026', 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(15, '2026', 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(16, '2026', 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(17, '2026', 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(18, '2026', 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(19, '2026', 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(20, '2026', 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(21, '2026', 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(22, '2026', 11, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `plan_facturacion`
--

CREATE TABLE `plan_facturacion` (
  `id` int(11) NOT NULL,
  `año` year(4) NOT NULL,
  `enero` decimal(15,2) DEFAULT 0.00,
  `febrero` decimal(15,2) DEFAULT 0.00,
  `marzo` decimal(15,2) DEFAULT 0.00,
  `abril` decimal(15,2) DEFAULT 0.00,
  `mayo` decimal(15,2) DEFAULT 0.00,
  `junio` decimal(15,2) DEFAULT 0.00,
  `julio` decimal(15,2) DEFAULT 0.00,
  `agosto` decimal(15,2) DEFAULT 0.00,
  `septiembre` decimal(15,2) DEFAULT 0.00,
  `octubre` decimal(15,2) DEFAULT 0.00,
  `noviembre` decimal(15,2) DEFAULT 0.00,
  `diciembre` decimal(15,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `plan_facturacion`
--

INSERT INTO `plan_facturacion` (`id`, `año`, `enero`, `febrero`, `marzo`, `abril`, `mayo`, `junio`, `julio`, `agosto`, `septiembre`, `octubre`, `noviembre`, `diciembre`) VALUES
(1, '2025', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `plan_material`
--

CREATE TABLE `plan_material` (
  `id` int(11) NOT NULL,
  `año` year(4) NOT NULL,
  `tipo_material` enum('FLEJE','REMACHES','PUNTAFITAS') NOT NULL,
  `total_pactados` int(11) DEFAULT 0,
  `total_descontar` int(11) DEFAULT 0,
  `enero` decimal(10,2) DEFAULT 0.00,
  `febrero` decimal(10,2) DEFAULT 0.00,
  `marzo` decimal(10,2) DEFAULT 0.00,
  `abril` decimal(10,2) DEFAULT 0.00,
  `mayo` decimal(10,2) DEFAULT 0.00,
  `junio` decimal(10,2) DEFAULT 0.00,
  `julio` decimal(10,2) DEFAULT 0.00,
  `agosto` decimal(10,2) DEFAULT 0.00,
  `septiembre` decimal(10,2) DEFAULT 0.00,
  `octubre` decimal(10,2) DEFAULT 0.00,
  `noviembre` decimal(10,2) DEFAULT 0.00,
  `diciembre` decimal(10,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `plan_material`
--

INSERT INTO `plan_material` (`id`, `año`, `tipo_material`, `total_pactados`, `total_descontar`, `enero`, `febrero`, `marzo`, `abril`, `mayo`, `junio`, `julio`, `agosto`, `septiembre`, `octubre`, `noviembre`, `diciembre`) VALUES
(1, '2025', 'FLEJE', 0, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(2, '2025', 'REMACHES', 0, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(3, '2025', 'PUNTAFITAS', 0, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `proveedores`
--

CREATE TABLE `proveedores` (
  `id` int(11) NOT NULL,
  `nombre` varchar(128) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `proveedores`
--

INSERT INTO `proveedores` (`id`, `nombre`) VALUES
(6, 'ASERRADERO DEL MOLINO'),
(7, 'MADERAS SABUGO'),
(8, 'MADERAS SABUGO CASTAÑO'),
(1, 'MADERBAR'),
(2, 'MADERBAR CASTAÑO'),
(5, 'MAITZER AMERICANA'),
(3, 'MAITZER ESLOVAQUIA'),
(4, 'MAITZER RUMANIA'),
(10, 'QUERCUS IMPORT BULGARIA'),
(9, 'QUERCUS PIRENAICA'),
(11, 'SINDO');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ubicaciones`
--

CREATE TABLE `ubicaciones` (
  `id` int(11) NOT NULL,
  `descripcion` varchar(60) NOT NULL,
  `instalacion_id` int(11) NOT NULL,
  `orden` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `ubicaciones`
--

INSERT INTO `ubicaciones` (`id`, `descripcion`, `instalacion_id`, `orden`) VALUES
(1, 'A11', 1, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `username` varchar(64) NOT NULL,
  `fullname` varchar(128) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` varchar(32) DEFAULT 'viewer',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `created_by` varchar(100) NOT NULL DEFAULT 'system',
  `updated_by` varchar(100) NOT NULL DEFAULT 'system',
  `deleted_by` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `username`, `fullname`, `password_hash`, `role`, `created_at`, `updated_at`, `deleted_at`, `is_deleted`, `created_by`, `updated_by`, `deleted_by`) VALUES
(1, 'admin', 'Admin', '$2y$10$lyhm35pbQHiZEDpSHlwCQOkBUy8RQwv/2Mn7KSQodnU7cSMJ6QxMS', 'admin', '2025-10-25 13:43:49', '2025-10-25 23:36:52', '2025-10-25 23:36:52', 0, 'system', 'system', NULL),
(2, 'rafa', 'Rafael', '$2b$10$nVJMSjwq0c8lKcIqj15LG.K0o7D3Cu/Ttc3JCiCocXIfcXr1koW2W', 'admin', '2025-10-25 13:43:49', '2025-11-04 02:11:59', NULL, 0, 'system', 'system', NULL),
(3, 'pepe', 'Pepe Sanchez', '$2b$12$e5Hd/HX6dIUk9GqUdWGB0eb3.8YCE2hBjInKdFYWVzv412aoJmE52', 'viewer', '2025-10-25 13:43:49', '2025-10-25 13:43:49', NULL, 0, 'system', 'system', NULL),
(4, '', '', '', '', '2025-10-27 00:50:04', '2025-10-27 00:51:03', '2025-10-27 00:51:03', 0, 'system', 'system', NULL);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `clientes`
--
ALTER TABLE `clientes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`nombre`);

--
-- Indices de la tabla `estados`
--
ALTER TABLE `estados`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `descripcion` (`descripcion`);

--
-- Indices de la tabla `instalaciones`
--
ALTER TABLE `instalaciones`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `plan_camiones`
--
ALTER TABLE `plan_camiones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_plan_camiones_proveedores` (`proveedor_id`);

--
-- Indices de la tabla `plan_facturacion`
--
ALTER TABLE `plan_facturacion`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `plan_material`
--
ALTER TABLE `plan_material`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `año` (`año`,`tipo_material`);

--
-- Indices de la tabla `proveedores`
--
ALTER TABLE `proveedores`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`nombre`);

--
-- Indices de la tabla `ubicaciones`
--
ALTER TABLE `ubicaciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_ubicaciones_instalaciones` (`instalacion_id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `idx_mi_tabla_is_deleted` (`is_deleted`),
  ADD KEY `idx_mi_tabla_deleted_at` (`deleted_at`),
  ADD KEY `idx_usuarios_is_deleted` (`is_deleted`),
  ADD KEY `idx_usuarios_deleted_at` (`deleted_at`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `clientes`
--
ALTER TABLE `clientes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT de la tabla `estados`
--
ALTER TABLE `estados`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `instalaciones`
--
ALTER TABLE `instalaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `plan_camiones`
--
ALTER TABLE `plan_camiones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT de la tabla `plan_facturacion`
--
ALTER TABLE `plan_facturacion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `plan_material`
--
ALTER TABLE `plan_material`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `proveedores`
--
ALTER TABLE `proveedores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `ubicaciones`
--
ALTER TABLE `ubicaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `plan_camiones`
--
ALTER TABLE `plan_camiones`
  ADD CONSTRAINT `fk_plan_camiones_proveedores` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores` (`id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `ubicaciones`
--
ALTER TABLE `ubicaciones`
  ADD CONSTRAINT `fk_ubicaciones_instalaciones` FOREIGN KEY (`instalacion_id`) REFERENCES `instalaciones` (`id`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
