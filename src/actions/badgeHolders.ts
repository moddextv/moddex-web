'use server';

import { getBadges } from '@/utils/api/moddex/public';

// public numbers off the catalogue, which the api caches for an hour anyway
export async function badgeHolderCounts(): Promise<Record<string, number | null>> {
  try {
    const catalogue = await getBadges();

    return Object.fromEntries(catalogue.map((badge) => [badge.slug, badge.holders]));
  } catch {
    return {};
  }
}
