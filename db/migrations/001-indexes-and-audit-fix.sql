-- 001 — audit autoincrement + index reconciliation
--
-- apply to an EXISTING production database. db/init/01-schema.sql already
-- reflects the end state for fresh installs.
--
-- run it as:
--   docker compose -f compose.prod.yaml exec -T db \
--     mariadb -u root -p<pass> <db> < db/migrations/001-indexes-and-audit-fix.sql
--
-- the two ALTERs on `mods`/`vips` rewrite multi-million-row tables. on
-- mariadb 10.11 the ADD/DROP INDEX below are ALGORITHM=INPLACE and do not
-- block reads or writes, but they will take minutes and consume disk for the
-- sort buffer. run them during a quiet window.

-- ---------------------------------------------------------------- audit ----
-- `audit`.`id` has no AUTO_INCREMENT in production, but utils/donation.ts does
--   INSERT INTO audit (type, message) VALUES (?, ?)
-- with no id. in strict mode that errors; otherwise every row tries to claim
-- id=0 and the second insert collides on the primary key. either way the table
-- is empty in the dump — the donation audit trail has never recorded anything.
ALTER TABLE `audit` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

-- ------------------------------------------------------------ role tables --
-- PRIMARY (user_id, channel_id) already answers "where does this user mod?",
-- so a standalone index on user_id is a redundant copy of the PK prefix —
-- pure write cost and disk on the largest tables in the database.
ALTER TABLE `mods` DROP INDEX `idx_user_id`;
ALTER TABLE `vips` DROP INDEX `idx_user_id`;

-- channel_id is NOT a PK prefix, so it needs its own index — widen it to
-- include `granted` so "who mods this channel, newest first" is served
-- entirely from the index instead of sorting the result set.
ALTER TABLE `mods` DROP INDEX `idx_channel_id`,
                   ADD INDEX `idx_mods_channel_granted` (`channel_id`, `granted`);
ALTER TABLE `vips` DROP INDEX `idx_channel_id`,
                   ADD INDEX `idx_vips_channel_granted` (`channel_id`, `granted`);

-- same redundancy on the badge join table
ALTER TABLE `user_badges` DROP INDEX `idx_user_id_user_badges`;

-- ------------------------------------------------------ smaller tables ----
-- utils/user.ts joins dctwitchusers on twitch_id, which had no index; the
-- unique key is on twitch_username, a different column.
ALTER TABLE `dctwitchusers` ADD INDEX `idx_dctwitchusers_twitch_id` (`twitch_id`);

-- getTotalDonationsForUser and getTopDonator both filter/group by user_id
ALTER TABLE `donations` ADD INDEX `idx_donations_user_id` (`user_id`);
