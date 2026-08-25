import { alternatesFor } from '@/misc/metadata';
import { asLocale } from '@/i18n/locales';
import { getTranslator } from '@/i18n/dictionary';
import { Metadata } from 'next';

import { AuditLog } from '@/components/Dashboard/AuditLog';
import { listAudit } from '@/actions/dashboard';

interface MetaProps {
  params: Promise<{ locale: string }>;
}

export const generateMetadata = async ({ params }: MetaProps): Promise<Metadata> => {
  const locale = asLocale((await params).locale);

  return {
    alternates: alternatesFor('/dashboard/audit', locale),
    robots: { index: false, follow: false },
    title: 'Audit log · Dashboard'
  };
};

export default async function AuditPage({ params }: MetaProps) {
  const t = getTranslator(asLocale((await params).locale));
  const result = await listAudit();

  if (!result.ok) {
    return (
      <section className="enter pb-6">
        <div className="panel">
          <p className="text-read text-primary-300">{t('dash.auditUnreadable')}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="enter pb-6">
      <AuditLog initial={result.data} />
    </section>
  );
}
