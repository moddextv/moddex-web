-- 012 — flag known bots
--
-- apply to an EXISTING production database. db/init/01-schema.sql already
-- reflects the end state for fresh installs.
--
-- run it as:
--   docker compose -f compose.prod.yaml exec -T db \
--     mariadb -u root -p<pass> moddex_web < db/migrations/012-known-bots.sql
--
-- WHY: bots crowd out humans in role lists. forsen alone has 14,777 mods, and
-- the platform bots sit in most of them, so a "hide bots" filter needs a flag
-- to filter on.
--
-- WHY MANUAL: twitch does expose a `verifiedBot` field through ivr, but it
-- returned null for nightbot, fossabot, streamelements and moobot when checked
-- on 2026-08-06 -- so it cannot seed this. The list is a mix of twitch-verified
-- bots and accounts that are simply bots, and is curated by hand in
-- src/misc/bots.ts.
--
-- KEEP THE TWO IN SYNC. src/misc/bots.ts is what flags a user at write time
-- (updateUserInDb); this file is what flags rows that already exist. Adding a
-- name to one without the other means new users get flagged and old ones do
-- not, or the reverse.
--
-- SAFE TO RERUN: idempotent. Re-run the UPDATE after editing the list to pick
-- up newly added names.
--
-- Instant on any database size: the column add is INSTANT on mariadb 10.3+,
-- and the UPDATE touches at most a few dozen rows.

-- ------------------------------------------------------------------ column --
-- ALGORITHM=INSTANT: adding a nullable/defaulted column at the end of the row
-- is metadata-only, so this does not rewrite 2.75M rows.
ALTER TABLE `users`
  ADD COLUMN IF NOT EXISTS `bot` tinyint(1) NOT NULL DEFAULT 0 AFTER `ignored`;

-- -------------------------------------------------------------------- flag --
-- matched on login, which is what a human adding an entry will have. a login
-- that has since been changed by its owner simply stops matching -- it never
-- mis-flags somebody else, because twitch does not release logins for reuse
-- while the account exists.
UPDATE `users` SET `bot` = 1 WHERE `login` IN (
  'anotherttvviewer',
  'blerp',
  'botisimo',
  'coebot',
  'commanderroot',
  'deepbot',
  'fossabot',
  'modcheckerbot',
  'moobot',
  'nightbot',
  'own3d',
  'pajbot',
  'phantombot',
  'sery_bot',
  'soundalerts',
  'spanixbot',
  'streamelements',
  'streamlabs',
  'streamstickers',
  'supibot',
  'susgeebot',
  'tangiabot',
  'thepositivebot',
  'wizebot'
);

-- ---------------------------------------------------------------- verify ----
--   SELECT login FROM users WHERE bot = 1 ORDER BY login;
--
-- A name in the list that is not in `users` yet is not an error -- the row gets
-- flagged when that account is first fetched, via src/misc/bots.ts.
