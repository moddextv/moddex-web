export type ClaimState = 'signIn' | 'connect' | null;

// somebody else's profile gets no invitation, and a connected owner needs none
export const claimState = (
  viewerId: string | undefined,
  ownerId: string,
  connected: boolean
): ClaimState => {
  if (!viewerId) return 'signIn';
  if (viewerId !== ownerId || connected) return null;

  return 'connect';
};
