-- schema for moddex
--
-- RECONCILED against a production dump (MariaDB 10.11.6) on 2026-08-05.
-- this file is now the source of truth; the old top-level db-schema.sql was
-- stale and is superseded.
--
-- run automatically by the mariadb entrypoint on first boot of an empty data
-- volume. files here execute in alphabetical order, so anything with foreign
-- keys must sort after the tables it references.

SET NAMES utf8mb4;

CREATE TABLE `users` (
  `id` varchar(20) NOT NULL,
  `login` varchar(50) NOT NULL,
  -- utf8mb4_bin in production: twitch display names carry emoji and non-latin
  -- scripts that utf8mb3 cannot store
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `avatar` varchar(255) NOT NULL,
  `bio` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `follower` int(10) unsigned DEFAULT NULL,
  -- stores a reason string ('TOS_BANNED', 'DEACTIVATED'), '' when not banned
  `banned` varchar(255) NOT NULL DEFAULT '',
  `ignored` tinyint(1) NOT NULL DEFAULT 0,
  `created` timestamp NULL DEFAULT NULL,
  `updated` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_login` (`login`),
  -- serves the "which channels are stale / not opted out" refresh sweep
  KEY `idx_users_ignored_updated` (`ignored`,`updated`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

CREATE TABLE `badges` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `path` varchar(255) NOT NULL,
  `permission` int(11) NOT NULL DEFAULT 0,
  `order` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

CREATE TABLE `chat_badges` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `badge_id` int(11) NOT NULL,
  `name` varchar(55) NOT NULL,
  -- present in production but never read or written by the app
  `slug` varchar(128) NOT NULL,
  `path` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `badge_id` (`badge_id`),
  CONSTRAINT `chat_badges_ibfk_1` FOREIGN KEY (`badge_id`) REFERENCES `badges` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

CREATE TABLE `user_badges` (
  `user_id` varchar(20) NOT NULL,
  `badge_id` int(11) NOT NULL,
  PRIMARY KEY (`user_id`,`badge_id`),
  KEY `idx_badge_id_user_badges` (`badge_id`),
  CONSTRAINT `user_badges_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `user_badges_ibfk_2` FOREIGN KEY (`badge_id`) REFERENCES `badges` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

CREATE TABLE `user_chat_badges` (
  `user_id` varchar(20) NOT NULL,
  `chat_badge_id` int(11) NOT NULL,
  PRIMARY KEY (`user_id`),
  KEY `chat_badge_id` (`chat_badge_id`),
  CONSTRAINT `user_chat_badges_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `user_chat_badges_ibfk_2` FOREIGN KEY (`chat_badge_id`) REFERENCES `chat_badges` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- the two role tables are the bulk of the database (millions of rows each).
-- index notes:
--   PRIMARY (user_id, channel_id) already serves "where does this user mod?"
--     so a separate KEY on user_id alone would be a redundant duplicate.
--   idx_channel_granted serves "who mods this channel, newest first" — the
--     ORDER BY granted DESC in getStoredUsers would otherwise filesort.
--   no (user_id, granted) index: the PK already locates the rows and a person
--     holds few enough roles that sorting them is free. a second index on a
--     multi-million-row table has to earn its space.
CREATE TABLE `mods` (
  `user_id` varchar(20) NOT NULL,
  `channel_id` varchar(20) NOT NULL,
  `granted` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`user_id`,`channel_id`),
  KEY `idx_mods_channel_granted` (`channel_id`,`granted`),
  CONSTRAINT `mods_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `mods_ibfk_2` FOREIGN KEY (`channel_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

CREATE TABLE `vips` (
  `user_id` varchar(20) NOT NULL,
  `channel_id` varchar(20) NOT NULL,
  `granted` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`user_id`,`channel_id`),
  KEY `idx_vips_channel_granted` (`channel_id`,`granted`),
  CONSTRAINT `vips_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `vips_ibfk_2` FOREIGN KEY (`channel_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
-- founders. deliberately NOT `ON UPDATE current_timestamp()` like mods/vips
-- above: that clause rewrites the historical date on any UPDATE, and the date
-- a founder was granted is the entire point of the role. `granted` comes from
-- twitch's `entitlementStart` and is nullable because a founder row is only as
-- good as what the api returned.
CREATE TABLE `founders` (
  `user_id` varchar(20) NOT NULL,
  `channel_id` varchar(20) NOT NULL,
  `granted` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`user_id`,`channel_id`),
  KEY `idx_founders_channel_granted` (`channel_id`,`granted`),
  CONSTRAINT `founders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `founders_ibfk_2` FOREIGN KEY (`channel_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

CREATE TABLE `dctwitchusers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `discord_user_id` varchar(255) NOT NULL,
  `twitch_username` varchar(255) NOT NULL,
  `twitch_id` varchar(255) DEFAULT NULL,
  `is_boosting` tinyint(4) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `twitch_username` (`twitch_username`),
  -- the app joins on twitch_id, which was unindexed in production
  KEY `idx_dctwitchusers_twitch_id` (`twitch_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

CREATE TABLE `donations` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `payment_id` varchar(255) NOT NULL,
  `user_id` varchar(255) DEFAULT NULL,
  `amount` int(11) NOT NULL,
  `time` timestamp NOT NULL DEFAULT current_timestamp(),
  `email` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `payment_intent_id` varchar(255) NOT NULL,
  `payment_status` varchar(50) NOT NULL,
  `charge_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `payment_id` (`payment_id`),
  -- getTotalDonationsForUser and getTopDonator both group by user_id
  KEY `idx_donations_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

CREATE TABLE `snapshots` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `channels` int(11) NOT NULL,
  `users` int(11) NOT NULL,
  `mods` int(11) NOT NULL,
  `vips` int(11) NOT NULL,
  `time` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

CREATE TABLE `tokens` (
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `access_token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `refresh_token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `expires_at` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

CREATE TABLE `audit` (
  -- FIXED vs production: prod has no AUTO_INCREMENT here, but the app inserts
  -- (type, message) without an id. see db/migrations/001 for the prod fix.
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` varchar(25) NOT NULL,
  `message` text NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
