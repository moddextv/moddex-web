import { describe, expect, it } from 'vitest';

import {
  NO_FILTERS,
  activeFilterCount,
  isFiltering,
  passesFilters
} from '@/components/User/columns';
import type { RoleUser } from '@/misc/account';

const row = (overrides: Partial<RoleUser> = {}): RoleUser => ({
  id: '1',
  login: 'somebody',
  name: 'somebody',
  avatar: null,
  followers: 1,
  badges: [],
  chatBadge: null,
  grantedAt: null,
  ...overrides
});

const badge = (slug: string) => ({ id: 1, slug, name: slug, svg: '' });

/**
 * The filters replaced a single bot toggle on 2026-09-22. Each axis narrows
 * on its own: bots show, hide or only; kinds keep a row carrying any chosen
 * badge; banned drops. A row has to pass every axis, which is what makes
 * "partners, no bots" mean what it says.
 */
describe('the list filters', () => {
  it('pass everything when nothing is set', () => {
    expect(passesFilters(row({ bot: true }), NO_FILTERS)).toBe(true);
    expect(isFiltering(NO_FILTERS)).toBe(false);
    expect(activeFilterCount(NO_FILTERS)).toBe(0);
  });

  it('narrow bots three ways', () => {
    const bot = row({ bot: true });
    const human = row();

    expect(passesFilters(bot, { ...NO_FILTERS, bots: 'hide' })).toBe(false);
    expect(passesFilters(human, { ...NO_FILTERS, bots: 'hide' })).toBe(true);
    expect(passesFilters(bot, { ...NO_FILTERS, bots: 'only' })).toBe(true);
    expect(passesFilters(human, { ...NO_FILTERS, bots: 'only' })).toBe(false);
  });

  it('keep a row carrying any of the chosen kinds, by slug', () => {
    const partner = row({ badges: [badge('partner')] });
    const verified = row({ badges: [badge('verified')] });
    const plain = row();

    const filters = { ...NO_FILTERS, kinds: ['partner', 'verified'] as const };

    expect(passesFilters(partner, { ...filters, kinds: [...filters.kinds] })).toBe(true);
    expect(passesFilters(verified, { ...filters, kinds: [...filters.kinds] })).toBe(true);
    expect(passesFilters(plain, { ...filters, kinds: [...filters.kinds] })).toBe(false);
  });

  it('drop the banned when asked, and only then', () => {
    const banned = row({ banned: { reason: 'TOS' } });

    expect(passesFilters(banned, NO_FILTERS)).toBe(true);
    expect(passesFilters(banned, { ...NO_FILTERS, hideBanned: true })).toBe(false);
  });

  it('require every axis at once', () => {
    const bannedPartnerBot = row({
      bot: true,
      banned: { reason: 'x' },
      badges: [badge('partner')]
    });

    expect(
      passesFilters(bannedPartnerBot, { bots: 'only', kinds: ['partner'], hideBanned: true })
    ).toBe(false);
    expect(
      passesFilters(bannedPartnerBot, { bots: 'only', kinds: ['partner'], hideBanned: false })
    ).toBe(true);
  });

  it('count what is active, so the chip can say so', () => {
    expect(activeFilterCount({ bots: 'hide', kinds: ['staff', 'partner'], hideBanned: true })).toBe(
      4
    );
  });
});
