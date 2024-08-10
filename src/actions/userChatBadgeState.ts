'use server';

import { db } from '@/misc/Database';

export async function setSelectedUserChatBadge(
  userId: string,
  newSelectedBadge: string
): Promise<void> {
  try {
    if (newSelectedBadge === 'none') {
      await db.query(`DELETE FROM user_chat_badges WHERE user_id = ?`, [userId]);
      return;
    }

    const badge = await db.queryOne(`SELECT id FROM chat_badges WHERE name = ?`, [newSelectedBadge]);
    if (!badge) {
      return
    }

    await db.query(`INSERT INTO user_chat_badges (user_id, chat_badge_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE chat_badge_id = ?`, [userId, badge.id, badge.id]);

  } catch (err) {}
}