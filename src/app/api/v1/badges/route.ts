import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/misc/Database';
import { NotFound } from '@/app/api/ApiErrors';
import { Badge } from '@/misc/Interfaces';

export const GET = async (request: NextRequest, context: any) => {
    const { id, name } = Object.fromEntries(new URL(request.url).searchParams);

    if (!id && !name) {
        const badges: Badge[] = await db.query('SELECT id, name, path FROM badges');

        if (!badges.length) {
            return NotFound('Badges not found');
        }

        return NextResponse.json(badges);
    }

    const condition: string = id ? 'id' : 'name';
    const value: string = id || name;
    const badge: Badge = await db.queryOne(`SELECT id, name, path FROM badges WHERE ${condition}=?`, [value]);

    if (!badge) {
        return NotFound('Badge not found');
    }

    return NextResponse.json(badge);
};

export const POST = async (request: NextRequest, context: any) => {}

export const DELETE = async (request: NextRequest, context: any) => {}