-- 007 — grant the donator badge to everyone who paid for it
--
-- apply to an EXISTING production database, AFTER the storeDonation fix ships.
-- Applying it earlier works; the badge would just drift again on the next
-- donation.
--
-- run it as:
--   docker compose -f compose.prod.yaml exec -T db \
--     mariadb -u root -p<pass> <db> < db/migrations/007-reconcile-donator-badges.sql
--
-- WHY: measured on the 2026-08-06 data, 49 accounts have cleared the $5
-- threshold and 49 hold the badge -- but only 47 are the same people. The badge
-- write in storeDonation sits behind the same broken branch that produced 26
-- "top donators" (see 005), so grants have been unreliable.
--
--   MISSING (paid, no badge): 2
--   EXTRA   (badge, no pay) : 2   <-- deliberately NOT touched, see below
--
-- The threshold is config.stripe.donation.default * 100 = 500 (cents). It is
-- duplicated here because SQL cannot read the app config; if that value ever
-- changes, change it here too.
--
-- SAFE TO RERUN: INSERT ... SELECT with a NOT EXISTS guard. Converges.

START TRANSACTION;

SET @donator_badge = (SELECT id FROM badges WHERE name = 'donator' LIMIT 1);

-- everyone whose lifetime donations clear the threshold and who is a real
-- `users` row. the join to `users` is not optional: user_badges has a foreign
-- key to it, and at least one donation carries a user_id with no user record.
INSERT INTO user_badges (user_id, badge_id)
SELECT d.user_id, @donator_badge
FROM donations d
JOIN users u ON u.id = d.user_id
WHERE d.user_id IS NOT NULL
GROUP BY d.user_id
HAVING SUM(d.amount) >= 500
   AND NOT EXISTS (
     SELECT 1 FROM user_badges ub
     WHERE ub.user_id = d.user_id AND ub.badge_id = @donator_badge
   );

COMMIT;

-- --------------------------------------------------------------- NOT DONE ---
-- Two accounts hold the donator badge with no donations on record:
-- `retrorelaxo` and `existenzproduzent`. They are NOT revoked here.
--
-- `config.brand.email` is info@relaxo.dev, so `retrorelaxo` is almost certainly
-- a project account rather than a mis-grant, and a badge granted by hand for a
-- reason the donations table cannot know about is not something a migration
-- should quietly take away. If you do want them gone, it is one statement:
--
--   DELETE ub FROM user_badges ub
--   JOIN badges b ON b.id = ub.badge_id
--   WHERE b.name = 'donator'
--     AND ub.user_id IN (SELECT id FROM users
--                        WHERE login IN ('retrorelaxo','existenzproduzent'));
--
-- One further donor cannot be granted at all: a $5.00 donation carries a
-- user_id with no matching `users` row, so the foreign key rejects it. Fix the
-- user record first if that account matters.

-- ---------------------------------------------------------------- verify ----
--   SELECT COUNT(*) FROM user_badges ub JOIN badges b ON b.id=ub.badge_id
--   WHERE b.name='donator';   -- expect 51 after this runs on the 2026-08-06 data
