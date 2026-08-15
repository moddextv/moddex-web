// Every outbound connect flow. The name is three things at once: the path
// segment under /api/connect, the purpose carried in the signed state, and the
// query key /settings reads to report the outcome. Adding a flow means adding a
// name here — not a new prefix.
//
// Nothing is imported on purpose. This module is pulled in by the oauth helpers
// and by tests, and reaching for serverConfig here would make every one of them
// require NEXTAUTH_URL at import time. The redirect lives in connectRedirect.ts
// for exactly that reason.

export const CONNECT_FLOWS = ['channel', 'discord'] as const;

export type ConnectFlow = (typeof CONNECT_FLOWS)[number];

// What the signed state carries. Derived rather than written out again, but
// still the old wire value — changing it would fail the state check for anyone
// mid-authorisation.
export type ConnectPurpose = `${ConnectFlow}-connect`;

export const purposeOf = (flow: ConnectFlow): ConnectPurpose => `${flow}-connect`;
