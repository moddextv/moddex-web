import { db } from '@/misc/Database';
import { logger } from '@/misc/Logger';
import { addBadgeByNameToUser } from '@/utils/badges';

export async function storeDonation(donation: Donation) {
  try {
    await Promise.all([
      addBadgeByNameToUser(donation.userId || '', 'donator'),
      db.query(`
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
        donation.chargeId || null,
      ])
    ]);

  } catch (error) {
    logger.error('error storing donation:', error);
    throw new Error('failed to store donation');
  }
}

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