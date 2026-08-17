'use client';

import { Facts, Good, ReloadButton, StatePage, Status } from '@/components/PageState';
import { config } from '@/config';
import Link from 'next/link';
import { FC, ReactNode } from 'react';

export const NotFoundUser: FC<{ username: string }> = ({ username }) => (
  <StatePage>
    <h1 className="text-h1 mb-4">
      There&apos;s no Twitch account called{' '}
      <span className="text-primary-400 break-all">{username}</span>
    </h1>
    <p className="text-lead text-primary-300 max-w-prose mb-8">
      We asked Twitch and it has no account by that name, so there was nothing to index. People
      rename themselves a lot. Check the spelling and try again in the bar above.
    </p>

    <div className="flex flex-wrap gap-3">
      <Link href="/channel" className="btn">
        Channels
      </Link>
      <Link href="/" className="btn btn-soft">
        Home
      </Link>
    </div>

    <p className="text-ui text-primary-400 mt-8">
      <Status code={404}>The index was left untouched.</Status>
    </p>
  </StatePage>
);

export const InvalidUsername: FC<{ username: string }> = ({ username }) => (
  <StatePage>
    <h1 className="text-h1 mb-4">
      <span className="text-primary-400 break-all">{username}</span> can&apos;t be a Twitch name
    </h1>
    <p className="text-lead text-primary-300 max-w-prose mb-8">
      Twitch names run 1 to 25 characters and allow only letters, numbers and underscores. That one
      can&apos;t exist, so we never asked Twitch about it.
    </p>

    <div className="flex flex-wrap gap-3">
      <Link href="/channel" className="btn">
        Channels
      </Link>
      <Link href="/" className="btn btn-soft">
        Home
      </Link>
    </div>

    <p className="text-ui text-primary-400 mt-8">
      <Status code={404} />
    </p>
  </StatePage>
);

export const UnknownPage: FC = () => (
  <StatePage>
    <h1 className="text-h1 mb-4">This page doesn&apos;t exist</h1>
    <p className="text-lead text-primary-300 max-w-prose mb-8">
      That address doesn&apos;t lead anywhere on this site, so nothing was looked up. Everywhere
      worth going from here is below.
    </p>

    <div className="flex flex-wrap gap-3">
      <Link href="/" className="btn">
        Home
      </Link>
      <Link href="/channel" className="btn btn-soft">
        Channels
      </Link>
      <Link href="/user" className="btn btn-soft">
        Accounts
      </Link>
      <Link href="/donate" className="btn btn-soft">
        Donate
      </Link>
      <Link href="/docs" className="btn btn-soft">
        API docs
      </Link>
    </div>

    <p className="text-ui text-primary-400 mt-8">
      <Status code={404} />
    </p>
  </StatePage>
);

export const BannedUser: FC<{ username: string; reason?: string }> = ({ username, reason }) => {
  const kind = reason?.toLowerCase();
  const banned = kind === 'tos_banned';
  const deactivated = kind === 'deactivated';

  return (
    <StatePage>
      <div className="flex items-start gap-5 mb-6">
        <span className="avatar w-16 h-16 text-xl" aria-hidden="true">
          {username.slice(0, 1)}
        </span>
        <div className="min-w-0">
          <h1 className="text-h1 mb-3 break-all">
            {banned && `${username} is banned on Twitch`}
            {deactivated && `${username} deleted their account`}
            {!banned && !deactivated && `${username} is unavailable`}
          </h1>
          <p className="text-lead text-primary-300 max-w-prose">
            Twitch isn&apos;t serving this account, so {config.brand.name} won&apos;t serve a
            profile for it either. Any roles it held stay in the index, just hidden for as long as
            this lasts.
          </p>
        </div>
      </div>

      <Facts
        rows={[
          {
            label: 'Reason from Twitch',
            value: (
              <span className="text-base font-bold text-primary-100">{reason ?? 'not given'}</span>
            )
          },
          { label: 'Roles retained', value: <Good>Still indexed</Good> },
          { label: 'Roles shown', value: 'None while this lasts' }
        ]}
      />

      <div className="flex flex-wrap gap-3">
        {banned && <ReloadButton>Check again</ReloadButton>}
        <Link href="/channel" className={banned ? 'btn btn-soft' : 'btn'}>
          Look up someone else
        </Link>
      </div>

      {banned && (
        <p className="text-ui text-primary-400 mt-6 max-w-prose">
          Bans get reversed sometimes, which is why this is the only state on the site that offers
          to read again.
        </p>
      )}
      {deactivated && (
        <p className="text-ui text-primary-400 mt-6 max-w-prose">This one usually sticks.</p>
      )}
      {!banned && !deactivated && (
        <p className="text-ui text-primary-400 mt-6 max-w-prose">
          We show you whatever Twitch said, even when we don&apos;t recognize it.
        </p>
      )}
    </StatePage>
  );
};

export const CheckoutUnreadable: FC = () => (
  <StatePage>
    <h1 className="text-h1 mb-4">Your payment is fine. This page isn&apos;t.</h1>
    <p className="text-lead text-primary-300 max-w-prose mb-8">
      {config.brand.name} couldn&apos;t read the checkout session back from Stripe, so it can&apos;t
      show you a summary. None of that touches the donation itself.
    </p>

    <Facts
      rows={[
        { label: 'Payment', value: <Good>Taken by Stripe</Good> },
        { label: 'Receipt', value: <Good>Stripe will email it</Good> },
        { label: 'Donator badge', value: <Good>Granted by the webhook</Good> },
        {
          label: 'This page',
          value: (
            <span className="text-ui text-founder font-semibold">
              Couldn&apos;t read the session
            </span>
          )
        }
      ]}
    />

    <div className="flex flex-wrap gap-3">
      <Link href="/settings" className="btn">
        Check your profile
      </Link>
      <a
        href={config.brand.discordUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-soft"
      >
        Ask on Discord
      </a>
    </div>

    <p className="text-ui text-primary-400 mt-6 max-w-prose">
      If the badge is still missing an hour from now, send us the Stripe receipt and we&apos;ll
      assign it by hand. <Status code={400} />
    </p>
  </StatePage>
);
