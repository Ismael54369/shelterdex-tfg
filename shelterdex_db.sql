-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 15-04-2026 a las 16:30:17
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
  `imagen` varchar(255) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `estado` varchar(30) DEFAULT 'Refugio'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `animales`
--

INSERT INTO `animales` (`id`, `nombre`, `especie`, `edad`, `peso`, `energia`, `sociabilidad`, `emoji`, `imagen`, `descripcion`, `estado`) VALUES
(1, 'Rex', 'Perro', '3 años', '25 kg', 80, 60, '🐶', '/uploads/1776155576848.jpg', 'Rex es un perro muy enérgico. Le encantan los paseos largos y jugar a la pelota. Ideal para familias activas.', 'Refugio'),
(2, 'Luna', 'Gato', '1 año', '4 kg', 40, 90, '🐱', '/uploads/1776158673626.png', 'Luna es muy cariñosa y tranquila. Disfruta de las siestas al sol y de los mimos en el sofá.', 'Acogida'),
(3, 'Toby', 'Perro', '5 meses', '8 kg', 95, 50, '🐕', '/uploads/1776168190240.png', 'Un cachorro curioso que está aprendiendo a socializar. Necesita paciencia y mucho amor.', 'Adoptado'),
(5, 'Manolin', 'Perro', '2 meses', '7 kg', 50, 50, '🐾', '/uploads/1776159061826.png', 'Perro muy jugueton, enérgico y muy cariñoso', 'Refugio'),
(6, 'Rio', 'Otro', '5 años', '3 kg', 50, 50, '🦜', '/uploads/1776246506321.png', 'Loro que sabe hablar y entrenado para resolver puzzles, aunque es tímido es bastante cariñoso', 'Refugio'),
(7, 'Garfield', 'Gato', '7 años', '6 kg', 50, 50, '🐾', '/uploads/1776247203408.png', 'Gato senior, tranquilo y con visión reducida. Busca un hogar sin grandes sobresaltos donde pueda disfrutar de su jubilación. Se adapta rápido si se le habla con cariño y se le guía con paciencia.', 'Refugio'),
(8, 'Jamon', 'Perro', '1 año', '15 kg', 50, 50, '🐾', '/uploads/1776252984055.png', 'Al ser un cruce, tiene lo mejor de varios mundos: es resistente, original y muy adaptable. Está en la edad perfecta para ser entrenado, ya que conserva la curiosidad de un cachorro pero con mayor capacidad de enfoque. Busca un hogar donde le den estructura, ejercicio y, sobre todo, mucho cariño.', 'Refugio'),
(9, 'Firu', 'Perro', '9 meses', '7 kg', 50, 50, '🐾', '/uploads/1776254095201.png', 'Es el perro ideal para adoptantes primerizos: tiene la salud y juventud de un perro joven, pero con una personalidad pausada y atenta. Aprende rápido porque es muy centrado y busca siempre agradar. Un compañero fiel que prefiere las caricias a las travesuras.', 'Refugio');

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
-- Estructura de tabla para la tabla `imagenes_animales`
--

CREATE TABLE `imagenes_animales` (
  `id` int(11) NOT NULL,
  `animal_id` int(11) NOT NULL,
  `ruta` varchar(255) NOT NULL,
  `es_portada` tinyint(1) DEFAULT 0,
  `fecha_subida` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `imagenes_animales`
--

INSERT INTO `imagenes_animales` (`id`, `animal_id`, `ruta`, `es_portada`, `fecha_subida`) VALUES
(1, 1, '/uploads/1776155190624.png', 0, '2026-04-14 08:26:30'),
(2, 1, '/uploads/1776155190630.png', 0, '2026-04-14 08:26:30'),
(3, 1, '/uploads/1776155190652.png', 0, '2026-04-14 08:26:30'),
(4, 1, '/uploads/1776155190659.png', 0, '2026-04-14 08:26:30'),
(5, 1, '/uploads/1776155576848.jpg', 1, '2026-04-14 08:32:56'),
(6, 2, '/uploads/1776158673612.png', 0, '2026-04-14 09:24:33'),
(7, 2, '/uploads/1776158673617.png', 0, '2026-04-14 09:24:33'),
(8, 2, '/uploads/1776158673621.png', 0, '2026-04-14 09:24:33'),
(9, 2, '/uploads/1776158673626.png', 1, '2026-04-14 09:24:33'),
(10, 5, '/uploads/1776159061819.png', 0, '2026-04-14 09:31:01'),
(11, 5, '/uploads/1776159061826.png', 1, '2026-04-14 09:31:01'),
(12, 5, '/uploads/1776159061832.png', 0, '2026-04-14 09:31:01'),
(13, 5, '/uploads/1776159061837.jpg', 0, '2026-04-14 09:31:01'),
(14, 3, '/uploads/1776168190198.png', 0, '2026-04-14 12:03:10'),
(15, 3, '/uploads/1776168190211.png', 0, '2026-04-14 12:03:10'),
(16, 3, '/uploads/1776168190223.png', 0, '2026-04-14 12:03:10'),
(18, 3, '/uploads/1776168190240.png', 1, '2026-04-14 12:03:10'),
(19, 6, '/uploads/1776246506300.png', 0, '2026-04-15 09:48:26'),
(20, 6, '/uploads/1776246506309.png', 0, '2026-04-15 09:48:26'),
(21, 6, '/uploads/1776246506321.png', 1, '2026-04-15 09:48:26'),
(22, 6, '/uploads/1776246506330.png', 0, '2026-04-15 09:48:26'),
(23, 7, '/uploads/1776247203390.png', 0, '2026-04-15 10:00:03'),
(24, 7, '/uploads/1776247203395.png', 0, '2026-04-15 10:00:03'),
(25, 7, '/uploads/1776247203401.png', 0, '2026-04-15 10:00:03'),
(26, 7, '/uploads/1776247203408.png', 1, '2026-04-15 10:00:03'),
(27, 8, '/uploads/1776252984026.png', 0, '2026-04-15 11:36:24'),
(28, 8, '/uploads/1776252984032.png', 0, '2026-04-15 11:36:24'),
(29, 8, '/uploads/1776252984047.png', 0, '2026-04-15 11:36:24'),
(30, 8, '/uploads/1776252984055.png', 1, '2026-04-15 11:36:24'),
(32, 9, '/uploads/1776254095201.png', 1, '2026-04-15 11:54:55'),
(33, 9, '/uploads/1776254095206.png', 0, '2026-04-15 11:54:55'),
(34, 9, '/uploads/1776254095212.png', 0, '2026-04-15 11:54:55'),
(35, 9, '/uploads/1776254095223.png', 0, '2026-04-15 11:54:55');

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

--
-- Volcado de datos para la tabla `registro_tareas`
--

INSERT INTO `registro_tareas` (`id`, `usuario_id`, `animal_id`, `tarea_id`, `estado`, `fecha_creacion`) VALUES
(1, 4, 5, 1, 'aprobada', '2026-04-10 08:51:16'),
(2, 4, 1, 3, 'aprobada', '2026-04-10 09:24:16'),
(3, 4, 1, 2, 'aprobada', '2026-04-10 09:24:18'),
(4, 4, 5, 3, 'aprobada', '2026-04-10 09:24:22'),
(5, 4, 1, 1, 'aprobada', '2026-04-13 10:30:19'),
(6, 4, 5, 1, 'rechazada', '2026-04-13 11:48:45'),
(7, 4, 5, 3, 'rechazada', '2026-04-13 11:48:47'),
(8, 4, 1, 2, 'rechazada', '2026-04-13 11:48:49'),
(9, 5, 6, 1, 'aprobada', '2026-04-15 10:50:11'),
(10, 5, 7, 1, 'aprobada', '2026-04-15 10:50:22');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `solicitudes_adopcion`
--

CREATE TABLE `solicitudes_adopcion` (
  `id` int(11) NOT NULL,
  `animal_id` int(11) NOT NULL,
  `nombre_solicitante` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `telefono` varchar(20) NOT NULL,
  `mensaje` text DEFAULT NULL,
  `estado` enum('pendiente','aprobada','rechazada') DEFAULT 'pendiente',
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `solicitudes_adopcion`
--

INSERT INTO `solicitudes_adopcion` (`id`, `animal_id`, `nombre_solicitante`, `email`, `telefono`, `mensaje`, `estado`, `fecha_creacion`) VALUES
(1, 1, 'Manolo', 'manolo@gmail.com', '600 123 456', 'Tengo experiencia con esta raza y va a convivir con 2 compis, que pienso que le daran bastante actividad.', 'rechazada', '2026-04-10 10:06:43');

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
(4, 'Ismael Gonzalez', 'ismael@gmail.com', '$2b$10$ImknpNYbgPdS1ppHWUZQ3.idUY9Sdj9hjUCC05deTmEX8fBsuia9G', 'voluntario', 425, 3),
(5, 'Angie', 'angie@gmail.com', '$2b$10$l/GWjAlU1gwzHgQu8vFgj.Jf0qEkFZVrMWXE0IYzR.VDt.x/rmoK2', 'voluntario', 20, 1);

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
-- Indices de la tabla `imagenes_animales`
--
ALTER TABLE `imagenes_animales`
  ADD PRIMARY KEY (`id`),
  ADD KEY `animal_id` (`animal_id`);

--
-- Indices de la tabla `registro_tareas`
--
ALTER TABLE `registro_tareas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `animal_id` (`animal_id`),
  ADD KEY `tarea_id` (`tarea_id`);

--
-- Indices de la tabla `solicitudes_adopcion`
--
ALTER TABLE `solicitudes_adopcion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `animal_id` (`animal_id`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `catalogo_tareas`
--
ALTER TABLE `catalogo_tareas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `imagenes_animales`
--
ALTER TABLE `imagenes_animales`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT de la tabla `registro_tareas`
--
ALTER TABLE `registro_tareas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `solicitudes_adopcion`
--
ALTER TABLE `solicitudes_adopcion`
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
-- Filtros para la tabla `imagenes_animales`
--
ALTER TABLE `imagenes_animales`
  ADD CONSTRAINT `imagenes_animales_ibfk_1` FOREIGN KEY (`animal_id`) REFERENCES `animales` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `registro_tareas`
--
ALTER TABLE `registro_tareas`
  ADD CONSTRAINT `registro_tareas_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `registro_tareas_ibfk_2` FOREIGN KEY (`animal_id`) REFERENCES `animales` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `registro_tareas_ibfk_3` FOREIGN KEY (`tarea_id`) REFERENCES `catalogo_tareas` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `solicitudes_adopcion`
--
ALTER TABLE `solicitudes_adopcion`
  ADD CONSTRAINT `solicitudes_adopcion_ibfk_1` FOREIGN KEY (`animal_id`) REFERENCES `animales` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
