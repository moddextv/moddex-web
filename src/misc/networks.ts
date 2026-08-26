// The social networks `user_socials` accepts. Not in the action file: every
// export of a 'use server' module has to be an async function.
export const NETWORKS = ['discord'] as const;

export type Network = (typeof NETWORKS)[number];
