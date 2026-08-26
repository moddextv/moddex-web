import { asLocale } from '@/i18n/locales';
import { pageMetadata } from '@/misc/metadata';
import { HELD_FIELDS } from '@/misc/held';
import { config } from '@/config';
import { Metadata } from 'next';

import { Clause, Inline, LegalPage, Para } from '@/components/Legal';
import { LegalLanguageNotice } from '@/components/LegalLanguageNotice';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => ({
  ...pageMetadata('/tos', asLocale((await params).locale)),
  title: 'Terms of Service',
  description: `The terms for using ${config.brand.domain}, what data it holds about a listed account, and how to opt out.`
});

const SECTIONS = [
  { id: 'acceptance', title: '1. Acceptance', short: '1. Acceptance' },
  { id: 'service', title: '2. What this service does', short: '2. What this does' },
  { id: 'your-data', title: '3. Your data', short: '3. Your data' },
  { id: 'accounts', title: '4. Accounts and donations', short: '4. Accounts' },
  { id: 'use', title: '5. Acceptable use', short: '5. Acceptable use' },
  { id: 'disclaimer', title: '6. Disclaimer and liability', short: '6. Disclaimer' },
  { id: 'changes', title: '7. Changes', short: '7. Changes' },
  { id: 'contact', title: '8. Contact', short: '8. Contact' }
] as const;

export default async function TosPage({ params }: PageProps) {
  const locale = asLocale((await params).locale);
  const { name, url, domain, email } = config.brand;

  return (
    <LegalPage title="Terms of Service" sections={SECTIONS}>
      <LegalLanguageNotice locale={locale} />
      <Clause id="acceptance" title="1. Acceptance">
        <Para>
          By accessing{' '}
          <a href={url} className="text-primary-100 font-semibold hover:underline">
            {domain}
          </a>{' '}
          you agree to these terms. If you don&apos;t agree with part of them, please don&apos;t use
          the site.
        </Para>
      </Clause>

      <Clause id="service" title="2. What this service does">
        <Para>
          {name} records which Twitch accounts hold moderator, VIP or founder status in which Twitch
          channels, and when they got it. We read it from Twitch&apos;s own interfaces, and all of
          it is visible to anyone who can view the channel.
        </Para>
        <Para>
          A channel only gets indexed once somebody looks it up. We don&apos;t read chat messages,
          private messages, email addresses, or anything that isn&apos;t publicly visible on Twitch.
        </Para>
      </Clause>

      <Clause id="your-data" title="3. Your data">
        <Para>
          If you&apos;re listed on {name}, we hold the fields below plus the roles described above.
        </Para>

        <div className="panel grid grid-cols-2 sm:grid-cols-4 gap-x-5 gap-y-3">
          {HELD_FIELDS.map((field) => (
            <span key={field} className="text-ui text-primary-200">
              {field}
            </span>
          ))}
        </div>

        <Para>
          <strong className="text-primary-100">You can opt out at any time</strong>, from{' '}
          <Inline href="/settings">your settings</Inline>. What that does, exactly, is on the{' '}
          <Inline href="/privacy">privacy page</Inline>, which is the page that promises it.
        </Para>
        <Para>
          If Twitch reports an account as banned or deactivated, we mark it and stop displaying it.
        </Para>
      </Clause>

      <Clause id="accounts" title="4. Accounts and donations">
        <Para>
          Signing in goes through Twitch OAuth, so we never see your Twitch password. Stripe
          processes donations and handles the card details end to end. We store only the payment
          reference, the amount, and the name and email Stripe hands back.
        </Para>
        <Para>
          Donations are voluntary contributions toward running costs, not purchases. The cosmetic
          badges that come with one carry no monetary value and may change or be withdrawn.
          Donations are generally non-refundable, but if something went wrong, write to us and
          we&apos;ll sort it out.
        </Para>
      </Clause>

      <Clause id="use" title="5. Acceptable use">
        <Para>
          Don&apos;t use {name} to harass, dox, or target anyone, and don&apos;t try to disrupt the
          service or scrape it in a way that degrades it for everyone else. The public API is
          provided as-is, and rate limits may be applied or changed without notice.
        </Para>
      </Clause>

      <Clause id="disclaimer" title="6. Disclaimer and liability">
        <Para>
          {name} is provided &quot;as is&quot;, without warranty of any kind. The data is gathered
          automatically and may be incomplete, stale, or wrong. Please don&apos;t rely on it for any
          decision that matters.
        </Para>
        <Para>
          To the extent permitted by law, we&apos;re not liable for any damages arising from the use
          of, or inability to use, this site. Some jurisdictions don&apos;t allow such limitations,
          in which case they may not apply to you.
        </Para>
      </Clause>

      <Clause id="changes" title="7. Changes">
        <Para>
          We may revise these terms at any time. If you keep using the site, you accept the current
          version.
        </Para>
      </Clause>

      <Clause id="contact" title="8. Contact">
        <Para>
          Questions about these terms, your data, or anything else:{' '}
          <a href={`mailto:${email}`} className="text-primary-100 font-semibold hover:underline">
            {email}
          </a>
          .
        </Para>
      </Clause>
    </LegalPage>
  );
}
