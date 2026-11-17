'use client';

import { useT } from '@/i18n/context';
import { FC, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { ChevronDownIcon } from '@/components/Icons';
import { UserListItem } from '@/components/User/UserListItem';
import { fetchPastRolePage } from '@/actions/roleList';
import { hideChannel } from '@/actions/settings';
import { useAction } from '@/hooks/useAction';
import { Account, RoleUser } from '@/misc/account';
import { RoleType, UserType } from '@/misc/roles';

const PAST_PAGE = 25;

interface Past {
  items: RoleUser[];
  total: number;
  cursor: string | null;
  hasMore: boolean;
}

// read in the browser once the list's end is in view, never in the server html
export const PastRoles: FC<{
  user: Account;
  type: UserType;
  role: RoleType;
  canHide?: boolean;
  className?: string;
}> = ({ user, type, role, canHide, className }) => {
  const t = useT();
  const anchor = useRef<HTMLDivElement>(null);
  const [past, setPast] = useState<Past | null>(null);
  const [open, setOpen] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const hide = useAction(hideChannel);

  useEffect(() => {
    const node = anchor.current;
    if (!node) return;

    let cancelled = false;
    const load = () =>
      fetchPastRolePage(user.id, type, role)
        .then((page) => {
          if (cancelled) return;

          setPast({
            items: page.items,
            total: page.total ?? page.items.length,
            cursor: page.cursor,
            hasMore: page.hasMore
          });
        })
        .catch(() => undefined);

    if (typeof IntersectionObserver === 'undefined') {
      void load();

      return () => {
        cancelled = true;
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;

        observer.disconnect();
        void load();
      },
      { rootMargin: '200px' }
    );

    observer.observe(node);

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [user.id, type, role]);

  const loadMore = () => {
    if (!past?.cursor) return;

    setLoadingMore(true);
    fetchPastRolePage(user.id, type, role, past.cursor)
      .then((page) =>
        setPast((current) =>
          current
            ? {
                ...current,
                items: [...current.items, ...page.items],
                cursor: page.cursor,
                hasMore: page.hasMore
              }
            : current
        )
      )
      .catch(() => undefined)
      .finally(() => setLoadingMore(false));
  };

  const onHide = canHide
    ? (id: string) => {
        void hide.run(id).then((result) => {
          if (!result?.ok) return;

          setPast((current) =>
            current
              ? {
                  ...current,
                  items: current.items.filter((entry) => entry.id !== id),
                  total: Math.max(0, current.total - 1)
                }
              : current
          );
        });
      }
    : undefined;

  const shown = past && past.total > 0 && past.items.length > 0;

  return (
    <div ref={anchor} className={clsx(shown && 'past', className)}>
      {shown && (
        <>
          <button
            type="button"
            className="past-toggle"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? t('past.collapse') : t('past.toggle')}
            <span className="tabular text-primary-400">{t.number(past.total)}</span>
            <span aria-hidden="true" className={clsx('past-chevron', open && 'is-open')}>
              <ChevronDownIcon size={12} />
            </span>
          </button>

          {open && (
            <>
              <p className="px-4 pb-3 text-ui text-primary-400 max-w-prose">{t('past.note')}</p>

              <div className="rows">
                <div className={clsx('row-head cols-people', onHide && 'pr-14')}>
                  <span>
                    {type === 'channel'
                      ? t('controls.columns.account')
                      : t('controls.columns.channel')}
                  </span>
                  <span className="text-right">{t('controls.columns.granted.label')}</span>
                  <span className="text-right" title={t('past.endedHead')}>
                    {t('past.ended')}
                  </span>
                </div>

                {past.items.map((entry) => (
                  <UserListItem key={entry.id} user={entry} type={type} onHide={onHide} past />
                ))}
              </div>

              {past.hasMore && (
                <div className="px-4 py-4">
                  <button
                    type="button"
                    className="btn btn-soft"
                    onClick={loadMore}
                    disabled={loadingMore}
                  >
                    {loadingMore
                      ? t('common.loading')
                      : t('misc.loadMoreCount', { count: PAST_PAGE })}
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};
