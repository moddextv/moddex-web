-- 011 — remove self-granted cosmetic badges from departed accounts
--
-- run it as:
--   docker compose -f compose.prod.yaml exec -T db \
--     mariadb -u root -p<pass> <db> < db/migrations/011-strip-departed-vanity-badges.sql
--
-- 009 and 010 removed permissions; 008 removed unearned donator badges. What
-- was left on the departed accounts is cosmetic and self-granted:
--
--   retrorelaxo        affiliate, booster, contributor, early checker, painter
--   existenzproduzent  affiliate
--
-- `affiliate`, `partner` and `staff` mirror twitch account statuses rather than
-- anything awarded by this project, so they are KEPT: they describe the twitch
-- account, and stripping them would be stating something untrue about it. The
-- rest -- booster, contributor, early checker, painter -- are this project's
-- own awards and go.
--
-- `donator` is untouched by design. 008 already removed it from anyone who did
-- not pay, and anyone who *did* pay keeps it regardless of whether they are
-- still involved. The donation record is deliberately preserved.
--
-- SAFE TO RERUN: deletes nothing that is not there.

START TRANSACTION;

DELETE ub
FROM user_badges ub
JOIN badges b ON b.id = ub.badge_id
JOIN users u  ON u.id = ub.user_id
WHERE u.login IN ('retrorelaxo', 'existenzproduzent')
  AND b.name NOT IN ('affiliate', 'partner', 'staff', 'donator');

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
--   SELECT u.login, GROUP_CONCAT(b.name ORDER BY b.name)
--   FROM user_badges ub
--   JOIN badges b ON b.id = ub.badge_id
--   JOIN users u ON u.id = ub.user_id
--   WHERE u.login IN ('retrorelaxo','existenzproduzent')
--   GROUP BY u.login;      -- expect `affiliate` only, for both
