'use client';

import { FC, useState } from 'react';
import { useT } from '@/i18n/context';
import Link from 'next/link';

import { checkMembership } from '@/actions/membership';
import { useAction } from '@/hooks/useAction';
import { formatDayMonthYear } from '@/utils/format';
import type { Membership } from '@/utils/api/moddex/public';

const ROLES = [
  { key: 'mod', label: 'Mod', tone: 'text-mod', corner: 'corner-tl' },
  { key: 'vip', label: 'VIP', tone: 'text-vip', corner: 'corner-br' },
  { key: 'founder', label: 'Founder', tone: 'text-founder', corner: 'corner-bl' }
] as const;

type Asked = { account: string; channel: string };

const Verdict: FC<{ asked: Asked; held: Membership }> = ({ asked, held }) => {
  const has = ROLES.filter(({ key }) => held[key]);

  return (
    <div className="pt-6">
      <p className="text-read text-primary-300 pb-4">
        <Link href={`/user/${asked.account}`} className="text-primary-100 font-bold">
          {asked.account}
        </Link>{' '}
        {has.length ? 'holds' : 'holds nothing'} in{' '}
        <Link href={`/channel/${asked.channel}`} className="text-primary-100 font-bold">
          {asked.channel}
        </Link>
      </p>

      <div className="flex flex-wrap gap-3">
        {ROLES.map(({ key, label, tone, corner }) => {
          const on = held[key];

          return (
            <span
              key={key}
              className={`role-card${on ? ' is-held' : ''}`}
              aria-label={`${label}: ${on ? 'held' : 'not held'}`}
            >
              {on ? <span className={`corner ${corner} ${tone}`} aria-hidden="true" /> : null}

              <span className={on ? `text-ui font-bold ${tone}` : 'text-ui text-primary-400'}>
                {label}
              </span>

              <span className="text-micro text-primary-400">
                {on ? (on.grantedAt ? formatDayMonthYear(on.grantedAt) : 'no date') : 'not held'}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
};

export const RoleCheck: FC = () => {
  const t = useT();
  const [account, setAccount] = useState('');
  const [channel, setChannel] = useState('');
  const [asked, setAsked] = useState<Asked | null>(null);
  const [held, setHeld] = useState<Membership | null>(null);

  const check = useAction(checkMembership, { onSuccess: (data) => setHeld(data) });

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!account.trim() || !channel.trim()) return;

    setHeld(null);
    setAsked({ account: account.trim().toLowerCase(), channel: channel.trim().toLowerCase() });
    void check.run(account, channel);
  };

  return (
    <div className="panel">
      <h2 className="text-h2 pb-5">{t('roleCheck.title')}</h2>

      <form onSubmit={submit} className="flex flex-wrap items-center gap-3">
        <span className="text-lead text-primary-400">Is</span>

        <label className="search w-full sm:w-52">
          <input
            value={account}
            onChange={(event) => setAccount(event.target.value)}
            placeholder="account"
            aria-label={t('roleCheck.accountLogin')}
            autoComplete="off"
            spellCheck={false}
          />
        </label>

        <span className="text-lead text-primary-400">anything in</span>

        <label className="search w-full sm:w-52">
          <input
            value={channel}
            onChange={(event) => setChannel(event.target.value)}
            placeholder="channel"
            aria-label={t('roleCheck.channelLogin')}
            autoComplete="off"
            spellCheck={false}
          />
        </label>

        <button
          type="submit"
          className="btn"
          disabled={check.pending || !account.trim() || !channel.trim()}
        >
          {check.pending ? 'Checking…' : 'Check'}
        </button>
      </form>

      {check.error ? (
        <p className="text-read text-primary-300 pt-5" role="status">
          {check.code === 'opted out' ? 'That account has opted out of being listed.' : check.error}
        </p>
      ) : null}

      {held && asked ? <Verdict asked={asked} held={held} /> : null}
    </div>
  );
};
