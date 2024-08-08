import { NextRequest, NextResponse } from 'next/server';

async function trackMatomo(url: string) {
  const params = new URLSearchParams({
    idsite: '2',
    rec: '1',
    url,
  });

  try {
    await fetch(`https://analytics.maersux.dev/matomo.php?${params.toString()}`, {
      method: 'GET',
    });
  } catch (error) {
    console.error('Matomo tracking error:', error);
  }
}

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.href;
  await trackMatomo(url);

  return NextResponse.next();
}

export const config = {
  matcher: '/:path*'
};
