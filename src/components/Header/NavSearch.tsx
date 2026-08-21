'use client';

import { usePathname } from 'next/navigation';
import { FC, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';

import { SearchIcon } from '@/components/Icons';
import { SearchBox, type Scope } from '@/components/Search/SearchBox';

export const NavSearch: FC = () => {
  const pathname = usePathname() || '/';

  const routeScope: Scope =
    pathname === '/user' || pathname.startsWith('/user/') || pathname.startsWith('/u/')
      ? 'user'
      : 'channel';

  const [scope, setScope] = useState<Scope>(routeScope);
  const [open, setOpen] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => setScope(routeScope), [routeScope]);

  useEffect(() => {
    if (open) input.current?.focus();
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label="Search"
        onClick={() => setOpen(true)}
        className={clsx('btn btn-ghost w-10 px-0 shrink-0 ml-auto lg:hidden', open && 'invisible')}
      >
        <SearchIcon size={20} />
      </button>

      <SearchBox
        scope={scope}
        onScope={setScope}
        inputRef={input}
        scopeClassName={open ? 'w-full [&>button]:flex-1' : undefined}
        className={
          open
            ? 'absolute inset-x-0 top-0 z-30 h-auto flex-col items-stretch gap-2 rounded-none border-x-0 border-t-0 p-3'
            : 'hidden lg:flex lg:flex-1 lg:max-w-[560px]'
        }
      >
        {open ? (
          <button
            type="button"
            aria-label="Close search"
            onClick={() => setOpen(false)}
            className="text-meta text-primary-400 shrink-0 px-2"
          >
            Cancel
          </button>
        ) : null}
      </SearchBox>
    </>
  );
};
