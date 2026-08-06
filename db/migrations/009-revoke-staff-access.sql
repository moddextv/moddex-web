-- 009 — revoke staff access from two departed accounts
--
-- run it as:
--   docker compose -f compose.prod.yaml exec -T db \
--     mariadb -u root -p<pass> <db> < db/migrations/009-revoke-staff-access.sql
--
-- 008 removed their unearned donator badge, which is cosmetic. This removes
-- their *access*: getUserPermission() returns MAX(badges.permission) across a
-- user's badges, so a staff badge is the whole authorisation model.
--
--   retrorelaxo        admin (permission 2)  -> full dashboard + admin actions
--   existenzproduzent  team  (permission 1)  -> dashboard
--
-- After this both resolve to permission 0.
--
-- Named accounts, unlike 008: there is no data-derived rule for "has left the
-- project", so the logins are explicit and this migration is a record of a
-- decision rather than a reconciliation.
--
-- retrorelaxo's other badges (affiliate, painter, early checker, contributor,
-- booster) are cosmetic, carry permission 0, and are left in place.
--
-- SAFE TO RERUN: deletes nothing that is not there.
--
-- !! THIS DOES NOT END A LIVE SESSION !!
-- `perms` is written into the jwt at sign-in (see the jwt callback in
-- src/auth.ts) and read from the token thereafter, so an already-signed-in user
-- keeps whatever permission they had until their token expires. Rotating
-- AUTH_SECRET invalidates every existing session and is the companion step --
-- it signs out every user, not only these two.

START TRANSACTION;

DELETE ub
FROM user_badges ub
JOIN badges b ON b.id = ub.badge_id
JOIN users u  ON u.id = ub.user_id
WHERE b.name = 'admin'
  AND u.login = 'retrorelaxo';

DELETE ub
FROM user_badges ub
JOIN badges b ON b.id = ub.badge_id
JOIN users u  ON u.id = ub.user_id
WHERE b.name = 'team'
  AND u.login = 'existenzproduzent';

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
--   SELECT u.login, IFNULL(MAX(b.permission),0) AS perm
--   FROM users u
--   LEFT JOIN user_badges ub ON ub.user_id = u.id
--   LEFT JOIN badges b ON b.id = ub.badge_id
--   WHERE u.login IN ('retrorelaxo','existenzproduzent')
--   GROUP BY u.login;      -- both must be 0
