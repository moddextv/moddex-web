import { NextRequest } from 'next/server';
import { NotFound } from '@/app/api/ApiErrors';

export const GET = async (request: NextRequest, context: any) => {
    return NotFound();
};