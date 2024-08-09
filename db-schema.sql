CREATE TABLE `audit` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `type` varchar(25) NOT NULL,
  `message` text NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

CREATE TABLE `badges` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` varchar(255) NOT NULL,
  `path` varchar(255) NOT NULL,
  `permission` int(11) NOT NULL DEFAULT 0,
  `order` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

CREATE TABLE `chat_badges` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `badge_id` int(11) NOT NULL,
  `name` varchar(55) NOT NULL,
  `path` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

CREATE TABLE `dctwitchusers` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `discord_user_id` varchar(255) NOT NULL,
  `twitch_username` varchar(255) NOT NULL,
  `twitch_id` varchar(255) DEFAULT NULL,
  `is_boosting` tinyint(4) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

CREATE TABLE `mods` (
  `user_id` varchar(20) NOT NULL,
  `channel_id` varchar(20) NOT NULL,
  `granted` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`user_id`,`channel_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

CREATE TABLE `tokens` (
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL PRIMARY KEY,
  `access_token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `refresh_token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `expires_at` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

CREATE TABLE `users` (
  `id` varchar(20) NOT NULL PRIMARY KEY,
  `login` varchar(50) NOT NULL,
  `name` varchar(50) NOT NULL,
  `avatar` varchar(255) NOT NULL,
  `bio` text DEFAULT NULL,
  `follower` int(10) UNSIGNED DEFAULT NULL,
  `ignored` tinyint(1) NOT NULL DEFAULT 0,
  `created` timestamp NULL DEFAULT NULL,
  `updated` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

CREATE TABLE `user_badges` (
  `user_id` varchar(20) NOT NULL,
  `badge_id` int(11) NOT NULL,
  PRIMARY KEY (`user_id`,`badge_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

CREATE TABLE `user_chat_badges` (
  `user_id` varchar(20) NOT NULL PRIMARY KEY,
  `chat_badge_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

CREATE TABLE `vips` (
  `user_id` varchar(20) NOT NULL,
  `channel_id` varchar(20) NOT NULL,
  `granted` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`user_id`,`channel_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

ALTER TABLE `audit`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `badges`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `chat_badges`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,
  ADD FOREIGN KEY (`badge_id`) REFERENCES `badges` (`id`);

ALTER TABLE `dctwitchusers`
  ADD UNIQUE KEY `twitch_username` (`twitch_username`);

ALTER TABLE `mods`
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_channel_id` (`channel_id`),
  ADD CONSTRAINT `mods_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `mods_ibfk_2` FOREIGN KEY (`channel_id`) REFERENCES `users` (`id`);

ALTER TABLE `user_badges`
  ADD KEY `idx_user_id_user_badges` (`user_id`),
  ADD KEY `idx_badge_id_user_badges` (`badge_id`),
  ADD CONSTRAINT `user_badges_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `user_badges_ibfk_2` FOREIGN KEY (`badge_id`) REFERENCES `badges` (`id`);

ALTER TABLE `user_chat_badges`
  ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD FOREIGN KEY (`chat_badge_id`) REFERENCES `chat_badges` (`id`);

ALTER TABLE `vips`
  ADD CONSTRAINT `vips_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `vips_ibfk_2` FOREIGN KEY (`channel_id`) REFERENCES `users` (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_channel_id` (`channel_id`);