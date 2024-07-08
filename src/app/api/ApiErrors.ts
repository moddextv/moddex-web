import { NextResponse } from 'next/server';

type ResponsePayload = {
    error?: string;
    message?: string;
};

const sendResponse = (status: number, error: string = '', message?: string): NextResponse => {
    const responsePayload: ResponsePayload = { error };

    if (message) {
        responsePayload.message = message;
    }

    return NextResponse.json(responsePayload, { status });
};

export const BadRequest = (message: string = '', error: string = '') => (
    sendResponse(400, error || 'Bad Request', message)
);

export const Forbidden = (message: string = '', error: string = '') => (
    sendResponse(403, error || 'Forbidden', message)
);

export const NotFound = (message: string = '', error: string = '') => (
    sendResponse(404, error || 'Not Found', message)
);

export const InternalServerError = (message: string = '', error: string = '') => (
    sendResponse(500, error || 'Internal Server Error', message)
);