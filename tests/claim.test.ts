import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { claimState } from '@/utils/claim';

const read = (...parts: string[]) => readFileSync(join(process.cwd(), 'src', ...parts), 'utf8');

describe('the invitation on a profile', () => {
  it('asks a signed-out visitor to sign in', () => {
    expect(claimState(undefined, '1', false)).toBe('signIn');
  });

  it('asks the owner to connect while the channel is not', () => {
    expect(claimState('1', '1', false)).toBe('connect');
  });

  it('says nothing to a connected owner', () => {
    expect(claimState('1', '1', true)).toBeNull();
  });

  it('says nothing on somebody else`s profile', () => {
    expect(claimState('2', '1', false)).toBeNull();
    expect(claimState('2', '1', true)).toBeNull();
  });

  it.each([
    ['user', '[username]', 'page.tsx'],
    ['channel', '[username]', 'page.tsx']
  ])('%s/%s draws it', (...parts) => {
    expect(read('app', '[locale]', ...parts)).toContain('<ClaimPanel');
  });

  // next-auth knows nothing about locales, so the way back has to carry it
  it('lands the sign-in back on the profile in the reader`s language', () => {
    const source = read('components', 'User', 'ClaimPanel.tsx');

    expect(source).toContain('localePath(locale, `/${type}/${login}`)');
    expect(source).toContain('redirectTo: back');
  });

  // the connect starts at the route that checks the session, never at twitch
  it('sends the owner through the connect route', () => {
    expect(read('components', 'User', 'ClaimPanel.tsx')).toContain('href="/api/connect/channel"');
  });
});
