import { Title } from '@/components/UI/Title';
import { config } from '@/config';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'terms of service',
  description: `find ${config.brand.name}s terms of service and privacy information here`
};

const Section = ({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div>
    <Title level={2} size="md">
      {title}
    </Title>
    <div className="mt-2 mb-8 flex flex-col gap-2">{children}</div>
  </div>
);

export default async function TosPage() {
  const { name, url, domain, email } = config.brand;

  return (
    <main className="container mx-auto max-w-5xl py-16 px-6 flex-grow flex flex-col gap-8">
      <Title mb="lg">Terms of Service</Title>

      <p className="text-primary-300">
        Last updated: {new Date().getFullYear()}. {name} is not affiliated with,
        endorsed by, or sponsored by Twitch Interactive, Inc.
      </p>

      <Section title="1. Acceptance">
        <p>
          By accessing <a className="underline" href={url}>{domain}</a> you agree
          to these terms. If you disagree with any part of them, please do not
          use the site.
        </p>
      </Section>

      <Section title="2. What this service does">
        <p>
          {name} records which Twitch accounts hold moderator or VIP status in
          which Twitch channels, and when that status was granted. This
          information is retrieved from Twitch&apos;s own interfaces and is
          visible to anyone who can view the channel in question.
        </p>
        <p>
          A channel is only indexed once somebody looks it up. We do not read
          chat messages, private messages, email addresses, or anything that is
          not publicly visible on Twitch.
        </p>
      </Section>

      <Section title="3. Your data and how to opt out">
        <p>
          If you are listed on {name}, we hold your Twitch user id, login name,
          display name, avatar url, profile description, follower count, account
          creation date, and the mod/VIP roles described above.
        </p>
        <p>
          <strong>You can opt out at any time.</strong> Sign in with Twitch and
          enable the opt-out in{' '}
          <a className="underline" href="/settings">
            your settings
          </a>
          . Your profile then stops being served and you are removed from every
          mod and VIP list and from the public API. To have your records deleted
          outright rather than hidden, email{' '}
          <a className="underline" href={`mailto:${email}`}>
            {email}
          </a>
          .
        </p>
        <p>
          Accounts that Twitch reports as banned or deactivated are marked as
          such and are not displayed.
        </p>
      </Section>

      <Section title="4. Accounts and donations">
        <p>
          Signing in uses Twitch OAuth; we never see your Twitch password.
          Donations are processed by Stripe, and card details are handled
          entirely by Stripe — we store only the payment reference, the amount,
          and the name and email Stripe returns to us.
        </p>
        <p>
          Donations are voluntary contributions towards running costs, not
          purchases. Cosmetic badges granted alongside a donation carry no
          monetary value and may change or be withdrawn. Donations are generally
          non-refundable; if something went wrong, contact us and we will sort it
          out.
        </p>
      </Section>

      <Section title="5. Acceptable use">
        <p>
          Do not use {name} to harass, dox, or target anyone, and do not attempt
          to disrupt the service or scrape it in a way that degrades it for
          others. The public API is provided as-is and rate limits may be applied
          or changed without notice.
        </p>
      </Section>

      <Section title="6. Disclaimer and liability">
        <p>
          {name} is provided &quot;as is&quot;, without warranty of any kind. The
          data is gathered automatically and may be incomplete, stale, or wrong —
          it should not be relied upon for any decision that matters.
        </p>
        <p>
          To the extent permitted by law, we are not liable for any damages
          arising from the use of, or inability to use, this site. Some
          jurisdictions do not allow such limitations, in which case they may not
          apply to you.
        </p>
      </Section>

      <Section title="7. Changes">
        <p>
          We may revise these terms at any time. Continuing to use the site means
          you accept the current version.
        </p>
      </Section>

      <Section title="8. Contact">
        <p>
          Questions about these terms, your data, or anything else:{' '}
          <a className="underline" href={`mailto:${email}`}>
            {email}
          </a>
          .
        </p>
      </Section>
    </main>
  );
}
