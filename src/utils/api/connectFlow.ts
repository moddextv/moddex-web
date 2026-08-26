// a flow is a name here, never a new /api/connect prefix
export const CONNECT_FLOWS = ['channel', 'discord'] as const;

export type ConnectFlow = (typeof CONNECT_FLOWS)[number];

// the old wire value — changing it fails the state check mid-authorisation
export type ConnectPurpose = `${ConnectFlow}-connect`;

export const purposeOf = (flow: ConnectFlow): ConnectPurpose => `${flow}-connect`;
