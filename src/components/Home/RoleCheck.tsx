'use client';

import { useT } from '@/i18n';
import { FC, useState } from 'react';
import { LocaleLink } from '@/components/UI/LocaleLink';

import { checkMembership } from '@/actions/membership';
import { useAction } from '@/hooks/useAction';
import type { Membership } from '@/utils/api/moddex/public';

const ROLES = [
  { key: 'mod', label: 'Mod', tone: 'text-mod', corner: 'corner-tl' },
  { key: 'vip', label: 'VIP', tone: 'text-vip', corner: 'corner-br' },
  { key: 'founder', label: 'Founder', tone: 'text-founder', corner: 'corner-bl' }
] as const;

type Asked = { account: string; channel: string };

const Verdict: FC<{ asked: Asked; held: Membership }> = ({ asked, held }) => {
  const t = useT();
  const has = ROLES.filter(({ key }) => held[key]);

  return (
    <div className="pt-6">
      <p className="text-read text-primary-300 pb-4">
        <LocaleLink href={`/user/${asked.account}`} className="text-primary-100 font-bold">
          {asked.account}
        </LocaleLink>{' '}
        {has.length ? t('roleCheck.holds') : t('roleCheck.holdsNothing')}{' '}
        <LocaleLink href={`/channel/${asked.channel}`} className="text-primary-100 font-bold">
          {asked.channel}
        </LocaleLink>
      </p>

      <div className="flex flex-wrap gap-3">
        {ROLES.map(({ key, label, tone, corner }) => {
          const on = held[key];

          return (
            <span
              key={key}
              className={`role-card${on ? ' is-held' : ''}`}
              aria-label={`${label}: ${on ? t('roleCheck.held') : t('roleCheck.notHeld')}`}
            >
              {on ? <span className={`corner ${corner} ${tone}`} aria-hidden="true" /> : null}

              <span className={on ? `text-ui font-bold ${tone}` : 'text-ui text-primary-400'}>
                {label}
              </span>

              <span className="text-micro text-primary-400">
                {on
                  ? on.grantedAt
                    ? t.date(on.grantedAt)
                    : t('roleCheck.noDate')
                  : t('roleCheck.notHeld')}
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
        <span className="text-lead text-primary-400">{t('roleCheck.asksWhether')}</span>

        <label className="search w-full sm:w-52">
          <input
            value={account}
            onChange={(event) => setAccount(event.target.value)}
            placeholder={t('misc.account').toLowerCase()}
            aria-label={t('roleCheck.accountLogin')}
            autoComplete="off"
            spellCheck={false}
          />
        </label>

        <span className="text-lead text-primary-400">{t('roleCheck.anythingIn')}</span>

        <label className="search w-full sm:w-52">
          <input
            value={channel}
            onChange={(event) => setChannel(event.target.value)}
            placeholder={t('dash.channel').toLowerCase()}
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
          {check.pending ? t('roleCheck.checking') : t('roleCheck.check')}
        </button>
      </form>

      {check.error ? (
        <p className="text-read text-primary-300 pt-5" role="status">
          {check.code === 'opted out' ? t('roleCheck.optedOut') : check.error}
        </p>
      ) : null}

      {held && asked ? <Verdict asked={asked} held={held} /> : null}
    </div>
  );
};
