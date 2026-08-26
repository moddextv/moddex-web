'use client';

import { useT } from '@/i18n/context';

export default function Loading() {
  const t = useT();

  return (
    <section className="enter pb-6">
      <div className="panel">
        <p className="text-read text-primary-300">{t('common.loading')}</p>
      </div>
    </section>
  );
}
