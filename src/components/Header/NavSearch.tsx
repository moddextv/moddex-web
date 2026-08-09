'use client';

import { usePathname, useRouter } from 'next/navigation';
import { FC, FormEvent, useEffect, useState } from 'react';
import clsx from 'clsx';

type Scope = 'channel' | 'user';

/**
 * the nav search — the single structural change the whole direction rests on.
 *
 * it sits in the header on every page, which is why no page needs a hero to
 * hold a search box and why `/` and `/channel` stopped being search pages at
 * all. it carries a scope switch marked with two corners of the mark, so which
 * direction you are looking up is stated in the brand's own notation rather
 * than in a word.
 */
export const NavSearch: FC = () => {
  const router = useRouter();
  const pathname = usePathname() || '/';

  // the route is the authority on which way round the switch starts: landing on
  // /user/nymn from a link and finding the switch set to Channel would be a lie
  // about what you are looking at.
  const routeScope: Scope =
    pathname === '/user' || pathname.startsWith('/user/') || pathname.startsWith('/u/')
      ? 'user'
      : 'channel';

  const [scope, setScope] = useState<Scope>(routeScope);
  const [value, setValue] = useState('');

  useEffect(() => setScope(routeScope), [routeScope]);

  // deliberately no validation here beyond "not empty". the old search hit the
  // api to check a login existed before navigating, which cost a round trip to
  // show an error the destination already renders — /channel/[username] answers
  // both "not a valid twitch username" and "user not found" in full, with room
  // for the message. a 40px bar in the nav has no room for either.
  const submit = (event: FormEvent) => {
    event.preventDefault();

    const login = value.trim();
    if (!login) return;

    setValue('');
    router.push(`/${scope}/${encodeURIComponent(login)}`);
  };

  return (
    <form className="search flex-1 max-w-[560px]" onSubmit={submit} role="search">
      {/* primary-400, not the 500 the comp draws: #55555F on the raised surface
          is 2.6:1 and this is a real label, not decoration. the same swap is
          already baked into `.row-head`. */}
      <span className="text-meta text-primary-400 shrink-0 hidden sm:inline">
        twitch.tv/
      </span>

      <input
        type="text"
        name="username"
        className="text-base"
        placeholder={scope === 'user' ? 'nymn' : 'forsen'}
        aria-label={`Look up a twitch ${scope === 'user' ? 'account' : 'channel'}`}
        maxLength={25}
        autoComplete="off"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />

      {/* below `sm` the two words are dropped and the corners carry the switch
          on their own. they are the same notation the direction tabs use, the
          pressed option keeps its own colour and a filled background, and the
          placeholder swaps between `forsen` and `nymn` — so which way round it
          is set stays legible. keeping the words cost 100px of a 360px header
          and left the input too narrow to type a login into.

          the label stays in `aria-label` either way, so the accessible name
          never depends on the viewport. */}
      <span className="scope" role="group" aria-label="What to look up">
        {(
          [
            { key: 'channel', label: 'Channel', corner: 'corner-tl', tone: 'text-mod' },
            { key: 'user', label: 'Person', corner: 'corner-br', tone: 'text-vip' }
          ] as const
        ).map((option) => (
          <button
            key={option.key}
            type="button"
            aria-label={option.label}
            title={option.label}
            aria-pressed={scope === option.key}
            onClick={() => setScope(option.key)}
          >
            <span
              aria-hidden="true"
              className={clsx(
                'corner',
                option.corner,
                scope === option.key ? option.tone : 'text-primary-600'
              )}
            />
            <span className="hidden sm:inline">{option.label}</span>
          </button>
        ))}
      </span>
    </form>
  );
};
