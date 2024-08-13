import { InternalServerError } from '@/app/api/ApiErrors';
import { db } from '@/misc/Database';
import { logger } from '@/misc/Logger';
import { NextRequest, NextResponse } from 'next/server';
import { constants } from '@/utils/constants';

export const GET = async (request: NextRequest, context: any) => {
  try {
    const badgesResults = await db.query(`
      SELECT 
        cb.name, cb.path,
        u.id
      FROM chat_badges cb
      LEFT JOIN user_chat_badges ucb 
        ON cb.id = ucb.chat_badge_id
      LEFT JOIN users u 
        ON ucb.user_id = u.id
    `);

    if (!badgesResults.length) {
      return InternalServerError('something went wrong while fetching badges');
    }

    const badgesByUser: Record<string, { ffzSlot: number, name: string, path: string, users: string[] }> = {};

    badgesResults.forEach((badge: any) => {
      const badgeName = badge.name;
      const badgePath = badge.path;
      const userId = badge.id;

      if (!badgesByUser[badgeName]) {
        badgesByUser[badgeName] = {
          ffzSlot: constants.ffzSlot,
          name: badgeName,
          path: `https://modchecker.com${badgePath}`,
          users: []
        };
      }

      if (userId) {
        badgesByUser[badgeName].users.push(userId);
      }
    });

    const result = Object.values(badgesByUser);
    return NextResponse.json(result);
  } catch (error) {
    logger.error('error on /api/v1/chatBadges', error);
    return InternalServerError('something went wrong while fetching badges');
  }
};