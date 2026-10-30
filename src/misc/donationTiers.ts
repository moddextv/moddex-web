import type { BadgeCatalogueEntry } from '@/misc/badges';

export interface TierBadge {
  slug: string;
  name: string;
  icon: string;
  chat: string;
}

export interface Tier {
  key: string;
  cents: number;
  badges: TierBadge[];
}

export const MIN_CENTS = 100;
export const MAX_CENTS = 1_000_000;

const face = (entry: BadgeCatalogueEntry): TierBadge => ({
  slug: entry.slug,
  name: entry.name,
  icon: entry.images.icon.svg,
  chat: entry.images.chat[2]
});

const family = (catalogue: BadgeCatalogueEntry[], parent: string) =>
  catalogue
    .filter((entry) => entry.slug === parent || entry.variantOf === parent)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

// the thresholds live on the api's variant rows; this only reads them back
export const tiersFrom = (
  catalogue: BadgeCatalogueEntry[],
  baseCents: number,
  topCents: number | null
): Tier[] => {
  const donator = family(catalogue, 'donator');
  const crown = family(catalogue, 'top-donator');

  const steps = [
    ...new Set([baseCents, ...donator.map((entry) => entry.unlockCents ?? baseCents)])
  ].sort((a, b) => a - b);

  const tiers = steps.map((cents) => ({
    key: String(cents),
    cents,
    badges: donator.filter((entry) => (entry.unlockCents ?? baseCents) <= cents).map(face)
  }));

  const last = steps.at(-1) ?? baseCents;

  tiers.push({
    key: 'top',
    cents: Math.max(topCents ?? 0, last) + 100,
    badges: [...crown, ...donator].map(face)
  });

  return tiers;
};

// what an amount buys on its own, ignoring earlier donations: the highest tier it reaches
export const tierFor = (tiers: Tier[], cents: number): Tier | null =>
  tiers
    .filter((tier) => tier.key !== 'top')
    .reduce<Tier | null>((best, tier) => (tier.cents <= cents ? tier : best), null);

// whole dollars read as $5, not $5.00, in every locale's own order
export const wholeDollars = (formatted: string): string => formatted.replace(/[.,]00(?=\D*$)/, '');

export const isAmount = (cents: unknown): cents is number =>
  Number.isInteger(cents) && (cents as number) >= MIN_CENTS && (cents as number) <= MAX_CENTS;
