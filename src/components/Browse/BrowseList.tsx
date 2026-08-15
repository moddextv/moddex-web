'use client';

import { fetchAccounts, fetchChannels } from '@/actions/browse';
import { BrowseRows } from '@/components/Browse/BrowseRows';
import { AccountSort, BrowseEntry, BrowsePage, ChannelSort } from '@/misc/browse';
import { formatNumber } from '@/utils/format';
import { FC, useRef, useState, useTransition } from 'react';
import { beginPage, beginQuery, createPageLoad, wanted } from '@/hooks/pageLoad';

const PAGE = 25;

const CHANNEL_SORTS: { key: ChannelSort; label: string }[] = [
  { key: 'read', label: 'Recently read' },
  { key: 'roles', label: 'Most roles' },
  { key: 'followers', label: 'Most followers' }
];

const ACCOUNT_SORTS: { key: AccountSort; label: string }[] = [
  { key: 'roles', label: 'Most roles' },
  { key: 'followers', label: 'Most followers' }
];

interface BrowseListProps {
  kind: 'channel' | 'account';
  title: string;
  total: number;
  totalLabel: string;
  initial: BrowsePage;
}

export const BrowseList: FC<BrowseListProps> = ({ kind, title, total, totalLabel, initial }) => {
  const [sort, setSort] = useState<string>(kind === 'channel' ? 'read' : 'roles');
  const [includeBots, setIncludeBots] = useState(true);
  const [items, setItems] = useState<BrowseEntry[]>(initial.items);
  const [hasMore, setHasMore] = useState(initial.hasMore);
  const [failed, setFailed] = useState(false);
  const [pending, startTransition] = useTransition();

  const seeking = useRef<number | null>(null);
  const pageLoad = useRef(createPageLoad());

  const load = (nextSort: string, nextBots: boolean, offset: number, append: boolean) => {
    if (append) {
      if (seeking.current !== null) return;
      seeking.current = offset;
    }

    const attempt = append ? beginPage(pageLoad.current) : beginQuery(pageLoad.current);

    startTransition(async () => {
      try {
        const page =
          kind === 'channel'
            ? await fetchChannels(nextSort as ChannelSort, PAGE, offset)
            : await fetchAccounts(nextSort as AccountSort, PAGE, offset, nextBots);

        if (!wanted(pageLoad.current, attempt)) return;

        setFailed(false);
        setItems((current) => (append ? [...current, ...page.items] : page.items));
        setHasMore(page.hasMore);
      } catch {
        if (wanted(pageLoad.current, attempt)) setFailed(true);
      } finally {
        if (append) seeking.current = null;
      }
    });
  };

  const changeSort = (next: string) => {
    if (next === sort) return;

    setSort(next);
    load(next, includeBots, 0, false);
  };

  const toggleBots = () => {
    const next = !includeBots;

    setIncludeBots(next);
    load(sort, next, 0, false);
  };

  const sorts = kind === 'channel' ? CHANNEL_SORTS : ACCOUNT_SORTS;

  return (
    <div className="panel-flush">
      <div className="flex items-center gap-3 flex-wrap px-4 pb-5">
        <h2 className="text-h2">{title}</h2>
        <span className="text-lead text-primary-400 tabular">
          {formatNumber(total)} <span className="text-ui">{totalLabel}</span>
        </span>

        <span className="ml-auto flex items-center gap-2 flex-wrap">
          {sorts.map((option) => (
            <button
              key={option.key}
              type="button"
              className="chip"
              aria-pressed={sort === option.key}
              onClick={() => changeSort(option.key)}
            >
              {option.label}
            </button>
          ))}

          {kind === 'account' && (
            <button type="button" className="chip" aria-pressed={includeBots} onClick={toggleBots}>
              Include bots
            </button>
          )}
        </span>
      </div>

      {failed ? (
        <div className="px-4 pb-6">
          <p className="text-read text-primary-300 max-w-prose mb-2">
            We couldn&apos;t read this ranking. The rest of the page is unaffected.
          </p>
          <button
            type="button"
            className="btn btn-soft"
            disabled={pending}
            onClick={() => load(sort, includeBots, 0, false)}
          >
            {pending ? 'Reading the index…' : 'Try again'}
          </button>
        </div>
      ) : items.length === 0 ? (
        <p className="px-4 pb-6 text-read text-primary-300 max-w-prose">
          {pending
            ? 'Reading the index.'
            : 'Nothing to show for this ordering yet. The roles ranking gets rebuilt once a day, so it stays empty until the first rebuild has run.'}
        </p>
      ) : (
        <>
          <BrowseRows kind={kind} items={items} />

          {hasMore && (
            <button
              type="button"
              disabled={pending}
              onClick={() => load(sort, includeBots, items.length, true)}
              className="w-full h-12 mt-2 rounded-md text-base font-bold text-primary-300 hover:text-primary-100 hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {pending ? 'Loading' : 'Load more'}
            </button>
          )}
        </>
      )}
    </div>
  );
};
