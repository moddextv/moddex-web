import { db } from '@/misc/Database';
import { logger } from '@/misc/Logger';
import { addBadgeByNameToUser, removeBadgeByNameFromUser } from '@/utils/badges';
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

      if (topDonator && userTotalAmount > topDonator.total) {
        await updateTopDonatorBadge(donation.userId, topDonator.user_id);
      }
    }

  } catch (error) {
    logger.error('error storing donation:', error);
    throw new Error('failed to store donation');
  }
}

const getTotalDonationsForUser = async (userId: string) => {
  const userDonations = await db.queryOne(`
    SELECT SUM(amount) as total
    FROM donations
    WHERE user_id = ?
  `, [userId], false);

  return userDonations?.total || 0;
};

const getTopDonator = async () => {
  return await db.queryOne(`
    SELECT user_id, SUM(amount) as total
    FROM donations
    WHERE user_id IS NOT NULL
    GROUP BY user_id
    ORDER BY total DESC
  `);
};

const updateTopDonatorBadge = async (newTopUserId: string, currentTopUserId: string) => {
  if (newTopUserId !== currentTopUserId) {
    await Promise.all([
      removeBadgeByNameFromUser(currentTopUserId, 'top donator'),
      addBadgeByNameToUser(newTopUserId, 'top donator')
    ]);
  }
};

export async function donationExists(paymentId: string): Promise<boolean> {
  try {
    return await db.entryExists(
      `SELECT 1 FROM donations WHERE payment_id = ?`,
      [paymentId]
    );
  } catch (error) {
    logger.error('error checking donation existence:', error);
    return false;
  }
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

