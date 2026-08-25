import { getTranslator, Locale } from '@/i18n';
import { FC } from 'react';

import type { EventsubHealth } from '@/utils/api/moddex/public';
import type { SweepHealth } from '@/utils/api/moddex/admin';

const number = (value: number | null | undefined) =>
  value === null || value === undefined ? '·' : value.toLocaleString('en-US');

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

export const Sweeps: FC<{
  sweeps: SweepHealth;
  eventsub: EventsubHealth | null;
  locale: Locale;
}> = ({ sweeps, eventsub, locale }) => {
  const t = getTranslator(locale);
  const { queue } = sweeps;
  const pressure = queue.capacity ? Math.round((queue.waiting / queue.capacity) * 100) : 0;

  return (
    <div className="panel-flush">
      <div className="flex items-center gap-3 flex-wrap px-4 pb-5">
        <h2 className="text-h2">{t('dash.sweeps')}</h2>
        <span className="w-full sm:w-auto sm:ml-auto text-ui text-primary-400">
          {sweeps.depthCounted ? t('dash.backlogsCounted') : t('dash.backlogsNotCounted')}
        </span>
      </div>

      <div className="rows">
        <div className="row-head cols-jobs">
          <span>{t('dash.sweep')}</span>
          <span>{t('dash.rate')}</span>
          <span />
        </div>

        <Row label={t('dash.sw.live')} note={t('dash.sw.liveNote')}>
          {number(sweeps.live.perMinute)}{' '}
          <span className="text-primary-400">{t('dash.sw.perMinute')}</span>
        </Row>

        <Row label={t('dash.stale')} note={t('dash.dueAnotherLook')}>
          {number(sweeps.stale.perMinute)}{' '}
          <span className="text-primary-400">{t('dash.sw.perMinute')}</span>
          {sweeps.stale.depth !== null && (
            <span className="text-primary-400">
              {' '}
              · {t('dash.sw.inScope', { count: number(sweeps.stale.depth) })}
            </span>
          )}
        </Row>

        <Row label={t('dash.discover')} note={t('dash.sw.discoverNote')}>
          {number(sweeps.discover.perMinute)}{' '}
          <span className="text-primary-400">{t('dash.sw.perMinute')}</span>
          {sweeps.discover.depth !== null && (
            <span className="text-primary-400">
              {' '}
              · {t('dash.sw.unread', { count: number(sweeps.discover.depth) })}
            </span>
          )}
        </Row>

        <Row label={t('dash.queue')} note={t('dash.sw.queueNote')}>
          <span className={pressure > 80 ? 'text-vip font-bold' : undefined}>
            {number(queue.waiting)}
          </span>
          <span className="text-primary-400">
            {' '}
            /{' '}
            {t('dash.sw.queueState', {
              capacity: number(queue.capacity),
              running: number(queue.running)
            })}
          </span>
        </Row>

        <Row
          label={t('dash.yield')}
          note={t('dash.sw.yieldNote', { above: number(queue.yieldAbove) })}
        >
          {sweeps.yield.engaged ? (
            <span className="text-vip font-bold">
              {sweeps.yield.since
                ? t('dash.sw.standingAsideSince', { since: t.ago(sweeps.yield.since) })
                : t('dash.sw.standingAside')}
            </span>
          ) : (
            t('dash.sw.running')
          )}
        </Row>

        {eventsub && (
          <Row label={t('dash.eventSub')} note={t('dash.conduitNoShard')}>
            <span className={eventsub.status === 'ok' ? undefined : 'text-vip font-bold'}>
              {eventsub.eventsub}
            </span>
            {eventsub.totalShards !== undefined && (
              <span className="text-primary-400">
                {' '}
                ·{' '}
                {t('dash.sw.shards', {
                  count: eventsub.totalShards,
                  enabled: number(eventsub.enabledShards),
                  total: number(eventsub.totalShards)
                })}
              </span>
            )}
          </Row>
        )}
      </div>
    </div>
  );
};
