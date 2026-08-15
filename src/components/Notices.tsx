'use client';

import { Facts, Good, StatePage, Status } from '@/components/PageState';
import { OptOutEffect } from '@/components/OptOutPromise';
import Link from 'next/link';
import { FC } from 'react';

export const OptedOut: FC<{ username: string }> = ({ username }) => (
  <StatePage>
    <div className="flex items-center gap-3 mb-4">
      <span className="corner corner-tl text-mod" aria-hidden="true" />
      <p className="text-ui text-primary-400">Withheld at the account&apos;s request</p>
    </div>

    <h1 className="text-h1 mb-4">This account asked not to be listed</h1>
    <p className="text-lead text-primary-300 max-w-prose mb-8">
      <span className="text-primary-100 font-bold break-all">{username}</span> switched the opt-out
      on. <OptOutEffect /> Nothing went wrong, and there&apos;s nothing to retry.
    </p>

    <Facts
      rows={[
        { label: 'Profile served', value: 'No' },
        { label: 'Appears in role lists', value: 'No' },
        { label: 'Returned by the api', value: 'No' },
        {
          label: 'Channels they moderate',
          value: <Good>Still indexed</Good>
        }
      ]}
    />

    <div className="flex flex-wrap gap-3">
      <Link href="/channel" className="btn">
        Look up someone else
      </Link>
      <Link href="/settings" className="btn btn-soft">
        Opt out yourself
      </Link>
    </div>

    <p className="text-ui text-primary-400 mt-8">
      <Status code={403} />
    </p>
  </StatePage>
);

export const TeamOnly: FC<{ login?: string }> = ({ login }) => (
  <StatePage>
    <p className="text-meta text-primary-400 mb-2.5">Signed in, but not on the team</p>
    <h1 className="text-h1 mb-4">The dashboard is team only</h1>
    <p className="text-lead text-primary-300 max-w-prose mb-8">
      You&apos;re signed in{login ? ` as ${login}` : ''}, but that account doesn&apos;t have team
      permission. Nothing else on the site needs it.
    </p>

    <div className="flex flex-wrap gap-3">
      <Link href="/" className="btn">
        Home
      </Link>
      <Link href="/settings" className="btn btn-soft">
        Settings
      </Link>
    </div>

    <p className="text-ui text-primary-400 mt-8">
      <Status code={403} />
    </p>
  </StatePage>
);

export const NoCheckout: FC = () => (
  <StatePage>
    <h1 className="text-h1 mb-4">There&apos;s no checkout to show</h1>
    <p className="text-lead text-primary-300 max-w-prose mb-8">
      This address only means something right after a Stripe checkout. You&apos;ve probably come
      from a bookmark.
    </p>

    <div className="flex flex-wrap gap-3">
      <Link href="/donate" className="btn">
        Donate page
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
