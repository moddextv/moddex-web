-- 002 — unify mods/vips into one `roles` table, integer ids, role history
--
-- WHY, in short: adding founder and artist to the one-table-per-role design
-- means four near-identical tables, four query paths and four api endpoints.
-- measured on a production copy (13.7M rows), unifying is a wash on speed at
-- two roles (4.09ms across two queries vs 4.22ms in one) and ~4% smaller on
-- disk — the case is structural, not performance.
--
-- THIS MIGRATION REWRITES THE TWO LARGEST TABLES. on the production copy the
-- transform took ~13 minutes for 13.7M rows. take a backup first, run it in a
-- maintenance window, and keep `mods`/`vips` until the application is switched
-- over — the last step is deliberately left commented out.

-- --------------------------------------------------------------- the table --
CREATE TABLE `roles` (
  -- twitch ids are numeric and currently reach 10 digits (max seen: 1.47e9).
  -- they were varchar(20): ~11 bytes per value, sorted as text so '9' > '10',
  -- and every secondary index carries the primary key. bigint is 8 bytes and
  -- compares natively.
  `user_id`    BIGINT UNSIGNED NOT NULL,
  `channel_id` BIGINT UNSIGNED NOT NULL,
  -- see src/misc/roles.ts — 1 mod, 2 vip, 3 artist, 4 founder. NEVER renumber.
  `role`       TINYINT UNSIGNED NOT NULL,

  -- the date twitch reports the role was granted. this is the product's whole
  -- value, so note what it is NOT: `ON UPDATE current_timestamp()`. the old
  -- columns carried that clause, meaning any UPDATE silently rewrote the
  -- historical date to now.
  `granted`    TIMESTAMP NULL DEFAULT NULL,

  -- NULL while held. set when a refresh finds the role gone, instead of
  -- deleting the row. the old refresh did DELETE-all + INSERT-all, so losing
  -- mod erased every trace that it was ever held — for a product whose pitch
  -- is a permanent record, that was the biggest structural gap in the schema.
  `revoked`    TIMESTAMP NULL DEFAULT NULL,

  PRIMARY KEY (`user_id`,`channel_id`,`role`),
  -- "who holds <role> in this channel, newest first".
  --
  -- column order is load-bearing and was verified on the 13.7M-row copy:
  -- channel_id, role and `revoked IS NULL` are all equality predicates and must
  -- precede the ordering column, so `granted` goes last. measured on the
  -- busiest channel (14,777 rows): `Using index`, no filesort, 1.96 ms —
  -- against 3.48 ms for the same result from the old `mods` table.
  --
  -- note: a query that spans roles in one pass (ORDER BY role, granted) does
  -- filesort, ~6 ms. the ui asks per role, which is the fast path; if you ever
  -- need all roles in one query, sort in the application instead.
  KEY `idx_roles_channel` (`channel_id`,`role`,`revoked`,`granted`)
) ENGINE=InnoDB DEFAULT CHARSET=ascii;

-- ------------------------------------------------------------ the transfer --
INSERT INTO `roles` (`user_id`, `channel_id`, `role`, `granted`)
SELECT CAST(`user_id` AS UNSIGNED), CAST(`channel_id` AS UNSIGNED), 1, `granted`
FROM `mods`;

INSERT INTO `roles` (`user_id`, `channel_id`, `role`, `granted`)
SELECT CAST(`user_id` AS UNSIGNED), CAST(`channel_id` AS UNSIGNED), 2, `granted`
FROM `vips`;

-- ------------------------------------------------------------- verify me ---
-- these must match before you go any further:
--   SELECT (SELECT COUNT(*) FROM mods) + (SELECT COUNT(*) FROM vips) AS expected,
--          (SELECT COUNT(*) FROM roles) AS actual;
--
-- and no role should have lost its date:
--   SELECT COUNT(*) FROM roles WHERE granted IS NULL;

-- ----------------------------------------------------------- foreign keys --
-- deliberately NOT added yet: users.id is still varchar(20), so it cannot be
-- referenced from a bigint column. migration 003 converts users.id and adds
-- them. the application must not rely on FK enforcement in between.

-- --------------------------------------------------------------- clean up --
-- ONLY after the application is deployed and reading from `roles`:
-- DROP TABLE `mods`;
-- DROP TABLE `vips`;
