import { NextResponse } from 'next/server';

type ResponsePayload = {
  status: number;
  error: string;
  message?: string;
};

const sendResponse = (status: number, error: string, message?: string): NextResponse => {
  const responsePayload: ResponsePayload = { error, status };

  if (message) {
    responsePayload.message = message;
  }

  return NextResponse.json(responsePayload, { status });
};

export const NotFound = (message: string = '', error: string = '') =>
  sendResponse(404, error || 'not found', message);
