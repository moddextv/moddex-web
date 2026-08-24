import { FC } from 'react';
import { formatDate } from '@/utils/format';
import { ago } from './ago';
import { backupLate, clock, size } from '@/utils/jobHealth';
import type { JobHealth as Health } from '@/utils/api/moddex/admin';

const Row: FC<{ label: string; children: React.ReactNode; note?: string }> = ({
  label,
  children,
  note
}) => (
  <div className="row cols-jobs">
    <span className="text-base font-bold">{label}</span>
    <span className="text-ui text-primary-300">{children}</span>
    <span className="text-micro text-primary-400 truncate" title={note}>
      {note}
    </span>
  </div>
);

const Ran: FC<{ lastAt: string | null; dueSince: string; overdue: boolean }> = ({
  lastAt,
  dueSince,
  overdue
}) => (
  <>
    <span className={overdue ? 'text-vip font-bold' : undefined}>{ago(lastAt)}</span>
    {lastAt && <span className="text-primary-400"> · {clock(lastAt)}</span>}
    {overdue && (
      <span className="text-primary-400"> · nothing ran in the {clock(dueSince)} slot</span>
    )}
  </>
);

export const JobHealth: FC<{ health: Health }> = ({ health }) => {
  const { snapshot, roleCounts, sweepHead, backup } = health;

  return (
    <div className="panel-flush">
      <div className="flex items-center gap-3 flex-wrap px-4 pb-5">
        <h2 className="text-h2">Scheduled work</h2>
        <span className="w-full sm:w-auto sm:ml-auto text-ui text-primary-400">
          as of {formatDate(new Date().toISOString())}
        </span>
      </div>

      <div className="rows">
        <div className="row-head cols-jobs">
          <span>Job</span>
          <span>Last run</span>
          <span />
        </div>

        <Row label="Snapshot" note="one point a day at 03:00 UTC">
          <Ran {...snapshot} />
        </Row>

        <Row label="Role counts" note="the browse rankings, rebuilt at 04:00 UTC">
          <Ran {...roleCounts} />
        </Row>

        {backup && (
          <Row label="Backup" note="nightly dump, verified and 14 days retained">
            <span
              className={
                backupLate(backup.at, backup.expectedEverySeconds)
                  ? 'text-vip font-bold'
                  : undefined
              }
            >
              {ago(backup.at)}
            </span>
            <span className="text-primary-400"> · {size(backup.bytes)}</span>
          </Row>
        )}

        {sweepHead && (
          <Row label="Sweep head" note="oldest channel not yet revisited">
            <span title={formatDate(sweepHead)}>{ago(sweepHead)}</span>
          </Row>
        )}
      </div>
    </div>
  );
};
