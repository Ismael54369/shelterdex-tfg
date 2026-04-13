-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 10-04-2026 a las 10:36:00
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
-- Base de datos: `shelterdex_db`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `animales`
--

CREATE TABLE `animales` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `especie` varchar(30) NOT NULL,
  `edad` varchar(20) DEFAULT NULL,
  `peso` varchar(20) DEFAULT NULL,
  `energia` int(11) DEFAULT 50,
  `sociabilidad` int(11) DEFAULT 50,
  `emoji` varchar(10) DEFAULT '?',
  `descripcion` text DEFAULT NULL,
  `estado` varchar(30) DEFAULT 'Refugio'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `animales`
--

INSERT INTO `animales` (`id`, `nombre`, `especie`, `edad`, `peso`, `energia`, `sociabilidad`, `emoji`, `descripcion`, `estado`) VALUES
(1, 'Rex', 'Perro', '3 años', '25 kg', 80, 60, '🐶', 'Rex es un perro muy enérgico. Le encantan los paseos largos y jugar a la pelota. Ideal para familias activas.', 'Refugio'),
(2, 'Luna', 'Gato', '1 año', '4 kg', 40, 90, '🐱', 'Luna es muy cariñosa y tranquila. Disfruta de las siestas al sol y de los mimos en el sofá.', 'Acogida'),
(3, 'Toby', 'Perro', '5 meses', '8 kg', 95, 50, '🐕', 'Un cachorro curioso que está aprendiendo a socializar. Necesita paciencia y mucho amor.', 'Adoptado'),
(5, 'Manolin', 'Perro', '2 meses', '7 kg', 50, 50, '🐾', 'Perro muy jugueton, enérgico y muy cariñoso', 'Refugio');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `catalogo_tareas`
--

CREATE TABLE `catalogo_tareas` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `recompensa_xp` int(11) NOT NULL,
  `frecuencia` enum('diaria','semanal') DEFAULT 'diaria'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `catalogo_tareas`
--

INSERT INTO `catalogo_tareas` (`id`, `nombre`, `recompensa_xp`, `frecuencia`) VALUES
(1, 'Alimentación y agua', 10, 'diaria'),
(2, 'Paseo estándar', 15, 'diaria'),
(3, 'Limpieza de recinto', 20, 'diaria'),
(4, 'Baño y cepillado', 50, 'semanal'),
(5, 'Entrenamiento de obediencia', 80, 'semanal');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `registro_tareas`
--

CREATE TABLE `registro_tareas` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `animal_id` int(11) NOT NULL,
  `tarea_id` int(11) NOT NULL,
  `estado` enum('pendiente','aprobada','rechazada') DEFAULT 'pendiente',
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `rol` varchar(20) DEFAULT 'voluntario',
  `xp` int(11) DEFAULT 0,
  `nivel` int(11) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `email`, `password`, `rol`, `xp`, `nivel`) VALUES
(1, 'admin', 'admin@shelterdex.es', '$2b$10$jaxDpHk5fn8WyCNoLb7wPuvSzmxV8YZg6P/vrEirZYAegZslfdPbq', 'admin', 0, 1),
(2, 'Ash ', 'ash@pueblopaleta.com', '$2b$10$zVmfAYrBuk.SPsgTRa9vmOCDyVDBwXaNQ8YY/hNhL00tzplU8AuJa', 'voluntario', 0, 1),
(3, 'Gary Oak', 'gary@pueblopaleta.com', '$2b$10$fi6M9TrO0Ed/NLQjKDymU.JuTbIlVUOvZx3BO17VtkAFHui8cF69G', 'voluntario', 30, 1),
(4, 'Ismael Gonzalez', 'ismael@gmail.com', '$2b$10$ImknpNYbgPdS1ppHWUZQ3.idUY9Sdj9hjUCC05deTmEX8fBsuia9G', 'voluntario', 350, 3);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `animales`
--
ALTER TABLE `animales`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `catalogo_tareas`
--
ALTER TABLE `catalogo_tareas`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `registro_tareas`
--
ALTER TABLE `registro_tareas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `animal_id` (`animal_id`),
  ADD KEY `tarea_id` (`tarea_id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `animales`
--
ALTER TABLE `animales`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `catalogo_tareas`
--
ALTER TABLE `catalogo_tareas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `registro_tareas`
--
ALTER TABLE `registro_tareas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `registro_tareas`
--
ALTER TABLE `registro_tareas`
  ADD CONSTRAINT `registro_tareas_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `registro_tareas_ibfk_2` FOREIGN KEY (`animal_id`) REFERENCES `animales` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `registro_tareas_ibfk_3` FOREIGN KEY (`tarea_id`) REFERENCES `catalogo_tareas` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
