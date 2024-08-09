import { InternalServerError } from '@/app/api/ApiErrors';
import { db } from '@/misc/Database';
import { logger } from '@/misc/Logger';
import { NextResponse } from 'next/server';
import { constants } from '@/utils/constants';

export const GET = async () => {
  try {
    const badges = await db.query(`
      SELECT 
        cb.name, cb.path,
        u.id
      FROM users u
        JOIN user_chat_badges ucb
          ON u.id = ucb.user_id
        JOIN chat_badges cb
          ON ucb.chat_badge_id = cb.id
    `);

    if (!badges.length) {
      return InternalServerError('something went wrong while fetching badges');
    }

    const badgesByUser: Record<string, { ffzSlot: number, name: string, url: string, users: string[] }> = {};

    badges.forEach((badge: any) => {
      const badgeName = badge.name;
      const userId = badge.id;

      if (!badgesByUser[badgeName]) {
        badgesByUser[badgeName] = {
          ffzSlot: constants.ffzSlot,
          name: badgeName,
          url: `https://modchecker.com${badge.path}`,
          users: [userId],
        };
      } else {
        badgesByUser[badgeName].users.push(userId);
      }
    });

    const result = Object.values(badgesByUser);

    return NextResponse.json(result);

  } catch (error) {
    logger.error('error on /api/v1/chat-badges', error);
    return InternalServerError('something went wrong while fetching badge');
  }
};