-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Erstellungszeit: 16. Jul 2024 um 13:03
-- Server-Version: 10.6.18-MariaDB
-- PHP-Version: 8.3.6

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Datenbank: `modchecker`
--

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `badges`
--

CREATE TABLE `badges` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `path` varchar(255) NOT NULL,
  `permission` int(11) NOT NULL,
  `order` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `badges`
--

INSERT INTO `badges` (`id`, `name`, `path`, `permission`, `order`) VALUES
(1, 'affiliate', '/badges/affiliate.png', 0, 30),
(2, 'partner', '/badges/partner.png', 0, 20),
(3, 'team', '/badges/team.png', 1, 40),
(4, 'early checker', '/badges/early_checker.png', 0, 60),
(5, 'relaxo', '/badges/relaxo.png', 0, 9999),
(6, 'painter', '/badges/painter.png', 0, 80),
(7, 'booster', '/badges/booster.png', 0, 70),
(8, 'donator', '/badges/donator.png', 0, 100),
(9, 'staff', '/badges/staff.png', 0, 10),
(10, 'top donator', '/badges/top_donator.png', 0, 90),
(11, 'contributor', '/badges/contributor.png', 0, 50),
(12, 'admin', '/badges/team.png', 2, 40);

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `dctwitchusers`
--

CREATE TABLE `dctwitchusers` (
  `id` int(11) NOT NULL,
  `discord_user_id` varchar(255) NOT NULL,
  `twitch_username` varchar(255) NOT NULL,
  `twitch_id` varchar(255) DEFAULT NULL,
  `is_boosting` tinyint(4) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `dctwitchusers`
--

INSERT INTO `dctwitchusers` (`id`, `discord_user_id`, `twitch_username`, `twitch_id`, `is_boosting`) VALUES
(4, '634384756158496768', 'lilb_lxryer', '676966284', 0),
(6, '870757294013567076', 'xlouw', '219044001', 1),
(7, '827588288130580571', 'mepplgotdrip', '457674693', 0),
(8, '780910551286546493', 'retrorelaxo', '265557682', 1),
(9, '209308548377739266', 'twitchisupporter', '401235515', 1),
(10, '127675245090832384', 'crownchaan', '152263203', 0),
(11, '1234479363215458336', 'alexmoderat', '1073354850', 0),
(13, '181497815942430720', 'cvk3', '87695884', 0),
(14, '506468993981349888', 'lellolidk', '636823070', 1),
(15, '738860724079558769', 'schwertwueste37', '202391035', 1),
(16, '829698707964166155', 'justin_lapaz', '739292066', 0),
(17, '1018535930111463455', '7niss', '824594608', 0),
(18, '1075401441373601833', 'chrisgbr263', '797899558', 0),
(19, '147028278320824320', 'quai1', '74471586', 0),
(20, '1083683401447522334', 'eslem_007', '684580275', 0),
(21, '194839394589474816', 'isnicable', '81815340', 0),
(22, '1010544156285874206', 'heelu_', '665586849', 0),
(23, '707677722985496596', 'bobthebuilder_98', '514785790', 0),
(24, '675902655763054595', 'spyrognt', '469620461', 0),
(25, '485810319420162059', 'za8uza', '655290698', 1),
(26, '730171512367349770', 'itzrobin', '228092244', 0),
(27, '248174180632100864', 'wave9k', '124212016', 0),
(28, '406874195742425089', 'fabi391', '142668038', 1),
(29, '1025160440604536853', '0xwwwwwwwwwwwwwwwwwwwwwww', '654368477', 0),
(30, '478464660274937859', 'mersufy', '492818669', 0),
(31, '215850142929125376', 'vmyk', '596675864', 0),
(32, '959653363379765268', 'limetimepop', '546292461', 0),
(33, '1059774551828992062', 'tthev', '677141167', 0);

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `mods`
--

CREATE TABLE `mods` (
  `user_id` varchar(20) NOT NULL,
  `channel_id` varchar(20) NOT NULL,
  `granted` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `mods`
--

INSERT INTO `mods` (`user_id`, `channel_id`, `granted`) VALUES
('100102531', '265557682', '2024-06-25 10:23:59'),
('100135110', '132883040', '2018-02-07 14:10:58'),
('100135110', '165270856', '2020-12-15 20:09:21'),
('100135110', '230077646', '2023-09-30 19:24:55'),
('100135110', '233729146', '2024-01-08 12:37:02'),
('100135110', '265557682', '2020-08-28 09:59:24'),
('100135110', '401235515', '2021-07-20 13:17:31'),
('100135110', '645960680', '2023-02-26 18:06:47'),
('100135110', '676966284', '2023-12-25 11:02:13'),
('100135110', '899021804', '2024-03-09 21:50:36'),
('1009638111', '132883040', '2024-06-10 21:36:19'),
('1016443566', '401235515', '2024-02-18 01:21:13'),
('1026729565', '401235515', '2024-01-27 07:11:03'),
('103220302', '265557682', '2024-06-16 18:56:08'),
('1056506170', '165270856', '2024-07-07 11:07:07'),
('1056506170', '401235515', '2024-06-19 15:03:35'),
('1056506170', '676966284', '2024-07-13 12:15:53'),
('1098167832', '265557682', '2024-06-12 17:05:40'),
('115409295', '667794838', '2024-03-21 13:56:42'),
('115409295', '899021804', '2023-12-05 20:14:03'),
('125417445', '132883040', '2024-01-01 20:34:48'),
('125417445', '233729146', '2024-04-26 18:32:37'),
('125417445', '676966284', '2024-03-23 20:33:57'),
('132420956', '667794838', '2024-02-25 18:07:28'),
('132883040', '233729146', '2024-04-24 17:34:39'),
('138187273', '265557682', '2024-06-16 18:55:47'),
('138187273', '676966284', '2024-04-16 14:22:26'),
('143641522', '899021804', '2024-05-22 17:44:36'),
('153048142', '645960680', '2023-05-16 22:05:35'),
('153048142', '667794838', '2023-09-07 14:30:36'),
('153048142', '899021804', '2024-03-20 14:52:22'),
('153215323', '265557682', '2024-06-16 18:55:40'),
('155042625', '667794838', '2023-09-21 18:22:10'),
('155042625', '899021804', '2024-04-21 14:17:00'),
('159736873', '667794838', '2024-05-11 17:24:52'),
('159736873', '899021804', '2023-11-26 02:38:44'),
('165270856', '676966284', '2024-07-08 19:36:08'),
('174408185', '667794838', '2023-12-08 18:59:37'),
('177139840', '165270856', '2024-05-14 08:22:48'),
('180000888', '265557682', '2024-06-16 18:55:32'),
('184675917', '265557682', '2024-06-16 18:55:16'),
('194514131', '165270856', '2024-01-14 18:18:56'),
('199196363', '265557682', '2024-06-16 18:56:31'),
('199354711', '265557682', '2024-06-16 18:55:37'),
('202391035', '265557682', '2024-06-16 18:53:54'),
('214700605', '265557682', '2024-06-16 18:55:23'),
('217986157', '165270856', '2024-03-11 21:11:42'),
('217986157', '230077646', '2023-11-26 10:28:58'),
('217986157', '233729146', '2024-01-01 19:28:05'),
('217986157', '265557682', '2024-06-17 02:51:43'),
('217986157', '401235515', '2024-01-07 15:37:19'),
('219044001', '265557682', '2024-02-09 12:03:05'),
('219044001', '667794838', '2023-07-17 18:33:30'),
('220846194', '265557682', '2024-06-16 18:55:11'),
('230077646', '217986157', '2023-11-14 12:51:55'),
('230077646', '233729146', '2023-11-07 17:06:30'),
('23162550', '667794838', '2023-12-14 20:31:16'),
('23162550', '899021804', '2024-06-26 11:48:10'),
('233729146', '132883040', '2024-02-15 19:17:13'),
('233729146', '217986157', '2024-04-30 02:47:16'),
('233729146', '230077646', '2023-09-10 10:45:29'),
('237719657', '132883040', '2023-11-02 17:14:22'),
('237719657', '165270856', '2024-02-22 21:49:41'),
('237719657', '217986157', '2023-11-14 13:52:16'),
('237719657', '233729146', '2024-02-03 20:36:30'),
('237719657', '265557682', '2023-09-12 18:34:47'),
('237719657', '401235515', '2024-02-18 01:20:24'),
('237719657', '645960680', '2023-01-15 18:21:12'),
('237719657', '667794838', '2023-04-12 05:19:20'),
('237719657', '676966284', '2024-02-07 11:36:10'),
('237719657', '899021804', '2024-03-18 20:16:22'),
('244902384', '265557682', '2024-06-16 18:55:30'),
('246278002', '265557682', '2024-06-16 18:55:17'),
('259160340', '265557682', '2024-06-16 18:56:15'),
('263830208', '645960680', '2024-03-28 18:03:32'),
('265557682', '676966284', '2024-07-13 20:04:23'),
('269024847', '401235515', '2023-01-19 19:12:16'),
('401235515', '265557682', '2024-06-16 18:55:14'),
('401235515', '676966284', '2024-07-12 12:10:08'),
('402680182', '265557682', '2024-06-16 18:55:36'),
('405731639', '265557682', '2024-06-16 18:55:08'),
('406052683', '265557682', '2024-06-16 18:56:16'),
('406305767', '401235515', '2023-01-11 20:19:27'),
('411896188', '899021804', '2024-01-13 00:44:40'),
('414160944', '645960680', '2023-11-25 20:23:38'),
('418937550', '265557682', '2024-06-16 18:56:26'),
('433400174', '645960680', '2023-08-26 19:47:45'),
('445736722', '265557682', '2024-06-16 18:55:46'),
('447709146', '265557682', '2024-06-25 10:24:09'),
('450777043', '265557682', '2024-04-30 09:47:01'),
('457674693', '265557682', '2024-01-29 20:39:09'),
('468580603', '265557682', '2024-06-16 18:56:23'),
('468580603', '667794838', '2024-05-26 11:15:04'),
('468580603', '899021804', '2024-06-26 11:45:36'),
('475287249', '265557682', '2024-06-16 18:54:59'),
('475748597', '265557682', '2024-06-16 18:55:06'),
('476943360', '265557682', '2022-08-06 20:09:05'),
('477232357', '265557682', '2024-06-24 08:20:14'),
('48048659', '217986157', '2023-12-12 06:06:20'),
('48048659', '230077646', '2023-09-04 13:44:20'),
('48048659', '401235515', '2024-01-07 14:50:16'),
('486970200', '645960680', '2024-01-12 21:05:28'),
('489472702', '265557682', '2024-03-14 11:33:15'),
('496088785', '645960680', '2024-02-21 11:52:05'),
('499189479', '265557682', '2024-06-16 18:55:26'),
('502145172', '667794838', '2024-04-06 17:26:50'),
('503279234', '265557682', '2024-06-16 18:55:12'),
('504443631', '265557682', '2024-06-16 18:55:45'),
('504443631', '667794838', '2023-09-09 16:39:43'),
('520655339', '265557682', '2024-06-16 18:56:02'),
('533829708', '265557682', '2024-06-16 18:55:31'),
('533829708', '899021804', '2024-06-25 17:37:42'),
('535534480', '265557682', '2024-06-16 18:55:39'),
('537025917', '265557682', '2024-06-16 18:55:55'),
('537196168', '265557682', '2024-04-05 19:52:01'),
('541450924', '265557682', '2023-12-13 13:37:58'),
('542519545', '265557682', '2024-06-16 18:55:22'),
('545612327', '265557682', '2024-01-29 20:39:13'),
('546352474', '265557682', '2024-06-24 09:09:45'),
('546352474', '899021804', '2024-01-27 21:22:30'),
('548615789', '265557682', '2024-06-16 18:55:19'),
('566087577', '265557682', '2024-06-16 18:55:38'),
('56932772', '899021804', '2024-03-07 17:04:17'),
('569956677', '265557682', '2024-03-25 21:30:45'),
('572114208', '265557682', '2024-06-17 02:51:51'),
('581648291', '265557682', '2024-06-16 18:56:06'),
('592633260', '265557682', '2024-06-16 18:56:28'),
('596675864', '265557682', '2024-06-18 09:59:02'),
('608747423', '265557682', '2024-06-16 18:56:07'),
('615684014', '645960680', '2024-03-15 21:54:04'),
('618436662', '265557682', '2024-06-16 20:03:16'),
('618436662', '899021804', '2024-03-12 23:27:25'),
('624738349', '645960680', '2024-04-05 11:05:16'),
('625016038', '132883040', '2023-12-16 16:46:13'),
('625016038', '165270856', '2024-06-20 07:56:00'),
('625016038', '265557682', '2023-09-23 20:10:57'),
('625016038', '401235515', '2024-01-14 21:05:12'),
('625016038', '667794838', '2023-09-07 14:26:25'),
('625016038', '676966284', '2024-01-23 17:55:03'),
('625016038', '899021804', '2024-02-25 04:06:52'),
('636810350', '265557682', '2024-06-16 18:54:54'),
('636823070', '265557682', '2024-06-16 18:53:45'),
('636823070', '676966284', '2024-05-23 17:37:17'),
('64144838', '265557682', '2024-06-16 18:55:52'),
('641972806', '265557682', '2024-06-24 19:18:12'),
('645960680', '667794838', '2023-09-29 22:50:19'),
('645960680', '899021804', '2024-06-26 11:48:47'),
('648984729', '265557682', '2024-06-16 18:56:22'),
('654368477', '265557682', '2024-06-16 18:56:32'),
('659440190', '265557682', '2024-04-05 19:43:15'),
('667794838', '265557682', '2024-06-16 18:56:30'),
('667794838', '899021804', '2024-05-22 17:46:01'),
('676966284', '165270856', '2024-05-28 10:34:53'),
('676966284', '401235515', '2024-06-16 09:33:54'),
('677141167', '265557682', '2024-06-24 07:25:22'),
('68136884', '265557682', '2023-10-07 16:05:28'),
('68136884', '401235515', '2024-06-26 10:04:22'),
('68136884', '676966284', '2024-06-05 15:35:56'),
('687075170', '132883040', '2024-01-17 18:55:29'),
('687075170', '217986157', '2024-01-09 10:03:32'),
('687075170', '230077646', '2024-02-13 17:46:13'),
('687075170', '233729146', '2024-01-21 23:36:23'),
('687075170', '676966284', '2024-07-01 18:10:12'),
('693727775', '265557682', '2024-06-16 18:54:01'),
('700957107', '265557682', '2024-03-12 10:10:20'),
('711348782', '645960680', '2023-04-08 22:50:35'),
('726027069', '265557682', '2024-06-16 18:56:18'),
('729353699', '265557682', '2024-05-28 15:33:31'),
('736656096', '645960680', '2024-03-01 18:35:22'),
('736656096', '899021804', '2024-05-22 17:45:05'),
('739292066', '265557682', '2023-12-13 14:46:09'),
('754201843', '265557682', '2024-05-02 11:43:41'),
('757102582', '265557682', '2024-01-20 12:05:53'),
('757102582', '667794838', '2023-12-10 23:49:37'),
('771789654', '667794838', '2023-07-29 08:16:19'),
('772450899', '265557682', '2022-06-20 18:29:57'),
('778353697', '132883040', '2024-06-24 18:22:54'),
('778353697', '165270856', '2024-01-12 08:30:01'),
('778353697', '217986157', '2024-01-31 17:42:42'),
('778353697', '230077646', '2023-09-02 08:12:32'),
('778353697', '233729146', '2023-11-18 18:11:54'),
('778353697', '401235515', '2024-06-25 09:40:55'),
('778353697', '667794838', '2024-02-24 19:51:36'),
('778353697', '676966284', '2024-02-21 16:19:07'),
('782987978', '899021804', '2024-02-16 20:11:42'),
('784897223', '265557682', '2024-06-16 18:54:51'),
('78672943', '265557682', '2024-01-29 15:02:11'),
('798779709', '230077646', '2024-04-21 16:12:40'),
('798779709', '233729146', '2024-04-22 15:22:47'),
('811561106', '667794838', '2024-03-21 13:58:22'),
('816713504', '265557682', '2024-06-16 18:55:25'),
('81745668', '645960680', '2024-05-30 21:21:40'),
('81815340', '132883040', '2024-02-05 22:25:24'),
('81815340', '265557682', '2024-06-16 18:55:49'),
('820351813', '265557682', '2024-06-25 10:23:56'),
('823358807', '265557682', '2024-06-16 18:55:44'),
('824594608', '265557682', '2024-06-08 17:38:25'),
('826185626', '899021804', '2024-02-25 04:18:00'),
('834328308', '265557682', '2024-06-12 18:15:35'),
('836352666', '265557682', '2024-06-17 05:34:17'),
('840365435', '265557682', '2024-06-16 18:56:04'),
('86143905', '132883040', '2023-04-28 19:14:46'),
('865895441', '265557682', '2024-02-01 04:46:29'),
('865895441', '667794838', '2024-05-16 18:26:18'),
('869979893', '899021804', '2024-03-31 21:21:38'),
('87695884', '265557682', '2024-02-29 10:34:46'),
('87695884', '676966284', '2024-07-13 12:16:53'),
('88140203', '645960680', '2024-06-08 21:07:13'),
('882073629', '265557682', '2024-06-16 18:55:10'),
('883453487', '265557682', '2024-04-28 09:15:11'),
('889474761', '265557682', '2024-06-16 18:55:27'),
('893599032', '265557682', '2024-06-25 10:24:04'),
('896702538', '265557682', '2024-06-16 18:55:28'),
('943559239', '265557682', '2024-06-16 18:53:37'),
('951349582', '265557682', '2024-02-25 02:35:22'),
('95421563', '265557682', '2024-06-16 18:55:50'),
('984601457', '265557682', '2024-06-17 02:51:56'),
('996004171', '217986157', '2024-06-02 10:00:47');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `tokens`
--

CREATE TABLE `tokens` (
  `name` varchar(255) NOT NULL,
  `access_token` varchar(255) NOT NULL,
  `refresh_token` varchar(255) DEFAULT NULL,
  `expires_at` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `users`
--

CREATE TABLE `users` (
  `id` varchar(20) NOT NULL,
  `login` varchar(50) NOT NULL,
  `name` varchar(50) NOT NULL,
  `avatar` varchar(255) NOT NULL,
  `bio` text DEFAULT NULL,
  `ignored` tinyint(1) NOT NULL DEFAULT 0,
  `created` timestamp NULL DEFAULT NULL,
  `updated` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `users`
--

INSERT INTO `users` (`id`, `login`, `name`, `avatar`, `bio`, `ignored`, `created`, `updated`) VALUES
('100023400', 'xwocky', 'xWocky', 'https://static-cdn.jtvnw.net/jtv_user_pictures/165a31ba-4ae5-46ac-b2f3-9d4c696ba778-profile_image-300x300.png', 'the realest of the real.', 0, '2015-08-20 22:38:03', NULL),
('100102531', 'amoaymen', 'amoaymen', 'https://static-cdn.jtvnw.net/jtv_user_pictures/619acb8a-08ec-4822-a630-2587a930233b-profile_image-300x300.png', 'Der bekannteste Tunesier Deutschlands | Contact: amoaymen@lyaison.com', 0, '2015-08-21 14:19:22', NULL),
('100135110', 'streamelements', 'StreamElements', 'https://static-cdn.jtvnw.net/jtv_user_pictures/a2a0d187-c092-40cb-bd6d-6d247ad9a9d3-profile_image-300x300.png', 'Elevate your content with www.StreamElements.com ✔️Free forever ✔️Legendary Service ✔️Trusted by the Best ', 0, '2015-08-21 18:25:14', NULL),
('1009638111', 'lostensounds', 'LostenSounds', 'https://static-cdn.jtvnw.net/user-default-pictures-uv/215b7342-def9-11e9-9a66-784f43822e80-profile_image-300x300.png', '', 0, '2023-12-27 02:19:38', NULL),
('1016443566', 'lilb_bot', 'lilb_bot', 'https://static-cdn.jtvnw.net/jtv_user_pictures/0a453719-7c24-4a32-a2b8-2b8f0f902c51-profile_image-300x300.png', 'lilb\'s bot', 0, '2024-01-10 14:55:02', NULL),
('1026729565', 'realcoolbot', 'RealCoolBot', 'https://static-cdn.jtvnw.net/jtv_user_pictures/e95da2db-75ee-4c5f-abb2-2e66389a2557-profile_image-300x300.png', '', 0, '2024-01-27 07:03:35', NULL),
('103220302', 'daveagain1337', 'daveagain1337', 'https://static-cdn.jtvnw.net/jtv_user_pictures/e10b6d30-84be-42cc-9e53-f66fc4c1539c-profile_image-300x300.png', '„Du solltest die kleinen Umwege in vollen Zügen genießen. Denn dort findest du Dinge, die wichtiger sind, als du willst.\' -Gin', 0, '2015-09-28 13:48:28', NULL),
('1046507325', 'txmhmb', 'txmhmb', 'https://static-cdn.jtvnw.net/user-default-pictures-uv/cdd517fe-def4-11e9-948e-784f43822e80-profile_image-300x300.png', '', 0, '2024-03-01 20:29:11', NULL),
('1056506170', 'feelsamazingmanbot', 'FeelsAmazingManBot', 'https://static-cdn.jtvnw.net/jtv_user_pictures/9a07a67a-7bab-4f90-beee-b311d5a8a3f2-profile_image-300x300.png', 'Twitch Bot geschrieben in JavaScript. Wenn du fragen hast kannst du @lilb_lxryer auf Discord oder auf Twitch kontaktieren. Du kannst den Bot bei dir hinzufügen mit #join, wenn du ihn removed haben willst dann kontakierte bitte lilb_lxryer.', 0, '2024-03-23 23:28:48', NULL),
('1083309801', 'lostenly', 'Lostenly', 'https://static-cdn.jtvnw.net/jtv_user_pictures/bd604faf-6bee-4351-92d7-9c1148bbce22-profile_image-300x300.png', 'This is a music control bot, on demand it can be added to your channel. :3', 0, '2024-05-11 12:37:41', NULL),
('1089608263', 'milesprower77x', 'Milesprower77x', 'https://static-cdn.jtvnw.net/jtv_user_pictures/764553e6-2ca4-49cc-9381-3ce39bacf279-profile_image-300x300.png', '', 0, '2024-05-21 07:59:01', NULL),
('1098167832', 'justsomethrowawayaccount', 'justsomethrowawayaccount', 'https://static-cdn.jtvnw.net/user-default-pictures-uv/dbdc9198-def8-11e9-8681-784f43822e80-profile_image-300x300.png', '', 0, '2024-06-12 17:04:45', NULL),
('115409295', 'anexiiis', 'Anexiiis', 'https://static-cdn.jtvnw.net/jtv_user_pictures/e965cc3c-f159-4c47-bb03-b06dc8192779-profile_image-300x300.jpeg', 'Halb Deutsch, halb Franzose', 0, '2016-02-10 13:05:31', NULL),
('123521762', 'crowie', 'Crowie', 'https://static-cdn.jtvnw.net/jtv_user_pictures/5677251c-913e-4310-be5b-3058ed9d48df-profile_image-300x300.png', 'Österreichischer Streamer & Twitter User | Based in Carinthia | Inquiries: crowie@lyaison.com', 0, '2016-05-05 13:33:56', NULL),
('125417445', 'iiiuminatiiii', 'iIIuminatiiii', 'https://static-cdn.jtvnw.net/jtv_user_pictures/963572f7-8cb1-4998-85ef-f0c97af7f70e-profile_image-300x300.png', '', 0, '2016-05-29 13:19:09', NULL),
('132205514', 'darknightlp702', 'DarknightLP702', 'https://static-cdn.jtvnw.net/jtv_user_pictures/f4c43ea3-b352-4aa5-b4ca-c3e0c16720dd-profile_image-300x300.png', 'Hi! Ich bin Marc | 19 und streame viele verschiedene Games :D Wenn du Lust hast und dir mein Content gefällt, kannst du gerne ein kostenloses Follow da lassen ❤', 0, '2016-08-14 17:25:57', NULL),
('132420956', 'mason77x', 'Mason77x', 'https://static-cdn.jtvnw.net/jtv_user_pictures/31568c35-eb83-4f15-88eb-c99029ebcae9-profile_image-300x300.png', 'Ich mag Sonic, bin in World of Warcraft vertieft und neige zur Schüchternheit. Das fasst mein Dasein recht gut zusammen. :)', 0, '2016-08-17 08:13:01', NULL),
('132883040', 'lostency', 'Lostency', 'https://static-cdn.jtvnw.net/jtv_user_pictures/6f2dae69-bffb-440e-9b75-9857c6ff737e-profile_image-300x300.jpeg', 'Hi, mein Name ist Nina. 🏳️‍⚧️', 0, '2016-08-22 16:15:43', '2024-07-08 16:42:12'),
('138187273', 'jannik_vdb', 'jannik_vdB', 'https://static-cdn.jtvnw.net/jtv_user_pictures/jannik_vdb-profile_image-69396598600c90d7-300x300.jpeg', '', 0, '2016-10-29 06:34:06', NULL),
('138847184', 'georgecharmant', 'GeorgeCharmant', 'https://static-cdn.jtvnw.net/jtv_user_pictures/00ff96ec-6eb6-4341-9d0d-c3ee947ddce3-profile_image-300x300.png', 'Only God can create something of value out of nothing', 0, '2016-11-05 21:04:31', NULL),
('142668038', 'fabi391', 'Fabi391', 'https://static-cdn.jtvnw.net/jtv_user_pictures/fcee10f2-78a1-46c1-9363-62283759429e-profile_image-300x300.png', '🤙 Discordname ➡️ Fabi391‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎  ‎ ‎ ‎ ‎  ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ 🤙 Irgendwann vielleicht auch mal live 😁', 0, '2016-12-23 15:11:21', NULL),
('143641522', 'lennnnyy', 'Lennnnyy', 'https://static-cdn.jtvnw.net/jtv_user_pictures/7d1a7c19-8e4a-4b86-9db7-0863ba8aa5b3-profile_image-300x300.jpeg', 'mamer sagt bin cool', 0, '2017-01-02 23:13:04', NULL),
('150295824', 'freeshxi', 'freeshxi', 'https://static-cdn.jtvnw.net/user-default-pictures-uv/998f01ae-def8-11e9-b95c-784f43822e80-profile_image-300x300.png', '', 0, '2017-03-13 02:39:31', NULL),
('151883075', 'mahluna', 'Mahluna', 'https://static-cdn.jtvnw.net/jtv_user_pictures/25d08b64-469d-4d70-b4b2-2ac9b98452ac-profile_image-300x300.png', 'Streamer und sonst auch recht verloren im Leben', 0, '2017-03-30 12:36:18', NULL),
('153048142', '7linus_', '7LINUS_', 'https://static-cdn.jtvnw.net/jtv_user_pictures/0f3fbfe9-10dc-43af-bd13-677f27625989-profile_image-300x300.png', '', 0, '2017-04-11 13:40:54', NULL),
('153215323', 'luccienv', 'LucciENV', 'https://static-cdn.jtvnw.net/jtv_user_pictures/c4bf18d3-4a0c-4723-a65d-c886c49d9760-profile_image-300x300.png', 'pbic 2020', 0, '2017-04-13 00:30:47', NULL),
('155042625', 'lamberio', 'Lamberio', 'https://static-cdn.jtvnw.net/jtv_user_pictures/72f9e57e-4bdc-4b76-b820-3ba923b5f88a-profile_image-300x300.png', '-', 0, '2017-04-29 08:37:32', NULL),
('155097906', 'isabellgebel', 'isabellgebel', 'https://static-cdn.jtvnw.net/jtv_user_pictures/c97662bf-b720-4e64-9608-2bb3dbb6e0eb-profile_image-300x300.png', 'Hey, ich bin Isabell, 22 jahre alt und mache paar Sachen hier.', 0, '2017-04-29 16:18:51', NULL),
('159736873', 'davidlxw', 'davidlxw', 'https://static-cdn.jtvnw.net/jtv_user_pictures/b054464a-3cc0-45ff-b904-46bd6c25fba3-profile_image-300x300.png', '', 0, '2017-06-10 10:56:10', NULL),
('163751674', 'phille_1901', 'Phille_1901', 'https://static-cdn.jtvnw.net/jtv_user_pictures/34506766-1fa9-465a-bf82-b95bafc8f5fb-profile_image-300x300.png', 'Hey, Ich bin Philipp 21 Jahre alt Lasst den Chat in Deutsch & Englisch.  Variety, Just Chatting und andere Sachen wie Valo und Co. kommen', 0, '2017-07-09 17:03:33', NULL),
('164664732', 'ra13e', 'RA13E', 'https://static-cdn.jtvnw.net/jtv_user_pictures/32fb0feb-cf21-4810-824e-d8306d35bef5-profile_image-300x300.png', '13', 0, '2017-07-14 17:18:54', NULL),
('165270856', 'treeed', 'Treeed', 'https://static-cdn.jtvnw.net/jtv_user_pictures/64b4bf6b-beee-4a32-810c-2328f5c5d9c6-profile_image-300x300.png', 'Gude !', 0, '2017-07-17 16:23:34', '2024-07-08 16:18:59'),
('165805620', 'uniquexslayer', 'uniquexslayer', 'https://static-cdn.jtvnw.net/jtv_user_pictures/4c7d0156-5d9c-40b9-8d4d-824e96f0c52e-profile_image-300x300.png', 'no shot', 0, '2017-07-20 15:24:07', NULL),
('171854263', 'dimitreeis', 'DimitReeis', 'https://static-cdn.jtvnw.net/jtv_user_pictures/f1a5f425-a77f-4438-aef6-a66ff8635493-profile_image-300x300.png', 'Mein Name ist Dimitri', 0, '2017-08-28 12:50:05', NULL),
('172781249', 'faister', 'Faister', 'https://static-cdn.jtvnw.net/jtv_user_pictures/87cc5c2e-aca5-400f-80c7-5351643643ce-profile_image-300x300.png', 'Businessmail: faister.business@gmail.com', 0, '2017-09-03 16:58:40', NULL),
('174408185', 'masterexxe', 'masterexxe', 'https://static-cdn.jtvnw.net/jtv_user_pictures/d9535611-1f93-4161-8ba7-200381ff73bc-profile_image-300x300.png', '', 0, '2017-09-16 13:55:02', NULL),
('177139840', 'tobivss', 'Tobivss', 'https://static-cdn.jtvnw.net/jtv_user_pictures/5253c030-6fa9-4327-b678-4a104ccf449d-profile_image-300x300.png', '', 0, '2017-10-09 17:01:12', NULL),
('179311496', 'acee47', 'Acee47', 'https://static-cdn.jtvnw.net/jtv_user_pictures/eb66440a-3f38-4b7b-b10f-e5974ebd2b7c-profile_image-300x300.png', 'YOOOOO DAILY STREAMS GANGY', 0, '2017-10-26 20:05:27', NULL),
('180000888', 'matthewsmeth', 'MatthewsMeth', 'https://static-cdn.jtvnw.net/jtv_user_pictures/62416353-e27b-485f-82bb-81a1f6194b89-profile_image-300x300.png', 'grrrrrrr', 0, '2017-11-01 06:41:37', NULL),
('184675917', 'tarsai', 'tarsaI', 'https://static-cdn.jtvnw.net/jtv_user_pictures/a492fa70-ca00-4613-81eb-954030a1f56c-profile_image-300x300.png', ' ', 0, '2017-12-06 21:18:44', NULL),
('185324637', 'omergambino', 'omergambino', 'https://static-cdn.jtvnw.net/jtv_user_pictures/d8081290-620d-4e92-88c7-62fbec1c8a04-profile_image-300x300.png', '', 0, '2017-12-10 21:46:35', NULL),
('192130733', 'klowagenfahrer1', 'KlowagenFahrer1', 'https://static-cdn.jtvnw.net/jtv_user_pictures/be5b4ce6-9a02-4432-93b8-a7e76aca848d-profile_image-300x300.png', '', 0, '2018-01-21 21:39:35', NULL),
('194514131', 'teereox', 'teereox', 'https://static-cdn.jtvnw.net/jtv_user_pictures/94232c74-8acc-4d03-bc34-cf4b5477821b-profile_image-300x300.png', 'joa', 0, '2018-02-03 09:09:50', NULL),
('195648680', '7fishyy', '7FISHYY', 'https://static-cdn.jtvnw.net/jtv_user_pictures/76513aa6-6bb7-48c0-91b7-924a53743890-profile_image-300x300.png', '', 0, '2018-02-10 09:14:06', NULL),
('198354860', 'rxschi', 'rxschi', 'https://static-cdn.jtvnw.net/jtv_user_pictures/99047d61-82da-4650-892b-024c8e32832e-profile_image-300x300.png', '', 0, '2018-02-25 14:16:31', NULL),
('199196363', '4jug', '4JUG', 'https://static-cdn.jtvnw.net/jtv_user_pictures/1d73fce4-b0bb-47e8-9f6a-4124d3e08123-profile_image-300x300.png', 'Yo.', 0, '2018-03-01 01:04:20', NULL),
('199354711', 'mackonzu', 'mackonZu', 'https://static-cdn.jtvnw.net/jtv_user_pictures/b3b29829-bdbc-4e2a-9cc0-58b1998887fa-profile_image-300x300.png', 'uh', 0, '2018-03-01 03:20:22', NULL),
('202391035', 'schwertwueste37', 'SchwertWueste37', 'https://static-cdn.jtvnw.net/jtv_user_pictures/819adb78-8be7-4f14-9b8c-4557ea6150f5-profile_image-300x300.png', 'Hi ich bin Schwerti', 0, '2018-03-04 16:23:15', NULL),
('214700605', 'scorpyl2', 'ScorpyL2', 'https://static-cdn.jtvnw.net/jtv_user_pictures/ff237ab6-d4ca-43b7-abc5-d1483c590313-profile_image-300x300.jpeg', 'Hey! 🤠 I like music xD', 0, '2018-04-16 11:34:37', NULL),
('214709601', 'nicoko13', 'NICOKO13', 'https://static-cdn.jtvnw.net/jtv_user_pictures/97903806-ca2d-45ba-94d4-fc6cfa0862bc-profile_image-300x300.png', '', 0, '2018-04-16 12:31:35', NULL),
('216119826', 'phlliip', 'PHlLIIP', 'https://static-cdn.jtvnw.net/jtv_user_pictures/09bb5e3e-2cf6-4be2-afa2-3aae25e4a787-profile_image-300x300.png', 'forsen', 0, '2018-04-22 18:09:47', NULL),
('217986157', 'maersux', 'maersux', 'https://static-cdn.jtvnw.net/jtv_user_pictures/4058d275-ca87-4cf3-b736-c0392b81b6ed-profile_image-300x300.png', 'this random dev guy. if there\'s a social media platform with this name, it\'s probably me.', 0, '2018-05-01 18:09:47', '2024-07-08 15:55:47'),
('219044001', 'xlouw', 'xLouw', 'https://static-cdn.jtvnw.net/jtv_user_pictures/754c64ff-d96d-4e13-af08-df675743b1bf-profile_image-300x300.png', 'it feels like I can\'t die, \'cause I never was alive', 0, '2018-05-07 10:32:56', NULL),
('220846194', 'viocles', 'viocles', 'https://static-cdn.jtvnw.net/jtv_user_pictures/8128fb3a-a544-437e-b325-0294bf71da6a-profile_image-300x300.png', 'Twitch Mod/Chatter', 0, '2018-05-10 12:36:02', NULL),
('230077646', 'xblackclaw', 'xBlackClaw', 'https://static-cdn.jtvnw.net/jtv_user_pictures/6bb34d91-4423-4e73-9bba-6431d714e1e1-profile_image-300x300.png', '', 0, '2018-06-09 17:43:23', '2024-07-08 16:14:09'),
('23162550', 'nneo', 'NNeo', 'https://static-cdn.jtvnw.net/jtv_user_pictures/b12337db-32ac-46f6-ab4d-16752c6d315a-profile_image-300x300.png', 'shooting pixels in fps games', 0, '2011-06-27 18:09:25', NULL),
('233729146', 'spamvonangi', 'spamvonangi', 'https://static-cdn.jtvnw.net/jtv_user_pictures/ea2f1de2-aa4f-4490-a1bb-47f7e670ed3d-profile_image-300x300.png', 'i bims', 0, '2018-06-24 07:34:29', '2024-07-08 16:26:16'),
('235212439', '7reazy', '7REAZY', 'https://static-cdn.jtvnw.net/jtv_user_pictures/cd92e25e-b56c-455a-b834-842633b9e479-profile_image-300x300.png', 'ya manyak', 0, '2018-06-30 13:31:03', NULL),
('237719657', 'fossabot', 'Fossabot', 'https://static-cdn.jtvnw.net/jtv_user_pictures/719a0ffa-6c86-4321-83f1-44990fd644bc-profile_image-300x300.png', 'Fossabot is a Twitch chat bot that has all the features you need to create the ultimate chat experience for yourself and your audience. Built by the community, for the community.', 0, '2018-07-10 18:56:46', '2024-07-11 13:35:41'),
('244902384', 'mrpandir', 'MrPandir', 'https://static-cdn.jtvnw.net/jtv_user_pictures/8a02be95-5b43-4cb7-b4e0-b61278f0846a-profile_image-300x300.png', 'Type: person Class: programmer Family: python 🐍️️️️️️️️️️️️️️️️️️️️️️️️️️️️️‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌  Level: pre-junior Available languages: ukrainian, russian', 0, '2018-08-02 12:25:12', NULL),
('246278002', 'tackling', 'Tackling', 'https://static-cdn.jtvnw.net/jtv_user_pictures/a1ec9f84-1e8b-4f91-9e12-313e153d1f19-profile_image-300x300.png', 'ㅤ', 0, '2018-08-07 18:39:26', NULL),
('251917242', 'mart1n_123', 'mart1n_123', 'https://static-cdn.jtvnw.net/jtv_user_pictures/ee6446af-3db2-43f7-9683-20966afa5ae4-profile_image-300x300.png', 'Moin ', 0, '2018-08-26 13:53:30', NULL),
('259160340', 'cordo_exe', 'CORDO_EXE', 'https://static-cdn.jtvnw.net/jtv_user_pictures/47e9e977-5b85-4595-bf10-66bc14fafff0-profile_image-300x300.png', '7', 0, '2018-09-16 07:07:25', NULL),
('263805796', 'skrypi_', 'skrypi_', 'https://static-cdn.jtvnw.net/jtv_user_pictures/7cff1a18-4b46-4458-b206-5ee8a4b1ad04-profile_image-300x300.png', 'Streame ab und zu', 0, '2018-09-30 14:31:14', NULL),
('263830208', 'jubewe', 'Jubewe', 'https://static-cdn.jtvnw.net/jtv_user_pictures/54e9e3c3-9b0a-4960-8714-17ce084ecabf-profile_image-300x300.png', 'undefined', 0, '2018-09-30 16:08:47', NULL),
('265557682', 'retrorelaxo', 'RETRORELAXO', 'https://static-cdn.jtvnw.net/jtv_user_pictures/d9a9fe4a-aa17-425a-a248-4b5ecd60e7fe-profile_image-300x300.png', 'streamer & twitch moderator/event manager | contact: contact@relaxo.dev', 0, '2018-10-08 20:52:48', '2024-07-09 06:33:44'),
('269024847', 'bento_senpaiiiii', 'bento_senpaiiiii', 'https://static-cdn.jtvnw.net/jtv_user_pictures/b45294ff-38cf-4efd-aab9-0129b8ef0cc1-profile_image-300x300.png', '', 0, '2018-10-23 14:19:16', NULL),
('273445678', 'lodeno_k1d', 'lodeno_K1D', 'https://static-cdn.jtvnw.net/jtv_user_pictures/2e1407cc-5df6-478a-9bea-5ad5b85d746a-profile_image-300x300.png', '///GODDID\\\\\\ Komm gerne in den Chat ich würde mich riesig freuen :) Business-Anfragen an: Lodeno@web.de', 0, '2018-11-08 22:00:11', NULL),
('38793521', 'rawleyftp', 'rawleyftp', 'https://static-cdn.jtvnw.net/jtv_user_pictures/24cd756b-c569-4267-ac73-907448513f4f-profile_image-300x300.png', 'Come join in and hang out! We mostly speak German but if you chat in English, I\'ll respond accordingly :)', 0, '2012-12-27 10:56:07', NULL),
('401235515', 'twitchisupporter', 'TwitchiSupporter', 'https://static-cdn.jtvnw.net/jtv_user_pictures/0f3bb4ad-7a9b-473c-86ad-fe53bc072c07-profile_image-300x300.png', 'Ich heiße Leon. Ich arbeite nicht bei Twitch.', 0, '2018-12-09 20:27:28', '2024-07-08 16:18:41'),
('401594491', 'rockn__', 'ROCKN__', 'https://static-cdn.jtvnw.net/jtv_user_pictures/823d0390-38c7-49f7-90de-8e62bb9a1886-profile_image-300x300.png', 'yo', 0, '2018-12-11 21:15:26', NULL),
('402680182', 'malteeeeeeee', 'malteeeeeeee', 'https://static-cdn.jtvnw.net/jtv_user_pictures/306e3f82-5511-46e0-9529-7b6626e465d5-profile_image-300x300.png', '', 0, '2018-12-17 19:30:26', NULL),
('404081653', 'x38er', 'x38er', 'https://static-cdn.jtvnw.net/jtv_user_pictures/495fa17b-792f-4bb6-8889-d3dd5425127e-profile_image-300x300.png', '', 0, '2018-12-24 19:25:14', NULL),
('405731639', 'zhestykey', 'zhEsTYKey', 'https://static-cdn.jtvnw.net/jtv_user_pictures/d5476f43-7a71-4bb1-b184-756aa511ad96-profile_image-300x300.png', 'FeelsGoodMan Clap F҉e҉e҉l҉s҉G҉o҉o҉d҉M҉a҉n҉F҉e҉e҉l҉s҉G҉o҉o҉d҉M҉a҉nF҉e҉e҉l҉s҉G҉o҉o҉d҉M҉a҉n FeelsGoodMan F҉e҉e҉l҉s҉G҉o҉o҉d҉M҉a҉n҉F҉e҉e҉l҉s҉G҉o҉o҉d҉M҉a҉nF҉e҉e҉l҉s҉G҉o҉o҉d҉M҉a҉n FeelsGoodMan F҉e҉e҉l҉s҉G҉o҉o҉d҉M҉a҉n҉F҉e҉e҉l҉s҉G҉o҉o҉d҉M҉a҉nF҉e҉e҉l҉s҉G҉o҉o҉d҉M҉a҉n FeelsGoodMan', 0, '2018-12-31 17:53:31', NULL),
('406052683', 'cloudyeaa', 'cloudyeaa', 'https://static-cdn.jtvnw.net/jtv_user_pictures/369ffe1a-e53a-4735-bdc4-4cea499049c0-profile_image-300x300.png', 'ok', 0, '2019-01-02 00:46:43', NULL),
('406305767', 'fmb6', 'FMB6', 'https://static-cdn.jtvnw.net/jtv_user_pictures/b6d58440-8bd8-4fc0-8b97-67e596e9b3b0-profile_image-300x300.png', '', 0, '2019-01-03 00:04:54', NULL),
('411896188', 'notaaronxd', 'NotAaronxD', 'https://static-cdn.jtvnw.net/jtv_user_pictures/979332af-bb1b-4257-be4b-b8cd001cced9-profile_image-300x300.png', 'Loser', 0, '2019-01-24 16:58:27', NULL),
('412150332', 'dau8er', 'DAU8ER', 'https://static-cdn.jtvnw.net/jtv_user_pictures/f9e413e1-4175-4aa2-9fd5-ae20780fbf83-profile_image-300x300.png', 'Oida was laaaaft ', 0, '2019-01-25 19:14:03', NULL),
('414160944', 'phil', 'phil', 'https://static-cdn.jtvnw.net/jtv_user_pictures/40db6f6c-a347-449e-9b99-28486199666d-profile_image-300x300.png', 'Hi Gang, ich bin Phil. Ich arbeite nicht mehr nur bei Twitch, sondern bei Amazon. Meine Q&As lass mal stehen. Irgendwie nostalgisch….', 0, '2019-02-03 12:23:50', NULL),
('418915228', 'schm1m', 'Schm1m', 'https://static-cdn.jtvnw.net/jtv_user_pictures/62c6849e-27ed-401a-a5e2-46dfce0a64be-profile_image-300x300.png', 'best i can do is bad gameplay', 0, '2019-02-23 18:13:36', NULL),
('418937550', 'ananasxpress_', 'ananasxpress_', 'https://static-cdn.jtvnw.net/jtv_user_pictures/b95982ae-55fb-4d55-a7ed-a8549ad6bbc0-profile_image-300x300.jpeg', 'Yo', 0, '2019-02-23 19:09:25', NULL),
('425099110', 'xpigup', 'xPigUp', 'https://static-cdn.jtvnw.net/jtv_user_pictures/191e2106-7df2-46ea-9e49-0a7d42c72ed5-profile_image-300x300.png', '', 0, '2019-03-22 13:56:43', NULL),
('433400174', 'xreavy', 'xReavy', 'https://static-cdn.jtvnw.net/jtv_user_pictures/be1dafe5-b327-4c80-923a-979c31bdb8c3-profile_image-300x300.png', '', 0, '2019-05-01 15:59:58', NULL),
('445736722', 'janniswyi', 'JannisWYI', 'https://static-cdn.jtvnw.net/jtv_user_pictures/a95d73fc-8f1c-474d-8e50-45f041cf7d85-profile_image-300x300.jpeg', 'Syke des Vertrauens ', 0, '2019-07-03 20:38:48', NULL),
('447709146', '2coyi', '2coyi', 'https://static-cdn.jtvnw.net/jtv_user_pictures/ed24ba9f-fbf9-4546-9849-b75111652009-profile_image-300x300.png', 'Keine Ahnung, streame halt oder so', 0, '2019-07-12 02:44:58', NULL),
('448440136', 'neerruu', 'neerruu', 'https://static-cdn.jtvnw.net/jtv_user_pictures/3ad2d692-9567-488e-be25-944d633c9264-profile_image-300x300.png', '', 0, '2019-07-15 09:33:02', NULL),
('450777043', '8hvdes', '8HVDES', 'https://static-cdn.jtvnw.net/jtv_user_pictures/b469795f-ee0c-4737-a173-4752a5e60f43-profile_image-300x300.png', 'Twitch and 7TV Moderator', 0, '2019-07-26 15:28:32', NULL),
('453742304', 'zanubixd', 'zanubixd', 'https://static-cdn.jtvnw.net/jtv_user_pictures/cbbabca7-d40e-4068-ad8c-2329253d7dcd-profile_image-300x300.png', 'ballin.', 0, '2019-08-10 10:41:59', NULL),
('457674693', 'mepplgotdrip', 'MEPPLGOTDRIP', 'https://static-cdn.jtvnw.net/jtv_user_pictures/ad175cd2-081b-45f7-b76c-63e7791aa0f3-profile_image-300x300.jpeg', 'xqcL', 0, '2019-08-28 10:00:34', NULL),
('468580603', 'aurxm', 'Aurxm', 'https://static-cdn.jtvnw.net/jtv_user_pictures/4b958c55-51ad-420e-9c1a-8c500a88e8e3-profile_image-300x300.png', 'lolxd', 0, '2019-10-22 13:39:35', NULL),
('468924601', 'tp66955', 'TP66955', 'https://static-cdn.jtvnw.net/jtv_user_pictures/b01d9225-fddd-43ee-955c-93e3357ec43b-profile_image-300x300.png', '', 0, '2019-10-24 17:18:20', NULL),
('474580827', 'zcrumbs', 'zCrumbs', 'https://static-cdn.jtvnw.net/jtv_user_pictures/f0651fcc-fed7-4f95-a372-785955699198-profile_image-300x300.png', 'Twitch Chatter & Moderator ', 0, '2019-11-25 14:01:26', NULL),
('475287249', 'justvanne', 'justvanne', 'https://static-cdn.jtvnw.net/jtv_user_pictures/29ec9bd5-875a-45f7-be32-bb1f8e4593b8-profile_image-300x300.png', 'Hallo peepoHappy falls ich Chat nicht lese bitti nicht böse sein', 0, '2019-11-29 19:47:41', NULL),
('475748597', 'zonianmidian', 'ZonianMidian', 'https://static-cdn.jtvnw.net/jtv_user_pictures/23ceee40-8d71-488a-9e6f-faa8f574db1b-profile_image-300x300.png', 'Nos vemos en el futuro ( • ֊ • )╯', 0, '2019-12-02 12:10:46', NULL),
('476943360', 'tecdenny', 'TeCDenny', 'https://static-cdn.jtvnw.net/jtv_user_pictures/f3c8699e-2995-4e9c-a975-1e11435e7077-profile_image-300x300.png', '', 0, '2019-12-09 13:27:53', NULL),
('477232357', 'k177uaaa', 'k177uaaa', 'https://static-cdn.jtvnw.net/jtv_user_pictures/32c66402-cb91-49fb-8da3-c4dc57466cf3-profile_image-300x300.jpeg', '', 0, '2019-12-11 07:32:46', NULL),
('48048659', 'lucas19961', 'lucas19961', 'https://static-cdn.jtvnw.net/jtv_user_pictures/d7b89f3b-aca3-4358-b5e5-d7ddff5b0e53-profile_image-300x300.png', 'ฏ๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎ํํํํํํํํํํํํํํํํํํํํํํํํํํỎ͖͈̞̩͎̻̫̫̜͉̠̫͕̭̭̫̫̹̗̹͈̼̠̖͍͚̥͈̮̼͕̠̤̯̻̥̬̗̼̳̤̳̬̪̹͚̞̼̠͕̼̠̦͚̫͔̯̹͉͉̘͎͕̼̣̝͙̱̟̹̩̟̳̦̭͉̮̖̭̣̣̞̙̗̜̺̭̻̥͚͙̝̦̲̱͉͖͉̰̦͎̫̣̼͎͍̠̮͓̹̹͉̤̰̗̙͕͇͔̱͕̭͈̳̗̭͔̘̖̺̮̜̠͖̘͓̳͕̟̠̱̫̤͓͔̘̰̲͙͍͇̙͎̣̼̗̖͙̯͉̠̟͈͍͕̪͓̝̩̦̖̹̼̠̘̮͚̟͉̺̜͍͓̯̳', 0, '2013-08-24 10:15:07', NULL),
('480986473', 'xredouan', 'xredouan', 'https://static-cdn.jtvnw.net/jtv_user_pictures/b561cd54-67a9-4961-b4e9-67cedb46a6fc-profile_image-300x300.png', 'lol', 0, '2019-12-30 11:21:58', NULL),
('486545285', 'iwantcookiez', 'IwantCookiez', 'https://static-cdn.jtvnw.net/jtv_user_pictures/4f7a8537-656d-46cd-bf0e-9963e63f00d7-profile_image-300x300.png', '', 0, '2020-01-18 18:45:31', NULL),
('486970200', 'fynn_ebr', 'fynn_ebr', 'https://static-cdn.jtvnw.net/jtv_user_pictures/e5f807e5-96e8-4237-ad4c-04c2b4fa9d4a-profile_image-300x300.png', 'contact@fynnebr.com :)', 0, '2020-01-20 15:59:59', NULL),
('489472702', 'fookstee', 'Fookstee', 'https://static-cdn.jtvnw.net/jtv_user_pictures/13a0afa9-1ded-427d-903c-860abd5efc27-profile_image-300x300.png', '', 0, '2020-01-31 23:30:45', NULL),
('492230503', 'raydoil', 'raydoIl', 'https://static-cdn.jtvnw.net/jtv_user_pictures/f3fa98e5-567c-42f0-a181-e50536850da1-profile_image-300x300.png', '✩linksversifftesau✩', 0, '2020-02-13 11:41:11', NULL),
('492818669', 'mersufy', 'Mersufy', 'https://static-cdn.jtvnw.net/jtv_user_pictures/b71c258c-e3e9-4efc-aad9-b7e38fb30959-profile_image-300x300.png', 'hi', 0, '2020-02-16 07:43:57', NULL),
('496088785', 'patrick71z', 'Patrick71z', 'https://static-cdn.jtvnw.net/jtv_user_pictures/8ff95979-3a20-4636-9473-999d1d64be5c-profile_image-300x300.png', 'MODDING Discord contact: @Patrick71z', 0, '2020-02-29 14:19:32', NULL),
('496797837', 'wandermaus2005', 'wandermaus2005', 'https://static-cdn.jtvnw.net/jtv_user_pictures/5d16186c-07f9-47ed-b777-b1bae5fbaa37-profile_image-300x300.jpeg', 'joa :3', 0, '2020-03-03 14:42:26', NULL),
('499189479', 'regressz', 'regressz', 'https://static-cdn.jtvnw.net/jtv_user_pictures/2e699c42-212b-47f1-a858-0aa2791b44e2-profile_image-300x300.png', 'regret', 0, '2020-03-13 20:40:45', NULL),
('502145172', 'xgxdeon', 'xGxdeon', 'https://static-cdn.jtvnw.net/jtv_user_pictures/9c3e55be-b1b3-4a3b-bd53-b33d3091dcbd-profile_image-300x300.png', 'hi', 0, '2020-03-22 00:13:13', NULL),
('503016207', 'm1chellem1', 'M1CHELLEM1', 'https://static-cdn.jtvnw.net/jtv_user_pictures/0b0adfa5-ec1d-4457-97c5-5922ab3c0f9e-profile_image-300x300.png', 'was machen sachen? hi, ich bin michelle - alles hier ist eine wilde achterbahn der gedanken, die sich schwer in worte fassen lassen ✨', 0, '2020-03-24 00:45:43', NULL),
('503279234', 'vgregor', 'vGregor', 'https://static-cdn.jtvnw.net/jtv_user_pictures/dd2588af-ad55-4b6a-b9fc-d5df7816e02f-profile_image-300x300.png', 'Streame Jeden Tag', 0, '2020-03-24 17:29:05', NULL),
('504443631', 'juliilan', 'JULIIlAN', 'https://static-cdn.jtvnw.net/jtv_user_pictures/bbc5dd45-498e-4d51-922e-a587f67322f5-profile_image-300x300.png', ':P', 0, '2020-03-27 11:44:59', NULL),
('514785790', 'bobthebuilder_98', 'Bobthebuilder_98', 'https://static-cdn.jtvnw.net/jtv_user_pictures/c414a1c8-b361-49a5-bf35-cfac6d49059b-profile_image-300x300.png', '', 0, '2020-04-15 18:39:50', NULL),
('520655339', 'dn9n', 'dn9n', 'https://static-cdn.jtvnw.net/jtv_user_pictures/f57ce334-894c-4fb7-bead-78ce7261226f-profile_image-300x300.png', '‎ ', 0, '2020-04-26 01:00:34', NULL),
('523222266', 'mahdialonzo', 'MahdiAlonzo', 'https://static-cdn.jtvnw.net/jtv_user_pictures/1b9deda4-5956-41f7-99e6-a527b424b17e-profile_image-300x300.png', 'business inquiries: mahdi@relaxo.dev', 0, '2020-04-30 15:03:07', NULL),
('527026170', 'gtrrrr_', 'gtrrrr_', 'https://static-cdn.jtvnw.net/jtv_user_pictures/217af8aa-a1fb-4e29-9156-c1817fd6a68e-profile_image-300x300.png', 'ForsenLookingAtYourMom ', 0, '2020-05-07 12:38:09', NULL),
('533829708', 'mocsxd', 'mocsxd', 'https://static-cdn.jtvnw.net/jtv_user_pictures/596b1430-fe46-4849-9d0d-ad60d1504604-profile_image-300x300.png', '', 0, '2020-05-21 17:40:37', NULL),
('535534480', 'lucysebast', 'LucySebast', 'https://static-cdn.jtvnw.net/jtv_user_pictures/ca62dacc-7cea-4358-833d-221349caf6ea-profile_image-300x300.png', 'hi :b', 0, '2020-05-25 16:27:20', NULL),
('537025917', 'fabianfabiho', 'fabianfabiho', 'https://static-cdn.jtvnw.net/jtv_user_pictures/e54b9e8b-483e-44d8-9c35-2b1a0b3a6f80-profile_image-300x300.png', '', 0, '2020-05-29 10:56:33', NULL),
('537196168', 'mylifeislul', 'Mylifeislul', 'https://static-cdn.jtvnw.net/jtv_user_pictures/a336cc34-dee2-4aa2-a36b-3d66421816b6-profile_image-300x300.png', 'buh', 0, '2020-05-29 19:06:52', NULL),
('541450924', 'creatisbot', 'CreatisBot', 'https://static-cdn.jtvnw.net/jtv_user_pictures/ba6e069d-d3ca-43f2-9615-25347f195e58-profile_image-300x300.png', 'Creati\'s Bot. The bot behind Isaiah Creati\'s Channel Points system.  https://bot.isaiahcreati.com', 0, '2020-06-09 06:26:01', NULL),
('542519545', 'snipyl', 'SnipyL', 'https://static-cdn.jtvnw.net/jtv_user_pictures/670cb49d-a9a9-4ea5-8591-d9e839f76941-profile_image-300x300.png', 'ome5', 0, '2020-06-11 19:19:24', NULL),
('545612327', 'j0hann3s_04', 'j0hann3s_04', 'https://static-cdn.jtvnw.net/jtv_user_pictures/e28e7793-0c2d-4e29-8507-d6cc57a1a9c3-profile_image-300x300.png', '', 0, '2020-06-19 15:36:17', NULL),
('546292461', 'limetimepop', 'LimeTimePop', 'https://static-cdn.jtvnw.net/jtv_user_pictures/72c9be70-78ef-4b89-9d97-cd5b34f28cb6-profile_image-300x300.png', '', 0, '2020-06-21 12:24:21', NULL),
('546352474', 'louis_030303', 'Louis_030303', 'https://static-cdn.jtvnw.net/jtv_user_pictures/5486227e-6035-4d88-b7f3-8f723a68f2c5-profile_image-300x300.jpeg', 'Happi', 0, '2020-06-21 16:05:25', NULL),
('548615789', 'sxqremee', 'Sxqremee', 'https://static-cdn.jtvnw.net/jtv_user_pictures/91a44f3a-cde6-443d-a48b-601d9c7214ba-profile_image-300x300.png', 'alowo', 0, '2020-06-27 18:43:54', NULL),
('566087577', 'm1kareal', 'm1kareal', 'https://static-cdn.jtvnw.net/jtv_user_pictures/1283d43e-b3ce-403e-b6e0-cfe28ee3ff81-profile_image-300x300.png', 'Checkt gerne meine anderen socials aus ♥️ bitti', 0, '2020-08-12 10:01:11', NULL),
('56932772', 'rensen47', 'rensen47', 'https://static-cdn.jtvnw.net/jtv_user_pictures/rensen47-profile_image-cc9d34fb591334bc-300x300.jpeg', '', 0, '2014-02-16 18:13:09', NULL),
('569487930', 'dcheroyt', 'DCheroYT', 'https://static-cdn.jtvnw.net/jtv_user_pictures/c0519c71-7ee7-4445-ae1b-008327faace2-profile_image-300x300.jpeg', 'yk when you know', 0, '2020-08-19 11:25:14', NULL),
('569956677', 'twispobot', 'TwiSpoBot', 'https://static-cdn.jtvnw.net/jtv_user_pictures/a5eec82d-e2fd-4e2b-a007-adc596b17cae-profile_image-300x300.png', 'TwiSpoBot ist ein privater Twitch-Bot.', 0, '2020-08-20 09:18:12', NULL),
('572114208', 'are9a', 'ARE9A', 'https://static-cdn.jtvnw.net/jtv_user_pictures/b13ab744-8be8-4434-ac31-0d006a057a1c-profile_image-300x300.jpeg', 'sup homie ', 0, '2020-08-24 11:58:48', NULL),
('574933584', 'fabianlswtor', 'FabianLSWTOR', 'https://static-cdn.jtvnw.net/jtv_user_pictures/bc7383cc-8988-448f-9981-cf22d54c68e2-profile_image-300x300.png', 'sus', 0, '2020-08-29 15:24:29', NULL),
('581648291', 'der__keks_', 'der__keks_', 'https://static-cdn.jtvnw.net/jtv_user_pictures/65433bc8-a885-4290-9507-be81f842a4f7-profile_image-300x300.png', '', 0, '2020-09-10 14:24:33', NULL),
('592633260', '8alone', '8ALONE', 'https://static-cdn.jtvnw.net/jtv_user_pictures/e3e72c9f-0569-47f2-a072-bcedb0ea8d84-profile_image-300x300.png', 'ALONE𖤐', 0, '2020-10-06 20:37:35', NULL),
('596675864', 'vmyk', 'VMYK', 'https://static-cdn.jtvnw.net/jtv_user_pictures/3f4df56b-c012-4484-b750-b0fe8065bace-profile_image-300x300.png', 'babe, i\'m breaking up with you. it\'s not you, you were poggers. it\'s me, i\'m omegalul. im sorry if this is pepehands but it has to be done, i\'ve just been feeling pepega and our relationship has been weirdchamp for months, it\'s time to end it, no kappa.', 0, '2020-10-16 20:22:17', NULL),
('597010881', 'leabedumb', 'leabedumb', 'https://static-cdn.jtvnw.net/jtv_user_pictures/61bc8930-8f52-4d27-97ef-9ad2c4e422be-profile_image-300x300.png', 'bin dumm, mehr gibt\'s nicht zu sagen ', 0, '2020-10-17 16:28:20', NULL),
('608747423', 'denizlpsevv', 'DENIZLPSEVV', 'https://static-cdn.jtvnw.net/jtv_user_pictures/c089c458-a43c-46cd-9dae-5aca19b65434-profile_image-300x300.png', '', 0, '2020-11-14 15:46:07', NULL),
('615684014', 'thisisjonass', 'thisisjonass', 'https://static-cdn.jtvnw.net/jtv_user_pictures/617f2e59-75f8-4b23-8dac-d5c557a34c56-profile_image-300x300.png', '', 0, '2020-12-02 13:12:32', NULL),
('618436662', 'thomas_gottschlag1994', 'thomas_gottschlag1994', 'https://static-cdn.jtvnw.net/jtv_user_pictures/63db06a0-8e82-4219-afb7-c689ad29e8ca-profile_image-300x300.png', '', 0, '2020-12-09 18:52:30', NULL),
('624738349', 'spikelk7', 'spikelk7', 'https://static-cdn.jtvnw.net/jtv_user_pictures/6128bee8-6375-4762-abac-117123ac6147-profile_image-300x300.png', 'Twitch Mod ', 0, '2020-12-22 17:27:40', NULL),
('625016038', 'apulxd', 'Apulxd', 'https://static-cdn.jtvnw.net/jtv_user_pictures/aa485f9f-f36d-42bb-8392-61a547cb1fe9-profile_image-300x300.png', 'Oh, hello! :D', 0, '2020-12-23 09:12:44', NULL),
('636810350', 'vibewithcassy', 'vibewithcassy', 'https://static-cdn.jtvnw.net/jtv_user_pictures/d5f891bb-82e1-4f93-bd32-39954e39f3c9-profile_image-300x300.png', 'hi', 0, '2021-01-15 17:17:47', NULL),
('636823070', 'lellolidk', 'lellolidk', 'https://static-cdn.jtvnw.net/jtv_user_pictures/d594b4a8-02ee-45f9-8dbd-3632972c57b9-profile_image-300x300.png', 'ok', 0, '2021-01-15 17:50:58', NULL),
('638471990', 'easyemi', 'easyemi', 'https://static-cdn.jtvnw.net/jtv_user_pictures/382b64c4-da55-4dce-a60f-7b5f9a8b6405-profile_image-300x300.png', 'gg go next⚡', 0, '2021-01-19 08:16:07', NULL),
('64144838', 'highpixelplayer', 'HighPixelPlayer', 'https://static-cdn.jtvnw.net/jtv_user_pictures/dde94e1b-d5bf-480d-991c-845b0e98f0cc-profile_image-300x300.png', 'Let\'s Plays und Tutoials Mit HighPixelPlayer auf YouTube war gestern. Jetzt IRL, Gaming und Just Chatting Livestreams mit HighPixelPlayer auf Twitch peepoHappy', 0, '2014-06-11 05:15:38', NULL),
('641972806', 'kaicenat', 'KaiCenat', 'https://static-cdn.jtvnw.net/jtv_user_pictures/1d8cd548-04fa-49fb-bfcd-f222f73482b6-profile_image-300x300.png', 'Come Through & Watch These Litt STREAMS! ', 0, '2021-01-27 00:55:08', NULL),
('645818912', 'ffffranziiii', 'ffffranziiii', 'https://static-cdn.jtvnw.net/jtv_user_pictures/4b9d06eb-4781-4fd6-8f8f-3306dd524b1f-profile_image-300x300.jpeg', '', 0, '2021-02-04 14:00:11', NULL),
('645960680', 'johannnees', 'johannnees', 'https://static-cdn.jtvnw.net/jtv_user_pictures/bc850c22-731b-444a-a1c7-284894b2f025-profile_image-300x300.png', '', 0, '2021-02-04 20:06:53', '2024-07-09 06:38:54'),
('64657760', 'drwuppmann', 'DrWuppmann', 'https://static-cdn.jtvnw.net/jtv_user_pictures/61b65a1d-2366-4495-80f9-d37a5d3dd88e-profile_image-300x300.png', 'Zu Risiken und Nebenwirkungen fragen Sie Ihren Arzt oder Apotheker.', 0, '2014-06-19 07:26:59', NULL),
('648984729', 'baer_lolmy', 'baer_lolmy', 'https://static-cdn.jtvnw.net/jtv_user_pictures/c731c231-3665-427d-a9a6-af793cd11139-profile_image-300x300.png', 'Herzlich Willkommen,Hier findest du Tägliche Streams! Community Discord: https://discord.gg/bp2YrUMcUW Business: lolmybuissness@proton.me', 0, '2021-02-11 19:52:51', NULL),
('650401636', 'valentinaaaaa_1909', 'valentinaaaaa_1909', 'https://static-cdn.jtvnw.net/jtv_user_pictures/73b93b63-2448-4644-80ea-5cecad7879c9-profile_image-300x300.png', 'aber, bin ich stabil?', 0, '2021-02-14 13:55:54', NULL),
('650703963', 'betnotifier', 'BetNotifier', 'https://static-cdn.jtvnw.net/jtv_user_pictures/1628646b-652e-4944-99e5-320bdac8de8c-profile_image-300x300.png', 'Bot to notify users when a streamer creates a new prediction so they will never miss predictions again.', 0, '2021-02-15 00:33:11', NULL),
('654368477', '0xwwwwwwwwwwwwwwwwwwwwwww', '0xWWWWWWWWWWWWWWWWWWWWWWW', 'https://static-cdn.jtvnw.net/jtv_user_pictures/5f0e62e5-312b-49c9-b2b0-5b7a4075725a-profile_image-300x300.png', 'Moin, ich bin 0xWWWWWWWWWWWWWWWWWWWWWWW.', 0, '2021-02-23 19:50:17', NULL),
('655290698', 'za8uza', 'ZA8UZA', 'https://static-cdn.jtvnw.net/jtv_user_pictures/0fd721ef-4e38-41e9-9855-840c65784d72-profile_image-300x300.png', 'TriHard', 0, '2021-02-26 06:10:01', NULL),
('659440190', 'e8ignmarke', 'e8ignmarke', 'https://static-cdn.jtvnw.net/user-default-pictures-uv/cdd517fe-def4-11e9-948e-784f43822e80-profile_image-300x300.png', '', 0, '2021-03-08 16:10:24', NULL),
('662032340', 'vitaminnoah', 'vitaminnoah', 'https://static-cdn.jtvnw.net/jtv_user_pictures/c38e22d4-933b-439f-8ca6-48acf7eab237-profile_image-300x300.png', 'Dein Geschenk Gottes', 0, '2021-03-14 10:15:47', NULL),
('667794838', '7domi_', '7DOMI_', 'https://static-cdn.jtvnw.net/jtv_user_pictures/19accb1f-65da-42eb-bc08-aa5bb64718d9-profile_image-300x300.jpeg', '', 0, '2021-03-27 21:39:39', '2024-07-09 06:34:03'),
('669106380', 'kehouk', 'KEHOUK', 'https://static-cdn.jtvnw.net/jtv_user_pictures/300f2b77-223c-491b-804e-15d107a68cb6-profile_image-300x300.png', 'God of War, Trackmania and Call of Duty.', 0, '2021-03-30 12:31:29', NULL),
('676966284', 'lilb_lxryer', 'lilb_lxryer', 'https://static-cdn.jtvnw.net/jtv_user_pictures/b315efbb-c70c-43eb-964a-74211a48f69e-profile_image-300x300.jpeg', 'lol', 0, '2021-04-17 14:34:27', '2024-07-14 14:52:42'),
('677141167', 'tthev', 'tthev', 'https://static-cdn.jtvnw.net/jtv_user_pictures/e86389d3-f64e-42b7-b74e-74fae7d6b927-profile_image-300x300.png', '', 0, '2021-04-17 22:10:30', NULL),
('678508684', 'same1lo', 'same1lo', 'https://static-cdn.jtvnw.net/jtv_user_pictures/aa74b649-0e85-423a-9ad2-077b6067f053-profile_image-300x300.png', '', 0, '2021-04-21 16:03:23', NULL),
('68136884', 'supibot', 'Supibot', 'https://static-cdn.jtvnw.net/jtv_user_pictures/db8e1ed5-9dea-4357-a5e1-8ad372765446-profile_image-300x300.png', 'Beep boop. @Supinic made me.', 0, '2014-08-04 08:14:48', NULL),
('684907887', 'mynamecallfelix', 'mynamecallfelix', 'https://static-cdn.jtvnw.net/jtv_user_pictures/36257caf-b195-4652-8606-8002b37dbb7a-profile_image-300x300.png', 'Hello Guys, I am mynamecallfelix aka Felix. I play a lot Games, like Minecraft or Fps Games like Apex/Valorant', 0, '2021-05-08 15:35:07', NULL),
('686363617', 'feelsdankman_daniel', 'feelsdankman_daniel', 'https://static-cdn.jtvnw.net/jtv_user_pictures/3bf8382d-6783-46f5-94c6-6116182f881a-profile_image-300x300.png', '', 0, '2021-05-11 06:52:52', NULL),
('687075170', 'lithamsterlaze', 'lithamsterlaze', 'https://static-cdn.jtvnw.net/jtv_user_pictures/6fded0f7-2073-47b3-ae5d-8c748296743e-profile_image-300x300.png', 'joa', 0, '2021-05-13 15:34:17', NULL),
('692981433', 'harass_', 'HARASS_', 'https://static-cdn.jtvnw.net/jtv_user_pictures/ecf9ee4e-3b48-499f-8fbe-0fae45ccf08c-profile_image-300x300.png', 'pipapo', 0, '2021-06-01 13:51:06', NULL),
('693727775', 'cashkhonshu', 'CashKhonshu', 'https://static-cdn.jtvnw.net/jtv_user_pictures/b03de10c-77d9-4489-abf7-93a46e644c17-profile_image-300x300.png', 'https://feds.lol/CashKhonshu', 0, '2021-06-03 18:18:27', NULL),
('700957107', 'wizzyy6', 'wizzyy6', 'https://static-cdn.jtvnw.net/jtv_user_pictures/d4d85db4-427e-4146-957d-f91387dd2126-profile_image-300x300.png', '...', 0, '2021-06-24 15:08:18', NULL),
('711348782', 'aecrobot', 'AecroBot', 'https://static-cdn.jtvnw.net/jtv_user_pictures/21a2528f-9720-4edb-91b8-8fc1e2286807-profile_image-300x300.png', 'Advanced Chat Moderation Bot', 0, '2021-07-26 19:56:18', NULL),
('726027069', 'cannkrd', 'cannkrd', 'https://static-cdn.jtvnw.net/jtv_user_pictures/ebb30442-2bd4-4beb-a860-8d3546b0846e-profile_image-300x300.png', '#ad Creator Code cannkrd', 0, '2021-09-12 00:19:46', NULL),
('729353699', 'ravenbtw', 'Ravenbtw', 'https://static-cdn.jtvnw.net/jtv_user_pictures/7f4e6c16-2c26-4d21-96cb-9b09fbcc8d7f-profile_image-300x300.png', 'Developer, creating tools and experiences.', 0, '2021-09-25 08:00:15', NULL),
('736656096', 'ravcegnt', 'RavceGNT', 'https://static-cdn.jtvnw.net/jtv_user_pictures/ff3ca359-afc0-434a-8d01-ea2ccf4a491b-profile_image-300x300.png', '', 0, '2021-10-23 17:23:43', NULL),
('739292066', 'justin_lapaz', 'Justin_Lapaz', 'https://static-cdn.jtvnw.net/jtv_user_pictures/1f352b31-b285-4401-a1ed-3e2e76f45146-profile_image-300x300.png', '╰┈⫸ Der W-Streamer, den du je gefunden hast! 💥╰┈⫸ Twitch-Moderator of Nuno ⚒️╰┈⫸ Brawl Stars Streamer 🏆 34K', 0, '2021-11-02 12:30:09', NULL),
('74133511', 'herrkonsorten', 'HerrKonsorten', 'https://static-cdn.jtvnw.net/jtv_user_pictures/ef927b7d-5534-4f4e-8f9f-2d44e3e7b3b2-profile_image-300x300.png', 'Hallo ich bin Chris, 25 Jahre alt und schau ma was wird. Ich streame nur ab und zu und wenn dann immer mal was anderes. Ich wünsche euch allen viel spaß ;D', 0, '2014-10-31 15:17:57', NULL),
('754201843', 'spanixbot', 'Spanixbot', 'https://static-cdn.jtvnw.net/jtv_user_pictures/7994f653-a946-45b8-9e17-3d9d9c14f386-profile_image-300x300.png', 'BOT multiplataforma en español | Paneles para más información | https://bot.spanix.team', 0, '2021-12-20 00:52:39', NULL),
('755628467', 'blockydotjar', 'BlockyDotJar', 'https://static-cdn.jtvnw.net/jtv_user_pictures/41b1302b-0bc4-4724-a137-f0312250c727-profile_image-300x300.png', 'Moin moin', 0, '2021-12-25 09:47:37', NULL),
('757102582', 'streamdatabase', 'StreamDatabase', 'https://static-cdn.jtvnw.net/jtv_user_pictures/6289b83b-75bb-4343-bce9-6dbaad1de8d3-profile_image-300x300.png', '', 0, '2021-12-30 04:04:16', NULL),
('771789654', 'zsimonn', 'zSimonn', 'https://static-cdn.jtvnw.net/jtv_user_pictures/15e504bd-87bf-4155-8590-6e577b2f8f28-profile_image-300x300.png', 'Where Is My Mind?', 0, '2022-02-11 20:50:40', NULL),
('772450899', 'lurfeyy', 'LURFEYY', 'https://static-cdn.jtvnw.net/jtv_user_pictures/401da06f-1892-4587-81bd-184847e924e6-profile_image-300x300.png', 'Hier gibt es so Daily Streams und so, ka voll der komische.', 0, '2022-02-13 20:47:27', NULL),
('778353697', 'susgeebot', 'Susgeebot', 'https://static-cdn.jtvnw.net/jtv_user_pictures/e5d0fd51-7598-4af5-b9c1-6513560117d2-profile_image-300x300.png', '', 0, '2022-03-07 19:37:22', NULL),
('782987978', 'jappisneuelippen', 'jappisneuelippen', 'https://static-cdn.jtvnw.net/jtv_user_pictures/90b6b188-fc0b-4d23-82a7-b75d40416ddb-profile_image-300x300.png', 'Meow', 0, '2022-03-26 11:05:41', NULL),
('784897223', 'deidaraxx', 'Deidaraxx', 'https://static-cdn.jtvnw.net/jtv_user_pictures/c892c3d1-3c49-405e-a99f-e93b30a38137-profile_image-300x300.png', 'Froschnite!        Deidaraxx, 15,     Tägliche Streams   (meistens sehr kurz und scheiße)                                                                                                                   ', 0, '2022-04-02 16:01:06', NULL),
('78672943', 'is2511', 'IS2511', 'https://static-cdn.jtvnw.net/jtv_user_pictures/3f3554de-aa9d-41e9-8dfa-17df9a652089-profile_image-300x300.jpeg', 'Someone with a computer and internet access widepeepoHappy', 0, '2015-01-02 15:59:51', NULL),
('79423298', 'zawin', 'Zawin', 'https://static-cdn.jtvnw.net/jtv_user_pictures/zawin-profile_image-2a84531ab01afbb2-300x300.png', 'hi na', 0, '2015-01-10 12:13:28', NULL),
('798779709', 'aliina_69', 'aliina_69', 'https://static-cdn.jtvnw.net/jtv_user_pictures/f8353b06-25aa-4570-adc1-d0a54bb3be94-profile_image-300x300.png', 'hier passiert nix ', 0, '2022-06-01 18:21:09', NULL),
('79972255', 'floweryalina', 'Floweryalina', 'https://static-cdn.jtvnw.net/jtv_user_pictures/6b480a4b-15d8-48d0-9905-bacd65cce3eb-profile_image-300x300.png', '♡  𝒃𝒆 𝒚𝒐𝒖𝒓 𝒐𝒘𝒏 𝒊𝒏𝒔𝒑𝒊𝒓𝒂𝒕𝒊𝒐𝒏. ', 0, '2015-01-16 16:34:06', NULL),
('811561106', '7jxn', '7JXN', 'https://static-cdn.jtvnw.net/jtv_user_pictures/7fd549ec-0e9c-4871-857d-669be0b91b20-profile_image-300x300.png', 'ᴛᴡɪᴛᴄʜ ᴍᴏᴅᴇʀᴀᴛᴏʀ', 0, '2022-07-22 21:13:02', NULL),
('816713504', 'rodorigesuuu', 'RODORIGESUUU', 'https://static-cdn.jtvnw.net/jtv_user_pictures/9a4a5a75-96cb-49fb-b49d-b0d625db8d94-profile_image-300x300.png', 'hey', 0, '2022-08-11 06:10:19', NULL),
('81745668', 'thepingspire', 'ThePingspire', 'https://static-cdn.jtvnw.net/jtv_user_pictures/9971b49c-5784-4192-a149-bf32f9864264-profile_image-300x300.png', 'FeelsOkayMan', 0, '2015-02-03 22:41:05', NULL),
('81815340', 'isnicable', 'isnicable', 'https://static-cdn.jtvnw.net/jtv_user_pictures/cb10e029-2051-465c-88be-2697a2f3fb77-profile_image-300x300.png', 'Next Stream coming soon, hit the follow button to get a notification 🔔  | !next ', 0, '2015-02-04 19:56:09', NULL),
('820351813', 'raandy187', 'Raandy187', 'https://static-cdn.jtvnw.net/jtv_user_pictures/98c6ef28-c086-41bc-9c8d-988f94a2e4f5-profile_image-300x300.png', '', 0, '2022-08-25 14:50:11', NULL),
('823358807', 'kasimirbrett', 'KasimirBrett', 'https://static-cdn.jtvnw.net/jtv_user_pictures/29c23b0a-2df3-4faa-b69a-07d4ee8c7a29-profile_image-300x300.png', '', 0, '2022-09-06 15:33:20', NULL),
('824594608', '7niss', '7NISS', 'https://static-cdn.jtvnw.net/jtv_user_pictures/61b229b9-e63a-465c-8c6b-3aefde072b3d-profile_image-300x300.png', 'Twitch Streamer / Media Specialist | contact: contact@hnes.me', 0, '2022-09-11 12:51:42', NULL),
('826185626', 'dau8bot', 'DAU8BOT', 'https://static-cdn.jtvnw.net/jtv_user_pictures/d3a4e918-2cf7-4a64-ac8d-29ca136a45dc-profile_image-300x300.png', 'DAU8BOT provides a mix of chat modules including notifications, timers, fun commands, custom commands and -keywords and much more.', 0, '2022-09-17 07:50:39', NULL),
('834328308', 'joviibs', 'JoviiBS', 'https://static-cdn.jtvnw.net/jtv_user_pictures/ac145060-6b73-47f4-89ee-1b43518d7d9f-profile_image-300x300.png', 'W Streamer SG and more!!!! DC: https://discord.gg/n7cwhndQ', 0, '2022-10-01 11:53:47', NULL),
('836352666', 'fb1an_', 'Fb1an_', 'https://static-cdn.jtvnw.net/jtv_user_pictures/87d14c73-0896-4a5e-aee1-d02f1682a298-profile_image-300x300.png', '', 0, '2022-10-10 12:38:45', NULL),
('840365435', 'dieminusdudes', 'DieMinusdudes', 'https://static-cdn.jtvnw.net/jtv_user_pictures/ae29ccbb-3912-4ca5-b21d-3f92c990af7c-profile_image-300x300.png', 'Hier kommen fast Daily Streams. Schaut gerne vorbei :D', 0, '2022-10-25 07:36:15', NULL),
('86143905', 'anasenpai05_', 'AnaSenpai05_', 'https://static-cdn.jtvnw.net/jtv_user_pictures/3eb2b061-46e8-404f-9430-513a9ff8d60f-profile_image-300x300.jpeg', '🇩🇪 🇵🇹 🇺🇸 🇫🇷 🇱🇺', 0, '2015-03-24 16:54:41', NULL),
('865895441', 'potatbotat', 'PotatBotat', 'https://static-cdn.jtvnw.net/jtv_user_pictures/82d5fbab-005e-4711-89e1-dec1ab44a5e9-profile_image-300x300.png', 'A chatbot by RyanPotat to improve the quality of your chatting experience. Visit potat.app for help and a list of commands!', 0, '2023-01-01 21:02:33', NULL),
('869979893', 'alex_b0596', 'alex_b0596', 'https://static-cdn.jtvnw.net/jtv_user_pictures/cf8a9f2e-49f7-4f56-98fe-2b6c399fa896-profile_image-300x300.jpeg', '', 0, '2023-01-12 17:00:17', NULL),
('87695884', 'cvk3', 'CVK3', 'https://static-cdn.jtvnw.net/jtv_user_pictures/0d667e67-2db6-4677-8d5b-bfdc84739dc0-profile_image-300x300.png', ':3', 0, '2015-04-06 11:25:13', NULL),
('88140203', 'cuzimserious', 'cuzimserious', 'https://static-cdn.jtvnw.net/jtv_user_pictures/199fcd70-eaa6-434c-b2a3-85885814673d-profile_image-300x300.png', 'Twitch & Discord Moderator', 0, '2015-04-10 16:37:49', NULL),
('882073629', 'mewingmateo', 'MewingMateo', 'https://static-cdn.jtvnw.net/jtv_user_pictures/7de20957-e1cb-44c2-96b1-4c0e1b872bdc-profile_image-300x300.png', 'rndm', 0, '2023-02-14 14:49:53', NULL),
('883453487', 'deepdankdungeonbot', 'DeepDankDungeonBot', 'https://static-cdn.jtvnw.net/jtv_user_pictures/3bfcc376-1cab-429c-99bf-77faaaaf7b6a-profile_image-300x300.png', 'Bot by @noiredayz Check the About panel or write !howtoaddbot in the chat if you want the bot added to your channel.', 0, '2023-02-19 12:53:09', NULL),
('88492428', 'markzynk', 'markzynk', 'https://static-cdn.jtvnw.net/jtv_user_pictures/82c0ad46-9f80-4ce6-9778-2d662e0cae68-profile_image-300x300.png', '👉 ', 0, '2015-04-13 21:26:03', NULL),
('889474761', 'paulsfritten', 'paulsfritten', 'https://static-cdn.jtvnw.net/jtv_user_pictures/3e5c6d5d-af49-4f98-92c8-0b03c53950ca-profile_image-300x300.png', 'Ich bin offiziell hobbylos!!!', 0, '2023-03-12 17:53:38', NULL),
('893599032', '267colin', '267Colin', 'https://static-cdn.jtvnw.net/jtv_user_pictures/70bf97d5-0eda-46cd-ad02-62830c3d7598-profile_image-300x300.png', 'Spotify und sonst überall 267Colin passt so', 0, '2023-03-26 09:16:10', NULL),
('896702538', 'notle0nard', 'NotLe0nard', 'https://static-cdn.jtvnw.net/jtv_user_pictures/938ac96b-3c53-4a8b-a4a2-930f4fc26ee8-profile_image-300x300.png', 'ICH STREAME ALLES UND JEDEN TAG. BITTE DAS DA DRÜCKEN: https://7tv.app', 0, '2023-04-05 08:55:04', NULL),
('899021804', 'danielviersieben', 'danielviersieben', 'https://static-cdn.jtvnw.net/jtv_user_pictures/752f816e-d2ae-479a-a33f-86e08c6cbac6-profile_image-300x300.png', 'Chat Moderator & sometimes Streamer.', 0, '2023-04-12 17:58:44', '2024-07-09 06:34:11'),
('943559239', 'ryzesghg', 'RyzesGHG', 'https://static-cdn.jtvnw.net/jtv_user_pictures/739411a2-61e7-4278-b4f9-7282b38c9d5c-profile_image-300x300.png', 'Chatter and Moderator #GHG', 0, '2023-08-12 17:14:56', NULL),
('94531906', 'mindoftitanium', 'mindoftitanium', 'https://static-cdn.jtvnw.net/jtv_user_pictures/40650450-99a6-4230-ad74-2b15130441a0-profile_image-300x300.png', 'Willkommen auf meinem Kanal 💚 schau im Chat vorbei sag Hi 💚 mal schauen wann gestreamt wird 💚', 0, '2015-06-26 14:55:20', NULL),
('94623025', 'alisf98', 'AliSF98', 'https://static-cdn.jtvnw.net/jtv_user_pictures/792ef791-6754-4ff8-9729-120fa77ca50e-profile_image-300x300.png', '', 0, '2015-06-27 14:28:00', NULL),
('951349582', 'gofishgame', 'gofishgame', 'https://static-cdn.jtvnw.net/jtv_user_pictures/3e847926-7e29-457e-a7c3-004e5aceeea5-profile_image-300x300.png', 'Ask breadworms to add me to your channel.', 0, '2023-09-01 21:41:13', NULL),
('95421563', 'hoodiebruski', 'HoodieBruski', 'https://static-cdn.jtvnw.net/jtv_user_pictures/0c0560ab-ac1a-42d9-8fce-19f444721cc4-profile_image-300x300.png', 'Just another random guy on the internet.', 0, '2015-07-06 18:55:35', NULL),
('984601457', '0hez', '0hez', 'https://static-cdn.jtvnw.net/jtv_user_pictures/95123cb5-09ab-43f6-8269-96a46ffa3ff3-profile_image-300x300.png', 'XD', 0, '2023-11-07 21:21:48', NULL),
('995903564', 'maersucks', 'maersucks', 'https://static-cdn.jtvnw.net/user-default-pictures-uv/cdd517fe-def4-11e9-948e-784f43822e80-profile_image-150x150.png', 'void', 0, '2023-07-01 08:38:04', '2024-07-15 05:38:04'),
('996004171', 'susgeebot2', 'Susgeebot2', 'https://static-cdn.jtvnw.net/user-default-pictures-uv/cdd517fe-def4-11e9-948e-784f43822e80-profile_image-300x300.png', '', 0, '2023-11-25 16:41:02', NULL);

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `user_badges`
--

CREATE TABLE `user_badges` (
  `user_id` varchar(20) NOT NULL,
  `badge_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `user_badges`
--

INSERT INTO `user_badges` (`user_id`, `badge_id`) VALUES
('100023400', 1),
('100102531', 1),
('100135110', 2),
('103220302', 1),
('123521762', 2),
('132205514', 1),
('132883040', 1),
('138847184', 1),
('142668038', 1),
('151883075', 2),
('153215323', 1),
('165805620', 1),
('171854263', 1),
('172781249', 2),
('177139840', 1),
('179311496', 1),
('184675917', 1),
('194514131', 1),
('195648680', 1),
('199196363', 1),
('199354711', 1),
('202391035', 1),
('214700605', 1),
('216119826', 1),
('217986157', 3),
('217986157', 4),
('219044001', 1),
('23162550', 1),
('233729146', 1),
('235212439', 1),
('237719657', 2),
('251917242', 1),
('263805796', 1),
('263830208', 1),
('265557682', 1),
('273445678', 1),
('38793521', 1),
('401235515', 4),
('401235515', 10),
('401235515', 11),
('401594491', 1),
('414160944', 9),
('425099110', 1),
('433400174', 1),
('445736722', 1),
('450777043', 1),
('48048659', 1),
('486970200', 1),
('492818669', 1),
('496088785', 1),
('499189479', 1),
('503016207', 1),
('503279234', 1),
('514785790', 1),
('520655339', 1),
('535534480', 1),
('546292461', 1),
('548615789', 1),
('566087577', 1),
('572114208', 1),
('596675864', 1),
('608747423', 1),
('624738349', 1),
('636823070', 1),
('638471990', 2),
('64144838', 1),
('641972806', 2),
('645960680', 1),
('654368477', 1),
('662032340', 1),
('669106380', 1),
('692981433', 1),
('700957107', 1),
('711348782', 2),
('726027069', 1),
('729353699', 1),
('739292066', 1),
('771789654', 1),
('772450899', 1),
('784897223', 1),
('79972255', 1),
('816713504', 1),
('81745668', 1),
('81815340', 1),
('824594608', 1),
('834328308', 1),
('840365435', 1),
('86143905', 1),
('865895441', 1),
('87695884', 1),
('88492428', 1),
('893599032', 1),
('899021804', 1),
('94623025', 1),
('995903564', 12);

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `vips`
--

CREATE TABLE `vips` (
  `user_id` varchar(20) NOT NULL,
  `channel_id` varchar(20) NOT NULL,
  `granted` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `vips`
--

INSERT INTO `vips` (`user_id`, `channel_id`, `granted`) VALUES
('100023400', '265557682', '2024-06-08 17:45:04'),
('1009638111', '233729146', '2024-02-02 19:59:04'),
('1026729565', '676966284', '2024-06-02 11:28:34'),
('1046507325', '899021804', '2024-03-19 19:28:42'),
('1056506170', '265557682', '2024-06-08 17:41:13'),
('1083309801', '132883040', '2024-05-11 12:57:35'),
('1089608263', '401235515', '2024-06-27 13:34:32'),
('1089608263', '676966284', '2024-06-25 13:56:51'),
('115409295', '645960680', '2023-09-26 20:01:00'),
('123521762', '899021804', '2024-06-25 17:36:36'),
('132205514', '265557682', '2024-06-07 15:08:25'),
('132420956', '401235515', '2024-05-02 11:16:32'),
('132420956', '676966284', '2024-07-13 21:28:09'),
('138187273', '132883040', '2024-01-04 08:22:10'),
('138187273', '165270856', '2024-04-24 11:32:30'),
('138187273', '401235515', '2024-05-02 11:14:46'),
('138847184', '899021804', '2024-03-19 19:58:12'),
('142668038', '645960680', '2023-04-06 00:02:41'),
('150295824', '265557682', '2024-02-06 14:20:38'),
('151883075', '233729146', '2024-01-21 14:29:52'),
('155097906', '165270856', '2024-03-11 18:25:15'),
('159736873', '265557682', '2024-05-26 13:00:21'),
('159736873', '645960680', '2024-01-13 18:09:28'),
('163751674', '233729146', '2024-04-18 18:11:01'),
('164664732', '165270856', '2024-06-22 20:48:11'),
('164664732', '265557682', '2024-05-24 14:00:10'),
('164664732', '401235515', '2024-05-03 21:44:43'),
('164664732', '667794838', '2024-06-30 12:20:30'),
('164664732', '676966284', '2024-07-07 15:38:45'),
('165270856', '401235515', '2024-05-10 11:13:15'),
('165805620', '899021804', '2024-03-13 14:17:54'),
('171854263', '233729146', '2024-01-08 13:35:49'),
('172781249', '233729146', '2024-03-29 18:51:26'),
('174408185', '899021804', '2024-06-26 11:49:31'),
('179311496', '265557682', '2024-03-10 22:27:41'),
('185324637', '401235515', '2024-05-02 13:01:35'),
('192130733', '645960680', '2023-08-26 20:36:24'),
('192130733', '667794838', '2023-11-29 21:29:23'),
('194514131', '265557682', '2024-02-08 11:21:53'),
('195648680', '645960680', '2024-01-13 18:09:43'),
('198354860', '233729146', '2024-04-18 18:11:03'),
('202391035', '899021804', '2024-07-03 14:32:17'),
('214709601', '265557682', '2024-05-02 18:21:52'),
('216119826', '645960680', '2022-12-23 00:43:56'),
('217986157', '132883040', '2024-01-21 17:12:30'),
('217986157', '676966284', '2024-06-21 16:12:17'),
('23162550', '645960680', '2023-07-22 10:51:21'),
('235212439', '899021804', '2024-03-19 19:10:20'),
('251917242', '645960680', '2024-01-13 18:10:03'),
('263805796', '645960680', '2024-01-13 18:10:26'),
('273445678', '899021804', '2024-05-16 09:51:49'),
('38793521', '233729146', '2024-02-29 17:34:06'),
('401235515', '165270856', '2024-05-10 11:07:37'),
('401594491', '265557682', '2024-06-08 17:43:52'),
('404081653', '265557682', '2024-05-20 13:01:11'),
('406052683', '667794838', '2024-07-05 18:26:50'),
('411896188', '667794838', '2023-12-07 14:30:05'),
('412150332', '645960680', '2024-05-31 21:04:15'),
('418915228', '132883040', '2024-01-21 17:14:05'),
('418915228', '165270856', '2024-03-20 18:37:35'),
('418915228', '233729146', '2024-01-08 13:35:15'),
('425099110', '233729146', '2024-04-18 18:11:06'),
('448440136', '645960680', '2024-01-12 17:02:57'),
('453742304', '265557682', '2023-11-07 14:01:54'),
('457674693', '667794838', '2024-05-18 16:01:56'),
('457674693', '676966284', '2024-06-06 17:06:07'),
('457674693', '899021804', '2024-06-07 22:15:21'),
('468924601', '233729146', '2024-01-08 16:47:59'),
('474580827', '645960680', '2023-08-29 08:34:29'),
('48048659', '165270856', '2024-03-08 00:10:24'),
('48048659', '676966284', '2024-05-25 22:20:18'),
('480986473', '667794838', '2024-03-21 13:57:26'),
('480986473', '899021804', '2024-03-09 22:53:11'),
('486545285', '265557682', '2023-10-07 13:35:19'),
('492230503', '132883040', '2024-01-04 08:21:24'),
('492818669', '265557682', '2024-06-08 17:42:45'),
('496797837', '165270856', '2024-05-02 18:17:38'),
('502145172', '645960680', '2024-01-13 18:10:40'),
('502145172', '899021804', '2024-03-16 16:51:04'),
('503016207', '645960680', '2024-02-17 22:55:52'),
('504443631', '645960680', '2024-01-13 18:08:59'),
('514785790', '265557682', '2024-06-08 17:40:33'),
('523222266', '265557682', '2024-02-06 14:20:40'),
('527026170', '645960680', '2024-01-13 18:09:22'),
('533829708', '667794838', '2024-06-04 17:10:22'),
('537196168', '165270856', '2024-05-18 16:36:49'),
('537196168', '676966284', '2024-04-14 11:18:36'),
('546292461', '265557682', '2024-06-08 17:42:16'),
('546352474', '645960680', '2024-01-14 12:02:02'),
('546352474', '667794838', '2023-12-14 20:29:27'),
('569487930', '265557682', '2024-03-10 22:27:43'),
('574933584', '401235515', '2024-05-02 11:16:43'),
('597010881', '233729146', '2024-04-18 18:10:46'),
('618436662', '645960680', '2024-02-17 21:20:23'),
('625016038', '645960680', '2024-01-13 18:27:23'),
('638471990', '233729146', '2024-03-03 20:26:46'),
('645818912', '165270856', '2024-06-06 10:56:00'),
('64657760', '233729146', '2024-02-29 17:32:43'),
('650401636', '165270856', '2024-03-24 18:53:36'),
('650703963', '645960680', '2024-01-13 18:24:37'),
('654368477', '645960680', '2023-07-09 14:01:08'),
('655290698', '265557682', '2024-06-08 17:45:10'),
('655290698', '667794838', '2024-04-03 18:31:45'),
('662032340', '132883040', '2024-02-10 21:42:31'),
('667794838', '645960680', '2024-01-13 18:09:46'),
('669106380', '265557682', '2024-06-08 17:41:57'),
('676966284', '265557682', '2024-04-04 13:06:42'),
('678508684', '165270856', '2024-03-08 00:10:44'),
('68136884', '645960680', '2024-01-18 17:28:46'),
('684907887', '667794838', '2024-05-28 17:31:38'),
('686363617', '165270856', '2024-05-11 18:06:25'),
('692981433', '667794838', '2024-03-21 13:57:42'),
('726027069', '645960680', '2022-11-03 19:39:47'),
('74133511', '233729146', '2024-02-29 17:33:00'),
('755628467', '667794838', '2023-12-20 20:28:31'),
('79423298', '233729146', '2024-01-08 13:37:19'),
('798779709', '132883040', '2024-05-11 13:02:35'),
('79972255', '165270856', '2024-06-22 20:44:18'),
('79972255', '265557682', '2024-03-08 07:53:16'),
('88492428', '265557682', '2024-06-08 17:42:38'),
('899021804', '667794838', '2024-05-26 11:17:28'),
('94531906', '132883040', '2024-02-04 01:47:39'),
('94623025', '899021804', '2024-03-20 14:43:18'),
('996004171', '676966284', '2024-07-05 11:33:52');

--
-- Indizes der exportierten Tabellen
--

--
-- Indizes für die Tabelle `badges`
--
ALTER TABLE `badges`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `dctwitchusers`
--
ALTER TABLE `dctwitchusers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `twitch_username` (`twitch_username`);

--
-- Indizes für die Tabelle `mods`
--
ALTER TABLE `mods`
  ADD PRIMARY KEY (`user_id`,`channel_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_channel_id` (`channel_id`);

--
-- Indizes für die Tabelle `tokens`
--
ALTER TABLE `tokens`
  ADD PRIMARY KEY (`name`);

--
-- Indizes für die Tabelle `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `user_badges`
--
ALTER TABLE `user_badges`
  ADD PRIMARY KEY (`user_id`,`badge_id`),
  ADD KEY `idx_user_id_user_badges` (`user_id`),
  ADD KEY `idx_badge_id_user_badges` (`badge_id`);

--
-- Indizes für die Tabelle `vips`
--
ALTER TABLE `vips`
  ADD PRIMARY KEY (`user_id`,`channel_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_channel_id` (`channel_id`);

--
-- AUTO_INCREMENT für exportierte Tabellen
--

--
-- AUTO_INCREMENT für Tabelle `badges`
--
ALTER TABLE `badges`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT für Tabelle `dctwitchusers`
--
ALTER TABLE `dctwitchusers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- Constraints der exportierten Tabellen
--

--
-- Constraints der Tabelle `mods`
--
ALTER TABLE `mods`
  ADD CONSTRAINT `mods_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `mods_ibfk_2` FOREIGN KEY (`channel_id`) REFERENCES `users` (`id`);

--
-- Constraints der Tabelle `user_badges`
--
ALTER TABLE `user_badges`
  ADD CONSTRAINT `user_badges_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `user_badges_ibfk_2` FOREIGN KEY (`badge_id`) REFERENCES `badges` (`id`);

--
-- Constraints der Tabelle `vips`
--
ALTER TABLE `vips`
  ADD CONSTRAINT `vips_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `vips_ibfk_2` FOREIGN KEY (`channel_id`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
