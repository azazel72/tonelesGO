-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 23-02-2026 a las 07:16:49
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
-- Estructura de tabla para la tabla `ambientes`
--

CREATE TABLE `ambientes` (
  `id` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `toma` int(11) NOT NULL,
  `temperatura` decimal(6,2) NOT NULL,
  `humedad` decimal(6,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `ambientes`
--

INSERT INTO `ambientes` (`id`, `fecha`, `toma`, `temperatura`, `humedad`) VALUES
(1, '2026-02-21', 1, 35.20, 75.50);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `archivos_subidos`
--

CREATE TABLE `archivos_subidos` (
  `id` int(11) NOT NULL,
  `titulo` varchar(150) NOT NULL,
  `nombre_original` varchar(255) NOT NULL,
  `nombre_archivo` varchar(255) NOT NULL,
  `extension` varchar(10) NOT NULL,
  `entidad` varchar(80) NOT NULL,
  `entidad_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `created_by` varchar(100) NOT NULL DEFAULT 'system',
  `updated_by` varchar(100) NOT NULL DEFAULT 'system',
  `deleted_by` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `archivos_subidos`
--

INSERT INTO `archivos_subidos` (`id`, `titulo`, `nombre_original`, `nombre_archivo`, `extension`, `entidad`, `entidad_id`, `created_at`, `updated_at`, `deleted_at`, `is_deleted`, `created_by`, `updated_by`, `deleted_by`) VALUES
(1, 'Factura', '8043045TG3674S0001TI (1).pdf', '8043045TG3674S0001TI__1__20251229_075742.pdf', 'pdf', 'entradas', 123, '2025-12-29 06:57:42', '2025-12-29 06:57:42', NULL, 0, 'system', 'system', NULL),
(2, 'Albaranes', '8043045TG3674S0001TI.pdf', '8043045TG3674S0001TI_20251229_075801.pdf', 'pdf', 'entradas', 123, '2025-12-29 06:58:01', '2025-12-29 06:58:01', NULL, 0, 'system', 'system', NULL),
(3, 'Albaranes', 'BOLETIN RAFAEL SANCHEZ NAVARRO.pdf', 'BOLETIN_RAFAEL_SANCHEZ_NAVARRO_20251229_075801.pdf', 'pdf', 'entradas', 123, '2025-12-29 06:58:01', '2025-12-29 06:58:01', NULL, 0, 'system', 'system', NULL),
(4, 'Entrada 11225', '8043045TG3674S0001TI.pdf', '8043045TG3674S0001TI_20251230_045948.pdf', 'pdf', 'entradas', 1, '2025-12-30 03:59:48', '2025-12-30 03:59:48', NULL, 0, 'system', 'system', NULL),
(5, 'Entrada 11225', 'factura_TSKP021780.pdf', 'factura_TSKP021780_20251230_054451.pdf', 'pdf', 'entradas', 1, '2025-12-30 04:44:51', '2025-12-30 04:44:51', NULL, 0, 'system', 'system', NULL),
(6, 'Entrada 11225', 'IMG-20251123-WA0025.jpg', 'IMG-20251123-WA0025_20251231_131708.jpg', 'jpg', 'entradas', 1, '2025-12-31 12:17:08', '2025-12-31 12:17:08', NULL, 0, 'system', 'system', NULL),
(7, 'Numero de pedido de material', '25-L00001.pdf', '25-L00001_20251231_131812.pdf', 'pdf', 'entradas', 1, '2025-12-31 12:18:12', '2025-12-31 12:18:12', NULL, 0, 'system', 'system', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `botas`
--

CREATE TABLE `botas` (
  `id` int(11) NOT NULL,
  `codigo` varchar(60) NOT NULL,
  `tipo_producto_id` int(11) DEFAULT NULL,
  `material_id` int(11) DEFAULT NULL,
  `vaso_producto_id` int(11) NOT NULL,
  `fondo_producto_id` int(11) NOT NULL,
  `tapa_producto_id` int(11) NOT NULL,
  `fleje_1_id` int(11) DEFAULT NULL,
  `fleje_2_id` int(11) DEFAULT NULL,
  `fleje_3_id` int(11) DEFAULT NULL,
  `fleje_4_id` int(11) DEFAULT NULL,
  `fleje_5_id` int(11) DEFAULT NULL,
  `estado` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `created_by` varchar(100) NOT NULL DEFAULT 'system',
  `updated_by` varchar(100) NOT NULL DEFAULT 'system',
  `deleted_by` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `clientes`
--

CREATE TABLE `clientes` (
  `id` int(11) NOT NULL,
  `nombre` varchar(128) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cuadrantes`
--

CREATE TABLE `cuadrantes` (
  `id` int(11) NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `titulo` varchar(100) DEFAULT NULL,
  `observaciones` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `created_by` varchar(50) DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  `updated_by` varchar(50) DEFAULT NULL,
  `deleted` tinyint(1) NOT NULL DEFAULT 0,
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `cuadrantes`
--

INSERT INTO `cuadrantes` (`id`, `fecha_inicio`, `fecha_fin`, `titulo`, `observaciones`, `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted`, `deleted_at`, `deleted_by`) VALUES
(2, '2025-11-20', '2025-11-27', '', '', '2025-11-24 01:48:47', NULL, NULL, NULL, 0, NULL, NULL),
(3, '2031-01-09', '2031-01-15', '', '', '2025-12-07 00:37:57', NULL, NULL, NULL, 0, NULL, NULL),
(4, '2025-12-04', '2025-12-10', '', '', '2025-12-07 22:33:47', NULL, NULL, NULL, 0, NULL, NULL),
(5, '2025-12-11', '2025-12-17', '', '', '2025-12-07 22:42:34', NULL, NULL, NULL, 0, NULL, NULL),
(6, '2025-12-18', '2025-12-24', '', '', '2025-12-07 23:55:16', NULL, NULL, NULL, 0, NULL, NULL),
(7, '2025-12-25', '2025-12-31', '', '', '2025-12-08 01:13:51', NULL, NULL, NULL, 0, NULL, NULL),
(8, '2026-02-19', '2026-02-25', '', '', '2025-12-10 04:29:17', NULL, NULL, NULL, 0, NULL, NULL),
(9, '2026-01-15', '2026-01-21', '', '', '2026-01-16 00:49:10', NULL, NULL, NULL, 0, NULL, NULL),
(10, '2026-01-22', '2026-01-28', '', '', '2026-01-24 19:44:03', NULL, NULL, NULL, 0, NULL, NULL),
(11, '2026-01-29', '2026-02-04', '', '', '2026-01-31 01:08:30', NULL, NULL, NULL, 0, NULL, NULL),
(12, '2026-02-05', '2026-02-11', '', '', '2026-02-10 04:09:37', NULL, NULL, NULL, 0, NULL, NULL),
(13, '2026-02-12', '2026-02-18', '', '', '2026-02-15 23:17:33', NULL, NULL, NULL, 0, NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cuadrante_detalles`
--

CREATE TABLE `cuadrante_detalles` (
  `id` int(11) NOT NULL,
  `cuadrante_id` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `puesto_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `orden_en_puesto` tinyint(3) UNSIGNED NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `created_by` varchar(50) DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  `updated_by` varchar(50) DEFAULT NULL,
  `deleted` tinyint(1) NOT NULL DEFAULT 0,
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `cuadrante_detalles`
--

INSERT INTO `cuadrante_detalles` (`id`, `cuadrante_id`, `fecha`, `puesto_id`, `usuario_id`, `orden_en_puesto`, `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted`, `deleted_at`, `deleted_by`) VALUES
(1, 4, '2025-12-04', 3, 71, 1, '2025-12-10 04:39:37', NULL, NULL, NULL, 0, NULL, NULL),
(2, 4, '2025-12-04', 5, 57, 1, '2025-12-10 04:40:02', NULL, NULL, NULL, 0, NULL, NULL),
(3, 4, '2025-12-04', 2, 55, 1, '2025-12-10 04:42:03', NULL, NULL, NULL, 0, NULL, NULL),
(4, 4, '2025-12-04', 7, 75, 1, '2025-12-10 04:42:45', NULL, NULL, NULL, 0, NULL, NULL),
(5, 4, '2025-12-04', 8, 69, 1, '2025-12-10 04:42:47', NULL, NULL, NULL, 0, NULL, NULL),
(6, 4, '2025-12-08', 11, 59, 1, '2025-12-10 04:42:49', NULL, '2025-12-11 14:16:17', NULL, 0, NULL, NULL),
(7, 4, '2025-12-04', 3, 47, 1, '2025-12-10 04:55:32', NULL, NULL, NULL, 0, NULL, NULL),
(8, 4, '2025-12-08', 1, 53, 1, '2025-12-10 04:55:34', NULL, '2025-12-11 03:27:25', NULL, 0, NULL, NULL),
(9, 4, '2025-12-04', 4, 43, 1, '2025-12-10 04:55:37', NULL, NULL, NULL, 0, NULL, NULL),
(10, 4, '2025-12-04', 6, 44, 1, '2025-12-10 04:55:39', NULL, NULL, NULL, 0, NULL, NULL),
(11, 4, '2025-12-04', 7, 57, 1, '2025-12-10 04:55:40', NULL, NULL, NULL, 0, NULL, NULL),
(12, 4, '2025-12-05', 6, 49, 1, '2025-12-10 04:55:42', NULL, NULL, NULL, 0, NULL, NULL),
(13, 4, '2025-12-05', 4, 46, 1, '2025-12-10 04:55:44', NULL, NULL, NULL, 0, NULL, NULL),
(14, 4, '2025-12-05', 3, 65, 1, '2025-12-10 04:55:46', NULL, NULL, NULL, 0, NULL, NULL),
(15, 4, '2025-12-08', 3, 71, 1, '2025-12-10 04:55:47', NULL, NULL, NULL, 0, NULL, NULL),
(16, 4, '2025-12-10', 3, 71, 1, '2025-12-10 04:55:49', NULL, NULL, NULL, 0, NULL, NULL),
(17, 4, '2025-12-09', 3, 46, 1, '2025-12-10 04:55:51', NULL, NULL, NULL, 0, NULL, NULL),
(18, 4, '2025-12-09', 3, 57, 1, '2025-12-10 04:55:52', NULL, NULL, NULL, 0, NULL, NULL),
(19, 4, '2025-12-05', 2, 69, 1, '2025-12-10 04:55:54', NULL, '2025-12-11 03:29:04', NULL, 0, NULL, NULL),
(20, 4, '2025-12-05', 7, 59, 1, '2025-12-10 04:55:56', NULL, NULL, NULL, 0, NULL, NULL),
(21, 4, '2025-12-05', 7, 74, 1, '2025-12-10 04:55:58', NULL, NULL, NULL, 0, NULL, NULL),
(22, 4, '2025-12-08', 7, 58, 1, '2025-12-10 04:55:59', NULL, NULL, NULL, 0, NULL, NULL),
(23, 4, '2025-12-10', 7, 58, 1, '2025-12-10 04:56:01', NULL, NULL, NULL, 0, NULL, NULL),
(24, 4, '2025-12-09', 7, 58, 1, '2025-12-10 04:56:04', NULL, NULL, NULL, 0, NULL, NULL),
(25, 4, '2025-12-08', 7, 69, 1, '2025-12-10 04:56:05', NULL, NULL, NULL, 0, NULL, NULL),
(26, 4, '2025-12-09', 7, 69, 1, '2025-12-10 04:56:07', NULL, NULL, NULL, 0, NULL, NULL),
(27, 4, '2025-12-10', 7, 69, 1, '2025-12-10 04:56:08', NULL, NULL, NULL, 0, NULL, NULL),
(28, 4, '2025-12-05', 5, 60, 1, '2025-12-10 04:56:12', NULL, '2025-12-11 04:57:17', NULL, 0, NULL, NULL),
(29, 4, '2025-12-05', 8, 42, 1, '2025-12-10 04:56:19', NULL, NULL, NULL, 0, NULL, NULL),
(30, 4, '2025-12-08', 8, 45, 1, '2025-12-10 04:56:20', NULL, NULL, NULL, 0, NULL, NULL),
(31, 4, '2025-12-08', 9, 56, 1, '2025-12-10 04:56:22', NULL, '2025-12-11 03:31:16', NULL, 0, NULL, NULL),
(32, 4, '2025-12-09', 5, 62, 1, '2025-12-10 04:56:24', NULL, '2025-12-11 04:57:30', NULL, 0, NULL, NULL),
(33, 4, '2025-12-04', 11, 51, 1, '2025-12-10 04:58:01', NULL, NULL, NULL, 0, NULL, NULL),
(34, 4, '2025-12-08', 6, 46, 1, '2025-12-10 05:07:23', NULL, '2025-12-11 14:16:15', NULL, 0, NULL, NULL),
(35, 4, '2025-12-05', 14, 66, 1, '2025-12-10 05:07:40', NULL, '2025-12-11 14:16:51', NULL, 0, NULL, NULL),
(36, 4, '2025-12-05', 1, 47, 1, '2025-12-10 09:44:43', NULL, '2025-12-11 14:16:09', NULL, 0, NULL, NULL),
(37, 4, '2025-12-04', 1, 67, 1, '2025-12-11 00:30:59', NULL, NULL, NULL, 0, NULL, NULL),
(38, 5, '2025-12-17', 3, 48, 1, '2025-12-11 00:31:40', NULL, '2025-12-11 05:01:18', NULL, 0, NULL, NULL),
(39, 4, '2025-12-04', 15, 74, 1, '2025-12-11 01:24:52', NULL, '2025-12-11 14:16:53', NULL, 0, NULL, NULL),
(40, 4, '2025-12-10', 3, 65, 1, '2025-12-11 02:29:59', NULL, '2025-12-11 14:16:12', NULL, 0, NULL, NULL),
(42, 5, '2025-12-11', 6, 54, 1, '2025-12-11 05:07:55', NULL, NULL, NULL, 0, NULL, NULL),
(43, 5, '2025-12-11', 10, 42, 1, '2025-12-11 05:08:01', NULL, NULL, NULL, 0, NULL, NULL),
(44, 5, '2025-12-16', 11, 66, 1, '2025-12-11 05:08:06', NULL, NULL, NULL, 0, NULL, NULL),
(45, 5, '2025-12-11', 2, 55, 1, '2025-12-11 05:08:31', NULL, NULL, NULL, 0, NULL, NULL),
(46, 5, '2025-12-12', 2, 71, 1, '2025-12-11 05:08:49', NULL, '2025-12-11 05:14:54', NULL, 0, NULL, NULL),
(48, 5, '2025-12-11', 14, 42, 1, '2025-12-11 05:10:23', NULL, NULL, NULL, 0, NULL, NULL),
(50, 5, '2025-12-11', 4, 76, 1, '2025-12-11 05:13:58', NULL, NULL, NULL, 0, NULL, NULL),
(52, 5, '2025-12-12', 7, 46, 1, '2025-12-11 05:14:03', NULL, '2025-12-11 05:20:45', NULL, 0, NULL, NULL),
(53, 5, '2025-12-11', 8, 70, 1, '2025-12-11 05:14:05', NULL, NULL, NULL, 0, NULL, NULL),
(54, 5, '2025-12-11', 9, 57, 1, '2025-12-11 05:14:08', NULL, NULL, NULL, 0, NULL, NULL),
(55, 5, '2025-12-15', 9, 57, 1, '2025-12-11 05:14:10', NULL, '2025-12-11 09:29:23', NULL, 0, NULL, NULL),
(56, 5, '2025-12-11', 1, 71, 1, '2025-12-11 05:14:15', NULL, '2025-12-11 09:29:33', NULL, 0, NULL, NULL),
(58, 5, '2025-12-15', 1, 55, 1, '2025-12-11 05:14:20', NULL, '2025-12-11 05:14:52', NULL, 0, NULL, NULL),
(61, 5, '2025-12-11', 3, 75, 1, '2025-12-11 05:14:35', NULL, NULL, NULL, 0, NULL, NULL),
(62, 5, '2025-12-12', 3, 49, 1, '2025-12-11 05:14:37', NULL, NULL, NULL, 0, NULL, NULL),
(65, 5, '2025-12-11', 12, 51, 1, '2025-12-11 05:15:10', NULL, NULL, NULL, 0, NULL, NULL),
(66, 5, '2025-12-11', 13, 49, 1, '2025-12-11 05:15:13', NULL, NULL, NULL, 0, NULL, NULL),
(67, 5, '2025-12-11', 15, 66, 1, '2025-12-11 05:15:16', NULL, NULL, NULL, 0, NULL, NULL),
(68, 5, '2025-12-12', 11, 42, 1, '2025-12-11 05:25:06', NULL, NULL, NULL, 0, NULL, NULL),
(69, 5, '2025-12-12', 5, 57, 1, '2025-12-11 05:25:51', NULL, NULL, NULL, 0, NULL, NULL),
(70, 5, '2025-12-15', 5, 58, 1, '2025-12-11 05:25:53', NULL, NULL, NULL, 0, NULL, NULL),
(71, 5, '2025-12-15', 6, 60, 1, '2025-12-11 05:25:55', NULL, NULL, NULL, 0, NULL, NULL),
(73, 5, '2025-12-12', 13, 71, 1, '2025-12-11 05:30:23', NULL, NULL, NULL, 0, NULL, NULL),
(74, 5, '2025-12-12', 9, 54, 1, '2025-12-11 05:30:25', NULL, NULL, NULL, 0, NULL, NULL),
(75, 5, '2025-12-12', 10, 62, 1, '2025-12-11 05:30:27', NULL, NULL, NULL, 0, NULL, NULL),
(77, 5, '2025-12-11', 5, 43, 1, '2025-12-11 05:32:26', NULL, NULL, NULL, 0, NULL, NULL),
(78, 5, '2025-12-12', 12, 62, 1, '2025-12-11 05:33:26', NULL, NULL, NULL, 0, NULL, NULL),
(81, 5, '2025-12-16', 8, 57, 1, '2025-12-11 09:29:26', NULL, NULL, NULL, 0, NULL, NULL),
(82, 5, '2025-12-17', 9, 57, 1, '2025-12-11 09:29:27', NULL, NULL, NULL, 0, NULL, NULL),
(83, 5, '2025-12-15', 2, 71, 1, '2025-12-11 09:29:36', NULL, NULL, NULL, 0, NULL, NULL),
(84, 5, '2025-12-16', 1, 71, 1, '2025-12-11 09:29:38', NULL, NULL, NULL, 0, NULL, NULL),
(85, 5, '2025-12-17', 2, 71, 1, '2025-12-11 09:29:40', NULL, NULL, NULL, 0, NULL, NULL),
(86, 4, '2025-12-08', 13, 43, 1, '2025-12-11 09:31:05', NULL, '2025-12-11 14:16:19', NULL, 0, NULL, NULL),
(87, 4, '2025-12-05', 16, 54, 1, '2025-12-11 14:16:56', NULL, NULL, NULL, 0, NULL, NULL),
(88, 5, '2025-12-11', 1, 47, 1, '2025-12-12 00:57:00', NULL, NULL, NULL, 0, NULL, NULL),
(89, 5, '2025-12-12', 1, 64, 1, '2025-12-12 00:57:08', NULL, '2025-12-12 01:07:02', NULL, 0, NULL, NULL),
(90, 7, '2025-12-25', 1, 48, 1, '2025-12-29 03:48:31', NULL, NULL, NULL, 0, NULL, NULL),
(91, 7, '2025-12-25', 2, 53, 1, '2025-12-29 03:48:33', NULL, NULL, NULL, 0, NULL, NULL),
(92, 7, '2025-12-25', 2, 55, 1, '2025-12-29 03:48:34', NULL, NULL, NULL, 0, NULL, NULL),
(93, 7, '2025-12-26', 3, 65, 1, '2025-12-29 03:48:37', NULL, NULL, NULL, 0, NULL, NULL),
(94, 12, '2026-02-05', 1, 43, 1, '2026-02-10 04:11:06', NULL, NULL, NULL, 0, NULL, NULL),
(95, 12, '2026-02-05', 2, 55, 1, '2026-02-10 04:11:07', NULL, NULL, NULL, 0, NULL, NULL),
(96, 12, '2026-02-05', 4, 71, 1, '2026-02-10 04:11:09', NULL, '2026-02-10 05:14:56', NULL, 0, NULL, NULL),
(97, 12, '2026-02-05', 3, 72, 1, '2026-02-10 05:14:55', NULL, NULL, NULL, 0, NULL, NULL),
(98, 12, '2026-02-05', 5, 76, 1, '2026-02-10 05:14:57', NULL, NULL, NULL, 0, NULL, NULL),
(99, 12, '2026-02-05', 6, 54, 1, '2026-02-10 05:14:58', NULL, NULL, NULL, 0, NULL, NULL),
(100, 12, '2026-02-05', 7, 58, 1, '2026-02-10 05:14:59', NULL, NULL, NULL, 0, NULL, NULL),
(101, 12, '2026-02-05', 8, 60, 1, '2026-02-10 05:15:02', NULL, NULL, NULL, 0, NULL, NULL),
(102, 12, '2026-02-05', 9, 45, 1, '2026-02-10 05:15:04', NULL, NULL, NULL, 0, NULL, NULL),
(103, 12, '2026-02-05', 16, 66, 1, '2026-02-10 05:15:07', NULL, NULL, NULL, 0, NULL, NULL),
(104, 12, '2026-02-06', 9, 52, 1, '2026-02-10 05:15:09', NULL, NULL, NULL, 0, NULL, NULL),
(105, 12, '2026-02-09', 9, 73, 1, '2026-02-10 05:15:10', NULL, NULL, NULL, 0, NULL, NULL),
(106, 12, '2026-02-10', 9, 59, 1, '2026-02-10 05:15:12', NULL, NULL, NULL, 0, NULL, NULL),
(107, 12, '2026-02-11', 9, 73, 1, '2026-02-10 05:15:14', NULL, NULL, NULL, 0, NULL, NULL),
(108, 12, '2026-02-06', 16, 73, 1, '2026-02-10 05:15:19', NULL, NULL, NULL, 0, NULL, NULL),
(109, 12, '2026-02-09', 16, 59, 1, '2026-02-10 05:15:21', NULL, NULL, NULL, 0, NULL, NULL),
(110, 12, '2026-02-10', 16, 74, 1, '2026-02-10 05:15:24', NULL, NULL, NULL, 0, NULL, NULL),
(111, 12, '2026-02-11', 16, 69, 1, '2026-02-10 05:15:26', NULL, NULL, NULL, 0, NULL, NULL),
(112, 12, '2026-02-05', 5, 50, 1, '2026-02-10 05:42:47', NULL, NULL, NULL, 0, NULL, NULL),
(113, 12, '2026-02-05', 6, 50, 1, '2026-02-10 05:42:50', NULL, NULL, NULL, 0, NULL, NULL),
(114, 12, '2026-02-05', 9, 62, 1, '2026-02-10 05:42:55', NULL, NULL, NULL, 0, NULL, NULL),
(116, 12, '2026-02-05', 9, 47, 1, '2026-02-10 11:38:09', NULL, NULL, NULL, 0, NULL, NULL),
(178, 8, '2026-02-24', 8, 66, 1, '2026-02-21 01:19:37', NULL, NULL, NULL, 0, NULL, NULL),
(179, 8, '2026-02-24', 9, 42, 1, '2026-02-21 01:19:37', NULL, NULL, NULL, 0, NULL, NULL),
(218, 8, '2026-02-25', 8, 66, 1, '2026-02-21 01:20:01', NULL, NULL, NULL, 0, NULL, NULL),
(219, 8, '2026-02-25', 9, 42, 1, '2026-02-21 01:20:01', NULL, NULL, NULL, 0, NULL, NULL),
(220, 8, '2026-02-19', 8, 66, 1, '2026-02-21 01:20:04', NULL, NULL, NULL, 0, NULL, NULL),
(221, 8, '2026-02-19', 9, 42, 1, '2026-02-21 01:20:04', NULL, NULL, NULL, 0, NULL, NULL),
(222, 8, '2026-02-23', 8, 66, 1, '2026-02-21 01:24:17', NULL, NULL, NULL, 0, NULL, NULL),
(223, 8, '2026-02-23', 9, 42, 1, '2026-02-21 01:24:17', NULL, NULL, NULL, 0, NULL, NULL),
(225, 8, '2026-02-19', 2, 43, 1, '2026-02-23 05:44:00', NULL, NULL, NULL, 0, NULL, NULL),
(226, 8, '2026-02-19', 1, 65, 1, '2026-02-23 05:44:01', NULL, NULL, NULL, 0, NULL, NULL),
(227, 8, '2026-02-19', 3, 57, 1, '2026-02-23 05:44:03', NULL, NULL, NULL, 0, NULL, NULL),
(228, 8, '2026-02-19', 4, 62, 1, '2026-02-23 05:44:05', NULL, NULL, NULL, 0, NULL, NULL),
(229, 8, '2026-02-19', 5, 52, 1, '2026-02-23 05:44:07', NULL, NULL, NULL, 0, NULL, NULL),
(230, 8, '2026-02-19', 6, 74, 1, '2026-02-23 05:44:09', NULL, NULL, NULL, 0, NULL, NULL),
(231, 8, '2026-02-19', 7, 45, 1, '2026-02-23 05:44:10', NULL, NULL, NULL, 0, NULL, NULL),
(232, 8, '2026-02-19', 10, 59, 1, '2026-02-23 05:44:12', NULL, NULL, NULL, 0, NULL, NULL),
(233, 8, '2026-02-19', 11, 45, 1, '2026-02-23 05:44:13', NULL, NULL, NULL, 0, NULL, NULL),
(234, 8, '2026-02-19', 12, 62, 1, '2026-02-23 05:44:15', NULL, NULL, NULL, 0, NULL, NULL),
(235, 8, '2026-02-19', 13, 42, 1, '2026-02-23 05:44:17', NULL, NULL, NULL, 0, NULL, NULL),
(236, 8, '2026-02-19', 14, 59, 1, '2026-02-23 05:44:19', NULL, NULL, NULL, 0, NULL, NULL),
(237, 8, '2026-02-19', 16, 56, 1, '2026-02-23 05:44:21', NULL, NULL, NULL, 0, NULL, NULL),
(238, 8, '2026-02-19', 15, 73, 1, '2026-02-23 05:44:23', NULL, NULL, NULL, 0, NULL, NULL),
(239, 8, '2026-02-19', 17, 58, 1, '2026-02-23 05:44:26', NULL, NULL, NULL, 0, NULL, NULL),
(240, 8, '2026-02-19', 19, 58, 1, '2026-02-23 05:44:29', NULL, NULL, NULL, 0, NULL, NULL),
(241, 8, '2026-02-19', 18, 57, 1, '2026-02-23 05:44:32', NULL, NULL, NULL, 0, NULL, NULL),
(242, 13, '2026-02-12', 1, 65, 1, '2026-02-23 05:46:17', NULL, NULL, NULL, 0, NULL, NULL),
(243, 13, '2026-02-12', 2, 50, 1, '2026-02-23 05:46:19', NULL, NULL, NULL, 0, NULL, NULL),
(244, 13, '2026-02-12', 3, 57, 1, '2026-02-23 05:46:21', NULL, NULL, NULL, 0, NULL, NULL),
(245, 13, '2026-02-12', 4, 62, 1, '2026-02-23 05:46:23', NULL, NULL, NULL, 0, NULL, NULL),
(246, 13, '2026-02-12', 5, 74, 1, '2026-02-23 05:46:24', NULL, NULL, NULL, 0, NULL, NULL),
(247, 13, '2026-02-12', 6, 52, 1, '2026-02-23 05:46:26', NULL, NULL, NULL, 0, NULL, NULL),
(248, 13, '2026-02-12', 7, 45, 1, '2026-02-23 05:46:27', NULL, NULL, NULL, 0, NULL, NULL),
(249, 13, '2026-02-12', 8, 42, 1, '2026-02-23 05:46:29', NULL, NULL, NULL, 0, NULL, NULL),
(250, 13, '2026-02-12', 9, 59, 1, '2026-02-23 05:46:31', NULL, NULL, NULL, 0, NULL, NULL),
(251, 13, '2026-02-12', 10, 54, 1, '2026-02-23 05:46:32', NULL, NULL, NULL, 0, NULL, NULL),
(252, 13, '2026-02-12', 11, 51, 1, '2026-02-23 05:46:34', NULL, NULL, NULL, 0, NULL, NULL),
(253, 13, '2026-02-12', 12, 67, 1, '2026-02-23 05:46:37', NULL, NULL, NULL, 0, NULL, NULL),
(254, 13, '2026-02-12', 13, 55, 1, '2026-02-23 05:46:39', NULL, NULL, NULL, 0, NULL, NULL),
(255, 13, '2026-02-12', 14, 64, 1, '2026-02-23 05:46:41', NULL, NULL, NULL, 0, NULL, NULL),
(256, 13, '2026-02-12', 15, 72, 1, '2026-02-23 05:46:43', NULL, NULL, NULL, 0, NULL, NULL),
(257, 13, '2026-02-12', 16, 66, 1, '2026-02-23 05:46:45', NULL, NULL, NULL, 0, NULL, NULL),
(258, 13, '2026-02-12', 17, 60, 1, '2026-02-23 05:46:47', NULL, NULL, NULL, 0, NULL, NULL),
(259, 13, '2026-02-12', 18, 49, 1, '2026-02-23 05:46:49', NULL, NULL, NULL, 0, NULL, NULL),
(260, 13, '2026-02-12', 19, 70, 1, '2026-02-23 05:46:52', NULL, NULL, NULL, 0, NULL, NULL),
(261, 13, '2026-02-18', 1, 65, 1, '2026-02-23 05:46:58', NULL, NULL, NULL, 0, NULL, NULL),
(262, 13, '2026-02-18', 2, 50, 1, '2026-02-23 05:46:58', NULL, NULL, NULL, 0, NULL, NULL),
(263, 13, '2026-02-18', 3, 57, 1, '2026-02-23 05:46:58', NULL, NULL, NULL, 0, NULL, NULL),
(264, 13, '2026-02-18', 4, 62, 1, '2026-02-23 05:46:58', NULL, NULL, NULL, 0, NULL, NULL),
(265, 13, '2026-02-18', 5, 74, 1, '2026-02-23 05:46:58', NULL, NULL, NULL, 0, NULL, NULL),
(266, 13, '2026-02-18', 6, 52, 1, '2026-02-23 05:46:58', NULL, NULL, NULL, 0, NULL, NULL),
(267, 13, '2026-02-18', 7, 45, 1, '2026-02-23 05:46:58', NULL, NULL, NULL, 0, NULL, NULL),
(268, 13, '2026-02-18', 8, 42, 1, '2026-02-23 05:46:58', NULL, NULL, NULL, 0, NULL, NULL),
(269, 13, '2026-02-18', 9, 59, 1, '2026-02-23 05:46:58', NULL, NULL, NULL, 0, NULL, NULL),
(270, 13, '2026-02-18', 10, 54, 1, '2026-02-23 05:46:58', NULL, NULL, NULL, 0, NULL, NULL),
(271, 13, '2026-02-18', 11, 51, 1, '2026-02-23 05:46:58', NULL, NULL, NULL, 0, NULL, NULL),
(272, 13, '2026-02-18', 12, 67, 1, '2026-02-23 05:46:58', NULL, NULL, NULL, 0, NULL, NULL),
(273, 13, '2026-02-18', 13, 55, 1, '2026-02-23 05:46:58', NULL, NULL, NULL, 0, NULL, NULL),
(274, 13, '2026-02-18', 14, 64, 1, '2026-02-23 05:46:58', NULL, NULL, NULL, 0, NULL, NULL),
(275, 13, '2026-02-18', 15, 72, 1, '2026-02-23 05:46:58', NULL, NULL, NULL, 0, NULL, NULL),
(276, 13, '2026-02-18', 16, 66, 1, '2026-02-23 05:46:58', NULL, NULL, NULL, 0, NULL, NULL),
(277, 13, '2026-02-18', 17, 60, 1, '2026-02-23 05:46:58', NULL, NULL, NULL, 0, NULL, NULL),
(278, 13, '2026-02-18', 18, 49, 1, '2026-02-23 05:46:58', NULL, NULL, NULL, 0, NULL, NULL),
(279, 13, '2026-02-18', 19, 70, 1, '2026-02-23 05:46:58', NULL, NULL, NULL, 0, NULL, NULL),
(280, 13, '2026-02-17', 3, 65, 1, '2026-02-23 05:47:02', NULL, '2026-02-23 05:47:04', NULL, 0, NULL, NULL),
(281, 13, '2026-02-17', 4, 50, 1, '2026-02-23 05:47:02', NULL, '2026-02-23 05:47:07', NULL, 0, NULL, NULL),
(282, 13, '2026-02-17', 1, 57, 1, '2026-02-23 05:47:02', NULL, '2026-02-23 05:47:05', NULL, 0, NULL, NULL),
(283, 13, '2026-02-17', 5, 62, 1, '2026-02-23 05:47:02', NULL, '2026-02-23 05:47:08', NULL, 0, NULL, NULL),
(284, 13, '2026-02-17', 2, 74, 1, '2026-02-23 05:47:02', NULL, '2026-02-23 05:47:10', NULL, 0, NULL, NULL),
(285, 13, '2026-02-17', 7, 52, 1, '2026-02-23 05:47:02', NULL, '2026-02-23 05:47:11', NULL, 0, NULL, NULL),
(286, 13, '2026-02-17', 8, 45, 1, '2026-02-23 05:47:02', NULL, '2026-02-23 05:47:12', NULL, 0, NULL, NULL),
(287, 13, '2026-02-17', 9, 42, 1, '2026-02-23 05:47:02', NULL, '2026-02-23 05:47:13', NULL, 0, NULL, NULL),
(288, 13, '2026-02-17', 10, 59, 1, '2026-02-23 05:47:02', NULL, '2026-02-23 05:47:14', NULL, 0, NULL, NULL),
(289, 13, '2026-02-17', 11, 54, 1, '2026-02-23 05:47:02', NULL, '2026-02-23 05:47:15', NULL, 0, NULL, NULL),
(290, 13, '2026-02-17', 12, 51, 1, '2026-02-23 05:47:02', NULL, '2026-02-23 05:47:16', NULL, 0, NULL, NULL),
(291, 13, '2026-02-17', 13, 67, 1, '2026-02-23 05:47:02', NULL, '2026-02-23 05:47:17', NULL, 0, NULL, NULL),
(292, 13, '2026-02-17', 14, 55, 1, '2026-02-23 05:47:02', NULL, '2026-02-23 05:47:18', NULL, 0, NULL, NULL),
(293, 13, '2026-02-17', 15, 64, 1, '2026-02-23 05:47:02', NULL, '2026-02-23 05:47:19', NULL, 0, NULL, NULL),
(294, 13, '2026-02-17', 16, 72, 1, '2026-02-23 05:47:02', NULL, '2026-02-23 05:47:20', NULL, 0, NULL, NULL),
(295, 13, '2026-02-17', 17, 66, 1, '2026-02-23 05:47:02', NULL, '2026-02-23 05:47:21', NULL, 0, NULL, NULL),
(296, 13, '2026-02-17', 18, 60, 1, '2026-02-23 05:47:02', NULL, '2026-02-23 05:47:22', NULL, 0, NULL, NULL),
(297, 13, '2026-02-17', 19, 49, 1, '2026-02-23 05:47:02', NULL, '2026-02-23 05:47:23', NULL, 0, NULL, NULL),
(298, 13, '2026-02-17', 6, 70, 1, '2026-02-23 05:47:02', NULL, '2026-02-23 05:47:25', NULL, 0, NULL, NULL),
(299, 8, '2026-02-20', 9, 66, 1, '2026-02-23 05:48:36', NULL, '2026-02-23 05:48:46', NULL, 0, NULL, NULL),
(300, 8, '2026-02-20', 10, 42, 1, '2026-02-23 05:48:36', NULL, '2026-02-23 05:48:47', NULL, 0, NULL, NULL),
(301, 8, '2026-02-20', 3, 43, 1, '2026-02-23 05:48:36', NULL, '2026-02-23 05:48:40', NULL, 0, NULL, NULL),
(302, 8, '2026-02-20', 2, 65, 1, '2026-02-23 05:48:36', NULL, '2026-02-23 05:48:38', NULL, 0, NULL, NULL),
(304, 8, '2026-02-20', 5, 62, 1, '2026-02-23 05:48:36', NULL, '2026-02-23 05:48:42', NULL, 0, NULL, NULL),
(305, 8, '2026-02-20', 6, 52, 1, '2026-02-23 05:48:36', NULL, '2026-02-23 05:48:43', NULL, 0, NULL, NULL),
(306, 8, '2026-02-20', 7, 74, 1, '2026-02-23 05:48:36', NULL, '2026-02-23 05:48:44', NULL, 0, NULL, NULL),
(307, 8, '2026-02-20', 8, 45, 1, '2026-02-23 05:48:36', NULL, '2026-02-23 05:48:45', NULL, 0, NULL, NULL),
(308, 8, '2026-02-20', 11, 59, 1, '2026-02-23 05:48:36', NULL, '2026-02-23 05:48:48', NULL, 0, NULL, NULL),
(309, 8, '2026-02-20', 12, 45, 1, '2026-02-23 05:48:36', NULL, '2026-02-23 05:48:49', NULL, 0, NULL, NULL),
(310, 8, '2026-02-20', 13, 62, 1, '2026-02-23 05:48:36', NULL, '2026-02-23 05:48:50', NULL, 0, NULL, NULL),
(311, 8, '2026-02-20', 14, 42, 1, '2026-02-23 05:48:36', NULL, '2026-02-23 05:48:51', NULL, 0, NULL, NULL),
(312, 8, '2026-02-20', 15, 59, 1, '2026-02-23 05:48:36', NULL, '2026-02-23 05:48:52', NULL, 0, NULL, NULL),
(313, 8, '2026-02-20', 17, 56, 1, '2026-02-23 05:48:36', NULL, '2026-02-23 05:48:54', NULL, 0, NULL, NULL),
(314, 8, '2026-02-20', 16, 73, 1, '2026-02-23 05:48:36', NULL, '2026-02-23 05:48:53', NULL, 0, NULL, NULL),
(315, 8, '2026-02-20', 18, 58, 1, '2026-02-23 05:48:36', NULL, '2026-02-23 05:48:55', NULL, 0, NULL, NULL),
(316, 8, '2026-02-20', 1, 58, 1, '2026-02-23 05:48:36', NULL, '2026-02-23 05:48:58', NULL, 0, NULL, NULL),
(318, 8, '2026-02-20', 4, 57, 1, '2026-02-23 05:52:43', NULL, '2026-02-23 05:52:47', NULL, 0, NULL, NULL),
(319, 8, '2026-02-20', 19, 57, 1, '2026-02-23 05:55:52', NULL, NULL, NULL, 0, NULL, NULL),
(320, 8, '2026-02-23', 17, 59, 1, '2026-02-23 05:56:03', NULL, '2026-02-23 06:59:20', NULL, 0, NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `duelas`
--

CREATE TABLE `duelas` (
  `id` int(11) NOT NULL,
  `descripcion` varchar(150) NOT NULL,
  `material_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `created_by` varchar(100) NOT NULL DEFAULT 'system',
  `updated_by` varchar(100) NOT NULL DEFAULT 'system',
  `deleted_by` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `duelas`
--

INSERT INTO `duelas` (`id`, `descripcion`, `material_id`, `created_at`, `updated_at`, `deleted_at`, `is_deleted`, `created_by`, `updated_by`, `deleted_by`) VALUES
(11, 'Hileras de Duelas de Castaño 1.30 X 0,035', 10, '2026-01-15 22:24:52', '2026-02-23 00:24:42', NULL, 0, 'system', 'system', NULL),
(12, 'Hileras de Duelas de Roble americano 1.30 X 0,035', 2, '2026-01-15 22:24:52', '2026-01-15 22:24:52', NULL, 0, 'system', 'system', NULL),
(13, 'Hileras de Duelas de Roble bulgaro 1.30 X 0,035', 5, '2026-01-15 22:24:52', '2026-02-23 00:23:19', NULL, 0, 'system', 'system', NULL),
(14, 'Hileras de Duelas de Roble europeo 1.30 X 0,035', 1, '2026-01-15 22:24:52', '2026-01-15 22:24:52', NULL, 0, 'system', 'system', NULL),
(15, 'Hileras de Duelas de Castaño 1.15 X 0,035', 10, '2026-01-15 22:24:52', '2026-02-23 00:24:42', NULL, 0, 'system', 'system', NULL),
(16, 'Hileras de Duelas de Roble americano 1.15 X 0,035', 2, '2026-01-15 22:24:52', '2026-01-15 22:24:52', NULL, 0, 'system', 'system', NULL),
(17, 'Hileras de Duelas de Roble bulgaro 1.15 X 0,035', 5, '2026-01-15 22:24:52', '2026-02-23 00:23:19', NULL, 0, 'system', 'system', NULL),
(18, 'Hileras de Duelas de Roble europeo 1.15 X 0,035', 1, '2026-01-15 22:24:52', '2026-01-15 22:24:52', NULL, 0, 'system', 'system', NULL),
(19, 'Hileras de Duelas de Castaño 1.00 X 0,035', 10, '2026-01-15 22:24:52', '2026-02-23 00:24:42', NULL, 0, 'system', 'system', NULL),
(20, 'Hileras de Duelas de Roble americano 1.00 X 0,035', 2, '2026-01-15 22:24:52', '2026-01-15 22:24:52', NULL, 0, 'system', 'system', NULL),
(21, 'Hileras de Duelas de Roble bulgaro 1.00 X 0,035', 5, '2026-01-15 22:24:52', '2026-02-23 00:23:19', NULL, 0, 'system', 'system', NULL),
(22, 'Hileras de Duelas de Roble europeo 1.00 X 0,035', 1, '2026-01-15 22:24:52', '2026-01-15 22:24:52', NULL, 0, 'system', 'system', NULL),
(23, 'Hileras de Duelas de Castaño 0.95 X 0,035', 10, '2026-01-15 22:24:52', '2026-02-23 00:24:42', NULL, 0, 'system', 'system', NULL),
(24, 'Hileras de Duelas de Roble americano 0.95 X 0,035', 2, '2026-01-15 22:24:52', '2026-01-15 22:24:52', NULL, 0, 'system', 'system', NULL),
(25, 'Hileras de Duelas de Roble bulgaro 0.95 X 0,035', 5, '2026-01-15 22:24:52', '2026-02-23 00:23:19', NULL, 0, 'system', 'system', NULL),
(26, 'Hileras de Duelas de Roble europeo 0.95 X 0,035', 1, '2026-01-15 22:24:52', '2026-01-15 22:24:52', NULL, 0, 'system', 'system', NULL),
(27, 'Hileras de Duelas de Castaño 0.85 X 0,035', 10, '2026-01-15 22:24:52', '2026-02-23 00:24:42', NULL, 0, 'system', 'system', NULL),
(28, 'Hileras de Duelas de Roble americano 0.85 X 0,035', 2, '2026-01-15 22:24:52', '2026-01-15 22:24:52', NULL, 0, 'system', 'system', NULL),
(29, 'Hileras de Duelas de Roble bulgaro 0.85 X 0,035', 5, '2026-01-15 22:24:52', '2026-02-23 00:23:19', NULL, 0, 'system', 'system', NULL),
(30, 'Hileras de Duelas de Roble europeo 0.85 X 0,035', 1, '2026-01-15 22:24:52', '2026-01-15 22:24:52', NULL, 0, 'system', 'system', NULL),
(31, 'Hileras de Duelas de Castaño 0,80 X 0,035', 10, '2026-01-15 22:24:52', '2026-02-23 00:24:42', NULL, 0, 'system', 'system', NULL),
(32, 'Hileras de Duelas de Roble americano 0,80 X 0,035', 2, '2026-01-15 22:24:52', '2026-01-15 22:24:52', NULL, 0, 'system', 'system', NULL),
(33, 'Hileras de Duelas de Roble bulgaro 0,80 X 0,035', 5, '2026-01-15 22:24:52', '2026-02-23 00:23:19', NULL, 0, 'system', 'system', NULL),
(34, 'Hileras de Duelas de Roble europeo 0,80 X 0,035', 1, '2026-01-15 22:24:52', '2026-01-15 22:24:52', NULL, 0, 'system', 'system', NULL),
(35, 'Hileras de Duelas de Castaño 0.70 X 0,035', 10, '2026-01-15 22:24:52', '2026-02-23 00:24:42', NULL, 0, 'system', 'system', NULL),
(36, 'Hileras de Duelas de Roble americano 0.70 X 0,035', 2, '2026-01-15 22:24:52', '2026-01-15 22:24:52', NULL, 0, 'system', 'system', NULL),
(37, 'Hileras de Duelas de Roble bulgaro 0.70 X 0,035', 5, '2026-01-15 22:24:52', '2026-02-23 00:23:19', NULL, 0, 'system', 'system', NULL),
(38, 'Hileras de Duelas de Roble europeo 0.70 X 0,035', 1, '2026-01-15 22:24:52', '2026-01-15 22:24:52', NULL, 0, 'system', 'system', NULL),
(39, 'Hileras de Duelas de Castaño 0.60 X 0,035', 10, '2026-01-15 22:24:52', '2026-02-23 00:24:42', NULL, 0, 'system', 'system', NULL),
(40, 'Hileras de Duelas de Roble americano 0.60 X 0,035', 2, '2026-01-15 22:24:52', '2026-01-15 22:24:52', NULL, 0, 'system', 'system', NULL),
(41, 'Hileras de Duelas de Roble bulgaro 0.60 X 0,035', 5, '2026-01-15 22:24:52', '2026-02-23 00:23:19', NULL, 0, 'system', 'system', NULL),
(42, 'Hileras de Duelas de Roble europeo 0.60 X 0,035', 1, '2026-01-15 22:24:52', '2026-01-15 22:24:52', NULL, 0, 'system', 'system', NULL),
(43, 'Hileras de Duelas de Castaño 0.50 X 0,035', 10, '2026-01-15 22:24:52', '2026-02-23 00:24:42', NULL, 0, 'system', 'system', NULL),
(44, 'Hileras de Duelas de Roble americano 0.50 X 0,035', 2, '2026-01-15 22:24:52', '2026-01-15 22:24:52', NULL, 0, 'system', 'system', NULL),
(45, 'Hileras de Duelas de Roble bulgaro 0.50 X 0,035', 5, '2026-01-15 22:24:52', '2026-02-23 00:23:19', NULL, 0, 'system', 'system', NULL),
(46, 'Hileras de Duelas de Roble europeo 0.50 X 0,035', 1, '2026-01-15 22:24:52', '2026-01-15 22:24:52', NULL, 0, 'system', 'system', NULL),
(47, 'Hileras de Duelas de Castaño 0.45 X 0,035', 10, '2026-01-15 22:24:52', '2026-02-23 00:24:42', NULL, 0, 'system', 'system', NULL),
(48, 'Hileras de Duelas de Roble americano 0.45 X 0,035', 2, '2026-01-15 22:24:52', '2026-01-15 22:24:52', NULL, 0, 'system', 'system', NULL),
(49, 'Hileras de Duelas de Roble bulgaro 0.45 X 0,035', 5, '2026-01-15 22:24:52', '2026-02-23 00:23:19', NULL, 0, 'system', 'system', NULL),
(50, 'Hileras de Duelas de Roble europeo 0.45 X 0,035', 1, '2026-01-15 22:24:52', '2026-01-15 22:24:52', NULL, 0, 'system', 'system', NULL),
(51, 'Hileras de Duelas de RCPalillos 0.50 X 0,035', 9, '2026-02-23 00:18:20', '2026-02-23 00:18:20', NULL, 0, 'system', 'system', NULL),
(52, 'Hileras de Duelas de RP 0.50 X 0,035', 11, '2026-02-23 00:18:20', '2026-02-23 00:29:17', NULL, 0, 'system', 'system', NULL),
(53, 'Hileras de Duelas de RCPalillos 0.60 X 0,035', 9, '2026-02-23 00:18:20', '2026-02-23 00:18:20', NULL, 0, 'system', 'system', NULL),
(54, 'Hileras de Duelas de RP 0.60 X 0,035', 11, '2026-02-23 00:18:20', '2026-02-23 00:29:17', NULL, 0, 'system', 'system', NULL),
(55, 'Hileras de Duelas de RCPalillos 0.70 X 0,035', 9, '2026-02-23 00:18:20', '2026-02-23 00:18:20', NULL, 0, 'system', 'system', NULL),
(56, 'Hileras de Duelas de RP 0.70 X 0,035', 11, '2026-02-23 00:18:20', '2026-02-23 00:29:17', NULL, 0, 'system', 'system', NULL),
(57, 'Hileras de Duelas de RCPalillos 0.80 X 0,035', 9, '2026-02-23 00:18:20', '2026-02-23 00:18:20', NULL, 0, 'system', 'system', NULL),
(58, 'Hileras de Duelas de RCPalillos 0.85 X 0,035', 9, '2026-02-23 00:18:20', '2026-02-23 00:18:20', NULL, 0, 'system', 'system', NULL),
(59, 'Hileras de Duelas de RP 0.85 X 0,035', 11, '2026-02-23 00:18:20', '2026-02-23 00:29:17', NULL, 0, 'system', 'system', NULL),
(60, 'Hileras de Duelas de RP 0.95 X 0,035', 11, '2026-02-23 00:18:20', '2026-02-23 00:29:17', NULL, 0, 'system', 'system', NULL),
(61, 'Hileras de Duelas de RCPalillos 1.00 X 0,035', 9, '2026-02-23 00:18:20', '2026-02-23 00:18:20', NULL, 0, 'system', 'system', NULL),
(62, 'Hileras de Duelas de RP 1.00 X 0,035', 11, '2026-02-23 00:18:20', '2026-02-23 00:29:17', NULL, 0, 'system', 'system', NULL),
(63, 'Hileras de Duelas de RCPalillos 1.15 X 0,035', 9, '2026-02-23 00:18:20', '2026-02-23 00:18:20', NULL, 0, 'system', 'system', NULL),
(64, 'Hileras de Duelas de RP 1.15 X 0,035', 11, '2026-02-23 00:18:20', '2026-02-23 00:29:17', NULL, 0, 'system', 'system', NULL),
(65, 'Hileras de Duelas de RCPalillos 1.30 X 0,035', 9, '2026-02-23 00:18:20', '2026-02-23 00:18:20', NULL, 0, 'system', 'system', NULL),
(66, 'Hileras de Duelas de RP 1.30 X 0,035', 11, '2026-02-23 00:18:20', '2026-02-23 00:29:17', NULL, 0, 'system', 'system', NULL),
(67, 'Hileras de Duelas de Roble bulgaro 1.30 X 0,035', 4, '2026-02-23 00:58:41', '2026-02-23 00:58:41', NULL, 0, 'system', 'system', NULL),
(68, 'Hileras de Duelas de RC 1.30 X 0,035', 8, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(69, 'Hileras de Duelas de Roble bulgaro 1.15 X 0,035', 4, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(70, 'Hileras de Duelas de RC 1.15 X 0,035', 8, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(71, 'Hileras de Duelas de Roble bulgaro 1.00 X 0,035', 4, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(72, 'Hileras de Duelas de RC 1.00 X 0,035', 8, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(73, 'Hileras de Duelas de Roble bulgaro 0.95 X 0,035', 4, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(74, 'Hileras de Duelas de RC 0.95 X 0,035', 8, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(75, 'Hileras de Duelas de Roble bulgaro 0.85 X 0,035', 4, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(76, 'Hileras de Duelas de RC 0.85 X 0,035', 8, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(77, 'Hileras de Duelas de Roble americano 0.80 X 0,035', 2, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(78, 'Hileras de Duelas de Roble bulgaro 0.80 X 0,035', 4, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(79, 'Hileras de Duelas de RC 0.80 X 0,035', 8, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(80, 'Hileras de Duelas de Roble bulgaro 0.70 X 0,035', 4, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(81, 'Hileras de Duelas de RC 0.70 X 0,035', 8, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(82, 'Hileras de Duelas de Roble bulgaro 0.60 X 0,035', 4, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(83, 'Hileras de Duelas de RC 0.60 X 0,035', 8, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(84, 'Hileras de Duelas de Roble bulgaro 0.50 X 0,035', 4, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(85, 'Hileras de Duelas de RC 0.50 X 0,035', 8, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `entradas`
--

CREATE TABLE `entradas` (
  `id` int(11) NOT NULL,
  `numero` varchar(50) NOT NULL,
  `proveedor_id` int(11) NOT NULL,
  `fecha` date DEFAULT NULL,
  `entregado` tinyint(1) NOT NULL DEFAULT 0,
  `anulado` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `created_by` varchar(100) NOT NULL DEFAULT 'system',
  `updated_by` varchar(100) NOT NULL DEFAULT 'system',
  `deleted_by` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `entradas`
--

INSERT INTO `entradas` (`id`, `numero`, `proveedor_id`, `fecha`, `entregado`, `anulado`, `created_at`, `updated_at`, `deleted_at`, `is_deleted`, `created_by`, `updated_by`, `deleted_by`) VALUES
(1, '11225', 1, '2025-12-30', 0, 0, '2025-12-30 02:33:46', '2025-12-31 01:00:35', NULL, 0, 'system', 'system', NULL),
(2, '1225', 1, '2025-12-30', 0, 0, '2025-12-30 02:50:57', '2025-12-31 01:00:30', NULL, 0, 'system', 'system', NULL),
(3, 'nuevo', 2, '2025-12-31', 0, 0, '2025-12-31 12:15:06', '2025-12-31 12:15:06', NULL, 0, 'system', 'system', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `entradas_flejes`
--

CREATE TABLE `entradas_flejes` (
  `id` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `tipo_producto_id` int(11) NOT NULL,
  `lote` varchar(120) NOT NULL,
  `peso` decimal(10,2) NOT NULL DEFAULT 0.00,
  `consumido` decimal(10,2) NOT NULL DEFAULT 0.00,
  `restante` decimal(10,2) NOT NULL DEFAULT 0.00,
  `estado` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `created_by` varchar(100) NOT NULL DEFAULT 'system',
  `updated_by` varchar(100) NOT NULL DEFAULT 'system',
  `deleted_by` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `entradas_flejes`
--

INSERT INTO `entradas_flejes` (`id`, `fecha`, `tipo_producto_id`, `lote`, `peso`, `consumido`, `restante`, `estado`, `created_at`, `updated_at`, `deleted_at`, `is_deleted`, `created_by`, `updated_by`, `deleted_by`) VALUES
(2, '2026-02-25', 11, '222', 30382.00, 0.00, 30382.00, 0, '2026-02-23 03:25:26', '2026-02-23 03:25:26', NULL, 0, 'system', 'system', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estados_botas`
--

CREATE TABLE `estados_botas` (
  `id` int(11) NOT NULL,
  `descripcion` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `estados_botas`
--

INSERT INTO `estados_botas` (`id`, `descripcion`) VALUES
(1, 'Proceso de produccion'),
(2, 'Zona de carga'),
(3, 'En camino'),
(4, 'Envinado'),
(5, 'Vuelta a reparación'),
(6, 'Destino definitivo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estados_lineas_fabricacion`
--

CREATE TABLE `estados_lineas_fabricacion` (
  `id` int(11) NOT NULL,
  `descripcion` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `estados_lineas_fabricacion`
--

INSERT INTO `estados_lineas_fabricacion` (`id`, `descripcion`) VALUES
(1, 'Proceso de produccion'),
(2, 'Zona de carga'),
(3, 'En camino'),
(4, 'Envinado'),
(5, 'Vuelta a reparación'),
(6, 'Destino definitivo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estados_ordenes_fabricacion`
--

CREATE TABLE `estados_ordenes_fabricacion` (
  `id` int(11) NOT NULL,
  `descripcion` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `estados_ordenes_fabricacion`
--

INSERT INTO `estados_ordenes_fabricacion` (`id`, `descripcion`) VALUES
(1, 'Proceso de produccion'),
(2, 'Zona de carga'),
(3, 'En camino'),
(4, 'Envinado'),
(5, 'Vuelta a reparación'),
(6, 'Destino definitivo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estados_palets`
--

CREATE TABLE `estados_palets` (
  `id` int(11) NOT NULL,
  `descripcion` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `estados_palets`
--

INSERT INTO `estados_palets` (`id`, `descripcion`) VALUES
(1, 'Activo'),
(2, 'Consumido'),
(3, 'Bloqueado');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estados_trazabilidad_fabricacion`
--

CREATE TABLE `estados_trazabilidad_fabricacion` (
  `id` int(11) NOT NULL,
  `descripcion` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `estados_trazabilidad_fabricacion`
--

INSERT INTO `estados_trazabilidad_fabricacion` (`id`, `descripcion`) VALUES
(1, 'Proceso de produccion'),
(2, 'Zona de carga'),
(3, 'En camino'),
(4, 'Envinado'),
(5, 'Vuelta a reparación'),
(6, 'Destino definitivo');

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
(1, 'Taller nuevo', 'M'),
(2, 'Taller viejo', 'M'),
(3, 'Sta Lucia', 'M'),
(4, 'Paez Morilla', 'M'),
(5, 'Procesados', 'M'),
(6, 'Predeterminado', 'M');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `lineas_entrada`
--

CREATE TABLE `lineas_entrada` (
  `id` int(11) NOT NULL,
  `entrada_id` int(11) NOT NULL,
  `duela_id` int(11) NOT NULL,
  `bultos` int(11) NOT NULL DEFAULT 0,
  `kilos` decimal(10,2) NOT NULL DEFAULT 0.00,
  `bultos_entregados` int(11) NOT NULL DEFAULT 0,
  `verificado` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `lineas_fabricacion`
--

CREATE TABLE `lineas_fabricacion` (
  `id` int(11) NOT NULL,
  `orden_id` int(11) NOT NULL,
  `tipo_producto_id` int(11) NOT NULL,
  `material_id` int(11) DEFAULT NULL,
  `cantidad` int(11) NOT NULL DEFAULT 0,
  `cantidad_fabricada` int(11) NOT NULL DEFAULT 0,
  `estado` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `created_by` varchar(100) NOT NULL DEFAULT 'system',
  `updated_by` varchar(100) NOT NULL DEFAULT 'system',
  `deleted_by` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `lineas_fabricacion`
--

INSERT INTO `lineas_fabricacion` (`id`, `orden_id`, `tipo_producto_id`, `material_id`, `cantidad`, `cantidad_fabricada`, `estado`, `created_at`, `updated_at`, `deleted_at`, `is_deleted`, `created_by`, `updated_by`, `deleted_by`) VALUES
(1, 1, 1, 6, 50, 51, 1, '2026-01-25 22:26:07', '2026-02-23 04:42:48', NULL, 0, 'system', 'system', NULL),
(2, 2, 1, 3, 20, 27, 1, '2026-02-01 00:20:29', '2026-02-21 01:55:11', NULL, 0, 'system', 'system', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `materiales`
--

CREATE TABLE `materiales` (
  `id` int(11) NOT NULL,
  `descripcion` varchar(150) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `created_by` varchar(100) NOT NULL DEFAULT 'system',
  `updated_by` varchar(100) NOT NULL DEFAULT 'system',
  `deleted_by` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `materiales`
--

INSERT INTO `materiales` (`id`, `descripcion`, `created_at`, `updated_at`, `deleted_at`, `is_deleted`, `created_by`, `updated_by`, `deleted_by`) VALUES
(1, 'Roble Europeo', '2025-12-31 01:19:32', '2026-02-21 01:44:55', NULL, 0, 'system', 'system', NULL),
(2, 'Roble Americano', '2026-02-21 01:45:24', '2026-02-22 00:09:02', NULL, 0, 'system', 'system', NULL),
(3, 'Roble Español', '2025-12-31 11:33:12', '2026-02-21 01:45:06', NULL, 0, 'system', 'system', NULL),
(4, 'Roble Europa Este', '2026-02-21 01:45:39', '2026-02-22 00:09:18', NULL, 0, 'system', 'system', NULL),
(5, 'Roble bulgaro', '2026-02-23 00:20:59', '2026-02-23 00:20:59', NULL, 0, 'system', 'system', NULL),
(6, 'Castaño Español', '2026-02-21 01:45:53', '2026-02-21 01:45:53', NULL, 0, 'system', 'system', NULL),
(7, 'Castaño Frances', '2026-02-21 01:46:01', '2026-02-21 01:46:01', NULL, 0, 'system', 'system', NULL),
(8, 'RC', '2026-02-22 23:29:06', '2026-02-22 23:29:06', NULL, 0, 'system', 'system', NULL),
(9, 'RCPalillos', '2026-02-22 23:29:20', '2026-02-22 23:29:20', NULL, 0, 'system', 'system', NULL),
(10, 'Castaño', '2026-02-22 23:29:30', '2026-02-22 23:29:30', NULL, 0, 'system', 'system', NULL),
(11, 'RP', '2026-02-23 00:27:25', '2026-02-23 00:27:25', NULL, 0, 'system', 'system', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ordenes_fabricacion`
--

CREATE TABLE `ordenes_fabricacion` (
  `id` int(11) NOT NULL,
  `numero` varchar(50) NOT NULL,
  `descripcion` varchar(120) NOT NULL DEFAULT '',
  `fecha` date DEFAULT NULL,
  `fecha_finalizacion` date DEFAULT NULL,
  `estado` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `created_by` varchar(100) NOT NULL DEFAULT 'system',
  `updated_by` varchar(100) NOT NULL DEFAULT 'system',
  `deleted_by` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `ordenes_fabricacion`
--

INSERT INTO `ordenes_fabricacion` (`id`, `numero`, `descripcion`, `fecha`, `fecha_finalizacion`, `estado`, `created_at`, `updated_at`, `deleted_at`, `is_deleted`, `created_by`, `updated_by`, `deleted_by`) VALUES
(1, '1', 'Orden 1', '2026-01-25', '2026-01-25', 1, '2026-01-25 22:21:33', '2026-02-21 01:37:52', NULL, 0, 'system', 'system', NULL),
(2, '2', 'Orden 2', '2026-02-02', '2026-02-02', 1, '2026-02-01 00:19:52', '2026-02-21 01:37:52', NULL, 0, 'system', 'system', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `palets`
--

CREATE TABLE `palets` (
  `id` int(11) NOT NULL,
  `codigo` varchar(60) NOT NULL,
  `linea_entrada_id` int(11) DEFAULT NULL,
  `duela_tipo_id` int(11) DEFAULT NULL,
  `cubicaje` decimal(10,2) NOT NULL DEFAULT 0.00,
  `consumido` decimal(10,2) NOT NULL DEFAULT 0.00,
  `estado` int(11) DEFAULT NULL,
  `ubicacion_id` int(11) DEFAULT NULL,
  `procesado` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `created_by` varchar(100) NOT NULL DEFAULT 'system',
  `updated_by` varchar(100) NOT NULL DEFAULT 'system',
  `deleted_by` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `palets`
--

INSERT INTO `palets` (`id`, `codigo`, `linea_entrada_id`, `duela_tipo_id`, `cubicaje`, `consumido`, `estado`, `ubicacion_id`, `procesado`, `created_at`, `updated_at`, `deleted_at`, `is_deleted`, `created_by`, `updated_by`, `deleted_by`) VALUES
(33, 'stock_0.50_Castaño', NULL, 43, 6500.00, 0.00, NULL, 7, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(34, 'stock_0.60_Castaño', NULL, 39, 6288.00, 0.00, NULL, 7, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(35, 'stock_1.00_Castaño', NULL, 19, 40934.00, 0.00, NULL, 7, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(36, 'stock_0.50_RC', NULL, 85, 252391.00, 0.00, NULL, 7, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(37, 'stock_1.15_RC', NULL, 70, 1932.00, 0.00, NULL, 7, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(38, 'stock_1.00_RC', NULL, 72, 672673.00, 0.00, NULL, 7, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(39, 'stock_0.95_RC', NULL, 74, 183502.00, 0.00, NULL, 7, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(40, 'stock_0.85_RC', NULL, 76, 232360.00, 0.00, NULL, 7, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(41, 'stock_0.80_RC', NULL, 79, 58869.00, 0.00, NULL, 7, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(42, 'stock_0.70_RC', NULL, 81, 431550.00, 0.00, NULL, 7, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(43, 'stock_0.60_RC', NULL, 83, 321187.00, 0.00, NULL, 7, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(44, 'stock_1.30_RC', NULL, 68, 1857217.00, 0.00, NULL, 6, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(45, 'stock_0.50_Castaño', NULL, 43, 6751.00, 0.00, NULL, 6, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(46, 'stock_1.00_Castaño', NULL, 19, 22056.00, 0.00, NULL, 6, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(47, 'stock_0.60_Castaño', NULL, 39, 12692.00, 0.00, NULL, 6, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(48, 'stock_1.00_RA', NULL, 20, 2723.00, 0.00, NULL, 6, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(49, 'stock_1.00_RP', NULL, 62, 18816.00, 0.00, NULL, 6, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(50, 'stock_1.00_RC', NULL, 72, 68540.00, 0.00, NULL, 6, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(51, 'stock_1.15_RA', NULL, 16, 4358.00, 0.00, NULL, 6, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(52, 'stock_1.15_RC', NULL, 70, 657864.00, 0.00, NULL, 6, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(53, 'stock_0.85_RC', NULL, 76, 10780.00, 0.00, NULL, 6, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(54, 'stock_0.50_RC', NULL, 85, 9238.00, 0.00, NULL, 5, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(55, 'stock_0.50_RA', NULL, 44, 38398.00, 0.00, NULL, 5, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(56, 'stock_0.50_RB', NULL, 84, 63451.00, 0.00, NULL, 5, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(57, 'stock_0.60_RCPalillos', NULL, 53, 3206.00, 0.00, NULL, 5, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(58, 'stock_0.70_RCPalillos', NULL, 55, 3730.00, 0.00, NULL, 5, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(59, 'stock_1.00_RCPalillos', NULL, 61, 8539.00, 1.25, NULL, 5, 0, '2026-02-23 00:58:42', '2026-02-23 04:07:26', NULL, 0, 'system', 'system', NULL),
(60, 'stock_0.85_RCPalillos', NULL, 58, 2280.00, 0.00, NULL, 5, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(61, 'stock_0.50_RCPalillos', NULL, 51, 7491.00, 0.00, NULL, 5, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(62, 'stock_1.15_RCPalillos', NULL, 63, 5462.00, 0.00, NULL, 5, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(63, 'stock_1.30_RCPalillos', NULL, 65, 34502.00, 0.00, NULL, 5, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(64, 'stock_0.60_RB', NULL, 82, 61911.00, 0.00, NULL, 5, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(65, 'stock_0.80_RCPalillos', NULL, 57, 2280.00, 0.00, NULL, 5, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(66, 'stock_0.60_RA', NULL, 40, 73942.00, 0.00, NULL, 5, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(67, 'stock_0.80_RC', NULL, 79, 1048.00, 0.00, NULL, 5, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(68, 'stock_0.70_RB', NULL, 80, 38459.00, 0.00, NULL, 5, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(69, 'stock_1.30_RC', NULL, 68, 457049.00, 0.00, NULL, 5, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(70, 'stock_1.30_RA', NULL, 12, 26263.00, 0.00, NULL, 5, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(71, 'stock_1.30_RB', NULL, 67, 150723.00, 0.00, NULL, 5, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(72, 'stock_1.15_RC', NULL, 70, 222701.00, 0.00, NULL, 5, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(73, 'stock_1.15_RA', NULL, 16, 278065.00, 0.00, NULL, 5, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(74, 'stock_1.15_RB', NULL, 69, 375056.00, 0.00, NULL, 5, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(75, 'stock_1.00_RC', NULL, 72, 42840.00, 0.00, NULL, 5, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(76, 'stock_1.00_RA', NULL, 20, 183645.00, 0.00, NULL, 5, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(77, 'stock_0.60_RC', NULL, 83, 14354.00, 0.00, NULL, 5, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(78, 'stock_1.00_RB', NULL, 71, 103170.00, 0.00, NULL, 5, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(79, 'stock_0.95_RB', NULL, 73, 6462.00, 0.00, NULL, 5, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(80, 'stock_0.85_RC', NULL, 76, 17794.00, 0.00, NULL, 5, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(81, 'stock_0.85_RB', NULL, 75, 20044.00, 0.00, NULL, 5, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(82, 'stock_0.80_RA', NULL, 77, 50862.00, 0.00, NULL, 5, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(83, 'stock_0.80_RB', NULL, 78, 7704.00, 0.00, NULL, 5, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(84, 'stock_0.70_RC', NULL, 81, 18734.00, 0.00, NULL, 5, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(85, 'stock_0.70_RA', NULL, 36, 18064.00, 0.00, NULL, 5, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(86, 'stock_0.95_RC', NULL, 74, 8979.00, 0.00, NULL, 5, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(87, 'stock_0.50_RC', NULL, 85, 51048.00, 0.00, NULL, 2, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(88, 'stock_0.50_RP', NULL, 52, 3168.00, 0.00, NULL, 2, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(89, 'stock_0.60_RA', NULL, 40, 12499.00, 0.00, NULL, 2, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(90, 'stock_1.00_RC', NULL, 72, 119100.00, 0.00, NULL, 2, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(91, 'stock_0.60_RC', NULL, 83, 47266.00, 0.00, NULL, 2, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(92, 'stock_0.60_RP', NULL, 54, 2424.00, 0.00, NULL, 2, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(93, 'stock_1.00_RA', NULL, 20, 26856.00, 0.00, NULL, 2, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(94, 'stock_1.00_RP', NULL, 62, 36685.00, 0.00, NULL, 2, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(95, 'stock_1.15_RB', NULL, 69, 52800.00, 0.00, NULL, 2, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(96, 'stock_1.15_RC', NULL, 70, 42601.00, 0.00, NULL, 2, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(97, 'stock_1.30_RA', NULL, 12, 52080.00, 0.00, NULL, 2, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(98, 'stock_1.30_RC', NULL, 68, 478111.00, 0.00, NULL, 2, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(99, 'stock_1.30_RP', NULL, 66, 76124.00, 0.00, NULL, 2, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(100, 'stock_0.95_RP', NULL, 60, 878.00, 0.00, NULL, 2, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(101, 'stock_0.85_RC', NULL, 76, 32870.00, 0.00, NULL, 2, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(102, 'stock_0.85_RP', NULL, 59, 2355.00, 0.00, NULL, 2, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(103, 'stock_0.80_RC', NULL, 79, 17306.00, 0.00, NULL, 2, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(104, 'stock_0.70_RC', NULL, 81, 64949.00, 0.00, NULL, 2, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(105, 'stock_0.70_RP', NULL, 56, 2826.00, 0.00, NULL, 2, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(106, 'stock_0.95_RC', NULL, 74, 34027.00, 10.00, NULL, 2, 0, '2026-02-23 00:58:42', '2026-02-23 04:17:00', NULL, 0, 'system', 'system', NULL),
(107, 'stock_0.50_RB', NULL, 84, 9145.00, 0.00, NULL, 3, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(108, 'stock_0.50_RC', NULL, 85, 52640.00, 0.00, NULL, 3, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(109, 'stock_0.50_RP', NULL, 52, 19740.00, 0.00, NULL, 3, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(110, 'stock_0.60_RC', NULL, 83, 32356.00, 0.00, NULL, 3, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(111, 'stock_0.70_RC', NULL, 81, 70500.00, 0.00, NULL, 3, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(112, 'stock_0.60_RB', NULL, 82, 13945.00, 0.00, NULL, 3, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(113, 'stock_0.70_RP', NULL, 56, 4910.00, 0.00, NULL, 3, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(114, 'stock_0.80_RB', NULL, 78, 3744.00, 0.00, NULL, 3, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(115, 'stock_0.80_RC', NULL, 79, 13909.00, 0.00, NULL, 3, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(116, 'stock_0.85_RC', NULL, 76, 119888.00, 0.00, NULL, 3, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(117, 'stock_0.95_RC', NULL, 74, 3574.00, 0.00, NULL, 3, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(118, 'stock_1.00_RC', NULL, 72, 8920.00, 0.00, NULL, 3, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(119, 'stock_1.15_RP', NULL, 64, 24640.00, 0.00, NULL, 3, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(120, 'stock_1.15_RC', NULL, 70, 49190.00, 0.00, NULL, 3, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(121, 'stock_1.30_Castaño', NULL, 11, 1566.00, 0.00, NULL, 3, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(122, 'stock_0.60_RP', NULL, 54, 7520.00, 0.00, NULL, 3, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(123, 'stock_1.30_RCPalillos', NULL, 65, 8000.00, 0.00, NULL, 3, 0, '2026-02-23 00:58:42', '2026-02-23 00:58:42', NULL, 0, 'system', 'system', NULL),
(124, '01234567890123456', NULL, 61, 1.25, 0.00, NULL, NULL, 0, '2026-02-23 04:07:26', '2026-02-23 04:07:26', NULL, 0, 'system', 'system', NULL),
(125, '01234567890#000001', NULL, 74, 10.00, 0.00, NULL, NULL, 0, '2026-02-23 04:17:00', '2026-02-23 04:17:00', NULL, 0, 'system', 'system', NULL);

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
(1, '2025', 1, 12, 1, 4, 2, 2, 0, 10, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(2, '2025', 6, 0, 0, 0, 0, 0, 0, 0, 0, 8, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(3, '2025', 7, 0, 0, 3, 0, 0, 2, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(4, '2025', 8, 0, 0, 0, 2, 0, 1, 0, 15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(5, '2025', 2, 10, 6, 2, 0, 0, 0, 3, 3, 0, 0, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(6, '2025', 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(7, '2025', 3, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(8, '2025', 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 0, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(9, '2025', 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 35, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(10, '2025', 9, 0, 0, 10, 10, 10, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(12, '2026', 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(13, '2026', 7, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(14, '2026', 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(15, '2026', 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(16, '2026', 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(17, '2026', 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(18, '2026', 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(19, '2026', 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(20, '2026', 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(21, '2026', 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(22, '2026', 11, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(23, '2025', 11, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

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
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `id` int(11) NOT NULL,
  `tipo` enum('FONDO','VASO','BOTA') NOT NULL,
  `material_id` int(11) DEFAULT NULL,
  `codigo` varchar(60) NOT NULL,
  `produccion_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `created_by` varchar(100) NOT NULL DEFAULT 'system',
  `updated_by` varchar(100) NOT NULL DEFAULT 'system',
  `deleted_by` varchar(100) DEFAULT NULL,
  `fabricado_por_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`id`, `tipo`, `material_id`, `codigo`, `produccion_id`, `created_at`, `updated_at`, `deleted_at`, `is_deleted`, `created_by`, `updated_by`, `deleted_by`, `fabricado_por_id`) VALUES
(72, 'BOTA', NULL, '012345678901234564244X2600001', 1, '2026-02-23 04:36:42', '2026-02-23 04:36:42', NULL, 0, 'system', 'system', NULL, NULL),
(73, 'BOTA', NULL, '012344271X260200001', 1, '2026-02-23 04:42:48', '2026-02-23 04:42:48', NULL, 0, 'system', 'system', NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos_operarios`
--

CREATE TABLE `productos_operarios` (
  `producto_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_by` varchar(100) NOT NULL DEFAULT 'system'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `productos_operarios`
--

INSERT INTO `productos_operarios` (`producto_id`, `usuario_id`, `created_at`, `created_by`) VALUES
(72, 42, '2026-02-23 04:36:42', 'system'),
(72, 44, '2026-02-23 04:36:42', 'system'),
(73, 42, '2026-02-23 04:42:48', 'system'),
(73, 71, '2026-02-23 04:42:48', 'system');

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
-- Estructura de tabla para la tabla `puestos_trabajo`
--

CREATE TABLE `puestos_trabajo` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `es_maquinaria` tinyint(1) NOT NULL DEFAULT 0,
  `fabricacion` tinyint(1) NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `created_by` varchar(50) DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  `updated_by` varchar(50) DEFAULT NULL,
  `deleted` tinyint(1) NOT NULL DEFAULT 0,
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `puestos_trabajo`
--

INSERT INTO `puestos_trabajo` (`id`, `nombre`, `es_maquinaria`, `fabricacion`, `activo`, `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted`, `deleted_at`, `deleted_by`) VALUES
(1, 'LABRAR', 0, 0, 1, '2025-11-23 16:56:45', NULL, NULL, NULL, 0, NULL, NULL),
(2, 'COR. FLEJE', 0, 0, 1, '2025-11-23 16:56:45', NULL, '2025-11-23 19:09:48', NULL, 0, NULL, NULL),
(3, 'JUNTAR', 0, 0, 1, '2025-11-23 16:56:45', NULL, NULL, NULL, 0, NULL, NULL),
(4, 'LEVANTAR', 0, 0, 1, '2025-11-23 16:56:45', NULL, NULL, NULL, 0, NULL, NULL),
(5, 'BATIDERO MAÑANA', 1, 0, 1, '2025-11-23 16:56:45', NULL, '2026-02-23 07:01:18', NULL, 0, NULL, NULL),
(6, 'BATIDERO TARDE', 1, 0, 1, '2025-11-23 16:56:45', NULL, '2026-02-23 07:01:19', NULL, 0, NULL, NULL),
(7, 'HERRAR', 0, 0, 1, '2025-11-23 16:56:45', NULL, NULL, NULL, 0, NULL, NULL),
(8, 'ARRUÑAR', 0, 0, 1, '2025-11-23 16:56:45', NULL, NULL, NULL, 0, NULL, NULL),
(9, 'COR. FONDO', 1, 0, 1, '2025-11-23 16:56:45', NULL, '2026-02-23 07:01:24', NULL, 0, NULL, NULL),
(10, 'JUNTAR PZS.', 0, 0, 1, '2025-11-23 16:56:45', NULL, NULL, NULL, 0, NULL, NULL),
(11, 'ARRUMAR', 0, 0, 1, '2025-11-23 16:56:45', NULL, NULL, NULL, 0, NULL, NULL),
(12, 'ENGABILLAR', 0, 0, 1, '2025-11-23 16:56:45', NULL, NULL, NULL, 0, NULL, NULL),
(13, 'PULIMENTAR', 1, 0, 1, '2025-11-23 16:56:45', NULL, '2026-02-23 07:01:26', NULL, 0, NULL, NULL),
(14, 'BANDEAR', 0, 0, 1, '2025-11-23 16:56:45', NULL, NULL, NULL, 0, NULL, NULL),
(15, 'LIQUIDO', 0, 0, 1, '2025-11-23 16:56:45', NULL, NULL, NULL, 0, NULL, NULL),
(16, 'LÁSER', 1, 0, 1, '2025-11-23 16:56:45', NULL, '2026-02-23 07:01:31', NULL, 0, NULL, NULL),
(17, 'FONDAR', 0, 1, 1, '2025-11-23 16:56:45', NULL, '2026-02-23 07:01:34', NULL, 0, NULL, NULL),
(18, 'COMODIN', 0, 0, 1, '2025-11-23 16:56:45', NULL, NULL, NULL, 0, NULL, NULL),
(19, 'TALLER VIEJO', 0, 0, 1, '2025-11-23 16:56:45', NULL, NULL, NULL, 0, NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `nombre` varchar(20) NOT NULL,
  `planificacion` tinyint(1) NOT NULL,
  `recepcion` tinyint(1) NOT NULL,
  `ubicacion` tinyint(1) NOT NULL,
  `fabricacion` tinyint(1) NOT NULL,
  `expedicion` tinyint(1) NOT NULL,
  `trazabilidad` tinyint(1) NOT NULL,
  `administrador` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `roles`
--

INSERT INTO `roles` (`id`, `nombre`, `planificacion`, `recepcion`, `ubicacion`, `fabricacion`, `expedicion`, `trazabilidad`, `administrador`) VALUES
(1, 'admin', 1, 1, 1, 1, 1, 1, 1),
(2, 'gestor', 1, 1, 1, 1, 1, 1, 0),
(3, 'operario', 0, 1, 1, 1, 1, 0, 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipos_producto`
--

CREATE TABLE `tipos_producto` (
  `id` int(11) NOT NULL,
  `tipo` varchar(30) NOT NULL DEFAULT '',
  `codigo` varchar(60) NOT NULL,
  `descripcion` varchar(150) NOT NULL,
  `consumo` decimal(10,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `created_by` varchar(100) NOT NULL DEFAULT 'system',
  `updated_by` varchar(100) NOT NULL DEFAULT 'system',
  `deleted_by` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tipos_producto`
--

INSERT INTO `tipos_producto` (`id`, `tipo`, `codigo`, `descripcion`, `consumo`, `created_at`, `updated_at`, `deleted_at`, `is_deleted`, `created_by`, `updated_by`, `deleted_by`) VALUES
(1, 'BOTA', 'B130', 'Bota 1.30', 7.14, '2026-01-25 22:23:44', '2026-02-21 02:42:45', NULL, 0, 'system', 'system', NULL),
(2, 'BOTA', 'B115', 'Bota 1.15', 7.70, '2026-02-21 01:40:06', '2026-02-21 02:42:47', NULL, 0, 'system', 'system', NULL),
(3, 'BOTA', 'B100', 'Bota 1.00', 9.80, '2026-02-21 01:40:25', '2026-02-21 02:42:49', NULL, 0, 'system', 'system', NULL),
(4, 'BOTA', 'M300', 'Media 300L', 10.70, '2026-02-21 01:40:50', '2026-02-21 02:42:52', NULL, 0, 'system', 'system', NULL),
(5, 'BOTA', 'M250', 'Media 250L', 12.10, '2026-02-21 01:41:06', '2026-02-21 02:42:54', NULL, 0, 'system', 'system', NULL),
(6, 'BOTA', 'M200', 'Media 200L', 13.40, '2026-02-21 01:41:22', '2026-02-21 02:42:56', NULL, 0, 'system', 'system', NULL),
(7, 'FONDO', 'F60', 'Fondo 60', 0.00, '2026-02-21 01:56:02', '2026-02-21 02:42:58', NULL, 0, 'system', 'system', NULL),
(8, 'FONDO', 'F70', 'Fondo 70', 0.00, '2026-02-21 01:56:14', '2026-02-21 02:42:59', NULL, 0, 'system', 'system', NULL),
(9, 'FONDO', 'F80', 'Fondo 80', 0.00, '2026-02-21 01:56:31', '2026-02-21 02:43:01', NULL, 0, 'system', 'system', NULL),
(10, 'FLEJE', 'FL40', 'Fleje 40', 9.60, '2026-02-21 02:43:25', '2026-02-23 02:14:38', NULL, 0, 'system', 'system', NULL),
(11, 'FLEJE', 'FL70', 'Fleje 70', 4.20, '2026-02-21 02:43:41', '2026-02-23 02:14:55', NULL, 0, 'system', 'system', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `trazabilidad_fabricacion`
--

CREATE TABLE `trazabilidad_fabricacion` (
  `id` int(11) NOT NULL,
  `linea_fabricacion_id` int(11) NOT NULL,
  `palet_id` int(11) NOT NULL,
  `cantidad_fabricada` int(11) NOT NULL DEFAULT 0,
  `estado` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `created_by` varchar(100) NOT NULL DEFAULT 'system',
  `updated_by` varchar(100) NOT NULL DEFAULT 'system',
  `deleted_by` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `trazabilidad_fabricacion`
--

INSERT INTO `trazabilidad_fabricacion` (`id`, `linea_fabricacion_id`, `palet_id`, `cantidad_fabricada`, `estado`, `created_at`, `updated_at`, `deleted_at`, `is_deleted`, `created_by`, `updated_by`, `deleted_by`) VALUES
(41, 1, 124, 2, 0, '2026-02-23 04:07:26', '2026-02-23 05:28:30', NULL, 0, 'system', 'system', NULL),
(42, 1, 125, 2, 0, '2026-02-23 04:17:00', '2026-02-23 04:42:48', NULL, 0, 'system', 'system', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `trazabilidad_procesado`
--

CREATE TABLE `trazabilidad_procesado` (
  `id` int(11) NOT NULL,
  `palet_origen_id` int(11) NOT NULL,
  `palet_destino_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `created_by` varchar(100) NOT NULL DEFAULT 'system',
  `updated_by` varchar(100) NOT NULL DEFAULT 'system',
  `deleted_by` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `trazabilidad_producto`
--

CREATE TABLE `trazabilidad_producto` (
  `id` int(11) NOT NULL,
  `trazabilidad_fabricacion_id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `created_by` varchar(100) NOT NULL DEFAULT 'system',
  `updated_by` varchar(100) NOT NULL DEFAULT 'system',
  `deleted_by` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `trazabilidad_producto`
--

INSERT INTO `trazabilidad_producto` (`id`, `trazabilidad_fabricacion_id`, `producto_id`, `created_at`, `updated_at`, `deleted_at`, `is_deleted`, `created_by`, `updated_by`, `deleted_by`) VALUES
(1, 41, 72, '2026-02-23 04:36:42', '2026-02-23 04:36:42', NULL, 0, 'system', 'system', NULL),
(2, 42, 72, '2026-02-23 04:36:42', '2026-02-23 04:36:42', NULL, 0, 'system', 'system', NULL),
(3, 41, 73, '2026-02-23 04:42:48', '2026-02-23 04:42:48', NULL, 0, 'system', 'system', NULL),
(4, 42, 73, '2026-02-23 04:42:48', '2026-02-23 04:42:48', NULL, 0, 'system', 'system', NULL);

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
(2, 'Paez Morilla', 4, 1),
(3, 'Predeterminado', 6, 1),
(4, 'Procesados', 5, 1),
(5, 'Sta Lucia', 3, 1),
(6, 'Taller nuevo', 1, 1),
(7, 'Taller viejo', 2, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `codigo` varchar(2) DEFAULT NULL,
  `alias` varchar(64) NOT NULL,
  `nombre` varchar(128) DEFAULT NULL,
  `clave` varchar(255) NOT NULL,
  `empleado` tinyint(1) NOT NULL DEFAULT 1,
  `rol_id` int(11) DEFAULT NULL,
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

INSERT INTO `usuarios` (`id`, `codigo`, `alias`, `nombre`, `clave`, `empleado`, `rol_id`, `created_at`, `updated_at`, `deleted_at`, `is_deleted`, `created_by`, `updated_by`, `deleted_by`) VALUES
(1, '01', 'admin', 'Admin', '$2y$10$lyhm35pbQHiZEDpSHlwCQOkBUy8RQwv/2Mn7KSQodnU7cSMJ6QxMS', 0, 1, '2025-10-25 13:43:49', '2026-02-23 06:10:05', '2025-10-25 23:36:52', 0, 'system', 'system', NULL),
(2, '02', 'rafa', 'Rafael', '$2b$10$nVJMSjwq0c8lKcIqj15LG.K0o7D3Cu/Ttc3JCiCocXIfcXr1koW2W', 0, 2, '2025-10-25 13:43:49', '2026-02-23 06:10:05', NULL, 0, 'system', 'system', NULL),
(3, '03', 'pepe', 'Pepe Sanchez', '$2b$12$e5Hd/HX6dIUk9GqUdWGB0eb3.8YCE2hBjInKdFYWVzv412aoJmE52', 0, 3, '2025-10-25 13:43:49', '2026-02-23 06:10:05', NULL, 0, 'system', 'system', NULL),
(42, '42', 'pedrito', 'PEDRITO', '', 1, NULL, '2025-11-23 16:31:44', '2026-02-23 06:10:05', NULL, 0, 'system', 'system', NULL),
(43, '43', 'calvente', 'CALVENTE', '', 1, NULL, '2025-11-23 16:31:44', '2026-02-23 06:10:05', NULL, 0, 'system', 'system', NULL),
(44, '44', 'j.carlos', 'J.CARLOS', '', 1, NULL, '2025-11-23 16:31:44', '2026-02-23 06:10:05', NULL, 0, 'system', 'system', NULL),
(45, '45', 'perez', 'PEREZ', '', 1, NULL, '2025-11-23 16:31:44', '2026-02-23 06:10:05', NULL, 0, 'system', 'system', NULL),
(46, '46', 'jose luis', 'JOSE LUIS', '', 1, NULL, '2025-11-23 16:31:44', '2026-02-23 06:10:05', NULL, 0, 'system', 'system', NULL),
(47, '47', 'giraldo', 'GIRALDO', '', 1, NULL, '2025-11-23 16:31:44', '2026-02-23 06:10:05', NULL, 0, 'system', 'system', NULL),
(48, '48', 'adrian', 'ADRIAN', '', 1, NULL, '2025-11-23 16:31:44', '2026-02-23 06:10:05', NULL, 0, 'system', 'system', NULL),
(49, '49', 'manuel', 'MANUEL', '', 1, NULL, '2025-11-23 16:31:44', '2026-02-23 06:10:05', NULL, 0, 'system', 'system', NULL),
(50, '50', 'jony', 'JONY', '', 1, NULL, '2025-11-23 16:31:44', '2026-02-23 06:10:05', NULL, 0, 'system', 'system', NULL),
(51, '51', 'jesus', 'JESUS', '', 1, NULL, '2025-11-23 16:31:44', '2026-02-23 06:10:05', NULL, 0, 'system', 'system', NULL),
(52, '52', 'rujano', 'RUJANO', '', 1, NULL, '2025-11-23 16:31:44', '2026-02-23 06:10:05', NULL, 0, 'system', 'system', NULL),
(53, '53', 'clavijo', 'CLAVIJO', '', 1, NULL, '2025-11-23 16:31:44', '2026-02-23 06:10:05', NULL, 0, 'system', 'system', NULL),
(54, '54', 'lauren', 'LAUREN', '', 1, NULL, '2025-11-23 16:31:44', '2026-02-23 06:10:05', NULL, 0, 'system', 'system', NULL),
(55, '55', 'fran', 'FRAN', '', 1, NULL, '2025-11-23 16:31:44', '2026-02-23 06:10:05', NULL, 0, 'system', 'system', NULL),
(56, '56', 'parra', 'PARRA', '', 1, NULL, '2025-11-23 16:31:44', '2026-02-23 06:10:05', NULL, 0, 'system', 'system', NULL),
(57, '57', 'juan jose', 'JUAN JOSE', '', 1, NULL, '2025-11-23 16:31:44', '2026-02-23 06:10:05', NULL, 0, 'system', 'system', NULL),
(58, '58', 'martin', 'MARTIN', '', 1, NULL, '2025-11-23 16:31:44', '2026-02-23 06:10:05', NULL, 0, 'system', 'system', NULL),
(59, '59', 'melero', 'MELERO', '', 1, NULL, '2025-11-23 16:31:44', '2026-02-23 06:10:05', NULL, 0, 'system', 'system', NULL),
(60, '60', 'nono', 'NONO', '', 1, NULL, '2025-11-23 16:31:44', '2026-02-23 06:10:05', NULL, 0, 'system', 'system', NULL),
(61, '61', 'jose fco', 'JOSE FCO', '', 1, NULL, '2025-11-23 16:31:44', '2026-02-23 06:10:05', NULL, 0, 'system', 'system', NULL),
(62, '62', 'muñoz', 'MUÑOZ', '', 1, NULL, '2025-11-23 16:31:44', '2026-02-23 06:10:05', NULL, 0, 'system', 'system', NULL),
(63, '63', 'corral', 'CORRAL', '', 1, NULL, '2025-11-23 16:31:44', '2026-02-23 06:10:05', NULL, 0, 'system', 'system', NULL),
(64, '64', 'diaz', 'DIAZ', '', 1, NULL, '2025-11-23 16:31:44', '2026-02-23 06:10:05', NULL, 0, 'system', 'system', NULL),
(65, '65', 'j.alberto', 'J.ALBERTO', '', 1, NULL, '2025-11-23 16:31:44', '2026-02-23 06:10:05', NULL, 0, 'system', 'system', NULL),
(66, '66', 'torres', 'TORRES', '', 1, NULL, '2025-11-23 16:31:44', '2026-02-23 06:10:05', NULL, 0, 'system', 'system', NULL),
(67, '67', 'angel', 'ANGEL', '', 1, NULL, '2025-11-23 16:31:44', '2026-02-23 06:10:05', NULL, 0, 'system', 'system', NULL),
(68, '68', 'luis', 'LUIS', '', 1, NULL, '2025-11-23 16:31:44', '2026-02-23 06:10:05', NULL, 0, 'system', 'system', NULL),
(69, '69', 'mancilla', 'MANCILLA', '', 1, NULL, '2025-11-23 16:31:44', '2026-02-23 06:10:05', NULL, 0, 'system', 'system', NULL),
(70, '70', 'juanito', 'JUANITO', '', 1, NULL, '2025-11-23 16:31:44', '2026-02-23 06:10:05', NULL, 0, 'system', 'system', NULL),
(71, '71', 'j.antonio', 'J.ANTONIO', '', 1, NULL, '2025-11-23 16:31:44', '2026-02-23 06:10:05', NULL, 0, 'system', 'system', NULL),
(72, '72', 'adri', 'ADRI', '', 1, NULL, '2025-11-23 16:31:44', '2026-02-23 06:10:05', NULL, 0, 'system', 'system', NULL),
(73, '73', 'paco', 'PACO', '', 1, NULL, '2025-11-23 16:31:44', '2026-02-23 06:10:05', NULL, 0, 'system', 'system', NULL),
(74, '74', 'miguelon', 'MIGUELON', '', 1, NULL, '2025-11-23 16:31:44', '2026-02-23 06:10:05', NULL, 0, 'system', 'system', NULL),
(75, '75', 'julio', 'JULIO', '', 1, NULL, '2025-11-23 16:31:44', '2026-02-23 06:10:05', NULL, 0, 'system', 'system', NULL),
(76, '76', 'jose', 'JOSE', '', 1, NULL, '2025-11-23 16:31:44', '2026-02-23 06:10:05', NULL, 0, 'system', 'system', NULL),
(77, '77', 'jose mari', 'JOSE MARI', '', 1, NULL, '2025-11-23 16:31:44', '2026-02-23 06:10:05', NULL, 0, 'system', 'system', NULL);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `ambientes`
--
ALTER TABLE `ambientes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_ambientes_fecha_toma` (`fecha`,`toma`);

--
-- Indices de la tabla `archivos_subidos`
--
ALTER TABLE `archivos_subidos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_archivos_subidos_entidad` (`entidad`,`entidad_id`);

--
-- Indices de la tabla `botas`
--
ALTER TABLE `botas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`),
  ADD KEY `fk_botas_vaso` (`vaso_producto_id`),
  ADD KEY `fk_botas_fondo` (`fondo_producto_id`),
  ADD KEY `fk_botas_tapa` (`tapa_producto_id`),
  ADD KEY `fk_botas_estados` (`estado`),
  ADD KEY `fk_botas_materiales` (`material_id`),
  ADD KEY `idx_botas_tipo_producto_id` (`tipo_producto_id`);

--
-- Indices de la tabla `clientes`
--
ALTER TABLE `clientes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`nombre`);

--
-- Indices de la tabla `cuadrantes`
--
ALTER TABLE `cuadrantes`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `cuadrante_detalles`
--
ALTER TABLE `cuadrante_detalles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_cd_puesto` (`puesto_id`),
  ADD KEY `fk_cd_usuario` (`usuario_id`),
  ADD KEY `fk_cd_cuadrante` (`cuadrante_id`);

--
-- Indices de la tabla `duelas`
--
ALTER TABLE `duelas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_duelas_materiales` (`material_id`);

--
-- Indices de la tabla `entradas`
--
ALTER TABLE `entradas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_entradas_proveedores` (`proveedor_id`);

--
-- Indices de la tabla `entradas_flejes`
--
ALTER TABLE `entradas_flejes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_entradas_flejes_fecha` (`fecha`),
  ADD KEY `idx_entradas_flejes_tipo_producto` (`tipo_producto_id`);

--
-- Indices de la tabla `estados_botas`
--
ALTER TABLE `estados_botas`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `estados_lineas_fabricacion`
--
ALTER TABLE `estados_lineas_fabricacion`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `estados_ordenes_fabricacion`
--
ALTER TABLE `estados_ordenes_fabricacion`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `estados_palets`
--
ALTER TABLE `estados_palets`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `estados_trazabilidad_fabricacion`
--
ALTER TABLE `estados_trazabilidad_fabricacion`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `instalaciones`
--
ALTER TABLE `instalaciones`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `lineas_entrada`
--
ALTER TABLE `lineas_entrada`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_lineas_entrada_entradas` (`entrada_id`),
  ADD KEY `fk_lineas_entrada_duelas` (`duela_id`);

--
-- Indices de la tabla `lineas_fabricacion`
--
ALTER TABLE `lineas_fabricacion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_lineas_fabricacion_ordenes` (`orden_id`),
  ADD KEY `fk_lineas_fabricacion_tipos` (`tipo_producto_id`),
  ADD KEY `fk_lineas_fabricacion_estados` (`estado`),
  ADD KEY `fk_lineas_fabricacion_materiales` (`material_id`);

--
-- Indices de la tabla `materiales`
--
ALTER TABLE `materiales`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `descripcion` (`descripcion`);

--
-- Indices de la tabla `ordenes_fabricacion`
--
ALTER TABLE `ordenes_fabricacion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_ordenes_fabricacion_estados` (`estado`);

--
-- Indices de la tabla `palets`
--
ALTER TABLE `palets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_palets_ubicaciones` (`ubicacion_id`),
  ADD KEY `fk_palets_lineas_entrada` (`linea_entrada_id`),
  ADD KEY `idx_palets_duela_tipo_id` (`duela_tipo_id`),
  ADD KEY `fk_palets_estados_palets` (`estado`);

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
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_productos_produccion` (`produccion_id`),
  ADD KEY `fk_productos_materiales` (`material_id`);

--
-- Indices de la tabla `productos_operarios`
--
ALTER TABLE `productos_operarios`
  ADD PRIMARY KEY (`producto_id`,`usuario_id`),
  ADD KEY `fk_productos_operarios_usuario` (`usuario_id`);

--
-- Indices de la tabla `proveedores`
--
ALTER TABLE `proveedores`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`nombre`);

--
-- Indices de la tabla `puestos_trabajo`
--
ALTER TABLE `puestos_trabajo`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `tipos_producto`
--
ALTER TABLE `tipos_producto`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`);

--
-- Indices de la tabla `trazabilidad_fabricacion`
--
ALTER TABLE `trazabilidad_fabricacion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_trazabilidad_fabricacion_linea` (`linea_fabricacion_id`),
  ADD KEY `fk_trazabilidad_fabricacion_palet` (`palet_id`),
  ADD KEY `fk_trazabilidad_fabricacion_estados` (`estado`);

--
-- Indices de la tabla `trazabilidad_procesado`
--
ALTER TABLE `trazabilidad_procesado`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_trazabilidad_procesado_origen` (`palet_origen_id`),
  ADD KEY `fk_trazabilidad_procesado_destino` (`palet_destino_id`);

--
-- Indices de la tabla `trazabilidad_producto`
--
ALTER TABLE `trazabilidad_producto`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_trazabilidad_producto_fabricacion` (`trazabilidad_fabricacion_id`),
  ADD KEY `fk_trazabilidad_producto_producto` (`producto_id`);

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
  ADD UNIQUE KEY `username` (`alias`),
  ADD KEY `idx_mi_tabla_is_deleted` (`is_deleted`),
  ADD KEY `idx_mi_tabla_deleted_at` (`deleted_at`),
  ADD KEY `idx_usuarios_is_deleted` (`is_deleted`),
  ADD KEY `idx_usuarios_deleted_at` (`deleted_at`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `ambientes`
--
ALTER TABLE `ambientes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `archivos_subidos`
--
ALTER TABLE `archivos_subidos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `botas`
--
ALTER TABLE `botas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `clientes`
--
ALTER TABLE `clientes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `cuadrantes`
--
ALTER TABLE `cuadrantes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de la tabla `cuadrante_detalles`
--
ALTER TABLE `cuadrante_detalles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=321;

--
-- AUTO_INCREMENT de la tabla `duelas`
--
ALTER TABLE `duelas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=86;

--
-- AUTO_INCREMENT de la tabla `entradas`
--
ALTER TABLE `entradas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `entradas_flejes`
--
ALTER TABLE `entradas_flejes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `estados_botas`
--
ALTER TABLE `estados_botas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `estados_lineas_fabricacion`
--
ALTER TABLE `estados_lineas_fabricacion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `estados_ordenes_fabricacion`
--
ALTER TABLE `estados_ordenes_fabricacion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `estados_palets`
--
ALTER TABLE `estados_palets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `estados_trazabilidad_fabricacion`
--
ALTER TABLE `estados_trazabilidad_fabricacion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `instalaciones`
--
ALTER TABLE `instalaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `lineas_entrada`
--
ALTER TABLE `lineas_entrada`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `lineas_fabricacion`
--
ALTER TABLE `lineas_fabricacion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `materiales`
--
ALTER TABLE `materiales`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `ordenes_fabricacion`
--
ALTER TABLE `ordenes_fabricacion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `palets`
--
ALTER TABLE `palets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=126;

--
-- AUTO_INCREMENT de la tabla `plan_camiones`
--
ALTER TABLE `plan_camiones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

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
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=79;

--
-- AUTO_INCREMENT de la tabla `proveedores`
--
ALTER TABLE `proveedores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `puestos_trabajo`
--
ALTER TABLE `puestos_trabajo`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `tipos_producto`
--
ALTER TABLE `tipos_producto`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `trazabilidad_fabricacion`
--
ALTER TABLE `trazabilidad_fabricacion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT de la tabla `trazabilidad_procesado`
--
ALTER TABLE `trazabilidad_procesado`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `trazabilidad_producto`
--
ALTER TABLE `trazabilidad_producto`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `ubicaciones`
--
ALTER TABLE `ubicaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=78;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `botas`
--
ALTER TABLE `botas`
  ADD CONSTRAINT `fk_botas_estados_entidad` FOREIGN KEY (`estado`) REFERENCES `estados_botas` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_botas_fondo` FOREIGN KEY (`fondo_producto_id`) REFERENCES `productos` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_botas_materiales` FOREIGN KEY (`material_id`) REFERENCES `materiales` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_botas_tapa` FOREIGN KEY (`tapa_producto_id`) REFERENCES `productos` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_botas_vaso` FOREIGN KEY (`vaso_producto_id`) REFERENCES `productos` (`id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `cuadrante_detalles`
--
ALTER TABLE `cuadrante_detalles`
  ADD CONSTRAINT `fk_cd_cuadrante` FOREIGN KEY (`cuadrante_id`) REFERENCES `cuadrantes` (`id`),
  ADD CONSTRAINT `fk_cd_puesto` FOREIGN KEY (`puesto_id`) REFERENCES `puestos_trabajo` (`id`),
  ADD CONSTRAINT `fk_cd_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `duelas`
--
ALTER TABLE `duelas`
  ADD CONSTRAINT `fk_duelas_materiales` FOREIGN KEY (`material_id`) REFERENCES `materiales` (`id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `entradas`
--
ALTER TABLE `entradas`
  ADD CONSTRAINT `fk_entradas_proveedores` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores` (`id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `lineas_entrada`
--
ALTER TABLE `lineas_entrada`
  ADD CONSTRAINT `fk_lineas_entrada_duelas` FOREIGN KEY (`duela_id`) REFERENCES `duelas` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_lineas_entrada_entradas` FOREIGN KEY (`entrada_id`) REFERENCES `entradas` (`id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `lineas_fabricacion`
--
ALTER TABLE `lineas_fabricacion`
  ADD CONSTRAINT `fk_lineas_fabricacion_estados_entidad` FOREIGN KEY (`estado`) REFERENCES `estados_lineas_fabricacion` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_lineas_fabricacion_materiales` FOREIGN KEY (`material_id`) REFERENCES `materiales` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_lineas_fabricacion_ordenes` FOREIGN KEY (`orden_id`) REFERENCES `ordenes_fabricacion` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_lineas_fabricacion_tipos` FOREIGN KEY (`tipo_producto_id`) REFERENCES `tipos_producto` (`id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `ordenes_fabricacion`
--
ALTER TABLE `ordenes_fabricacion`
  ADD CONSTRAINT `fk_ordenes_fabricacion_estados_entidad` FOREIGN KEY (`estado`) REFERENCES `estados_ordenes_fabricacion` (`id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `palets`
--
ALTER TABLE `palets`
  ADD CONSTRAINT `fk_palets_estados_palets` FOREIGN KEY (`estado`) REFERENCES `estados_palets` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_palets_lineas_entrada` FOREIGN KEY (`linea_entrada_id`) REFERENCES `lineas_entrada` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_palets_ubicaciones` FOREIGN KEY (`ubicacion_id`) REFERENCES `ubicaciones` (`id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `plan_camiones`
--
ALTER TABLE `plan_camiones`
  ADD CONSTRAINT `fk_plan_camiones_proveedores` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores` (`id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `productos`
--
ALTER TABLE `productos`
  ADD CONSTRAINT `fk_productos_materiales` FOREIGN KEY (`material_id`) REFERENCES `materiales` (`id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `productos_operarios`
--
ALTER TABLE `productos_operarios`
  ADD CONSTRAINT `fk_productos_operarios_producto` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_productos_operarios_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `trazabilidad_fabricacion`
--
ALTER TABLE `trazabilidad_fabricacion`
  ADD CONSTRAINT `fk_trazabilidad_fabricacion_linea` FOREIGN KEY (`linea_fabricacion_id`) REFERENCES `lineas_fabricacion` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_trazabilidad_fabricacion_palet` FOREIGN KEY (`palet_id`) REFERENCES `palets` (`id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `trazabilidad_procesado`
--
ALTER TABLE `trazabilidad_procesado`
  ADD CONSTRAINT `fk_trazabilidad_procesado_destino` FOREIGN KEY (`palet_destino_id`) REFERENCES `palets` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_trazabilidad_procesado_origen` FOREIGN KEY (`palet_origen_id`) REFERENCES `palets` (`id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `trazabilidad_producto`
--
ALTER TABLE `trazabilidad_producto`
  ADD CONSTRAINT `fk_trazabilidad_producto_fabricacion` FOREIGN KEY (`trazabilidad_fabricacion_id`) REFERENCES `trazabilidad_fabricacion` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_trazabilidad_producto_producto` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `ubicaciones`
--
ALTER TABLE `ubicaciones`
  ADD CONSTRAINT `fk_ubicaciones_instalaciones` FOREIGN KEY (`instalacion_id`) REFERENCES `instalaciones` (`id`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
