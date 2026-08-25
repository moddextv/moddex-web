'use client';

import { Translator, useT } from '@/i18n';
import { FC, useState } from 'react';
import { LocaleLink } from '@/components/UI/LocaleLink';

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

// admin and bot are not the generic endpoint's to write
const write = async (badge: string, userId: string, on: boolean) => {
  const kind = kindOf(badge);

  if (kind === 'admins') return on ? makeAdmin(userId) : removeAdmin(userId);
  if (kind === 'bots') return on ? flagAccountAsBot(userId) : unflagAccountAsBot(userId);

  return on ? grantUserBadge(userId, badge) : revokeUserBadge(userId, badge);
};

const Face: FC<{ badge: Badge; on: boolean; note: string | null; t: Translator }> = ({
  badge,
  on,
  note,
  t
}) => (
  <>
    <Image
      src={badge.svg}
      alt={t('dash.badge.alt', { name: badge.name })}
      width={20}
      height={20}
      radius="sm"
    />

    <span className="min-w-0 flex-1">
      <span className={on ? 'text-ui font-bold block truncate' : 'text-ui block truncate'}>
        {badge.name}
      </span>
      {note ? <span className="text-micro text-primary-400 block truncate">{note}</span> : null}
    </span>
  </>
);

// twitch owns these: state, not a switch nobody can move
const Owned: FC<{ badge: Badge; on: boolean; t: Translator }> = ({ badge, on, t }) => (
  <div className="badge-row is-owned">
    <Face badge={badge} on={on} note="twitch" t={t} />
    <span className={on ? 'text-ui text-primary-200' : 'text-ui text-primary-400'}>
      {on ? t('roleCheck.held') : '·'}
    </span>
  </div>
);

const Switch: FC<{
  badge: Badge;
  on: boolean;
  locked: boolean;
  note: string | null;
  busy: boolean;
  t: Translator;
  onChange: (on: boolean) => void;
}> = ({ badge, on, locked, note, busy, t, onChange }) => (
  <label className={`badge-row${locked ? ' is-owned' : ''}`}>
    <Face badge={badge} on={on} note={locked ? t('dash.badge.owner') : note} t={t} />

    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={badge.name}
      data-on={on}
      disabled={locked || busy}
      onClick={() => onChange(!on)}
      className="toggle cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span />
    </button>
  </label>
);

export const MemberBadges: FC<{ catalogue: Badge[]; ownerId?: string }> = ({
  catalogue,
  ownerId
}) => {
  const t = useT();
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
        <h2 className="text-h2">{t('dash.badgesPerAccount')}</h2>
      </div>

      <form onSubmit={search} className="flex items-center gap-3 flex-wrap px-4 pb-4">
        <label className="search w-full sm:w-72">
          <SearchIcon size={16} color="text-primary-400" />
          <input
            value={login}
            onChange={(event) => setLogin(event.target.value)}
            placeholder={t('dash.twitchLogin')}
            aria-label={t('dash.twitchLogin')}
            autoComplete="off"
          />
        </label>

        <button type="submit" className="btn btn-soft" disabled={lookup.pending || !login.trim()}>
          {t('common.search')}
        </button>
      </form>

      {looked && !member ? (
        <p className="text-read text-primary-300 px-4 pb-5">
          {t('dash.noAccountCalled', { login })}
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

            <LocaleLink href={`/user/${member.login}`} className="text-base font-bold">
              {member.name || member.login}
            </LocaleLink>

            <Badges badges={member.badges ?? []} size={18} className="shrink-0" />
          </div>

          <div className="grid gap-2 px-4 pb-5 sm:grid-cols-2">
            {catalogue.map((badge) => {
              const kind = kindOf(badge.name);
              const on = wears(member.badges, badge.name);

              if (kind === 'twitch') return <Owned key={badge.id} badge={badge} on={on} t={t} />;

              return (
                <Switch
                  key={badge.id}
                  badge={badge}
                  on={on}
                  locked={kind === 'admins' && !!ownerId && member.id === ownerId}
                  note={SOURCES[badge.name] ?? null}
                  busy={busy === badge.name}
                  t={t}
                  onChange={(next: boolean) => void toggle(badge.name, next)}
                />
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
};
