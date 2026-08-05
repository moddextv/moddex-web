import { db } from '@/misc/Database';
import { logger } from '@/misc/Logger';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * container healthcheck. reports the database separately from the process so a
 * failing check tells you which half is broken.
 */
export const GET = async () => {
  try {
    await db.ping();
  } catch (error) {
    logger.error('healthcheck: database unreachable', error);

    return NextResponse.json(
      { status: 'error', database: 'down' },
      { status: 503 }
    );
  }

  return NextResponse.json({ status: 'ok', database: 'up' });
};
