import { NotFound } from '@/app/api/ApiErrors';
import { NextRequest } from 'next/server';

export const GET = async (request: NextRequest, context: any) => {
  return NotFound();
};
