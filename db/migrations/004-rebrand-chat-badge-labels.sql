-- 004 — rebrand the user-visible chat badge labels
--
-- numbered 004 because NEXT-STEPS reserves 003 for the users.id BIGINT
-- conversion. this migration is independent of both 002 and 003 and can run
-- in any order relative to them.
--
-- apply to an EXISTING production database. db/init/02-seed.sql already
-- reflects the end state for fresh installs.
--
-- run it as:
--   docker compose -f compose.prod.yaml exec -T db \
--     mariadb -u root -p<pass> <db> < db/migrations/004-rebrand-chat-badge-labels.sql
--
-- WHY: `chat_badges`.`name` is a branded display label, not a key. all seven
-- production rows still read "Modchecker ...":
--
--   (1,11,'Modchecker Admin','admin','/badges/admin.webp')
--   (2, 8,'Modchecker Donator','donator','/badges/donator.webp')
--   (3,10,'Modchecker Top Donator','top-donator','/badges/top_donator.webp')
--   (4,12,'Modchecker Contributor','contributor','/badges/contributor.webp')
--   (5, 3,'Modchecker Team','team','/badges/team.webp')
--   (6, 7,'Modchecker Discord Booster','discord-booster','/badges/booster.webp')
--   (7, 4,'Modchecker Early Checker','early-checker','/badges/early_checker.webp')
--
-- the code rebrand does not touch these -- they are data, so the old name
-- survives the rename and is shown next to users' names in chat.
--
-- `slug` is deliberately NOT touched: it is the stable key the app and any
-- external consumer (FrankerFaceZ add-on, api) match on. renaming it would be
-- a breaking change for something no user ever sees.
--
-- SAFE TO RERUN: the WHERE clause only matches rows still carrying the old
-- prefix, so a second run is a no-op.
--
-- ROW COUNT: 7. this is a metadata-sized table; the update is instant and
-- needs no maintenance window.

-- ------------------------------------------------------------------ check ---
-- inspect before/after:
--   SELECT id, name, slug FROM chat_badges ORDER BY id;

START TRANSACTION;

UPDATE `chat_badges`
SET `name` = CONCAT('moddex ', LOWER(SUBSTRING(`name`, 12)))
WHERE `name` LIKE 'Modchecker %';

-- the app's type styling is lowercase throughout (see the `uppercase` utility
-- applied at render time), so the stored label is lowercased here rather than
-- carrying title case the design no longer uses. if you would rather keep
-- title case, replace the SET above with:
--   SET `name` = CONCAT('Moddex ', SUBSTRING(`name`, 12))

COMMIT;

-- ------------------------------------------------------------------ note ---
-- 'moddex discord booster' (slug `discord-booster`) is renamed but otherwise
-- left in place. it rewards boosting a discord server that does not currently
-- exist. retiring it touches real user entitlements in `user_chat_badges` and
-- `user_badges`, so it is deliberately out of scope here -- decide it against
-- a full dump, where those tables are visible.
