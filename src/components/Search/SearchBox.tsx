'use client';

import { FC, FormEvent, KeyboardEvent, ReactNode, RefObject, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';

import { Avatar } from '@/components/UI/Avatar';
import { SearchIcon } from '@/components/Icons';
import { useSuggest } from '@/hooks/useSuggest';
import { formatNumber } from '@/utils/format';

export type Scope = 'channel' | 'user';

const SCOPES = [
  { key: 'channel', label: 'Channel', corner: 'corner-tl', tone: 'text-mod' },
  { key: 'user', label: 'Account', corner: 'corner-br', tone: 'text-vip' }
] as const;

interface SearchBoxProps {
  scope: Scope;
  onScope?: (scope: Scope) => void;
  size?: 'nav' | 'hero';
  className?: string;
  placeholder?: string;
  label?: string;
  inputRef?: RefObject<HTMLInputElement | null>;
  scopeClassName?: string;
  children?: ReactNode;
}

export const SearchBox: FC<SearchBoxProps> = ({
  scope,
  onScope,
  size = 'nav',
  className,
  placeholder,
  label,
  inputRef,
  scopeClassName,
  children
}) => {
  const router = useRouter();
  const [value, setValue] = useState('');
  const [active, setActive] = useState(-1);
  const [picking, setPicking] = useState(false);

  const { items, loading, short } = useSuggest(value, picking);

  useEffect(() => setActive(-1), [items]);

  const go = (login: string) => {
    const target = login.trim();
    if (!target) return;

    setValue('');
    setPicking(false);
    router.push(`/${scope}/${encodeURIComponent(target)}`);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    go(active >= 0 && items[active] ? items[active].login : value);
  };

  const onKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape') return setPicking(false);
    if (!items.length) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((index) => (index + 1) % items.length);
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((index) => (index <= 0 ? items.length - 1 : index - 1));
    }
  };

  const open = picking && !short && (loading || items.length > 0);
  const hero = size === 'hero';

  return (
    <form
      className={clsx('search', hero && 'search-hero', className)}
      onSubmit={submit}
      onKeyDown={onKey}
      role="search"
    >
      <span className="flex items-center gap-2.5 min-w-0 flex-1">
        {hero && <SearchIcon size={18} color="text-primary-400" />}

        {!hero && (
          <span className="text-meta text-primary-400 shrink-0 hidden lg:inline font-mono">
            twitch.tv/
          </span>
        )}

        <input
          ref={inputRef}
          type="text"
          name="username"
          className={clsx('flex-1 min-w-0 font-mono', hero ? 'text-lead' : 'text-base')}
          placeholder={placeholder ?? (scope === 'user' ? 'nymn' : 'forsen')}
          aria-label={label ?? `Look up a Twitch ${scope === 'user' ? 'account' : 'channel'}`}
          maxLength={25}
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-controls="search-suggestions"
          aria-autocomplete="list"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setPicking(true);
          }}
          onFocus={() => setPicking(true)}
          onBlur={() => setTimeout(() => setPicking(false), 120)}
        />

        {children}
      </span>

      {onScope && (
        <span className={clsx('scope', scopeClassName)} role="group" aria-label="What to look up">
          {SCOPES.map((option) => (
            <button
              key={option.key}
              type="button"
              aria-label={option.label}
              title={option.label}
              aria-pressed={scope === option.key}
              onClick={() => onScope(option.key)}
            >
              <span
                aria-hidden="true"
                className={clsx(
                  'corner',
                  option.corner,
                  scope === option.key ? option.tone : 'text-primary-600'
                )}
              />
              {option.label}
            </button>
          ))}
        </span>
      )}

      {open && (
        <ul
          className="suggest"
          id="search-suggestions"
          role="listbox"
          aria-label="Matching accounts"
        >
          {items.map((item, index) => (
            <li key={item.id} role="option" aria-selected={index === active}>
              <button
                type="button"
                className={clsx('suggest-row', index === active && 'is-active')}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActive(index)}
                onClick={() => go(item.login)}
              >
                <Avatar
                  src={item.avatar}
                  name={item.name || item.login}
                  size={28}
                  className="w-7 h-7"
                />
                <span className="font-mono truncate">{item.login}</span>
                {item.name && item.name.toLowerCase() !== item.login.toLowerCase() && (
                  <span className="text-meta text-primary-400 truncate">{item.name}</span>
                )}
                <span className="ml-auto text-meta text-primary-400 tabular shrink-0">
                  {formatNumber(item.followers || 0)}
                </span>
              </button>
            </li>
          ))}

          {!items.length && loading && (
            <li className="suggest-note" aria-live="polite">
              reading the index
            </li>
          )}
        </ul>
      )}

      {picking && !short && !loading && !items.length && (
        <ul className="suggest" role="presentation">
          <li className="suggest-note">
            Nothing indexed starts with{' '}
            <span className="font-mono text-primary-200">{value.trim()}</span>. Press Enter to read
            it from Twitch and add it.
          </li>
        </ul>
      )}
    </form>
  );
};
