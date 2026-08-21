'use server';

import { getSuggestions, ModdexApiError } from '@/utils/api/moddex';
import { MIN_SEARCH_LENGTH } from '@/hooks/pageQuery';
import type { Suggestion } from '@/misc/suggest';
import { SUGGEST_LIMIT } from '@/misc/suggest';

export async function fetchSuggestions(term: string): Promise<Suggestion[]> {
  const q = term.trim();
  if (q.length < MIN_SEARCH_LENGTH) return [];

  try {
    const page = await getSuggestions(q, SUGGEST_LIMIT);

    return page.items.slice(0, SUGGEST_LIMIT).map((user) => ({
      id: user.id,
      login: user.login,
      name: user.name ?? null,
      avatar: user.avatar ?? null,
      followers: user.followers ?? null
    }));
  } catch (error) {
    // an api that has not shipped the endpoint yet answers 404, and a search
    // bar that still routes on Enter is better than one that throws
    if (error instanceof ModdexApiError) return [];

    throw error;
  }
}
