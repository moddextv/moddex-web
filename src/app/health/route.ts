import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Container healthcheck. It answers "is this web app alive" and nothing else.
 *
 * It deliberately does NOT check moddex-api. This app has no database now, and
 * a healthcheck that fails because a dependency is down turns one outage into
 * a restart loop across the estate — moddex-status is what reports the estate.
 *
 * `{status, service, uptimeSec}` is the shape every moddex service answers
 * with. uptimeSec is the process's own uptime, which is what makes a restart
 * loop visible: a service that is "ok" every time you look but never gets past
 * a few seconds of uptime is failing and recovering, not healthy.
 */
export const GET = async () =>
  NextResponse.json({
    status: 'ok',
    service: 'moddex-web',
    uptimeSec: Math.round(process.uptime())
  });
