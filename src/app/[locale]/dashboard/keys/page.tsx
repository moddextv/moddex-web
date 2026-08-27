import { asLocale } from '@/i18n/locales';
import { getTranslator } from '@/i18n/dictionary';
import { alternatesFor } from '@/misc/metadata';
import { Metadata } from 'next';

import { ClientKeys } from '@/components/Dashboard/ClientKeys';
import { listClientKeys } from '@/actions/dashboard';

interface MetaProps {
  params: Promise<{ locale: string }>;
}

export const generateMetadata = async ({ params }: MetaProps): Promise<Metadata> => {
  const locale = asLocale((await params).locale);

  return {
    alternates: alternatesFor('/dashboard/keys', locale),
    robots: { index: false, follow: false },
    title: 'Keys · Dashboard'
  };
};

export default async function KeysPage({ params }: MetaProps) {
  const locale = asLocale((await params).locale);
  const t = getTranslator(locale);
  const result = await listClientKeys();

  if (!result.ok) {
    return (
      <section className="enter pb-6">
        <div className="panel">
          <p className="text-read text-primary-300">{t('dash.keys.unreadable')}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="enter pb-6">
      <ClientKeys keys={result.data.items} />
    </section>
  );
}
