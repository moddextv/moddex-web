import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export const GET = async () =>
  NextResponse.json({
    status: 'ok',
    service: 'moddex-web',
    uptimeSec: Math.round(process.uptime())
  });
