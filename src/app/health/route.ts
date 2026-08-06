import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Container healthcheck. It answers "is this web app alive" and nothing else.
 *
 * It deliberately does NOT check moddex-api. This app has no database now, and
 * a healthcheck that fails because a dependency is down turns one outage into
 * a restart loop across the estate — moddex-status is what reports the estate.
 */
export const GET = async () =>
  NextResponse.json({ status: 'ok', service: 'moddex-web' });
