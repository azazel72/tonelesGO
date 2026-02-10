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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estados`
--

CREATE TABLE `estados` (
  `id` int(11) NOT NULL,
  `descripcion` varchar(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `instalaciones`
--

CREATE TABLE `instalaciones` (
  `id` int(11) NOT NULL,
  `nombre` varchar(60) NOT NULL,
  `tipo` varchar(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `proveedores`
--

CREATE TABLE `proveedores` (
  `id` int(11) NOT NULL,
  `nombre` varchar(128) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `puestos_trabajo`
--

CREATE TABLE `puestos_trabajo` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `es_maquinaria` tinyint(1) NOT NULL DEFAULT 0,
  `fabricacion` tinyint(1) NOT NULL DEFAULT 0,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `created_by` varchar(50) DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  `updated_by` varchar(50) DEFAULT NULL,
  `deleted` tinyint(1) NOT NULL DEFAULT 0,
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
-- Índices para tablas volcadas
--

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
-- AUTO_INCREMENT de la tabla `clientes`
--
ALTER TABLE `clientes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT de la tabla `cuadrantes`
--
ALTER TABLE `cuadrantes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `cuadrante_detalles`
--
ALTER TABLE `cuadrante_detalles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

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
-- Filtros para la tabla `cuadrante_detalles`
--
ALTER TABLE `cuadrante_detalles`
  ADD CONSTRAINT `fk_cd_cuadrante` FOREIGN KEY (`cuadrante_id`) REFERENCES `cuadrantes` (`id`),
  ADD CONSTRAINT `fk_cd_puesto` FOREIGN KEY (`puesto_id`) REFERENCES `puestos_trabajo` (`id`),
  ADD CONSTRAINT `fk_cd_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

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
  `deleted_by` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
-- Estructura de tabla para la tabla `trazabilidad_fabricacion`
--

CREATE TABLE `trazabilidad_fabricacion` (
  `id` int(11) NOT NULL,
  `linea_fabricacion_id` int(11) NOT NULL,
  `palet_id` int(11) NOT NULL,
  `cantidad_fabricada` int(11) NOT NULL DEFAULT 0,
  `estado` smallint NOT NULL DEFAULT 0,
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

--
-- Indices de la tabla `materiales`
--
ALTER TABLE `materiales`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `descripcion` (`descripcion`);

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
-- Indices de la tabla `lineas_entrada`
--
ALTER TABLE `lineas_entrada`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_lineas_entrada_entradas` (`entrada_id`),
  ADD KEY `fk_lineas_entrada_duelas` (`duela_id`);

--
-- Indices de la tabla `palets`
--
ALTER TABLE `palets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_palets_lineas` (`linea_entrada_id`),
  ADD KEY `fk_palets_ubicaciones` (`ubicacion_id`);

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
-- Indices de la tabla `archivos_subidos`
--
ALTER TABLE `archivos_subidos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_archivos_subidos_entidad` (`entidad`,`entidad_id`);

--
-- Indices de la tabla `ordenes_fabricacion`
--
ALTER TABLE `ordenes_fabricacion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_ordenes_fabricacion_clientes` (`cliente_id`),
  ADD KEY `fk_ordenes_fabricacion_estados` (`estado`);

--
-- Indices de la tabla `tipos_producto`
--
ALTER TABLE `tipos_producto`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`),
  ADD KEY `fk_tipos_producto_materiales` (`id_material`);

--
-- Indices de la tabla `lineas_fabricacion`
--
ALTER TABLE `lineas_fabricacion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_lineas_fabricacion_ordenes` (`orden_id`),
  ADD KEY `fk_lineas_fabricacion_tipos` (`tipo_producto_id`),
  ADD KEY `fk_lineas_fabricacion_estados` (`estado`);

--
-- Indices de la tabla `trazabilidad_procesado`
--
ALTER TABLE `trazabilidad_procesado`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_trazabilidad_procesado_origen` (`palet_origen_id`),
  ADD KEY `fk_trazabilidad_procesado_destino` (`palet_destino_id`);

--
-- Indices de la tabla `trazabilidad_fabricacion`
--
ALTER TABLE `trazabilidad_fabricacion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_trazabilidad_fabricacion_linea` (`linea_fabricacion_id`),
  ADD KEY `fk_trazabilidad_fabricacion_palet` (`palet_id`),
  ADD UNIQUE KEY `uk_trazabilidad_fabricacion_linea_palet` (`linea_fabricacion_id`,`palet_id`);

--
-- Indices de la tabla `trazabilidad_producto`
--
ALTER TABLE `trazabilidad_producto`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_trazabilidad_producto_fabricacion` (`trazabilidad_fabricacion_id`),
  ADD KEY `fk_trazabilidad_producto_producto` (`producto_id`);

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
-- AUTO_INCREMENT de las tablas volcadas
--
ALTER TABLE `materiales`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `duelas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `entradas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `lineas_entrada`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `palets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `productos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `archivos_subidos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ordenes_fabricacion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `tipos_producto`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `lineas_fabricacion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `trazabilidad_procesado`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `trazabilidad_fabricacion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `trazabilidad_producto`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `botas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--
ALTER TABLE `duelas`
  ADD CONSTRAINT `fk_duelas_materiales` FOREIGN KEY (`material_id`) REFERENCES `materiales` (`id`) ON UPDATE CASCADE;

ALTER TABLE `entradas`
  ADD CONSTRAINT `fk_entradas_proveedores` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores` (`id`) ON UPDATE CASCADE;

ALTER TABLE `lineas_entrada`
  ADD CONSTRAINT `fk_lineas_entrada_entradas` FOREIGN KEY (`entrada_id`) REFERENCES `entradas` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_lineas_entrada_duelas` FOREIGN KEY (`duela_id`) REFERENCES `duelas` (`id`) ON UPDATE CASCADE;

ALTER TABLE `palets`
  ADD CONSTRAINT `fk_palets_lineas` FOREIGN KEY (`linea_entrada_id`) REFERENCES `lineas_entrada` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_palets_ubicaciones` FOREIGN KEY (`ubicacion_id`) REFERENCES `ubicaciones` (`id`) ON UPDATE CASCADE;

--
-- Ajuste para permitir NULL en palets (si la tabla ya existe)
--
ALTER TABLE `palets`
  MODIFY `linea_entrada_id` int(11) NULL,
  MODIFY `ubicacion_id` int(11) NULL;

--
-- Ajuste estado en trazabilidad_fabricacion (si la tabla ya existe)
--
ALTER TABLE `trazabilidad_fabricacion`
  MODIFY `estado` smallint NOT NULL DEFAULT 0;

--
-- Ajuste fabricado_por_id en productos (si la tabla ya existe)
--
-- Eliminado: fabricado_por_id ahora se gestiona en productos_operarios

ALTER TABLE `ordenes_fabricacion`
  ADD CONSTRAINT `fk_ordenes_fabricacion_clientes` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_ordenes_fabricacion_estados` FOREIGN KEY (`estado`) REFERENCES `estados` (`id`) ON UPDATE CASCADE;

ALTER TABLE `tipos_producto`
  ADD CONSTRAINT `fk_tipos_producto_materiales` FOREIGN KEY (`id_material`) REFERENCES `materiales` (`id`) ON UPDATE CASCADE;

ALTER TABLE `lineas_fabricacion`
  ADD CONSTRAINT `fk_lineas_fabricacion_ordenes` FOREIGN KEY (`orden_id`) REFERENCES `ordenes_fabricacion` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_lineas_fabricacion_tipos` FOREIGN KEY (`tipo_producto_id`) REFERENCES `tipos_producto` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_lineas_fabricacion_estados` FOREIGN KEY (`estado`) REFERENCES `estados` (`id`) ON UPDATE CASCADE;

ALTER TABLE `trazabilidad_procesado`
  ADD CONSTRAINT `fk_trazabilidad_procesado_origen` FOREIGN KEY (`palet_origen_id`) REFERENCES `palets` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_trazabilidad_procesado_destino` FOREIGN KEY (`palet_destino_id`) REFERENCES `palets` (`id`) ON UPDATE CASCADE;

ALTER TABLE `trazabilidad_fabricacion`
  ADD CONSTRAINT `fk_trazabilidad_fabricacion_linea` FOREIGN KEY (`linea_fabricacion_id`) REFERENCES `lineas_fabricacion` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_trazabilidad_fabricacion_palet` FOREIGN KEY (`palet_id`) REFERENCES `palets` (`id`) ON UPDATE CASCADE;

ALTER TABLE `trazabilidad_producto`
  ADD CONSTRAINT `fk_trazabilidad_producto_fabricacion` FOREIGN KEY (`trazabilidad_fabricacion_id`) REFERENCES `trazabilidad_fabricacion` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_trazabilidad_producto_producto` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON UPDATE CASCADE;

ALTER TABLE `productos_operarios`
  ADD CONSTRAINT `fk_productos_operarios_producto` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_productos_operarios_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON UPDATE CASCADE;

ALTER TABLE `botas`
  ADD CONSTRAINT `fk_botas_vaso` FOREIGN KEY (`vaso_producto_id`) REFERENCES `productos` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_botas_fondo` FOREIGN KEY (`fondo_producto_id`) REFERENCES `productos` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_botas_tapa` FOREIGN KEY (`tapa_producto_id`) REFERENCES `productos` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_botas_estados` FOREIGN KEY (`estado`) REFERENCES `estados` (`id`) ON UPDATE CASCADE;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
