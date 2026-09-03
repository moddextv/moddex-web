import { Locale } from '@/i18n/locales';
import { Translator } from '@/i18n/translate';
import { getTranslator } from '@/i18n/dictionary';
import { FC } from 'react';
import type { EventsubHealth } from '@/utils/api/moddex/public';
import type { ChannelConnections } from '@/utils/api/moddex/admin';

const Row: FC<{
  connection: ChannelConnections['items'][number];
  subscribed: boolean;
  t: Translator;
}> = ({ connection, subscribed, t }) => {
  const { login, name, ignored, connectedAt, revokedAt, moderatedSyncedAt, id } = connection;
  const withdrew = !!revokedAt;

  return (
    <div className={`row cols-connections${withdrew ? ' opacity-60' : ''}`}>
      <span className="min-w-0 truncate">
        <span className="text-base font-bold">{login ?? id}</span>
        {name && name !== login && <span className="text-micro text-primary-400"> · {name}</span>}
        {ignored && <span className="text-micro text-vip"> · {t('dash.conn.optedOut')}</span>}
        {withdrew && (
          <span className="text-micro text-primary-400"> · {t('dash.conn.withdrew')}</span>
        )}
      </span>

      <span className="text-ui text-primary-300" title={t.dateLong(connectedAt)}>
        {t.ago(connectedAt)}
      </span>

      <span
        className="text-ui text-primary-300"
        title={moderatedSyncedAt ? t.dateLong(moderatedSyncedAt) : t('dash.conn.neverHandedOver')}
      >
        {moderatedSyncedAt ? t.ago(moderatedSyncedAt) : t('dash.conn.never')}
      </span>

      <span className="text-ui">
        {withdrew ? (
          <span className="text-primary-400">·</span>
        ) : subscribed ? (
          <span className="text-primary-400">{t('dash.conn.yes')}</span>
        ) : (
          <span className="text-vip font-bold" title={t('dash.conn.nothingSubscribed')}>
            {t('dash.conn.none')}
          </span>
        )}
      </span>
    </div>
  );
};

export const Connections: FC<{
  connections: ChannelConnections;
  eventsub?: EventsubHealth | null;
  locale: Locale;
}> = ({ connections, eventsub = null, locale }) => {
  const t = getTranslator(locale);
  const { items, total } = connections;
  const live = items.filter((connection) => !connection.revokedAt).length;

  // the api publishes shard health, not a per-channel subscription list
  const anySubscriptions = (eventsub?.enabledShards ?? 0) > 0;

  const capped = total > items.length;

  return (
    <div className="panel-flush">
      <div className="flex items-center gap-3 flex-wrap px-4 pb-5">
        <h2 className="text-h2">{t('dash.connectedChannels')}</h2>
        <span className="ml-auto text-ui text-primary-400">
          {capped ? `${items.length} of ${total}, newest first` : `${live} live`}
          {!capped && items.length !== live && ` · ${items.length - live} withdrew`}
        </span>
      </div>

      {items.length === 0 ? (
        <p className="text-read text-primary-300 max-w-prose px-4 pb-4">
          {t('dash.conn.nobodyConnected')}
        </p>
      ) : (
        <div className="rows">
          <div className="row-head cols-connections">
            <span>{t('dash.channel')}</span>
            <span>{t('dash.connected')}</span>
            <span>{t('dash.modList')}</span>
            <span>{t('dash.subscribed')}</span>
          </div>

          {items.map((connection) => (
            <Row key={connection.id} connection={connection} subscribed={anySubscriptions} t={t} />
          ))}
        </div>
      )}
    </div>
  );
};
