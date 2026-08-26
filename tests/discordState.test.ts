import { describe, expect, it } from 'vitest';

import { mintDiscordState, readDiscordState } from '../src/utils/api/discord';
import { mintState } from '../src/utils/api/oauthState';

process.env.AUTH_SECRET = 'test-secret-for-state-signing';

const ALICE = '12345';
const MALLORY = '99999';

const parts = (state: string) => {
  const [purpose, id, nonce, signature] = state.split('.');

  if (!purpose || !id || !nonce || !signature) throw new Error(`malformed state: ${state}`);

  return { purpose, id, nonce, signature };
};

describe('discord link state', () => {
  it('accepts a state in the session it was minted for', () => {
    expect(readDiscordState(mintDiscordState(ALICE), ALICE)).toBe(true);
  });

  it('has all four parts', () => {
    expect(mintDiscordState(ALICE).split('.')).toHaveLength(4);
    expect(parts(mintDiscordState(ALICE)).purpose).toBe('discord-connect');
  });

  it('refuses a state minted for somebody else', () => {
    expect(readDiscordState(mintDiscordState(MALLORY), ALICE)).toBe(false);
  });

  it('refuses a state minted for another flow', () => {
    const elsewhere = mintState('channel-connect', ALICE);

    expect(readDiscordState(elsewhere, ALICE)).toBe(false);
  });

  it('refuses a state whose twitch id was edited to match', () => {
    const { purpose, nonce, signature } = parts(mintDiscordState(MALLORY));
    const edited = `${purpose}.${ALICE}.${nonce}.${signature}`;

    expect(edited.split('.')).toHaveLength(4);
    expect(readDiscordState(edited, ALICE)).toBe(false);
  });

  it('refuses a tampered signature of the right length', () => {
    const { purpose, id, nonce, signature } = parts(mintDiscordState(ALICE));
    const flipped = signature.replace(/^./, (c) => (c === 'a' ? 'b' : 'a'));

    expect(flipped).toHaveLength(signature.length);
    expect(flipped).not.toBe(signature);
    expect(readDiscordState(`${purpose}.${id}.${nonce}.${flipped}`, ALICE)).toBe(false);
  });

  it('refuses a signature of the wrong length without throwing', () => {
    const { purpose, id, nonce } = parts(mintDiscordState(ALICE));
    const short = `${purpose}.${id}.${nonce}.short`;

    expect(() => readDiscordState(short, ALICE)).not.toThrow();
    expect(readDiscordState(short, ALICE)).toBe(false);
  });

  it('refuses missing and malformed states', () => {
    expect(readDiscordState(null, ALICE)).toBe(false);
    expect(readDiscordState('', ALICE)).toBe(false);
    expect(readDiscordState('nonsense', ALICE)).toBe(false);
    expect(readDiscordState(`discord-connect.${ALICE}.only-three`, ALICE)).toBe(false);
  });

  it('does not repeat itself', () => {
    expect(mintDiscordState(ALICE)).not.toBe(mintDiscordState(ALICE));
  });
});
