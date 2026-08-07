import { Container } from '@/components/UI/Container';
import { config } from '@/config';
import { Metadata } from 'next';
import Link from 'next/link';
import React, { CSSProperties, FC, ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: `The terms for using ${config.brand.domain}, what data it holds about a listed account, and how to opt out.`
};

/**
 * the section ids are load-bearing. they are linked from the sign-in gate and
 * from outside the site, so they are part of the url contract: rename one and
 * somebody's bookmark to "section 4" lands at the top of the page instead.
 */
const SECTIONS = [
  { id: 'acceptance', title: '1. Acceptance', short: '1. Acceptance' },
  { id: 'service', title: '2. What this service does', short: '2. What this does' },
  { id: 'your-data', title: '3. Your data and how to opt out', short: '3. Your data' },
  { id: 'accounts', title: '4. Accounts and donations', short: '4. Accounts' },
  { id: 'use', title: '5. Acceptable use', short: '5. Acceptable use' },
  { id: 'disclaimer', title: '6. Disclaimer and liability', short: '6. Disclaimer' },
  { id: 'changes', title: '7. Changes', short: '7. Changes' },
  { id: 'contact', title: '8. Contact', short: '8. Contact' }
] as const;

const Clause: FC<{ id: string; title: string; children: ReactNode }> = ({
  id,
  title,
  children
}) => (
  // scroll-mt clears the 60px sticky nav. without it an anchor lands with the
  // heading tucked underneath the header, which reads as the wrong section.
  <section id={id} className="scroll-mt-20">
    <h2 className="text-h2 mb-3">{title}</h2>
    <div className="flex flex-col gap-4">{children}</div>
  </section>
);

const Para: FC<{ children: ReactNode }> = ({ children }) => (
  <p className="text-read text-primary-300 max-w-prose">{children}</p>
);

const Inline: FC<{ href: string; children: ReactNode }> = ({ href, children }) => (
  <Link href={href} className="text-primary-100 font-semibold hover:underline">
    {children}
  </Link>
);

/** the fields held about a listed account, as a list rather than inside a sentence */
const HELD = [
  'twitch user id',
  'login name',
  'display name',
  'avatar url',
  'description',
  'follower count',
  'created date',
  'role grant dates'
];

export default async function TosPage() {
  const { name, url, domain, email } = config.brand;

  return (
    <main id="main" className="flex-grow">
      <Container>
        <header className="enter pt-12 pb-8">
          <h1 className="text-h1 mb-3">Terms of Service</h1>
          <p className="text-ui text-primary-400">
            Last updated {new Date().getFullYear()}. {name} is not affiliated
            with, endorsed by, or sponsored by Twitch Interactive, Inc.
          </p>
        </header>

        {/* the thing most readers came for, ahead of the contract */}
        <section
          className="enter pb-10 max-w-3xl"
          style={{ '--i': 1 } as CSSProperties}
        >
          <div className="panel">
            <div className="flex items-center gap-3 mb-3">
              <span className="corner corner-tl text-mod" aria-hidden="true" />
              <h2 className="text-h2">You can opt out at any time</h2>
            </div>
            <p className="text-read text-primary-300 max-w-prose mb-6">
              Sign in with twitch and enable the opt-out. Your profile stops
              being served, and you are removed from every mod and vip list and
              from the public api. It is one switch, and switching it back off
              restores your entry.
            </p>
            <Link href="/settings" className="btn">
              Go to opt-out settings
            </Link>
          </div>
        </section>

        <div
          className="enter flex gap-12 pb-4"
          style={{ '--i': 2 } as CSSProperties}
        >
          <div className="min-w-0 flex-1 max-w-3xl flex flex-col gap-10">
            <Clause id="acceptance" title="1. Acceptance">
              <Para>
                By accessing{' '}
                <a href={url} className="text-primary-100 font-semibold hover:underline">
                  {domain}
                </a>{' '}
                you agree to these terms. If you disagree with any part of them,
                please do not use the site.
              </Para>
            </Clause>

            <Clause id="service" title="2. What this service does">
              <Para>
                {name} records which Twitch accounts hold moderator or VIP status
                in which Twitch channels, and when that status was granted. This
                information is retrieved from Twitch&apos;s own interfaces and is
                visible to anyone who can view the channel in question.
              </Para>
              <Para>
                A channel is only indexed once somebody looks it up. We do not
                read chat messages, private messages, email addresses, or
                anything that is not publicly visible on Twitch.
              </Para>
            </Clause>

            <Clause id="your-data" title="3. Your data and how to opt out">
              <Para>
                If you are listed on {name}, we hold the fields below plus the
                mod and VIP roles described above.
              </Para>

              <div className="panel grid grid-cols-2 sm:grid-cols-4 gap-x-5 gap-y-3">
                {HELD.map((field) => (
                  <span key={field} className="text-ui text-primary-200">
                    {field}
                  </span>
                ))}
              </div>

              <Para>
                <strong className="text-primary-100">
                  You can opt out at any time.
                </strong>{' '}
                Sign in with Twitch and enable the opt-out in{' '}
                <Inline href="/settings">your settings</Inline>. Your profile
                then stops being served and you are removed from every mod and
                VIP list and from the public API. The opt-out is reversible:
                switching it back off restores your entry.
              </Para>
              <Para>
                Accounts that Twitch reports as banned or deactivated are marked
                as such and are not displayed.
              </Para>
            </Clause>

            <Clause id="accounts" title="4. Accounts and donations">
              <Para>
                Signing in uses Twitch OAuth; we never see your Twitch password.
                Donations are processed by Stripe, and card details are handled
                entirely by Stripe. We store only the payment reference, the
                amount, and the name and email Stripe returns to us.
              </Para>
              <Para>
                Donations are voluntary contributions towards running costs, not
                purchases. Cosmetic badges granted alongside a donation carry no
                monetary value and may change or be withdrawn. Donations are
                generally non-refundable; if something went wrong, contact us and
                we will sort it out.
              </Para>
            </Clause>

            <Clause id="use" title="5. Acceptable use">
              <Para>
                Do not use {name} to harass, dox, or target anyone, and do not
                attempt to disrupt the service or scrape it in a way that
                degrades it for others. The public API is provided as-is and rate
                limits may be applied or changed without notice.
              </Para>
            </Clause>

            <Clause id="disclaimer" title="6. Disclaimer and liability">
              <Para>
                {name} is provided &quot;as is&quot;, without warranty of any
                kind. The data is gathered automatically and may be incomplete,
                stale, or wrong. It should not be relied upon for any decision
                that matters.
              </Para>
              <Para>
                To the extent permitted by law, we are not liable for any damages
                arising from the use of, or inability to use, this site. Some
                jurisdictions do not allow such limitations, in which case they
                may not apply to you.
              </Para>
            </Clause>

            <Clause id="changes" title="7. Changes">
              <Para>
                We may revise these terms at any time. Continuing to use the site
                means you accept the current version.
              </Para>
            </Clause>

            <Clause id="contact" title="8. Contact">
              <Para>
                Questions about these terms, your data, or anything else:{' '}
                <a
                  href={`mailto:${email}`}
                  className="text-primary-100 font-semibold hover:underline"
                >
                  {email}
                </a>
                .
              </Para>
            </Clause>
          </div>

          <nav className="hidden xl:block w-56 shrink-0" aria-label="Sections">
            <div className="sticky top-[76px] flex flex-col gap-1">
              <p className="text-meta text-primary-400 mb-2 px-3">On this page</p>
              {SECTIONS.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="px-3 py-2 rounded-md text-ui text-primary-400 hover:bg-primary-800 hover:text-primary-100 transition-colors"
                >
                  {section.short}
                </a>
              ))}
            </div>
          </nav>
        </div>
      </Container>
    </main>
  );
}
