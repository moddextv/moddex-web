import { NextRequest, NextResponse } from 'next/server';
import { Forbidden } from '@/app/api/ApiErrors';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const allowedHosts = [
        'https://modchecker.com',
        'https://dev.modchecker.com'
    ];

    if (pathname.startsWith('/api/internal/')) {
        const origin = request.headers.get('host') || '';

        if (!allowedHosts.includes(origin)) {
            // return Forbidden(`You do not have permission to access the internal api`);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/api/internal/:path*',
}