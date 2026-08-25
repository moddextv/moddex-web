import { pageMetadata } from '@/misc/metadata';
import { HELD_FIELDS } from '@/misc/held';
import { config } from '@/config';
import { Metadata } from 'next';

import { Clause, Inline, LegalPage, Para } from '@/components/Legal';
import { LegalLanguageNotice } from '@/components/LegalLanguageNotice';
import { asLocale } from '@/i18n/locales';
import { OptOutEffect } from '@/components/OptOutPromise';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => ({
  ...pageMetadata('/privacy', asLocale((await params).locale)),
  title: 'Privacy',
  description: `What ${config.brand.domain} holds about an account, where it comes from, how long it is kept, and how to make it stop.`
});

const SECTIONS = [
  { id: 'summary', title: '1. The short version', short: '1. Short version' },
  { id: 'held', title: '2. What is held about an account', short: '2. What is held' },
  { id: 'source', title: '3. Where it comes from', short: '3. Where from' },
  { id: 'signing-in', title: '4. Signing in and linked accounts', short: '4. Sign-in' },
  { id: 'donations', title: '5. Donations', short: '5. Donations' },
  { id: 'not-collected', title: '6. What is never collected', short: '6. Never collected' },
  { id: 'analytics', title: '7. Visitor counting', short: '7. Visitor counting' },
  { id: 'retention', title: '8. How long it is kept', short: '8. Retention' },
  { id: 'choices', title: '9. Your choices', short: '9. Your choices' },
  { id: 'processors', title: '10. Who else sees it', short: '10. Third parties' },
  { id: 'contact', title: '11. Changes and contact', short: '11. Contact' }
] as const;

export default async function PrivacyPage({ params }: PageProps) {
  const locale = asLocale((await params).locale);
  const { name, domain, email } = config.brand;

  return (
    <LegalPage title="Privacy" sections={SECTIONS}>
      <LegalLanguageNotice locale={locale} />
      <Clause id="summary" title="1. The short version">
        <Para>
          We record which Twitch accounts hold moderator, VIP or founder status in which Twitch
          channels, and the day they got it. All of it is already on Twitch for anyone who can view
          the channel. We don&apos;t read anything private, and we don&apos;t sell anything.
        </Para>
        <Para>
          The rest of this page is the detail: what exactly is held, where it comes from, how long
          it stays, and what you can do about it.
        </Para>
      </Clause>

      <Clause id="held" title="2. What is held about an account">
        <Para>
          If an account shows up on {name}, we hold the fields below about it, along with the roles
          it holds and the date each one was granted.
        </Para>

        <div className="panel grid grid-cols-2 sm:grid-cols-4 gap-x-5 gap-y-3">
          {HELD_FIELDS.map((field) => (
            <span key={field} className="text-ui text-primary-200">
              {field}
            </span>
          ))}
        </div>

        <Para>
          If a role is removed later, we <strong className="text-primary-100">keep</strong> the
          record and mark it as ended. Knowing that somebody held a role, and between which dates,
          is the whole point of the site. We&apos;re spelling this out because most people would
          assume the data disappears when the role does.
        </Para>
      </Clause>

      <Clause id="source" title="3. Where it comes from">
        <Para>
          From Twitch, through their public interfaces, and only for channels somebody has looked up
          at least once. We don&apos;t buy data, import it from other sites, or combine it with
          anything from elsewhere.
        </Para>
        <Para>
          If Twitch reports an account as banned or deactivated, we mark it and stop displaying it.
        </Para>
      </Clause>

      <Clause id="signing-in" title="4. Signing in and linked accounts">
        <Para>
          Signing in goes through Twitch OAuth, so we never see your Twitch password. The session is
          a signed cookie holding your Twitch id, login and permission level. It&apos;s there to
          keep you signed in, and we don&apos;t use it for tracking or advertising.
        </Para>
        <Para>
          You can link a Discord account in <Inline href="/settings">your settings</Inline>. We
          store only the Discord account id, and only so the icon on your public profile can point
          at it. We ask for the smallest permission Discord offers: enough to read which account you
          are, and nothing that can touch your messages. The access token is used once to confirm
          the account and never stored. Remove the link and the record goes with it.
        </Para>
      </Clause>

      <Clause id="donations" title="5. Donations">
        <Para>
          Stripe processes donations. Card details stay with Stripe and never reach {name}. What we
          store is the payment reference, the amount, and the name and email address Stripe hands
          back.
        </Para>
      </Clause>

      <Clause id="not-collected" title="6. What is never collected">
        <Para>
          Chat messages, private messages, Twitch email addresses, and anything else that isn&apos;t
          publicly visible on Twitch. There are no advertising trackers on this site, nothing here
          follows you elsewhere, and we don&apos;t sell or share data for marketing. We do count
          page views, which is the next section.
        </Para>
      </Clause>

      <Clause id="analytics" title="7. Visitor counting">
        <Para>
          We count page views so we can tell whether anyone is using this. The counter is{' '}
          <strong className="text-primary-100">Umami</strong> and it runs on the same server as the
          rest of {name}. No figures leave that machine, and we don&apos;t share or sell any of
          them.
        </Para>
        <Para>
          A page view records the address you visited, the page that referred you if there was one,
          your browser, operating system, device type, screen size and language, and a rough
          location worked out from your network address:{' '}
          <strong className="text-primary-100">country, region and city</strong>. The network
          address itself is never stored.
        </Para>
        <Para>
          It sets <strong className="text-primary-100">no cookies</strong> and writes nothing to
          your device. The one thing it reads is a{' '}
          <code className="text-primary-200">umami.disabled</code> flag you can set yourself to
          switch it off completely. It can&apos;t follow you to other sites, and none of what it
          records is tied to your account, even while you&apos;re signed in.
        </Para>
        <Para>
          Visits within roughly a day get grouped into one session, so the counter can tell a
          returning reader from a new one. The grouping comes from your network address and browser,
          not from anything stored on your device, and it&apos;s not a name. Nothing here identifies
          who you are.
        </Para>
        <Para>
          Addresses are recorded without their query string. That&apos;s on purpose: the donation
          confirmation page carries a Stripe reference in its address, and a counter writes
          addresses down verbatim.
        </Para>
      </Clause>

      <Clause id="retention" title="8. How long it is kept">
        <Para>
          We keep role history indefinitely. A record that expires isn&apos;t much of a record.
          Profile fields get refreshed from Twitch over time and hold the most recent values we have
          seen.
        </Para>
        <Para>
          Two things you shouldn&apos;t have to find out the hard way. <OptOutEffect /> Since you
          can switch it back off, the underlying rows still exist while it&apos;s on. And the
          database is backed up nightly, with backups kept for fourteen days, so a deletion only
          reaches the backups once that window has passed.
        </Para>
        <Para>
          If you want your data removed outright instead of hidden, just ask. The address is below.
        </Para>
      </Clause>

      <Clause id="choices" title="9. Your choices">
        <Para>
          <strong className="text-primary-100">Opt out</strong> in{' '}
          <Inline href="/settings">your settings</Inline> at any time. One switch, it takes effect
          immediately, and you can undo it.
        </Para>
        <Para>
          <strong className="text-primary-100">Unlink Discord</strong> in the same place. That
          deletes the record.
        </Para>
        <Para>
          <strong className="text-primary-100">Ask for a copy, a correction or a deletion</strong>{' '}
          by email. Depending on where you live you may have a legal right to these. Either way, the
          address below reaches a person.
        </Para>
      </Clause>

      <Clause id="processors" title="10. Who else sees it">
        <Para>
          Twitch, as the source of the data and the sign-in provider. Stripe, for donations.
          Discord, if you choose to link an account. The server is rented hosting. Nobody else gets
          access to the database, and no third party receives the data for their own purposes.
        </Para>
      </Clause>

      <Clause id="contact" title="11. Changes and contact">
        <Para>
          This page changes when the service does, and the date at the top says when it last did. If
          you keep using the site after a change, the current version applies.
        </Para>
        <Para>
          Questions, corrections and deletion requests:{' '}
          <a href={`mailto:${email}`} className="text-primary-100 font-semibold hover:underline">
            {email}
          </a>
          . The terms of use are on the <Inline href="/tos">terms page</Inline>, and {domain} is not
          affiliated with Twitch.
        </Para>
      </Clause>
    </LegalPage>
  );
}
