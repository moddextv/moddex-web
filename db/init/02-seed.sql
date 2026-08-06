-- baseline + demo data
--
-- the `badges` and `chat_badges` rows are NOT optional demo data: the app
-- resolves permissions by badge name (utils/user.ts getUserPermission) and
-- auto-assigns 'partner' / 'affiliate' / 'staff' / 'donator' / 'top donator'
-- by name. an empty badges table silently degrades every profile.
--
-- everything below the badge section is local demo content so a fresh stack
-- has something to render without hitting twitch.

SET NAMES utf8mb4;

-- ---------------------------------------------------------------- badges ---
-- permission: 0 = default, 1 = team, 2 = admin (see utils/constants.ts)

INSERT INTO `badges` (`name`, `path`, `permission`, `order`) VALUES
  ('admin',         '/badges/admin.png',         2, 10),
  ('team',          '/badges/team.png',          1, 20),
  ('contributor',   '/badges/contributor.png',   0, 30),
  ('painter',       '/badges/painter.png',       0, 40),
  ('top donator',   '/badges/top_donator.png',   0, 50),
  ('donator',       '/badges/donator.png',       0, 60),
  ('booster',       '/badges/booster.png',       0, 70),
  ('early checker', '/badges/early_checker.png', 0, 80),
  ('staff',         '/badges/staff.png',         0, 90),
  ('partner',       '/badges/partner.png',       0, 100),
  ('affiliate',     '/badges/affiliate.png',     0, 110);

-- chat badges are the cosmetics a user may select in /settings. entitlement is
-- the join chat_badges.badge_id -> user_badges.badge_id, so a chat badge is
-- only offered to someone who holds the parent badge.

-- `name` is the branded display label and `slug` the stable key, e.g.
-- ('moddex top donator', 'top-donator'). the seed mirrors that split so
-- anything reading one instead of the other fails here, not in production.
--
-- production stored these as 'Modchecker Top Donator' until migration 004
-- renamed them; the slug was never touched, because it is what the app and the
-- ffz add-on match on.
INSERT INTO `chat_badges` (`badge_id`, `name`, `slug`, `path`)
SELECT `id`, CONCAT('moddex ', `name`), REPLACE(`name`, ' ', '-'), REPLACE(`path`, '.png', '.webp')
FROM `badges`
WHERE `name` IN ('admin', 'team', 'contributor', 'painter', 'top donator', 'donator', 'booster', 'early checker');

-- ------------------------------------------------------------- snapshots ---
-- the homepage reads the newest row; without one, getStats() dereferences false.

INSERT INTO `snapshots` (`channels`, `users`, `mods`, `vips`) VALUES
  (1337, 420690, 90210, 31337);

-- ------------------------------------------------------------ demo users ---
-- ids are outside twitch's real range so they can never collide with scraped
-- data. `updated` is set so the role lookups serve from the db and do not
-- trigger an outbound scrape on first page view.

INSERT INTO `users` (`id`, `login`, `name`, `avatar`, `bio`, `follower`, `created`, `updated`) VALUES
  ('900000001', 'demochannel', 'demoChannel', '/peepoLove.png', 'a seeded channel for local development', 125000, '2016-04-01 12:00:00', CURRENT_TIMESTAMP),
  ('900000002', 'demoshouter', 'demoShouter', '/peepoLove.png', 'a second seeded channel',                 48000,  '2018-09-14 08:30:00', CURRENT_TIMESTAMP),
  ('900000003', 'modalpha',    'modAlpha',    '/peepoLove.png', 'seeded moderator',                        920,    '2019-02-20 18:45:00', CURRENT_TIMESTAMP),
  ('900000004', 'modbravo',    'modBravo',    '/peepoLove.png', 'seeded moderator',                        1540,   '2020-07-03 21:10:00', CURRENT_TIMESTAMP),
  ('900000005', 'vipcharlie',  'vipCharlie',  '/peepoLove.png', 'seeded vip',                              310,    '2021-11-11 11:11:00', CURRENT_TIMESTAMP),
  ('900000006', 'optedout',    'optedOut',    '/peepoLove.png', 'seeded user who opted out of tracking',   77,     '2022-05-05 05:05:00', CURRENT_TIMESTAMP);

UPDATE `users` SET `ignored` = 1 WHERE `id` = '900000006';

-- modalpha mods for both demo channels, which is what makes the reverse
-- lookup at /user/modalpha show more than one row.
INSERT INTO `mods` (`user_id`, `channel_id`, `granted`) VALUES
  ('900000003', '900000001', '2023-01-15 10:00:00'),
  ('900000004', '900000001', '2023-06-22 14:30:00'),
  ('900000006', '900000001', '2023-08-01 09:00:00'),
  ('900000003', '900000002', '2024-02-09 19:20:00');

INSERT INTO `vips` (`user_id`, `channel_id`, `granted`) VALUES
  ('900000005', '900000001', '2023-03-30 16:45:00'),
  ('900000004', '900000002', '2024-04-18 12:05:00');

INSERT INTO `user_badges` (`user_id`, `badge_id`)
SELECT '900000001', `id` FROM `badges` WHERE `name` = 'partner';

INSERT INTO `user_badges` (`user_id`, `badge_id`)
SELECT '900000003', `id` FROM `badges` WHERE `name` IN ('team', 'donator');

INSERT INTO `user_badges` (`user_id`, `badge_id`)
SELECT '900000004', `id` FROM `badges` WHERE `name` = 'early checker';

INSERT INTO `dctwitchusers` (`discord_user_id`, `twitch_username`, `twitch_id`) VALUES
  ('123456789012345678', 'modalpha', '900000003');
