import { Metadata } from 'next';

import { AuditLog } from '@/components/Dashboard/AuditLog';
import { listAudit } from '@/actions/dashboard';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  alternates: { canonical: '/dashboard/audit' },
  title: 'Audit log · Dashboard'
};

export default async function AuditPage() {
  const result = await listAudit();

  if (!result.ok) {
    return (
      <section className="enter pb-6">
        <div className="panel">
          <p className="text-read text-primary-300">Could not read the audit log.</p>
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
