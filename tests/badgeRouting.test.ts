import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SOURCES, flagCopyFor, kindOf, wears } from '@/components/Dashboard/badgeRouting';
import en from '@/i18n/messages/en.json';

const src = (...parts: string[]) => readFileSync(join(__dirname, '..', 'src', ...parts), 'utf8');

/**
 * A flag badge is a column on the account, so the api answers a grant with 409
 * and the holders list with a count and no roster. The dashboard has to route it
 * away from the panel that draws a roster, or the count chip reads 31 beside a
 * line saying nobody holds it, with a toggle that can only fail.
 */
describe('the badge doors', () => {
  it('sends every flag badge to the counted door, verified included', () => {
    for (const badge of ['verified', 'staff', 'partner', 'affiliate']) {
      expect(kindOf(badge)).toBe('flag');
    }
  });

  it('keeps the three doors a lockout rule depends on', () => {
    expect(kindOf('admin')).toBe('admins');
    expect(kindOf('bot')).toBe('bots');
    expect(kindOf('donator')).toBe('badge');
    expect(kindOf('translator')).toBe('badge');
  });

  // verified is not twitch's, so the sentence naming twitch is the wrong one
  it('says who writes each flag badge, and has a message for it', () => {
    expect(flagCopyFor('verified')).toBe('dash.badge.signInFlag');
    expect(flagCopyFor('staff')).toBe('dash.badge.twitchOwned');

    for (const badge of ['verified', 'staff', 'partner', 'affiliate']) {
      const key = flagCopyFor(badge).split('.').slice(1);
      const message = key.reduce<unknown>(
        (node, part) => (node as Record<string, unknown>)?.[part],
        en.dash
      );

      expect(typeof message).toBe('string');
      expect(message).toContain('{count}');
    }
  });

  it('names a source for every flag badge, which is the note beside the switch', () => {
    expect(SOURCES.verified).toBe('signing in');
    expect(SOURCES.staff).toBe('twitch');
  });

  it('draws a flag badge as state in both panels rather than as a switch', () => {
    for (const file of ['BadgeManager.tsx', 'MemberBadges.tsx']) {
      const source = src('components', 'Dashboard', file);

      expect(source).toContain("kind === 'flag'");
      expect(source).not.toContain("'twitch'");
    }
  });

  it('wears reads the name a badge rides under', () => {
    const verified = { id: 10, slug: 'verified', name: 'verified', svg: '' };

    expect(wears([verified], 'verified')).toBe(true);
    expect(wears([verified], 'donator')).toBe(false);
    expect(wears(undefined, 'verified')).toBe(false);
  });
});

describe('the verified roster', () => {
  it('lists verified read-only, and no twitch flag', async () => {
    const { listsHolders } = await import('@/components/Dashboard/badgeRouting');

    expect(listsHolders('verified')).toBe(true);

    for (const badge of ['staff', 'partner', 'affiliate', 'donator']) {
      expect(listsHolders(badge)).toBe(false);
    }
  });
});
