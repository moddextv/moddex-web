-- 006 — the founders role
--
-- apply to an EXISTING production database. db/init/01-schema.sql already
-- reflects the end state for fresh installs.
--
-- run it as:
--   docker compose -f compose.prod.yaml exec -T db \
--     mariadb -u root -p<pass> <db> < db/migrations/006-founders-table.sql
--
-- WHY A TABLE AND NOT `roles`: 002 replaces mods/vips with a single `roles`
-- table and reserves role id 4 for founder, which is where this belongs
-- long-term. 002 is a ~13 minute rewrite of 13.7M rows and has not been
-- applied. Founder data is tiny by comparison — twitch caps the badge per
-- channel, so this is tens of rows per channel, not millions — so it gets its
-- own table now and folds into `roles` when 002 runs. 002 has been extended to
-- carry it across.
--
-- SAFE TO RERUN: CREATE TABLE IF NOT EXISTS, no data written.
--
-- Instant on any database size: it creates an empty table.

CREATE TABLE IF NOT EXISTS `founders` (
  `user_id`    varchar(20) NOT NULL,
  `channel_id` varchar(20) NOT NULL,

  -- twitch's `entitlementStart`. NOT `ON UPDATE current_timestamp()`, unlike
  -- the `granted` columns on mods/vips: that clause silently rewrites the
  -- historical date whenever the row is updated, and when the role was granted
  -- is the whole value of this record. nullable because the row is only as
  -- good as what the api returned.
  `granted`    timestamp NULL DEFAULT NULL,

  PRIMARY KEY (`user_id`,`channel_id`),
  -- "who founded this channel, newest first" — the channel page's query.
  KEY `idx_founders_channel_granted` (`channel_id`,`granted`),
  CONSTRAINT `founders_ibfk_1` FOREIGN KEY (`user_id`)    REFERENCES `users` (`id`),
  CONSTRAINT `founders_ibfk_2` FOREIGN KEY (`channel_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- ------------------------------------------------------------- verify -------
--   SHOW CREATE TABLE founders;
--   SELECT COUNT(*) FROM founders;   -- 0 until a channel page is refreshed
--
-- NOTE: the table fills lazily. Founders are fetched when a channel is
-- refreshed, exactly like mods and vips — there is no backfill, because twitch
-- only exposes founders per channel and there is no bulk source.
