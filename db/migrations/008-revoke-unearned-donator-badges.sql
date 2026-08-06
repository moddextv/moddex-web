-- 008 — revoke the donator badge from accounts that never donated
--
-- run it as:
--   docker compose -f compose.prod.yaml exec -T db \
--     mariadb -u root -p<pass> <db> < db/migrations/008-revoke-unearned-donator-badges.sql
--
-- 007 found two accounts holding the donator badge with no donations on record
-- and deliberately left them alone, on the reasoning that `retrorelaxo` looked
-- like a project account. That is no longer the case, so this removes them.
--
-- Scoped by donation history rather than by name: after this runs, holding the
-- donator badge means having paid for it, and there is no hardcoded login to
-- go stale.
--
-- SAFE TO RERUN: the condition only matches accounts that still fail it.
--
-- NOTE: this revokes the *donator* badge only. Staff access is a separate
-- badge and is not touched here -- see 009.

START TRANSACTION;

DELETE ub
FROM user_badges ub
JOIN badges b ON b.id = ub.badge_id
WHERE b.name = 'donator'
  AND COALESCE((
    SELECT SUM(d.amount) FROM donations d WHERE d.user_id = ub.user_id
  ), 0) < 500;

-- the cosmetic chat badge follows the entitlement: keeping a selected chat
-- badge whose parent badge is gone would leave it rendering in chat.
DELETE ucb
FROM user_chat_badges ucb
JOIN chat_badges cb ON cb.id = ucb.chat_badge_id
WHERE cb.slug = 'donator'
  AND NOT EXISTS (
    SELECT 1 FROM user_badges ub
    JOIN badges b ON b.id = ub.badge_id
    WHERE ub.user_id = ucb.user_id AND b.name = 'donator'
  );

COMMIT;

-- ---------------------------------------------------------------- verify ----
--   SELECT COUNT(*) FROM user_badges ub JOIN badges b ON b.id=ub.badge_id
--   WHERE b.name='donator';   -- expect 48 on the 2026-08-06 data
--
--   -- must return zero rows:
--   SELECT ub.user_id FROM user_badges ub JOIN badges b ON b.id=ub.badge_id
--   WHERE b.name='donator'
--     AND COALESCE((SELECT SUM(amount) FROM donations d
--                   WHERE d.user_id=ub.user_id),0) < 500;
