-- 005 — recalculate and redistribute the top donator badge
--
-- apply to an EXISTING production database, AFTER deploying the fix in
-- src/utils/donation.ts. applying it before the code fix works, but the next
-- donation would corrupt it again.
--
-- run it as:
--   docker compose -f compose.prod.yaml exec -T db \
--     mariadb -u root -p<pass> <db> < db/migrations/005-repair-top-donator-badge.sql
--
-- WHY: `storeDonation` compared donation totals that the mariadb driver returns
-- as DECIMAL *strings*, so the test was lexicographic:
--
--     "500" > "2500"   -->  true      ('5' > '2')
--      500  >  2500    -->  false
--
-- every $5 donor therefore "beat" the real top donor. The revoke step then
-- removed the badge from whoever was top *by total* -- a person who, for the
-- same reason, never actually held it -- so the revoke was a no-op and the
-- badge accumulated instead of moving.
--
-- Measured on the 2026-08-06 dump: 26 holders of a badge the donate page calls
-- "one-of-a-kind", none of them the actual top donor. The real top is the
-- account with the highest SUM(amount) over `donations`; on that dump it was a
-- $25.00 donor holding no badge at all, while $5.00 donors held it.
--
-- SAFE TO RERUN: it recomputes from `donations` every time and converges on
-- the same single holder.
--
-- NOTE ON TIES: if two accounts share the top total, MIN(user_id) wins, chosen
-- only because it is deterministic. There is no "first to reach it" data --
-- `donations.time` is per row, not per running total.

-- ------------------------------------------------------------- inspect ------
-- before:
--   SELECT ub.user_id, u.login FROM user_badges ub
--   JOIN badges b ON ub.badge_id=b.id LEFT JOIN users u ON u.id=ub.user_id
--   WHERE b.name='top donator';

START TRANSACTION;

-- the badge id, resolved by name so this does not hardcode an id
SET @badge_id = (SELECT id FROM badges WHERE name = 'top donator' LIMIT 1);

-- the rightful holder: highest lifetime total, ties broken by lowest user_id
SET @top_user = (
  SELECT user_id FROM (
    SELECT user_id, SUM(amount) AS total
    FROM donations
    WHERE user_id IS NOT NULL
    GROUP BY user_id
    ORDER BY total DESC, user_id ASC
    LIMIT 1
  ) t
);

-- strip the cosmetic chat badge from everyone who should not have it. the
-- chat badge row is keyed by user, so this only clears users whose *selected*
-- chat badge is the top donator one.
DELETE ucb FROM user_chat_badges ucb
JOIN chat_badges cb ON ucb.chat_badge_id = cb.id
WHERE cb.slug = 'top-donator'
  AND (@top_user IS NULL OR ucb.user_id <> @top_user);

-- revoke the entitlement from every incorrect holder
DELETE FROM user_badges
WHERE badge_id = @badge_id
  AND (@top_user IS NULL OR user_id <> @top_user);

-- grant it to the rightful holder if they do not already have it
INSERT INTO user_badges (user_id, badge_id)
SELECT @top_user, @badge_id
WHERE @top_user IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM user_badges
    WHERE user_id = @top_user AND badge_id = @badge_id
  );

COMMIT;

-- ------------------------------------------------------------- verify -------
-- expect exactly one row, and for it to match the highest SUM(amount):
--   SELECT ub.user_id, u.login, (SELECT SUM(amount)/100 FROM donations d
--                                WHERE d.user_id = ub.user_id) AS total_usd
--   FROM user_badges ub
--   JOIN badges b ON ub.badge_id = b.id
--   LEFT JOIN users u ON u.id = ub.user_id
--   WHERE b.name = 'top donator';
