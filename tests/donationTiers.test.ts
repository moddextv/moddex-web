import { describe, expect, it } from 'vitest';
import { tierFor, tiersFrom } from '@/misc/donationTiers';
import type { BadgeCatalogueEntry } from '@/misc/badges';

const entry = (
  slug: string,
  order: number,
  variantOf: string | null = null,
  unlockCents: number | null = null
): BadgeCatalogueEntry => ({
  id: order,
  slug,
  name: slug.replace('-', ' '),
  chatName: null,
  order,
  wearable: true,
  variantOf,
  unlockCents,
  images: {
    icon: { svg: `/badges/${slug}/icon.svg`, png: '' },
    chat: { 1: '', 2: `/badges/${slug}/2x.webp`, 4: '' }
  }
});

// the shape production answers, shuffled, with a badge that has nothing to do with donating
const CATALOGUE = [
  entry('donator-rose', 43, 'donator', 2500),
  entry('top-donator', 30),
  entry('donator', 40),
  entry('verified', 45),
  entry('donator-sky', 41, 'donator', 1000),
  entry('top-donator-onyx', 31, 'top-donator'),
  entry('donator-violet', 42, 'donator', 1000),
  entry('donator-ember', 44, 'donator', 2500),
  entry('top-donator-platinum', 32, 'top-donator')
];

const slugs = (cents: number) =>
  tierFor(tiersFrom(CATALOGUE, 500, null), cents)?.badges.map((badge) => badge.slug);

describe('the tiers are read off the catalogue, not written down twice', () => {
  it('offers the base amount and every threshold a variant row carries, then the top', () => {
    const tiers = tiersFrom(CATALOGUE, 500, 15_000);

    expect(tiers.map((tier) => [tier.key, tier.cents, tier.badges.length])).toEqual([
      ['500', 500, 1],
      ['1000', 1000, 3],
      ['2500', 2500, 5],
      ['top', 15_100, 8]
    ]);
  });

  it('prices the top one dollar over the highest total, never under the last tier', () => {
    expect(tiersFrom(CATALOGUE, 500, null).at(-1)!.cents).toBe(2600);
    expect(tiersFrom(CATALOGUE, 500, 800).at(-1)!.cents).toBe(2600);
  });

  it('adds a dollar, then rounds up to a whole one', () => {
    expect(tiersFrom(CATALOGUE, 500, 2550).at(-1)!.cents).toBe(2700);
    expect(tiersFrom(CATALOGUE, 500, 15_099).at(-1)!.cents).toBe(15_200);
    expect(tiersFrom(CATALOGUE, 500, 15_100).at(-1)!.cents).toBe(15_200);
  });

  it('puts the crown first in the top pack, and nothing unrelated in any of them', () => {
    const top = tiersFrom(CATALOGUE, 500, null)
      .at(-1)!
      .badges.map((badge) => badge.slug);

    expect(top.slice(0, 3)).toEqual(['top-donator', 'top-donator-onyx', 'top-donator-platinum']);
    expect(top).not.toContain('verified');
  });

  it('gives a custom amount the highest tier it reaches, and none below the first', () => {
    expect(slugs(499)).toBeUndefined();
    expect(slugs(500)).toEqual(['donator']);
    expect(slugs(999)).toEqual(['donator']);
    expect(slugs(1000)).toEqual(['donator', 'donator-sky', 'donator-violet']);
    expect(slugs(100_000)).toHaveLength(5);
  });

  it('still offers amounts when the catalogue could not be read', () => {
    const tiers = tiersFrom([], 500, null);

    expect(tiers.map((tier) => tier.key)).toEqual(['500', 'top']);
    expect(tiers.every((tier) => tier.badges.length === 0)).toBe(true);
  });
});
