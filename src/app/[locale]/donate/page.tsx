import { pageMetadata } from '@/misc/metadata';
import { asLocale } from '@/i18n/locales';
import { getTranslator } from '@/i18n/dictionary';
import { Container } from '@/components/UI/Container';
import { Image } from '@/components/UI/Image';
import { DonateForm } from '@/components/DonateForm';
import { config } from '@/config';
import { getFormattedStats } from '@/utils/stats';
import { formatNumber } from '@/utils/format';
import { Metadata } from 'next';
import { CSSProperties, FC } from 'react';

export const dynamic = 'force-dynamic';

interface MetaProps {
  params: Promise<{ locale: string }>;
}

export const generateMetadata = async ({ params }: MetaProps): Promise<Metadata> => {
  const locale = asLocale((await params).locale);
  const t = getTranslator(locale);

  return {
    ...pageMetadata('/donate', locale),
    title: t('donate.metaTitle'),
    description: t('donate.metaDescription', { brandName: config.brand.name })
  };
};

const Badge: FC<{ src: string; name: string; alt: string; children: string }> = ({
  src,
  name,
  alt,
  children
}) => (
  <div className="flex items-start gap-4">
    <Image src={src} alt={alt} width={42} height={42} radius="sm" className="shrink-0" />
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

export default async function DonatePage({ params }: MetaProps) {
  const locale = asLocale((await params).locale);
  const t = getTranslator(locale);
  const stats = await getFormattedStats();
  const roleRecords = stats.mods.raw + stats.vips.raw;

  return (
    <main id="main" className="flex-grow">
      <Container>
        <header className="enter pt-12 pb-8">
          <h1 className="text-h1 mb-3 max-w-[24ch]">
            {t('donate.heading', { brandName: config.brand.name })}
          </h1>
          <p className="text-lead text-primary-300 max-w-prose">{t('donate.lead')}</p>
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
              <span className="text-ui text-primary-400">{t('donate.oneTime')}</span>
            </div>
            <p className="text-read text-primary-300 mb-6">
              {t('donate.stripeNote', { brandName: config.brand.name })}
            </p>

            <DonateForm />

            <p className="text-ui text-primary-400 mt-4">{t('donate.signedOut')}</p>
          </div>

          <div className="panel">
            <h2 className="text-h2 mb-5">{t('donate.whatYouGet')}</h2>
            <div className="flex flex-col gap-6">
              <Badge
                src="/badges/donator.svg"
                name={t('donate.donator.name')}
                alt={t('donate.badgeAlt', { name: t('donate.donator.name') })}
              >
                {t('donate.donator.body')}
              </Badge>
              <Badge
                src="/badges/top_donator.svg"
                name={t('donate.topDonator.name')}
                alt={t('donate.badgeAlt', { name: t('donate.topDonator.name') })}
              >
                {t('donate.topDonator.body')}
              </Badge>
            </div>
          </div>

          <div className="panel">
            <h2 className="text-h2 mb-5">{t('donate.straight.title')}</h2>
            <ul className="flex flex-col gap-4">
              <Term>{t('donate.straight.one')}</Term>
              <Term>{t('donate.straight.two')}</Term>
              <Term>{t('donate.straight.three')}</Term>
            </ul>
          </div>
        </section>

        <section className="enter pb-4" style={{ '--i': 2 } as CSSProperties}>
          <div className="panel">
            <p className="text-meta text-primary-400 mb-4">{t('donate.holds.title')}</p>
            <div className="flex flex-wrap gap-x-14 gap-y-6">
              <Held value={formatNumber(roleRecords)} label={t('donate.holds.roleRecords')} />
              <Held value={formatNumber(stats.users.raw)} label={t('donate.holds.accounts')} />
              <Held value={formatNumber(stats.channels.raw)} label={t('donate.holds.channels')} />
              <Held value={t('donate.holds.backupsValue')} label={t('donate.holds.backups')} />
            </div>
          </div>
        </section>
      </Container>
    </main>
  );
}
