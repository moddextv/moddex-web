import { openGraphFor } from '@/misc/metadata';
import { Container } from '@/components/UI/Container';
import { Image } from '@/components/UI/Image';
import { DonateForm } from '@/components/DonateForm';
import { config } from '@/config';
import { getFormattedStats } from '@/utils/stats';
import { formatNumber } from '@/utils/format';
import { Metadata } from 'next';
import { CSSProperties, FC } from 'react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  alternates: { canonical: '/donate' },
  openGraph: openGraphFor('/donate'),
  title: 'Donate',
  description: `${config.brand.name} runs on one server and no advertising. No paid tier, nothing behind a login, and the api is open.`
};

const Badge: FC<{ src: string; name: string; children: string }> = ({ src, name, children }) => (
  <div className="flex items-start gap-4">
    <Image
      src={src}
      alt={`The ${name} badge`}
      width={42}
      height={42}
      radius="sm"
      className="shrink-0"
    />
    <div>
      <p className="text-base font-bold mb-1">{name}</p>
      <p className="text-ui text-primary-300 leading-relaxed">{children}</p>
    </div>
  </div>
);

const Term: FC<{ children: string }> = ({ children }) => (
  <li className="flex gap-3.5">
    <span className="corner corner-tl text-primary-400 mt-1.5" aria-hidden="true" />
    <span className="text-ui text-primary-300 leading-relaxed">{children}</span>
  </li>
);

const Held: FC<{ value: string; label: string }> = ({ value, label }) => (
  <div>
    <p className="text-h1 font-extrabold leading-none tabular mb-1.5">{value}</p>
    <p className="text-ui text-primary-400">{label}</p>
  </div>
);

export default async function DonatePage() {
  const stats = await getFormattedStats();
  const roleRecords = stats.mods.raw + stats.vips.raw;

  return (
    <main id="main" className="flex-grow">
      <Container>
        <header className="enter pt-12 pb-8">
          <h1 className="text-h1 mb-3 max-w-[24ch]">
            {config.brand.name} runs on one server and no advertising
          </h1>
          <p className="text-lead text-primary-300 max-w-prose">
            No paid tier, nothing behind a login, and the api is open. Donations are the only thing
            keeping it that way.
          </p>
        </header>

        <section
          className="enter grid items-start gap-6 lg:grid-cols-3 pb-6"
          style={{ '--i': 1 } as CSSProperties}
        >
          <div className="panel">
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-[2.25rem] font-extrabold leading-none tabular">
                ${config.stripe.donation.default.toFixed(2)}
              </span>
              <span className="text-ui text-primary-400">one time, USD</span>
            </div>
            <p className="text-read text-primary-300 mb-6">
              Stripe handles the card details end to end. {config.brand.name} stores the payment
              reference and the amount, nothing else.
            </p>

            <DonateForm />

            <p className="text-ui text-primary-400 mt-4">
              Sign in with Twitch first and the badge lands on your profile automatically. Donating
              signed out works too, it just needs a message in the Discord afterward.
            </p>
          </div>

          <div className="panel">
            <h2 className="text-h2 mb-5">What you get</h2>
            <div className="flex flex-col gap-6">
              <Badge src="/badges/donator.svg" name="donator">
                Sits beside your name everywhere moddex shows it. Any donation of $5 or more,
                permanently.
              </Badge>
              <Badge src="/badges/top_donator.svg" name="top donator">
                Held by exactly one account at a time, whoever has given the most. It moves when
                somebody passes you.
              </Badge>
            </div>
          </div>

          <div className="panel">
            <h2 className="text-h2 mb-5">Being straight about it</h2>
            <ul className="flex flex-col gap-4">
              <Term>A contribution to running costs, not a purchase.</Term>
              <Term>
                The badges are cosmetic. They don&apos;t unlock anything and carry no monetary
                value.
              </Term>
              <Term>
                Generally non-refundable. If something went wrong, write and we&apos;ll sort it out.
              </Term>
            </ul>
          </div>
        </section>

        <section className="enter pb-4" style={{ '--i': 2 } as CSSProperties}>
          <div className="panel">
            <p className="text-meta text-primary-400 mb-4">What the money holds up</p>
            <div className="flex flex-wrap gap-x-14 gap-y-6">
              <Held value={formatNumber(roleRecords)} label="role records" />
              <Held value={formatNumber(stats.users.raw)} label="accounts" />
              <Held value={formatNumber(stats.channels.raw)} label="channels" />
              <Held value="14 days" label="of backups retained" />
            </div>
          </div>
        </section>
      </Container>
    </main>
  );
}
