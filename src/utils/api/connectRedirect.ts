import 'server-only';

import { NextResponse } from 'next/server';
import { serverConfig } from '@/serverConfig';
import type { ConnectFlow } from '@/utils/api/connectFlow';

// separate from connectFlow.ts: importing serverConfig demands NEXTAUTH_URL at once
export const backToSettings = (flow: ConnectFlow, reason: string) =>
  NextResponse.redirect(new URL(`/settings?${flow}=${reason}`, serverConfig.baseUrl));
