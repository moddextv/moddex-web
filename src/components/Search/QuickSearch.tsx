'use client';

import { useT } from '@/i18n/context';
import { FC, MouseEvent, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { SearchBox, type Scope } from '@/components/Search/SearchBox';
import { SearchIcon } from '@/components/Icons';

const typing = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

export const QuickSearch: FC = () => {
  const t = useT();
  const pathname = usePathname();
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [scope, setScope] = useState<Scope>('channel');

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const combo = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k';
      const slash = event.key === '/' && !event.ctrlKey && !event.metaKey && !typing(event.target);

      if (!combo && !slash) return;

      event.preventDefault();
      setOpen(true);
    };

    window.addEventListener('keydown', onKey);

    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const node = dialog.current;
    if (!node) return;

    if (open && !node.open) {
      node.showModal();
      input.current?.focus();
    }

    if (!open && node.open) node.close();
  }, [open]);

  // landing on the profile is what ends a search, however it got there
  useEffect(() => setOpen(false), [pathname]);

  // a click on the backdrop reports the dialog itself as its target
  const onBackdrop = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === dialog.current) setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        className="btn btn-ghost w-10 px-0 shrink-0 hidden sm:inline-flex"
        aria-label={t('nav.search')}
        title={t('nav.searchShortcut')}
        onClick={() => setOpen(true)}
      >
        <SearchIcon size={18} />
      </button>

      <dialog
        ref={dialog}
        className="dialog quick-search"
        aria-label={t('nav.search')}
        onClose={() => setOpen(false)}
        onClick={onBackdrop}
      >
        {open && (
          <div className="p-4">
            <div className="flex gap-1.5 mb-3" role="group" aria-label={t('nav.searchFor')}>
              {(['channel', 'user'] as const).map((one) => (
                <button
                  key={one}
                  type="button"
                  aria-pressed={scope === one}
                  className={clsx('option', scope === one && 'is-active')}
                  onClick={() => {
                    setScope(one);
                    input.current?.focus();
                  }}
                >
                  <span className="text-ui font-bold">
                    {t(one === 'channel' ? 'pages.channels' : 'pages.accounts')}
                  </span>
                </button>
              ))}
              <span className="ml-auto self-center text-meta text-primary-400 hidden sm:inline">
                {t('nav.searchShortcut')}
              </span>
            </div>

            <SearchBox scope={scope} inputRef={input} label={t('nav.search')} />
          </div>
        )}
      </dialog>
    </>
  );
};
