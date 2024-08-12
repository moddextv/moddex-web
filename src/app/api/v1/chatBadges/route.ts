import { BadRequest, InternalServerError, NotFound } from '@/app/api/ApiErrors';
import { db } from '@/misc/Database';
import { Badge } from '@/misc/Interfaces';
import { logger } from '@/misc/Logger';
import { isInteger } from '@/utils/validation';
import { NextRequest, NextResponse } from 'next/server';
import { constants } from '@/utils/constants';

export const GET = async (request: NextRequest, context: any) => {
  const { id, name } = Object.fromEntries(new URL(request.url).searchParams);

  try {
    const badges2 = await db.query(`
      SELECT 
        cb.name, cb.path,
        u.id
      FROM users u
        JOIN user_chat_badges ucb
          ON u.id = ucb.user_id
        JOIN chat_badges cb
          ON ucb.chat_badge_id = cb.id
    `);
    if (!badges2.length) {
      return InternalServerError('something went wrong while fetching badges');
    }
    const badgesByUser: Record<string, { ffzSlot: number, name: string, path: string, users: string[] }> = {};

    badges2.forEach((badge: any) => {
      const badgeName = badge.name;
      const userId = badge.id;

      if (!badgesByUser[badgeName]) {
        badgesByUser[badgeName] = {
          ffzSlot: constants.ffzSlot,
          name: badgeName,
          path: `https://modchecker.com${badge.path}`,
          users: [userId],
        };
      } else {
        badgesByUser[badgeName].users.push(userId);
      }
    });

    const result = Object.values(badgesByUser);
    return NextResponse.json(result);
  } catch (error) {
    logger.error('error on /api/v1/chatBadges', error);
    return InternalServerError('something went wrong while fetching badge');
  }
};
