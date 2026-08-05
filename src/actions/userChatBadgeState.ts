'use server';

import { db } from '@/misc/Database';
import { auth } from '@/auth';

/**
 * every export of a 'use server' file is a publicly callable endpoint, so the
 * acting user is derived from the session here and never taken from an argument.
 *
 * the chat badge is resolved through the caller's own user_badges rows, so a
 * badge they have not earned (top donator, team, ...) cannot be selected.
 */
export async function setSelectedUserChatBadge(
  newSelectedBadge: string
): Promise<void> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error('not authenticated');
  }

  if (newSelectedBadge === 'none') {
    await db.query(`DELETE FROM user_chat_badges WHERE user_id = ?`, [userId]);
    return;
  }

  const badge = await db.queryOne(
    `
      SELECT cb.id
      FROM chat_badges cb
      JOIN user_badges ub
        ON cb.badge_id = ub.badge_id
      WHERE ub.user_id = ?
        AND cb.name = ?
    `,
    [userId, newSelectedBadge]
  );

  if (!badge) {
    throw new Error('badge not available for this user');
  }

  await db.query(
    `INSERT INTO user_chat_badges (user_id, chat_badge_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE chat_badge_id = ?`,
    [userId, badge.id, badge.id]
  );
}
