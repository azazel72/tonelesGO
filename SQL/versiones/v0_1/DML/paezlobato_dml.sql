-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 10-12-2025 a las 09:45:09
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
(8, '2026-02-19', '2026-02-25', '', '', '2025-12-10 04:29:17', NULL, NULL, NULL, 0, NULL, NULL);

--
-- Volcado de datos para la tabla `cuadrante_detalles`
--

INSERT INTO `cuadrante_detalles` (`id`, `cuadrante_id`, `fecha`, `puesto_id`, `usuario_id`, `orden_en_puesto`, `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted`, `deleted_at`, `deleted_by`) VALUES
(1, 4, '2025-12-04', 3, 71, 1, '2025-12-10 04:39:37', NULL, NULL, NULL, 0, NULL, NULL),
(2, 4, '2025-12-04', 5, 57, 1, '2025-12-10 04:40:02', NULL, NULL, NULL, 0, NULL, NULL),
(3, 4, '2025-12-04', 2, 55, 1, '2025-12-10 04:42:03', NULL, NULL, NULL, 0, NULL, NULL),
(4, 4, '2025-12-04', 7, 75, 1, '2025-12-10 04:42:45', NULL, NULL, NULL, 0, NULL, NULL),
(5, 4, '2025-12-04', 8, 69, 1, '2025-12-10 04:42:47', NULL, NULL, NULL, 0, NULL, NULL),
(6, 4, '2025-12-04', 9, 59, 1, '2025-12-10 04:42:49', NULL, NULL, NULL, 0, NULL, NULL),
(7, 4, '2025-12-04', 3, 47, 1, '2025-12-10 04:55:32', NULL, NULL, NULL, 0, NULL, NULL),
(8, 4, '2025-12-04', 2, 53, 1, '2025-12-10 04:55:34', NULL, NULL, NULL, 0, NULL, NULL),
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
(19, 4, '2025-12-05', 3, 69, 1, '2025-12-10 04:55:54', NULL, NULL, NULL, 0, NULL, NULL),
(20, 4, '2025-12-05', 7, 59, 1, '2025-12-10 04:55:56', NULL, NULL, NULL, 0, NULL, NULL),
(21, 4, '2025-12-05', 7, 74, 1, '2025-12-10 04:55:58', NULL, NULL, NULL, 0, NULL, NULL),
(22, 4, '2025-12-08', 7, 58, 1, '2025-12-10 04:55:59', NULL, NULL, NULL, 0, NULL, NULL),
(23, 4, '2025-12-10', 7, 58, 1, '2025-12-10 04:56:01', NULL, NULL, NULL, 0, NULL, NULL),
(24, 4, '2025-12-09', 7, 58, 1, '2025-12-10 04:56:04', NULL, NULL, NULL, 0, NULL, NULL),
(25, 4, '2025-12-08', 7, 69, 1, '2025-12-10 04:56:05', NULL, NULL, NULL, 0, NULL, NULL),
(26, 4, '2025-12-09', 7, 69, 1, '2025-12-10 04:56:07', NULL, NULL, NULL, 0, NULL, NULL),
(27, 4, '2025-12-10', 7, 69, 1, '2025-12-10 04:56:08', NULL, NULL, NULL, 0, NULL, NULL),
(28, 4, '2025-12-05', 7, 60, 1, '2025-12-10 04:56:12', NULL, NULL, NULL, 0, NULL, NULL),
(29, 4, '2025-12-05', 8, 42, 1, '2025-12-10 04:56:19', NULL, NULL, NULL, 0, NULL, NULL),
(30, 4, '2025-12-08', 8, 45, 1, '2025-12-10 04:56:20', NULL, NULL, NULL, 0, NULL, NULL),
(31, 4, '2025-12-08', 7, 56, 1, '2025-12-10 04:56:22', NULL, NULL, NULL, 0, NULL, NULL),
(32, 4, '2025-12-08', 7, 62, 1, '2025-12-10 04:56:24', NULL, NULL, NULL, 0, NULL, NULL),
(33, 4, '2025-12-04', 11, 51, 1, '2025-12-10 04:58:01', NULL, NULL, NULL, 0, NULL, NULL),
(34, 4, '2025-12-08', 4, 46, 1, '2025-12-10 05:07:23', NULL, NULL, NULL, 0, NULL, NULL),
(35, 4, '2025-12-04', 13, 66, 1, '2025-12-10 05:07:40', NULL, NULL, NULL, 0, NULL, NULL),
(36, 4, '2025-12-04', 1, 47, 1, '2025-12-10 09:44:43', NULL, NULL, NULL, 0, NULL, NULL);

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

--
-- Volcado de datos para la tabla `instalaciones`
--

INSERT INTO `instalaciones` (`id`, `nombre`, `tipo`) VALUES
(1, 'Taller nuevo', ''),
(2, 'Taller viejo', 'M'),
(3, 'Sta Lucia', 'B'),
(4, 'Paez Morilla', 'M');

--
-- Volcado de datos para la tabla `plan_camiones`
--

INSERT INTO `plan_camiones` (`id`, `año`, `proveedor_id`, `total_pactados`, `total_descontar`, `ene_previsto`, `ene_confirmado`, `feb_previsto`, `feb_confirmado`, `mar_previsto`, `mar_confirmado`, `abr_previsto`, `abr_confirmado`, `may_previsto`, `may_confirmado`, `jun_previsto`, `jun_confirmado`, `jul_previsto`, `jul_confirmado`, `ago_previsto`, `ago_confirmado`, `sep_previsto`, `sep_confirmado`, `oct_previsto`, `oct_confirmado`, `nov_previsto`, `nov_confirmado`, `dic_previsto`, `dic_confirmado`) VALUES
(1, '2025', 1, 9, 3, 2, 2, 2, 0, 10, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(2, '2025', 6, 0, 0, 0, 0, 0, 0, 0, 0, 8, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(3, '2025', 7, 0, 0, 3, 0, 0, 2, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(4, '2025', 8, 0, 0, 0, 2, 0, 1, 0, 15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(5, '2025', 2, 10, 6, 2, 0, 0, 0, 3, 3, 0, 0, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(6, '2025', 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(7, '2025', 3, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(8, '2025', 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 0, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(9, '2025', 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 35, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
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

--
-- Volcado de datos para la tabla `plan_facturacion`
--

INSERT INTO `plan_facturacion` (`id`, `año`, `enero`, `febrero`, `marzo`, `abril`, `mayo`, `junio`, `julio`, `agosto`, `septiembre`, `octubre`, `noviembre`, `diciembre`) VALUES
(1, '2025', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00);

--
-- Volcado de datos para la tabla `plan_material`
--

INSERT INTO `plan_material` (`id`, `año`, `tipo_material`, `total_pactados`, `total_descontar`, `enero`, `febrero`, `marzo`, `abril`, `mayo`, `junio`, `julio`, `agosto`, `septiembre`, `octubre`, `noviembre`, `diciembre`) VALUES
(1, '2025', 'FLEJE', 0, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(2, '2025', 'REMACHES', 0, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(3, '2025', 'PUNTAFITAS', 0, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00);

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

--
-- Volcado de datos para la tabla `puestos_trabajo`
--

INSERT INTO `puestos_trabajo` (`id`, `nombre`, `es_maquinaria`, `activo`, `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted`, `deleted_at`, `deleted_by`) VALUES
(1, 'LABRAR', 0, 1, '2025-11-23 16:56:45', NULL, NULL, NULL, 0, NULL, NULL),
(2, 'COR. FLEJE', 0, 1, '2025-11-23 16:56:45', NULL, '2025-11-23 19:09:48', NULL, 0, NULL, NULL),
(3, 'JUNTAR', 0, 1, '2025-11-23 16:56:45', NULL, NULL, NULL, 0, NULL, NULL),
(4, 'LEVANTAR', 0, 1, '2025-11-23 16:56:45', NULL, NULL, NULL, 0, NULL, NULL),
(5, 'BATIDERO MAÑANA', 1, 1, '2025-11-23 16:56:45', NULL, NULL, NULL, 0, NULL, NULL),
(6, 'BATIDERO TARDE', 1, 1, '2025-11-23 16:56:45', NULL, NULL, NULL, 0, NULL, NULL),
(7, 'HERRAR', 0, 1, '2025-11-23 16:56:45', NULL, NULL, NULL, 0, NULL, NULL),
(8, 'ARRUÑAR', 0, 1, '2025-11-23 16:56:45', NULL, NULL, NULL, 0, NULL, NULL),
(9, 'COR. FONDO', 1, 1, '2025-11-23 16:56:45', NULL, NULL, NULL, 0, NULL, NULL),
(10, 'JUNTAR PZS.', 0, 1, '2025-11-23 16:56:45', NULL, NULL, NULL, 0, NULL, NULL),
(11, 'ARRUMAR', 0, 1, '2025-11-23 16:56:45', NULL, NULL, NULL, 0, NULL, NULL),
(12, 'ENGABILLAR', 0, 1, '2025-11-23 16:56:45', NULL, NULL, NULL, 0, NULL, NULL),
(13, 'PULIMENTAR', 1, 1, '2025-11-23 16:56:45', NULL, NULL, NULL, 0, NULL, NULL),
(14, 'BANDEAR', 0, 1, '2025-11-23 16:56:45', NULL, NULL, NULL, 0, NULL, NULL),
(15, 'LIQUIDO', 0, 1, '2025-11-23 16:56:45', NULL, NULL, NULL, 0, NULL, NULL),
(16, 'LÁSER', 1, 1, '2025-11-23 16:56:45', NULL, NULL, NULL, 0, NULL, NULL),
(17, 'FONDAR', 0, 1, '2025-11-23 16:56:45', NULL, NULL, NULL, 0, NULL, NULL),
(18, 'COMODIN', 0, 1, '2025-11-23 16:56:45', NULL, NULL, NULL, 0, NULL, NULL),
(19, 'TALLER VIEJO', 0, 1, '2025-11-23 16:56:45', NULL, NULL, NULL, 0, NULL, NULL);

--
-- Volcado de datos para la tabla `roles`
--

INSERT INTO `roles` (`id`, `nombre`, `planificacion`, `recepcion`, `ubicacion`, `fabricacion`, `expedicion`, `trazabilidad`, `administrador`) VALUES
(1, 'admin', 1, 1, 1, 1, 1, 1, 1),
(2, 'gestor', 1, 1, 1, 1, 1, 1, 0),
(3, 'operario', 0, 1, 1, 1, 1, 0, 0);

--
-- Volcado de datos para la tabla `ubicaciones`
--

INSERT INTO `ubicaciones` (`id`, `descripcion`, `instalacion_id`, `orden`) VALUES
(1, 'A11', 3, 10);

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
