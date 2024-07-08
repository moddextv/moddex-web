CREATE TABLE `badges` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `path` varchar(255) NOT NULL,
  `order` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `dctwitchusers` (
  `id` int(11) NOT NULL,
  `discord_user_id` varchar(255) NOT NULL,
  `twitch_username` varchar(255) NOT NULL,
  `twitch_id` varchar(255) DEFAULT NULL,
  `is_boosting` tinyint(4) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `mods` (
  `user_id` varchar(20) NOT NULL,
  `channel_id` varchar(20) NOT NULL,
  `granted` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `paints` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `path` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `tokens` (
  `name` varchar(255) NOT NULL,
  `access_token` varchar(255) NOT NULL,
  `refresh_token` varchar(255) DEFAULT NULL,
  `expires_at` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `users` (
  `id` varchar(20) NOT NULL,
  `login` varchar(50) NOT NULL,
  `name` varchar(50) NOT NULL,
  `avatar` varchar(255) NOT NULL,
  `bio` text DEFAULT NULL,
  `partner` tinyint(1) DEFAULT NULL,
  `affiliate` tinyint(1) DEFAULT NULL,
  `created` timestamp NULL DEFAULT NULL,
  `updated` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `user_badges` (
  `user_id` varchar(20) NOT NULL,
  `badge_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `user_paints` (
  `user_id` varchar(20) NOT NULL,
  `paint_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `user_selected_paints` (
  `user_id` varchar(20) NOT NULL,
  `paint_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `vips` (
  `user_id` varchar(20) NOT NULL,
  `channel_id` varchar(20) NOT NULL,
  `granted` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


ALTER TABLE `badges`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `dctwitchusers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `twitch_username` (`twitch_username`);

ALTER TABLE `mods`
  ADD PRIMARY KEY (`user_id`,`channel_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_channel_id` (`channel_id`);

ALTER TABLE `paints`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `tokens`
  ADD PRIMARY KEY (`name`);

ALTER TABLE `user_badges`
  ADD PRIMARY KEY (`user_id`,`badge_id`),
  ADD KEY `idx_user_id_user_badges` (`user_id`),
  ADD KEY `idx_badge_id_user_badges` (`badge_id`);

ALTER TABLE `user_paints`
  ADD PRIMARY KEY (`user_id`,`paint_id`),
  ADD KEY `idx_user_id_user_paints` (`user_id`),
  ADD KEY `idx_paint_id_user_paints` (`paint_id`);

ALTER TABLE `user_selected_paints`
  ADD PRIMARY KEY (`user_id`,`paint_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_paint_id` (`paint_id`);

ALTER TABLE `vips`
  ADD PRIMARY KEY (`user_id`,`channel_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_channel_id` (`channel_id`);

ALTER TABLE `badges`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `dctwitchusers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `paints`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `mods`
  ADD CONSTRAINT `mods_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `mods_ibfk_2` FOREIGN KEY (`channel_id`) REFERENCES `users` (`id`);

ALTER TABLE `user_badges`
  ADD CONSTRAINT `user_badges_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `user_badges_ibfk_2` FOREIGN KEY (`badge_id`) REFERENCES `badges` (`id`);

ALTER TABLE `user_selected_paints`
  ADD CONSTRAINT `user_selected_paints_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `user_selected_paints_ibfk_2` FOREIGN KEY (`paint_id`) REFERENCES `paints` (`id`);

ALTER TABLE `vips`
  ADD CONSTRAINT `vips_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `vips_ibfk_2` FOREIGN KEY (`channel_id`) REFERENCES `users` (`id`);

INSERT INTO `badges` (`id`, `name`, `path`, `order`) VALUES
(1, 'affiliate', '/img/badges/affiliate.png', 30),
(2, 'partner', '/img/badges/partner.png', 20),
(3, 'team', '/img/badges/team.png', 40),
(4, 'early checker', '/img/badges/early_checker.png', 50),
(5, 'relaxo', '/img/badges/relaxo.png', 9999),
(6, 'painter', '/img/badges/painter.png', 70),
(7, 'booster', '/img/badges/booster.png', 60),
(8, 'donator', '/img/badges/donator.png', 90),
(9, 'staff', '/img/badges/staff.png', 10),
(10, 'top donator', '/img/badges/top_donator.png', 80);

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