'use client';

import { FC, useState } from 'react';
import Link from 'next/link';

import { Badges } from '@/components/User/Badges';
import { Image } from '@/components/UI/Image';
import { SearchIcon } from '@/components/Icons';
import { findAccount, flagAccountAsBot, unflagAccountAsBot } from '@/actions/bots';
import { makeAdmin, removeAdmin } from '@/actions/admins';
import { grantUserBadge, revokeUserBadge } from '@/actions/badges';
import { useAction } from '@/hooks/useAction';
import type { Badge } from '@/misc/badges';
import type { User } from '@/misc/account';
import { SOURCES, kindOf, wears } from './badgeRouting';

// admin and bot are not the generic endpoint's to write: the first carries the
// two lockout rules, the second has no user_badges row at all
const write = async (badge: string, userId: string, on: boolean) => {
  const kind = kindOf(badge);

  if (kind === 'admins') return on ? makeAdmin(userId) : removeAdmin(userId);
  if (kind === 'bots') return on ? flagAccountAsBot(userId) : unflagAccountAsBot(userId);

  return on ? grantUserBadge(userId, badge) : revokeUserBadge(userId, badge);
};

const Toggle: FC<{
  badge: Badge;
  on: boolean;
  disabled: boolean;
  reason: string | null;
  busy: boolean;
  onChange: (on: boolean) => void;
}> = ({ badge, on, disabled, reason, busy, onChange }) => (
  <button
    type="button"
    role="switch"
    aria-checked={on}
    aria-label={badge.name}
    disabled={disabled || busy}
    title={reason ?? undefined}
    onClick={() => onChange(!on)}
    className={`flex items-center gap-3 h-12 px-3 rounded-md border text-left transition-colors ${
      disabled
        ? 'border-primary-800 opacity-60 cursor-not-allowed'
        : on
          ? 'border-primary-300 bg-primary-800'
          : 'border-primary-700 hover:border-primary-600'
    }`}
  >
    <Image src={badge.svg} alt={`${badge.name} badge`} width={18} height={18} radius="sm" />

    <span className="min-w-0 flex-1">
      <span className={on ? 'text-ui font-bold block' : 'text-ui text-primary-300 block'}>
        {badge.name}
      </span>
      {reason ? <span className="text-micro text-primary-400 block">{reason}</span> : null}
    </span>

    <span
      aria-hidden="true"
      className={`w-9 h-5 rounded-full shrink-0 relative transition-colors ${
        on ? 'bg-primary-300' : 'bg-primary-700'
      }`}
    >
      <span
        className={`absolute top-0.5 w-4 h-4 rounded-full bg-primary-900 transition-all ${
          on ? 'left-4.5' : 'left-0.5'
        }`}
      />
    </span>
  </button>
);

export const MemberBadges: FC<{ catalogue: Badge[]; ownerId?: string }> = ({
  catalogue,
  ownerId
}) => {
  const [login, setLogin] = useState('');
  const [member, setMember] = useState<User | null>(null);
  const [looked, setLooked] = useState(false);
  const [busy, setBusy] = useState('');

  const lookup = useAction(findAccount, {
    onSuccess: (account) => {
      setMember(account);
      setLooked(true);
    }
  });

  const search = (event: React.FormEvent) => {
    event.preventDefault();
    if (!login.trim()) return;

    setLooked(false);
    void lookup.run(login.trim());
  };

  const toggle = async (badge: string, on: boolean) => {
    if (!member) return;

    setBusy(badge);

    const result = await write(badge, member.id, on);

    if (result.ok) {
      const next = on
        ? [...(member.badges ?? []), catalogue.find((one) => one.name === badge)!]
        : (member.badges ?? []).filter((one) => one.name !== badge);

      setMember({ ...member, badges: next });
    }

    setBusy('');
  };

  return (
    <div className="panel">
      <div className="px-4 pt-5 pb-4">
        <h2 className="text-h2">Someone&apos;s badges</h2>
        <p className="text-read text-primary-300 max-w-prose pt-1">
          Find the account, then switch a badge on or off. The badge-first view below answers the
          other question — who holds this one.
        </p>
      </div>

      <form onSubmit={search} className="flex gap-2 px-4 pb-4">
        <input
          value={login}
          onChange={(event) => setLogin(event.target.value)}
          placeholder="twitch login"
          aria-label="Twitch login"
          className="input flex-1 min-w-0"
        />
        <button type="submit" className="button" disabled={lookup.pending}>
          <SearchIcon size={16} color="text-primary-400" />
          <span>Find</span>
        </button>
      </form>

      {looked && !member ? (
        <p className="text-read text-primary-300 px-4 pb-5">
          There is no twitch account called {login}.
        </p>
      ) : null}

      {member ? (
        <>
          <div className="flex items-center gap-3 px-4 pb-4">
            {member.avatar ? (
              <Image
                src={member.avatar}
                alt={member.login}
                width={36}
                height={36}
                radius="full"
                className="w-9 h-9 bg-primary-700"
              />
            ) : null}

            <Link href={`/user/${member.login}`} className="text-base font-bold">
              {member.name || member.login}
            </Link>

            <Badges badges={member.badges ?? []} size={18} className="shrink-0" />
          </div>

          <div className="grid gap-2 px-4 pb-5 sm:grid-cols-2">
            {catalogue.map((badge) => {
              const owner = !!ownerId && member.id === ownerId;
              const kind = kindOf(badge.name);
              const owned = kind === 'twitch';
              const isOwner = kind === 'admins' && owner;

              return (
                <Toggle
                  key={badge.id}
                  badge={badge}
                  on={wears(member.badges, badge.name)}
                  disabled={owned || isOwner}
                  busy={busy === badge.name}
                  reason={
                    isOwner
                      ? 'the owner account, which cannot be removed'
                      : owned
                        ? `${SOURCES[badge.name]} decides this one`
                        : (SOURCES[badge.name] ?? null)
                  }
                  onChange={(on) => void toggle(badge.name, on)}
                />
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
};
