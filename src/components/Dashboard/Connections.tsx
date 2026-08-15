import { FC } from 'react';
import { formatDate } from '@/utils/format';
import { ago } from './ago';
import type { ChannelConnections } from '@/utils/api/moddex';

const Row: FC<{ connection: ChannelConnections['items'][number] }> = ({ connection }) => {
  const { login, name, ignored, connectedAt, revokedAt, id } = connection;
  const withdrew = !!revokedAt;

  return (
    <div className={`row cols-connections${withdrew ? ' opacity-60' : ''}`}>
      <span className="min-w-0">
        <span className="text-base font-bold truncate">{login ?? id}</span>
        {name && name !== login && <span className="text-micro text-primary-400"> · {name}</span>}
        {ignored && <span className="text-micro text-vip"> · opted out</span>}
        {withdrew && <span className="text-micro text-primary-400"> · withdrew</span>}
      </span>

      <span className="text-ui text-primary-300" title={formatDate(connectedAt)}>
        {ago(connectedAt)}
      </span>
    </div>
  );
};

export const Connections: FC<{ connections: ChannelConnections }> = ({ connections }) => {
  const { items, total } = connections;
  const live = items.filter((connection) => !connection.revokedAt).length;

  const capped = total > items.length;

  return (
    <div className="panel-flush">
      <div className="flex items-center gap-3 flex-wrap px-4 pb-5">
        <h2 className="text-h2">Connected channels</h2>
        <span className="ml-auto text-ui text-primary-400">
          {capped ? `${items.length} of ${total}, newest first` : `${live} live`}
          {!capped && items.length !== live && ` · ${items.length - live} withdrew`}
        </span>
      </div>

      {items.length === 0 ? (
        <p className="text-read text-primary-300 max-w-prose px-4 pb-4">
          Nobody has connected a channel yet. The eventsub shards can be healthy while this is
          empty. They answer different questions.
        </p>
      ) : (
        <div className="rows">
          <div className="row-head cols-connections">
            <span>Channel</span>
            <span>Connected</span>
          </div>

          {items.map((connection) => (
            <Row key={connection.id} connection={connection} />
          ))}
        </div>
      )}
    </div>
  );
};
