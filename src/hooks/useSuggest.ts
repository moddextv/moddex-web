import { useEffect, useRef, useState } from 'react';

import { fetchSuggestions } from '@/actions/search';
import { MIN_SEARCH_LENGTH } from '@/hooks/pageQuery';
import { SUGGEST_DEBOUNCE_MS, type Suggestion } from '@/misc/suggest';

export const useSuggest = (term: string, enabled: boolean) => {
  const [items, setItems] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const wanted = useRef(0);

  const short = term.trim().length < MIN_SEARCH_LENGTH;

  useEffect(() => {
    if (!enabled || short) {
      setItems([]);
      setLoading(false);
      return;
    }

    // every keystroke starts a request the previous one cannot finish after
    const attempt = ++wanted.current;
    setLoading(true);

    const timer = setTimeout(async () => {
      const found = await fetchSuggestions(term).catch(() => []);

      if (attempt !== wanted.current) return;

      setItems(found);
      setLoading(false);
    }, SUGGEST_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [term, enabled, short]);

  return { items, loading, short };
};
