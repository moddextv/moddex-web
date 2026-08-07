'use client';

import { Container } from '@/components/UI/Container';
import { ReloadIcon } from '@/components/Icons';
import { config } from '@/config';
import Link from 'next/link';
import { FC, ReactNode } from 'react';

/**
 * every error state on the site.
 *
 * these used to be one component taking a status code and two strings, which
 * meant every failure read the same: a number, a lowercase fragment, and a
 * "check again" button offered whether or not checking again could help. the
 * states below are written per cause instead, because the useful thing to say
 * after a failure is what happened to your data and what to do next, and that
 * differs completely between "twitch has no such account" and "this account
 * asked not to be listed".
 *
 * three rules hold across all of them:
 *   - name the cause in the heading, in words, not as a status code
 *   - say explicitly what was and was not written
 *   - offer a retry only where retrying could change the answer
 */
const ErrorPage: FC<{ children: ReactNode }> = ({ children }) => (
  <main id="main" className="flex-grow">
    <Container>
      <section className="enter pt-16 pb-10 max-w-2xl">{children}</section>
    </Container>
  </main>
);

/**
 * the key/value list these states use to answer "so what happened to my data".
 * it is `.rows` on a two column template rather than a table, same as every
 * other list on the site.
 */
const Facts: FC<{ rows: { label: string; value: ReactNode }[] }> = ({ rows }) => (
  <div className="panel-flush mb-8">
    <div className="rows">
      {rows.map((row) => (
        <div
          key={row.label}
          className="row"
          style={{ gridTemplateColumns: 'minmax(0, 1fr) auto' }}
        >
          <span className="text-base text-primary-300">{row.label}</span>
          <span className="text-ui text-primary-400">{row.value}</span>
        </div>
      ))}
    </div>
  </div>
);

const Good: FC<{ children: ReactNode }> = ({ children }) => (
  <span className="text-ui text-mod font-semibold">{children}</span>
);

const ReloadButton: FC<{ children: ReactNode }> = ({ children }) => (
  <button type="button" className="btn" onClick={() => window.location.reload()}>
    <ReloadIcon size={15} />
    {children}
  </button>
);

/* ------------------------------------------------------------------- 404 -- */

/** twitch was asked and had no such account. */
export const NotFoundUser: FC<{ username: string }> = ({ username }) => (
  <ErrorPage>
    <h1 className="text-h1 mb-4">
      There is no twitch account called{' '}
      <span className="text-primary-400 break-all">{username}</span>
    </h1>
    <p className="text-lead text-primary-300 max-w-prose mb-8">
      Twitch was asked and had no such account, so there is nothing to index.
      Names change often. Check the spelling and try again in the bar above.
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
      HTTP 404. Nothing was written to the index.
    </p>
  </ErrorPage>
);

/**
 * the name could not be a twitch name, so nothing left the server. worth saying
 * out loud: it is the difference between "we looked and it is not there" and
 * "we did not look".
 */
export const InvalidUsername: FC<{ username: string }> = ({ username }) => (
  <ErrorPage>
    <h1 className="text-h1 mb-4">
      <span className="text-primary-400 break-all">{username}</span> cannot be a
      twitch name
    </h1>
    <p className="text-lead text-primary-300 max-w-prose mb-8">
      Twitch names are 1 to 25 characters, letters, numbers and underscores only.
      Nothing was sent to twitch and nothing was written.
    </p>

    <div className="flex flex-wrap gap-3">
      <Link href="/channel" className="btn">
        Channels
      </Link>
      <Link href="/" className="btn btn-soft">
        Home
      </Link>
    </div>

    <p className="text-ui text-primary-400 mt-8">HTTP 404.</p>
  </ErrorPage>
);

/** an address that matches no route at all. */
export const UnknownPage: FC = () => (
  <ErrorPage>
    <h1 className="text-h1 mb-4">This page does not exist</h1>
    <p className="text-lead text-primary-300 max-w-prose mb-8">
      Nothing lives at that address. The places worth going are Channels, People,
      Donate and the api docs.
    </p>

    <div className="flex flex-wrap gap-3">
      <Link href="/channel" className="btn">
        Channels
      </Link>
      <Link href="/user" className="btn btn-soft">
        People
      </Link>
      <Link href="/" className="btn btn-soft">
        Home
      </Link>
    </div>

    <p className="text-ui text-primary-400 mt-8">HTTP 404.</p>
  </ErrorPage>
);

/* ------------------------------------------------------------------- 403 -- */

/**
 * the opt-out. this is the state most worth writing carefully: nothing has gone
 * wrong, the reader has not been refused anything, and there is nothing to
 * retry. it is also the one place the site explains what the opt-out does, so
 * the facts list spells out both what stops and what does not.
 */
export const OptedOut: FC<{ username: string }> = ({ username }) => (
  <ErrorPage>
    <div className="flex items-center gap-3 mb-4">
      <span className="corner corner-tl text-mod" aria-hidden="true" />
      <p className="text-ui text-primary-400">Withheld at the account&apos;s request</p>
    </div>

    <h1 className="text-h1 mb-4">This account asked not to be listed</h1>
    <p className="text-lead text-primary-300 max-w-prose mb-8">
      <span className="text-primary-100 font-bold break-all">{username}</span>{' '}
      switched the opt-out on, so {config.brand.name} stopped serving their
      profile and took them out of every mod and vip list and out of the public
      api. Nothing went wrong and there is nothing to retry.
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

    <p className="text-ui text-primary-400 mt-8">HTTP 403.</p>
  </ErrorPage>
);

/** signed in, but without team permission. an actual permission failure. */
export const TeamOnly: FC<{ login?: string }> = ({ login }) => (
  <ErrorPage>
    <p className="text-meta text-primary-400 mb-2.5">
      Signed in, but not on the team
    </p>
    <h1 className="text-h1 mb-4">The dashboard is team only</h1>
    <p className="text-lead text-primary-300 max-w-prose mb-8">
      You are signed in{login ? ` as ${login}` : ''}, which does not carry team
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

    <p className="text-ui text-primary-400 mt-8">HTTP 403.</p>
  </ErrorPage>
);

/* ---------------------------------------------------------------- banned -- */

/**
 * twitch is not serving the account.
 *
 * the three reasons read differently on purpose. a ban reverses, so it is the
 * only state on the site that offers to read again. an account the owner
 * deleted usually does not come back, so the retry goes away and the wording
 * softens. anything else twitch says is passed through rather than guessed at.
 *
 * "deleted their account" here is a twitch user deleting their own twitch
 * account, which is a different thing from moddex deleting records. moddex does
 * not delete records; see the opt-out copy above.
 */
export const BannedUser: FC<{ username: string; reason?: string }> = ({
  username,
  reason
}) => {
  const kind = reason?.toLowerCase();
  const banned = kind === 'tos_banned';
  const deactivated = kind === 'deactivated';

  return (
    <ErrorPage>
      <div className="flex items-start gap-5 mb-6">
        <span className="avatar w-16 h-16 text-xl" aria-hidden="true">
          {username.slice(0, 1)}
        </span>
        <div className="min-w-0">
          <h1 className="text-h1 mb-3 break-all">
            {banned && `${username} is banned on twitch`}
            {deactivated && `${username} deleted their account`}
            {!banned && !deactivated && `${username} is unavailable`}
          </h1>
          <p className="text-lead text-primary-300 max-w-prose">
            Twitch is not serving this account, so {config.brand.name} will not
            serve a profile for it either. Any roles it held stay in the index
            but are hidden while that is the case.
          </p>
        </div>
      </div>

      <Facts
        rows={[
          {
            label: 'Reason from twitch',
            value: (
              <span className="text-base font-bold text-primary-100">
                {reason ?? 'not given'}
              </span>
            )
          },
          { label: 'Roles retained', value: <Good>Still indexed</Good> },
          { label: 'Roles shown', value: 'None while this lasts' }
        ]}
      />

      <div className="flex flex-wrap gap-3">
        {/* bans reverse, which is why this is the only state on the site that
            offers to read again. a deleted account usually does not come back,
            so offering a retry there would be a false promise. */}
        {banned && <ReloadButton>Check again</ReloadButton>}
        <Link href="/channel" className={banned ? 'btn btn-soft' : 'btn'}>
          Look up someone else
        </Link>
      </div>

      {banned && (
        <p className="text-ui text-primary-400 mt-6 max-w-prose">
          Bans reverse, which is why this is the only state on the site that
          offers to read again.
        </p>
      )}
      {deactivated && (
        <p className="text-ui text-primary-400 mt-6 max-w-prose">
          This one does not usually reverse.
        </p>
      )}
      {!banned && !deactivated && (
        <p className="text-ui text-primary-400 mt-6 max-w-prose">
          Unrecognised reasons are passed through rather than guessed at.
        </p>
      )}
    </ErrorPage>
  );
};

/* ------------------------------------------------------------- 400 / 500 -- */

/**
 * /donate/success could not read the checkout session back from stripe.
 *
 * the entire job of this state is to stop the reader worrying about their
 * money: the payment, the receipt and the badge are all handled elsewhere, and
 * only the summary on this page is missing. hence the facts list.
 */
export const CheckoutUnreadable: FC = () => (
  <ErrorPage>
    <h1 className="text-h1 mb-4">Your payment is fine. This page is not.</h1>
    <p className="text-lead text-primary-300 max-w-prose mb-8">
      {config.brand.name} could not read the checkout session back from Stripe,
      so it cannot show you a summary. That has no effect at all on the donation
      itself.
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
              Cannot read the session
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
        href={`mailto:${config.brand.email}?subject=${encodeURIComponent(`${config.brand.name} donator badge`)}`}
        className="btn btn-soft"
      >
        Email {config.brand.email}
      </a>
    </div>

    <p className="text-ui text-primary-400 mt-6 max-w-prose">
      If the badge is still missing an hour from now, send the Stripe receipt and
      it gets assigned by hand. HTTP 400.
    </p>
  </ErrorPage>
);

/** /donate/success with no session_id, which is nearly always a bookmark. */
export const NoCheckout: FC = () => (
  <ErrorPage>
    <h1 className="text-h1 mb-4">There is no checkout to show</h1>
    <p className="text-lead text-primary-300 max-w-prose mb-8">
      This address only means something directly after a Stripe checkout. You
      have probably arrived from a bookmark.
    </p>

    <div className="flex flex-wrap gap-3">
      <Link href="/donate" className="btn">
        Donate page
      </Link>
      <Link href="/" className="btn btn-soft">
        Home
      </Link>
    </div>

    <p className="text-ui text-primary-400 mt-8">HTTP 404.</p>
  </ErrorPage>
);

/** the api did not answer. moddex.tv is up; api.moddex.tv is the one that is not. */
export const ServiceUnavailable: FC = () => (
  <ErrorPage>
    <h1 className="text-h1 mb-4">The lookup service did not respond</h1>
    <p className="text-lead text-primary-300 max-w-prose mb-8">
      {config.brand.domain} is up but the api did not answer in time. Nothing is
      lost and the index is unaffected.
    </p>

    <div className="flex flex-wrap gap-3">
      <ReloadButton>Check again</ReloadButton>
      <Link href="/" className="btn btn-soft">
        Home
      </Link>
    </div>

    <p className="text-ui text-primary-400 mt-8 max-w-prose">
      If it keeps happening,{' '}
      <a
        href={config.brand.statusUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary-200 font-semibold hover:underline"
      >
        {config.brand.statusUrl.replace('https://', '')}
      </a>{' '}
      shows whether the api is up. It runs on separate infrastructure, so it
      stays available when this does not.
    </p>
  </ErrorPage>
);
