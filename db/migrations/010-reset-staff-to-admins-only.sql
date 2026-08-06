-- 010 — reduce staff to the two remaining admins
--
-- run it as:
--   docker compose -f compose.prod.yaml exec -T db \
--     mariadb -u root -p<pass> <db> < db/migrations/010-reset-staff-to-admins-only.sql
--
-- 009 removed two departed accounts by name. This states the end position
-- instead: `maersux` and `lilb_lxryer` are the only people with any elevated
-- permission, and there are no team members at all.
--
-- Written as "revoke from everyone not in this list" rather than naming the
-- people leaving, so it is a declaration of who *is* staff. Rerunning it after
-- someone new is added would revoke them, which is the point -- this file is
-- the source of truth for the roster.
--
-- On the 2026-08-06 data it removes `team` from modcheckerbot, tthev and xlouw.
--
-- Permission comes from badges: getUserPermission() returns
-- MAX(badges.permission) over a user's badges, admin = 2, team = 1.
--
-- !! DOES NOT END LIVE SESSIONS !! `perms` is baked into the jwt at sign-in.
-- Rotate AUTH_SECRET to invalidate every existing session.

START TRANSACTION;

DELETE ub
FROM user_badges ub
JOIN badges b ON b.id = ub.badge_id
JOIN users u  ON u.id = ub.user_id
WHERE b.permission > 0
  AND u.login NOT IN ('maersux', 'lilb_lxryer');

-- drop any selected chat badge whose parent entitlement is now gone
DELETE ucb
FROM user_chat_badges ucb
JOIN chat_badges cb ON cb.id = ucb.chat_badge_id
WHERE NOT EXISTS (
  SELECT 1 FROM user_badges ub
  WHERE ub.user_id = ucb.user_id AND ub.badge_id = cb.badge_id
);

COMMIT;

-- ---------------------------------------------------------------- verify ----
--   SELECT u.login, b.name, b.permission
--   FROM user_badges ub
--   JOIN badges b ON b.id = ub.badge_id
--   JOIN users u ON u.id = ub.user_id
--   WHERE b.permission > 0 ORDER BY b.permission DESC;
--   -- expect exactly: maersux/admin/2 and lilb_lxryer/admin/2
