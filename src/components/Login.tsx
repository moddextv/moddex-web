import { signIn } from '@/auth';
import { Container } from '@/components/UI/Container';
import { TwitchIcon } from '@/components/Icons';
import { config } from '@/config';
import { OptOutEffect, OptOutReversible } from '@/components/OptOutPromise';
import Link from 'next/link';
import { FC, ReactNode } from 'react';

interface LoginProps {
  heading?: string;
  blurb?: string;
  redirectTo?: string;
}

const Can: FC<{ title: string; children: ReactNode }> = ({ title, children }) => (
  <li className="flex gap-4">
    <span className="corner corner-tl text-mod mt-1.5" aria-hidden="true" />
    <span>
      <span className="block text-base font-bold mb-1">{title}</span>
      <span className="block text-ui text-primary-300 leading-relaxed">{children}</span>
    </span>
  </li>
);

const Scope: FC<{ label: string; granted: boolean }> = ({ label, granted }) => (
  <div className="row" style={{ gridTemplateColumns: 'minmax(0, 1fr) auto', minHeight: '44px' }}>
    <span className={granted ? 'text-base' : 'text-base text-primary-400'}>{label}</span>
    <span className={granted ? 'text-ui text-mod font-bold' : 'text-ui text-primary-400'}>
      {granted ? 'Yes' : 'Never'}
    </span>
  </div>
);

export const Login: FC<LoginProps> = ({
  heading = 'This page needs a Twitch sign-in',
  blurb = `${config.brand.name} has to know which Twitch account is yours before it can let you change anything about it. Everything else on the site works signed out.`,
  redirectTo
}) => (
  <main id="main" className="flex-grow">
    <Container>
      <section className="enter pt-16 pb-8 max-w-2xl">
        <h1 className="text-h1 mb-4 max-w-[20ch]">{heading}</h1>
        <p className="text-lead text-primary-300 max-w-prose mb-8">{blurb}</p>

        <form
          action={async () => {
            'use server';
            await signIn('twitch', redirectTo ? { redirectTo } : undefined);
          }}
        >
          <button type="submit" className="btn btn-twitch">
            <TwitchIcon size={16} color="text-white" />
            Continue with Twitch
          </button>
        </form>

        <p className="text-ui text-primary-400 mt-4">
          You land back on the page you were trying to reach.
        </p>
      </section>

      <section className="enter grid gap-6 md:grid-cols-2 pb-4">
        <div className="panel">
          <h2 className="text-h2 mb-5">What a signed-in account can do</h2>
          <ul className="flex flex-col gap-5">
            <Can title="Opt out of the index">
              <OptOutEffect /> <OptOutReversible />
            </Can>
            <Can title="Pick a chat badge">
              If you hold more than one, choose which shows next to your name.
            </Can>
            <Can title="Attach a donation">
              So the donator badge lands automatically instead of by email.
            </Can>
          </ul>
        </div>

        <div className="panel-flush">
          <h2 className="text-h2 px-4 pb-5">What Twitch hands over</h2>
          <div className="rows">
            <Scope label="User id" granted />
            <Scope label="Login name" granted />
            <Scope label="Avatar" granted />
            <Scope label="Password" granted={false} />
            <Scope label="Chat access" granted={false} />
            <Scope label="Acting on your behalf" granted={false} />
          </div>
          <p className="text-ui text-primary-400 px-4 py-4">
            Full terms in{' '}
            <Link href="/tos#accounts" className="text-primary-200 font-semibold hover:underline">
              section 4
            </Link>
            .
          </p>
        </div>
      </section>
    </Container>
  </main>
);
