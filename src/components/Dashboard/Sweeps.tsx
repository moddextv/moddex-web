import { FC } from 'react';

import { ago } from './ago';
import type { EventsubHealth, SweepHealth } from '@/utils/api/moddex';

const number = (value: number | null | undefined) =>
  value === null || value === undefined ? '—' : value.toLocaleString('en-US');

const Row: FC<{ label: string; note: string; children: React.ReactNode }> = ({
  label,
  note,
  children
}) => (
  <div className="row cols-jobs">
    <span className="text-base font-bold">{label}</span>
    <span className="text-ui text-primary-300">{children}</span>
    <span className="text-micro text-primary-400 truncate" title={note}>
      {note}
    </span>
  </div>
);

export const Sweeps: FC<{ sweeps: SweepHealth; eventsub: EventsubHealth | null }> = ({
  sweeps,
  eventsub
}) => {
  const { queue } = sweeps;
  const pressure = queue.capacity ? Math.round((queue.waiting / queue.capacity) * 100) : 0;

  return (
    <div className="panel-flush">
      <div className="flex items-center gap-3 flex-wrap px-4 pb-5">
        <h2 className="text-h2">Sweeps</h2>
        <span className="w-full sm:w-auto sm:ml-auto text-ui text-primary-400">
          {sweeps.depthCounted ? 'backlogs counted' : 'backlogs not counted'}
        </span>
      </div>

      <div className="rows">
        <div className="row-head cols-jobs">
          <span>Sweep</span>
          <span>Rate</span>
          <span />
        </div>

        <Row label="Live" note="the channels currently streaming, walked continuously">
          {number(sweeps.live.perMinute)} <span className="text-primary-400">/ min</span>
        </Row>

        <Row label="Stale" note="channels read before, due another look">
          {number(sweeps.stale.perMinute)} <span className="text-primary-400">/ min</span>
          {sweeps.stale.depth !== null && (
            <span className="text-primary-400"> · {number(sweeps.stale.depth)} in scope</span>
          )}
        </Row>

        <Row
          label="Discover"
          note="accounts no sweep has ever touched — this is what grows the index"
        >
          {number(sweeps.discover.perMinute)} <span className="text-primary-400">/ min</span>
          {sweeps.discover.depth !== null && (
            <span className="text-primary-400"> · {number(sweeps.discover.depth)} unread</span>
          )}
        </Row>

        <Row label="Queue" note="on-demand refreshes; a full queue drops the rest">
          <span className={pressure > 80 ? 'text-vip font-bold' : undefined}>
            {number(queue.waiting)}
          </span>
          <span className="text-primary-400">
            {' '}
            / {number(queue.capacity)} waiting · {number(queue.running)} running
          </span>
        </Row>

        <Row
          label="Yield"
          note={`a sweep stands aside above ${number(queue.yieldAbove)} waiting, but never for long`}
        >
          {sweeps.yield.engaged ? (
            <span className="text-vip font-bold">
              standing aside{sweeps.yield.since ? ` since ${ago(sweeps.yield.since)}` : ''}
            </span>
          ) : (
            'running'
          )}
        </Row>

        {eventsub && (
          <Row label="EventSub" note="a conduit with no shard discards events">
            <span className={eventsub.status === 'ok' ? undefined : 'text-vip font-bold'}>
              {eventsub.eventsub}
            </span>
            {eventsub.totalShards !== undefined && (
              <span className="text-primary-400">
                {' '}
                · {number(eventsub.enabledShards)} / {number(eventsub.totalShards)} shard(s)
              </span>
            )}
          </Row>
        )}
      </div>
    </div>
  );
};
