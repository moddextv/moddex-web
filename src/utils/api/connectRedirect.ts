import 'server-only';

import { NextResponse } from 'next/server';
import { serverConfig } from '@/serverConfig';
import type { ConnectFlow } from '@/utils/api/connectFlow';

// Separate from connectFlow.ts because serverConfig requires NEXTAUTH_URL the
// moment it is imported: only the route handlers may pay that, not every module
// that needs a flow name.
export const backToSettings = (flow: ConnectFlow, reason: string) =>
  NextResponse.redirect(new URL(`/settings?${flow}=${reason}`, serverConfig.baseUrl));
