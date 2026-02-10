-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 10-02-2026 a las 12:57:23
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
  `vaso_producto_id` int(11) NOT NULL,
  `fondo_producto_id` int(11) NOT NULL,
  `tapa_producto_id` int(11) NOT NULL,
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

--
-- Volcado de datos para la tabla `clientes`
--

INSERT INTO `clientes` (`id`, `nombre`) VALUES
(44, '1'),
(45, '3'),
(46, '4'),
(47, '6666'),
(13, 'Antonia'),
(5, 'Antonio'),
(12, 'Consolacion'),
(14, 'Francisco'),
(11, 'Julio'),
(3, 'Manuel'),
(2, 'Miguel'),
(48, 'nuevo cli'),
(50, 'nuevo registro'),
(39, 'OK'),
(10, 'Paco'),
(4, 'Pepe'),
(1, 'Rafael'),
(17, 't3000'),
(19, 't8000');

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
(12, '2026-02-05', '2026-02-11', '', '', '2026-02-10 04:09:37', NULL, NULL, NULL, 0, NULL, NULL);

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
(116, 12, '2026-02-05', 9, 47, 1, '2026-02-10 11:38:09', NULL, NULL, NULL, 0, NULL, NULL);

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
(1, 'Hileras de Duela de Roble Frances 1300x1200x35mm', 1, '2025-12-31 01:19:32', '2025-12-31 01:19:32', NULL, 0, 'system', 'system', NULL),
(2, 'Hileras de Duela de Roble Frances 1150x1200x35mm', 1, '2025-12-31 01:19:32', '2025-12-31 01:19:32', NULL, 0, 'system', 'system', NULL),
(3, 'Hileras de Duela de Roble Frances 1000x1200x3,5mm', 3, '2025-12-31 01:19:32', '2025-12-31 11:42:08', NULL, 0, 'system', 'system', NULL),
(4, 'Hileras de Duela de Roble Frances 950x1200x3,5mm', 1, '2025-12-31 01:19:32', '2025-12-31 01:19:32', NULL, 0, 'system', 'system', NULL),
(5, 'Hileras de Duela de Roble Frances 700x1200x35mm', 1, '2025-12-31 01:19:32', '2025-12-31 01:19:32', NULL, 0, 'system', 'system', NULL);

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
(1, 'Taller nuevo', 'M'),
(2, 'Taller viejo', 'M'),
(3, 'Sta Lucia', 'B'),
(4, 'Paez Morilla', 'B');

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

--
-- Volcado de datos para la tabla `lineas_entrada`
--

INSERT INTO `lineas_entrada` (`id`, `entrada_id`, `duela_id`, `bultos`, `kilos`, `bultos_entregados`, `verificado`) VALUES
(2, 1, 1, 2, 850.00, 0, 0),
(3, 1, 5, 15, 100.00, 0, 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `lineas_fabricacion`
--

CREATE TABLE `lineas_fabricacion` (
  `id` int(11) NOT NULL,
  `orden_id` int(11) NOT NULL,
  `tipo_producto_id` int(11) NOT NULL,
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

INSERT INTO `lineas_fabricacion` (`id`, `orden_id`, `tipo_producto_id`, `cantidad`, `cantidad_fabricada`, `estado`, `created_at`, `updated_at`, `deleted_at`, `is_deleted`, `created_by`, `updated_by`, `deleted_by`) VALUES
(1, 1, 1, 50, 18, 1, '2026-01-25 22:26:07', '2026-02-10 10:54:21', NULL, 0, 'system', 'system', NULL),
(2, 2, 1, 20, 27, 1, '2026-02-01 00:20:29', '2026-02-10 04:46:06', NULL, 0, 'system', 'system', NULL);

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
(1, 'Roble Frances', '2025-12-31 01:19:32', '2025-12-31 01:19:32', NULL, 0, 'system', 'system', NULL),
(3, 'Castaño', '2025-12-31 11:33:12', '2025-12-31 11:33:12', NULL, 0, 'system', 'system', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ordenes_fabricacion`
--

CREATE TABLE `ordenes_fabricacion` (
  `id` int(11) NOT NULL,
  `numero` varchar(50) NOT NULL,
  `fecha` date DEFAULT NULL,
  `cliente_id` int(11) DEFAULT NULL,
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

INSERT INTO `ordenes_fabricacion` (`id`, `numero`, `fecha`, `cliente_id`, `estado`, `created_at`, `updated_at`, `deleted_at`, `is_deleted`, `created_by`, `updated_by`, `deleted_by`) VALUES
(1, '1', '2026-01-25', 1, 1, '2026-01-25 22:21:33', '2026-01-25 22:21:33', NULL, 0, 'system', 'system', NULL),
(2, '2', '2026-02-02', 4, 1, '2026-02-01 00:19:52', '2026-02-01 00:19:52', NULL, 0, 'system', 'system', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `palets`
--

CREATE TABLE `palets` (
  `id` int(11) NOT NULL,
  `codigo` varchar(60) NOT NULL,
  `linea_entrada_id` int(11) DEFAULT NULL,
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

INSERT INTO `palets` (`id`, `codigo`, `linea_entrada_id`, `ubicacion_id`, `procesado`, `created_at`, `updated_at`, `deleted_at`, `is_deleted`, `created_by`, `updated_by`, `deleted_by`) VALUES
(1, 'retrertre', NULL, NULL, 0, '2026-01-26 00:29:26', '2026-01-26 00:29:26', NULL, 0, 'system', 'system', NULL),
(2, '55-485-WQ', NULL, NULL, 0, '2026-01-26 00:30:42', '2026-01-26 00:30:42', NULL, 0, 'system', 'system', NULL),
(3, '88-Qww-12', NULL, NULL, 0, '2026-01-26 00:30:53', '2026-01-26 00:30:53', NULL, 0, 'system', 'system', NULL),
(4, 'cantidad_vacia', NULL, NULL, 0, '2026-01-26 00:31:15', '2026-01-26 00:31:15', NULL, 0, 'system', 'system', NULL),
(5, '11111', NULL, NULL, 0, '2026-01-26 00:41:11', '2026-01-26 00:41:11', NULL, 0, 'system', 'system', NULL),
(6, '1', NULL, NULL, 0, '2026-01-26 00:41:44', '2026-01-26 00:41:44', NULL, 0, 'system', 'system', NULL),
(7, '1125', NULL, NULL, 0, '2026-01-26 00:44:31', '2026-01-26 00:44:31', NULL, 0, 'system', 'system', NULL),
(8, '2', NULL, NULL, 0, '2026-01-26 00:47:54', '2026-01-26 00:47:54', NULL, 0, 'system', 'system', NULL),
(9, '3', NULL, NULL, 0, '2026-01-26 01:19:57', '2026-01-26 01:19:57', NULL, 0, 'system', 'system', NULL),
(10, 'assds', NULL, NULL, 0, '2026-01-26 01:50:55', '2026-01-26 01:50:55', NULL, 0, 'system', 'system', NULL),
(11, '37F512000', NULL, NULL, 0, '2026-02-01 01:06:28', '2026-02-01 01:06:28', NULL, 0, 'system', 'system', NULL),
(12, '37F512001', NULL, NULL, 0, '2026-02-01 01:13:41', '2026-02-01 01:13:41', NULL, 0, 'system', 'system', NULL),
(13, '38F512000', NULL, NULL, 0, '2026-02-01 02:42:50', '2026-02-01 02:42:50', NULL, 0, 'system', 'system', NULL),
(14, '111XY312001-000', NULL, NULL, 0, '2026-02-10 04:12:24', '2026-02-10 04:12:24', NULL, 0, 'system', 'system', NULL),
(15, '031FA601222-001', NULL, NULL, 0, '2026-02-10 10:36:02', '2026-02-10 10:36:02', NULL, 0, 'system', 'system', NULL),
(16, '032FA601222-015', NULL, NULL, 0, '2026-02-10 10:43:40', '2026-02-10 10:43:40', NULL, 0, 'system', 'system', NULL),
(17, '554455', NULL, NULL, 0, '2026-02-10 10:48:55', '2026-02-10 10:48:55', NULL, 0, 'system', 'system', NULL);

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
(13, '2026', 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(14, '2026', 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(15, '2026', 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(16, '2026', 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
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
  `codigo` varchar(60) NOT NULL,
  `venta_id` int(11) DEFAULT NULL,
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

INSERT INTO `productos` (`id`, `tipo`, `codigo`, `venta_id`, `produccion_id`, `created_at`, `updated_at`, `deleted_at`, `is_deleted`, `created_by`, `updated_by`, `deleted_by`, `fabricado_por_id`) VALUES
(37, 'BOTA', '111XY7248-2600001', NULL, 2, '2026-02-10 04:19:06', '2026-02-10 04:19:06', NULL, 0, 'system', 'system', NULL, NULL),
(38, 'BOTA', '111XY7652-2600002', NULL, 2, '2026-02-10 04:46:06', '2026-02-10 04:46:06', NULL, 0, 'system', 'system', NULL, NULL),
(39, 'BOTA', '031FA5059-2600003', NULL, 1, '2026-02-10 10:40:13', '2026-02-10 10:40:13', NULL, 0, 'system', 'system', NULL, NULL),
(40, 'BOTA', '032FA5000X2600001', NULL, 1, '2026-02-10 10:54:21', '2026-02-10 10:54:21', NULL, 0, 'system', 'system', NULL, NULL);

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
(37, 42, '2026-02-10 04:19:06', 'system'),
(37, 45, '2026-02-10 04:19:06', 'system'),
(37, 47, '2026-02-10 04:19:06', 'system'),
(37, 48, '2026-02-10 04:19:06', 'system'),
(37, 63, '2026-02-10 04:19:06', 'system'),
(37, 66, '2026-02-10 04:19:06', 'system'),
(37, 72, '2026-02-10 04:19:06', 'system'),
(37, 75, '2026-02-10 04:19:06', 'system'),
(38, 48, '2026-02-10 04:46:06', 'system'),
(38, 52, '2026-02-10 04:46:06', 'system'),
(38, 76, '2026-02-10 04:46:06', 'system'),
(39, 50, '2026-02-10 10:40:13', 'system'),
(39, 59, '2026-02-10 10:40:13', 'system'),
(40, 50, '2026-02-10 10:54:21', 'system');

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
(5, 'BATIDERO MAÑANA', 1, 1, 1, '2025-11-23 16:56:45', NULL, '2026-02-10 04:15:55', NULL, 0, NULL, NULL),
(6, 'BATIDERO TARDE', 1, 1, 1, '2025-11-23 16:56:45', NULL, '2026-02-10 04:15:49', NULL, 0, NULL, NULL),
(7, 'HERRAR', 0, 0, 1, '2025-11-23 16:56:45', NULL, NULL, NULL, 0, NULL, NULL),
(8, 'ARRUÑAR', 0, 0, 1, '2025-11-23 16:56:45', NULL, NULL, NULL, 0, NULL, NULL),
(9, 'COR. FONDO', 1, 1, 1, '2025-11-23 16:56:45', NULL, '2026-02-10 04:15:50', NULL, 0, NULL, NULL),
(10, 'JUNTAR PZS.', 0, 0, 1, '2025-11-23 16:56:45', NULL, NULL, NULL, 0, NULL, NULL),
(11, 'ARRUMAR', 0, 0, 1, '2025-11-23 16:56:45', NULL, NULL, NULL, 0, NULL, NULL),
(12, 'ENGABILLAR', 0, 0, 1, '2025-11-23 16:56:45', NULL, NULL, NULL, 0, NULL, NULL),
(13, 'PULIMENTAR', 1, 1, 1, '2025-11-23 16:56:45', NULL, '2026-02-10 04:15:51', NULL, 0, NULL, NULL),
(14, 'BANDEAR', 0, 0, 1, '2025-11-23 16:56:45', NULL, NULL, NULL, 0, NULL, NULL),
(15, 'LIQUIDO', 0, 0, 1, '2025-11-23 16:56:45', NULL, NULL, NULL, 0, NULL, NULL),
(16, 'LÁSER', 1, 1, 1, '2025-11-23 16:56:45', NULL, '2026-02-10 04:15:53', NULL, 0, NULL, NULL),
(17, 'FONDAR', 0, 0, 1, '2025-11-23 16:56:45', NULL, NULL, NULL, 0, NULL, NULL),
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
  `codigo` varchar(60) NOT NULL,
  `descripcion` varchar(150) NOT NULL,
  `id_material` int(11) NOT NULL,
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

INSERT INTO `tipos_producto` (`id`, `codigo`, `descripcion`, `id_material`, `created_at`, `updated_at`, `deleted_at`, `is_deleted`, `created_by`, `updated_by`, `deleted_by`) VALUES
(1, 'B110', 'Bota 110', 1, '2026-01-25 22:23:44', '2026-01-25 22:23:44', NULL, 0, 'system', 'system', NULL);

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
(22, 2, 14, 2, 0, '2026-02-10 04:12:24', '2026-02-10 04:46:06', NULL, 0, 'system', 'system', NULL),
(23, 1, 15, 1, 1, '2026-02-10 10:36:02', '2026-02-10 10:43:59', NULL, 0, 'system', 'system', NULL),
(24, 1, 16, 1, 0, '2026-02-10 10:43:40', '2026-02-10 10:54:21', NULL, 0, 'system', 'system', NULL),
(25, 1, 17, 1, 0, '2026-02-10 10:48:55', '2026-02-10 10:54:21', NULL, 0, 'system', 'system', NULL);

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
(70, 22, 37, '2026-02-10 04:19:06', '2026-02-10 04:19:06', NULL, 0, 'system', 'system', NULL),
(71, 22, 38, '2026-02-10 04:46:06', '2026-02-10 04:46:06', NULL, 0, 'system', 'system', NULL),
(72, 23, 39, '2026-02-10 10:40:13', '2026-02-10 10:40:13', NULL, 0, 'system', 'system', NULL),
(73, 24, 40, '2026-02-10 10:54:21', '2026-02-10 10:54:21', NULL, 0, 'system', 'system', NULL),
(74, 25, 40, '2026-02-10 10:54:21', '2026-02-10 10:54:21', NULL, 0, 'system', 'system', NULL);

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
(1, 'A11', 3, 10);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
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

INSERT INTO `usuarios` (`id`, `alias`, `nombre`, `clave`, `empleado`, `rol_id`, `created_at`, `updated_at`, `deleted_at`, `is_deleted`, `created_by`, `updated_by`, `deleted_by`) VALUES
(1, 'admin', 'Admin', '$2y$10$lyhm35pbQHiZEDpSHlwCQOkBUy8RQwv/2Mn7KSQodnU7cSMJ6QxMS', 0, 1, '2025-10-25 13:43:49', '2025-11-23 17:05:32', '2025-10-25 23:36:52', 0, 'system', 'system', NULL),
(2, 'rafa', 'Rafael', '$2b$10$nVJMSjwq0c8lKcIqj15LG.K0o7D3Cu/Ttc3JCiCocXIfcXr1koW2W', 0, 2, '2025-10-25 13:43:49', '2025-11-23 17:05:35', NULL, 0, 'system', 'system', NULL),
(3, 'pepe', 'Pepe Sanchez', '$2b$12$e5Hd/HX6dIUk9GqUdWGB0eb3.8YCE2hBjInKdFYWVzv412aoJmE52', 0, 3, '2025-10-25 13:43:49', '2025-11-23 17:05:38', NULL, 0, 'system', 'system', NULL),
(42, 'pedrito', 'PEDRITO', '', 1, NULL, '2025-11-23 16:31:44', '2025-11-23 17:05:23', NULL, 0, 'system', 'system', NULL),
(43, 'calvente', 'CALVENTE', '', 1, NULL, '2025-11-23 16:31:44', '2025-11-23 17:05:23', NULL, 0, 'system', 'system', NULL),
(44, 'j.carlos', 'J.CARLOS', '', 1, NULL, '2025-11-23 16:31:44', '2025-11-23 17:05:23', NULL, 0, 'system', 'system', NULL),
(45, 'perez', 'PEREZ', '', 1, NULL, '2025-11-23 16:31:44', '2025-11-23 17:05:23', NULL, 0, 'system', 'system', NULL),
(46, 'jose luis', 'JOSE LUIS', '', 1, NULL, '2025-11-23 16:31:44', '2025-11-23 17:05:23', NULL, 0, 'system', 'system', NULL),
(47, 'giraldo', 'GIRALDO', '', 1, NULL, '2025-11-23 16:31:44', '2025-11-23 17:05:23', NULL, 0, 'system', 'system', NULL),
(48, 'adrian', 'ADRIAN', '', 1, NULL, '2025-11-23 16:31:44', '2025-11-23 17:05:23', NULL, 0, 'system', 'system', NULL),
(49, 'manuel', 'MANUEL', '', 1, NULL, '2025-11-23 16:31:44', '2025-11-23 17:05:23', NULL, 0, 'system', 'system', NULL),
(50, 'jony', 'JONY', '', 1, NULL, '2025-11-23 16:31:44', '2025-11-23 17:05:23', NULL, 0, 'system', 'system', NULL),
(51, 'jesus', 'JESUS', '', 1, NULL, '2025-11-23 16:31:44', '2025-11-23 17:05:23', NULL, 0, 'system', 'system', NULL),
(52, 'rujano', 'RUJANO', '', 1, NULL, '2025-11-23 16:31:44', '2025-11-23 17:05:23', NULL, 0, 'system', 'system', NULL),
(53, 'clavijo', 'CLAVIJO', '', 1, NULL, '2025-11-23 16:31:44', '2025-11-23 17:05:23', NULL, 0, 'system', 'system', NULL),
(54, 'lauren', 'LAUREN', '', 1, NULL, '2025-11-23 16:31:44', '2025-11-23 17:05:23', NULL, 0, 'system', 'system', NULL),
(55, 'fran', 'FRAN', '', 1, NULL, '2025-11-23 16:31:44', '2025-11-23 17:05:23', NULL, 0, 'system', 'system', NULL),
(56, 'parra', 'PARRA', '', 1, NULL, '2025-11-23 16:31:44', '2025-11-23 17:05:23', NULL, 0, 'system', 'system', NULL),
(57, 'juan jose', 'JUAN JOSE', '', 1, NULL, '2025-11-23 16:31:44', '2025-11-23 17:05:23', NULL, 0, 'system', 'system', NULL),
(58, 'martin', 'MARTIN', '', 1, NULL, '2025-11-23 16:31:44', '2025-11-23 17:05:23', NULL, 0, 'system', 'system', NULL),
(59, 'melero', 'MELERO', '', 1, NULL, '2025-11-23 16:31:44', '2025-11-23 17:05:23', NULL, 0, 'system', 'system', NULL),
(60, 'nono', 'NONO', '', 1, NULL, '2025-11-23 16:31:44', '2025-11-23 17:05:23', NULL, 0, 'system', 'system', NULL),
(61, 'jose fco', 'JOSE FCO', '', 1, NULL, '2025-11-23 16:31:44', '2025-11-23 17:05:23', NULL, 0, 'system', 'system', NULL),
(62, 'muñoz', 'MUÑOZ', '', 1, NULL, '2025-11-23 16:31:44', '2025-11-23 17:05:23', NULL, 0, 'system', 'system', NULL),
(63, 'corral', 'CORRAL', '', 1, NULL, '2025-11-23 16:31:44', '2025-11-23 17:05:23', NULL, 0, 'system', 'system', NULL),
(64, 'diaz', 'DIAZ', '', 1, NULL, '2025-11-23 16:31:44', '2025-11-23 17:05:23', NULL, 0, 'system', 'system', NULL),
(65, 'j.alberto', 'J.ALBERTO', '', 1, NULL, '2025-11-23 16:31:44', '2025-11-23 17:05:23', NULL, 0, 'system', 'system', NULL),
(66, 'torres', 'TORRES', '', 1, NULL, '2025-11-23 16:31:44', '2025-11-23 17:05:23', NULL, 0, 'system', 'system', NULL),
(67, 'angel', 'ANGEL', '', 1, NULL, '2025-11-23 16:31:44', '2025-11-23 17:05:23', NULL, 0, 'system', 'system', NULL),
(68, 'luis', 'LUIS', '', 1, NULL, '2025-11-23 16:31:44', '2025-11-23 17:05:23', NULL, 0, 'system', 'system', NULL),
(69, 'mancilla', 'MANCILLA', '', 1, NULL, '2025-11-23 16:31:44', '2025-11-23 17:05:23', NULL, 0, 'system', 'system', NULL),
(70, 'juanito', 'JUANITO', '', 1, NULL, '2025-11-23 16:31:44', '2025-11-23 17:05:23', NULL, 0, 'system', 'system', NULL),
(71, 'j.antonio', 'J.ANTONIO', '', 1, NULL, '2025-11-23 16:31:44', '2025-11-23 17:05:23', NULL, 0, 'system', 'system', NULL),
(72, 'adri', 'ADRI', '', 1, NULL, '2025-11-23 16:31:44', '2025-11-23 17:05:23', NULL, 0, 'system', 'system', NULL),
(73, 'paco', 'PACO', '', 1, NULL, '2025-11-23 16:31:44', '2025-11-23 17:05:23', NULL, 0, 'system', 'system', NULL),
(74, 'miguelon', 'MIGUELON', '', 1, NULL, '2025-11-23 16:31:44', '2025-11-23 17:05:23', NULL, 0, 'system', 'system', NULL),
(75, 'julio', 'JULIO', '', 1, NULL, '2025-11-23 16:31:44', '2025-11-23 17:05:23', NULL, 0, 'system', 'system', NULL),
(76, 'jose', 'JOSE', '', 1, NULL, '2025-11-23 16:31:44', '2025-11-23 17:05:23', NULL, 0, 'system', 'system', NULL),
(77, 'jose mari', 'JOSE MARI', '', 1, NULL, '2025-11-23 16:31:44', '2025-11-23 17:05:23', NULL, 0, 'system', 'system', NULL);

--
-- Índices para tablas volcadas
--

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
  ADD KEY `fk_botas_estados` (`estado`);

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
  ADD KEY `fk_lineas_fabricacion_estados` (`estado`);

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
  ADD KEY `fk_ordenes_fabricacion_clientes` (`cliente_id`),
  ADD KEY `fk_ordenes_fabricacion_estados` (`estado`);

--
-- Indices de la tabla `palets`
--
ALTER TABLE `palets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_palets_ubicaciones` (`ubicacion_id`),
  ADD KEY `fk_palets_lineas_entrada` (`linea_entrada_id`);

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
  ADD KEY `idx_productos_venta` (`venta_id`),
  ADD KEY `idx_productos_produccion` (`produccion_id`);

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
  ADD UNIQUE KEY `codigo` (`codigo`),
  ADD KEY `fk_tipos_producto_materiales` (`id_material`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT de la tabla `cuadrantes`
--
ALTER TABLE `cuadrantes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `cuadrante_detalles`
--
ALTER TABLE `cuadrante_detalles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=117;

--
-- AUTO_INCREMENT de la tabla `duelas`
--
ALTER TABLE `duelas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `entradas`
--
ALTER TABLE `entradas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `ordenes_fabricacion`
--
ALTER TABLE `ordenes_fabricacion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `palets`
--
ALTER TABLE `palets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `trazabilidad_fabricacion`
--
ALTER TABLE `trazabilidad_fabricacion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT de la tabla `trazabilidad_procesado`
--
ALTER TABLE `trazabilidad_procesado`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `trazabilidad_producto`
--
ALTER TABLE `trazabilidad_producto`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=75;

--
-- AUTO_INCREMENT de la tabla `ubicaciones`
--
ALTER TABLE `ubicaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

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
  ADD CONSTRAINT `fk_botas_estados` FOREIGN KEY (`estado`) REFERENCES `estados` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_botas_fondo` FOREIGN KEY (`fondo_producto_id`) REFERENCES `productos` (`id`) ON UPDATE CASCADE,
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
  ADD CONSTRAINT `fk_lineas_fabricacion_estados` FOREIGN KEY (`estado`) REFERENCES `estados` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_lineas_fabricacion_ordenes` FOREIGN KEY (`orden_id`) REFERENCES `ordenes_fabricacion` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_lineas_fabricacion_tipos` FOREIGN KEY (`tipo_producto_id`) REFERENCES `tipos_producto` (`id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `ordenes_fabricacion`
--
ALTER TABLE `ordenes_fabricacion`
  ADD CONSTRAINT `fk_ordenes_fabricacion_clientes` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_ordenes_fabricacion_estados` FOREIGN KEY (`estado`) REFERENCES `estados` (`id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `palets`
--
ALTER TABLE `palets`
  ADD CONSTRAINT `fk_palets_lineas_entrada` FOREIGN KEY (`linea_entrada_id`) REFERENCES `lineas_entrada` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_palets_ubicaciones` FOREIGN KEY (`ubicacion_id`) REFERENCES `ubicaciones` (`id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `plan_camiones`
--
ALTER TABLE `plan_camiones`
  ADD CONSTRAINT `fk_plan_camiones_proveedores` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores` (`id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `productos_operarios`
--
ALTER TABLE `productos_operarios`
  ADD CONSTRAINT `fk_productos_operarios_producto` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_productos_operarios_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `tipos_producto`
--
ALTER TABLE `tipos_producto`
  ADD CONSTRAINT `fk_tipos_producto_materiales` FOREIGN KEY (`id_material`) REFERENCES `materiales` (`id`) ON UPDATE CASCADE;

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
