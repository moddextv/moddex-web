import { db } from '@/misc/Database';
import { logger } from '@/misc/Logger';
import { addBadgeByNameToUser, removeBadgeByNameFromUser, removeTopDonatorChatBadge } from '@/utils/badges';
import { config } from '@/config';

export async function storeDonation(donation: Donation) {
  try {
    await db.query(`
      INSERT INTO donations 
        (payment_id, user_id, amount, email, name, payment_intent_id, payment_status, charge_id) 
      VALUES 
        (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      donation.paymentId,
      donation.userId || null,
      donation.amount,
      donation.email || null,
      donation.name || null,
      donation.paymentIntentId,
      donation.paymentStatus,
      donation.chargeId || null
    ]);

    if (!donation.userId) {
      return;
    }

    const userTotalAmount = await getTotalDonationsForUser(donation.userId);

    if (userTotalAmount >= config.stripe.donation.default * 100) {
      const [topDonator] = await Promise.all([
          getTopDonator(),
          addBadgeByNameToUser(donation.userId || '', 'donator')
      ]);

      // this donation is already inserted, so getTopDonator() sees it: the
      // question is simply whether the donor now *is* the top, not whether
      // they beat a total that already includes them. the previous test was
      // `userTotalAmount > topDonator.total`, which could never be true --
      // and compared two DECIMAL strings, so "500" > "2500" was, giving the
      // badge to $5 donors and never to the actual top.
      if (topDonator && topDonator.user_id === donation.userId) {
        await Promise.all([
          db.query('INSERT INTO audit (type, message) VALUES (?, ?)', ['donation', `top-donator is now ${donation.userId}: ${userTotalAmount}`]),
          setSoleTopDonator(donation.userId)
        ]);
      }
    }

  } catch (error) {
    logger.error('error storing donation:', error);
    throw new Error('failed to store donation');
  }
}

/**
 * the driver returns SUM() as a DECIMAL *string*, so every one of these has to
 * be coerced before it is compared. leaving it as a string is what broke the
 * top donator badge: `"500" > "2500"` is true.
 */
const getTotalDonationsForUser = async (userId: string): Promise<number> => {
  const userDonations = await db.queryOne(`
    SELECT SUM(amount) as total
    FROM donations
    WHERE user_id = ?
  `, [userId]);

  return Number(userDonations?.total ?? 0);
};

const getTopDonator = async (): Promise<{ user_id: string; total: number } | null> => {
  const row = await db.queryOne(`
    SELECT user_id, SUM(amount) as total
    FROM donations
    WHERE user_id IS NOT NULL
    GROUP BY user_id
    ORDER BY SUM(amount) DESC
  `);

  if (!row) return null;

  return { user_id: String(row.user_id), total: Number(row.total) };
};

/**
 * makes `userId` the only holder of the top donator badge.
 *
 * it revokes from every other holder rather than from "the previous top",
 * because the old code revoked from whoever was top *by total* -- who, thanks
 * to the string comparison above, was never the person actually wearing the
 * badge. the revoke was therefore a no-op and holders accumulated. sweeping
 * all holders makes this self-healing.
 */
const setSoleTopDonator = async (userId: string): Promise<void> => {
  const holders = await db.query(`
    SELECT ub.user_id
    FROM user_badges ub
    JOIN badges b ON ub.badge_id = b.id
    WHERE b.name = 'top donator' AND ub.user_id <> ?
  `, [userId]);

  for (const holder of holders) {
    await Promise.all([
      removeTopDonatorChatBadge(holder.user_id),
      removeBadgeByNameFromUser(holder.user_id, 'top donator')
    ]);
  }

  await addBadgeByNameToUser(userId, 'top donator');
};

/**
 * throws if the check itself fails. it used to swallow the error and return
 * false, i.e. "no such donation" -- under webhook retries that is how one
 * payment becomes two rows and two badges. the caller must be able to tell
 * "definitely not recorded yet" from "could not find out".
 */
export async function donationExists(paymentId: string): Promise<boolean> {
  return await db.entryExists(
    `SELECT 1 FROM donations WHERE payment_id = ?`,
    [paymentId]
  );
}

export interface Donation {
  paymentId: string;
  userId?: string;
  amount: number;
  email?: string;
  name?: string;
  paymentIntentId: string;
  paymentStatus: string;
  chargeId: string;
}

