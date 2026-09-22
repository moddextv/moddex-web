'use client';

import { useI18n } from '@/i18n/context';
import { FC, useState } from 'react';
import { unhideChannel } from '@/actions/settings';
import { Avatar } from '@/components/UI/Avatar';
import { LocaleLink } from '@/components/UI/LocaleLink';
import { useAction } from '@/hooks/useAction';
import type { HiddenChannel } from '@/utils/api/moddex/me';

const Row: FC<{ channel: HiddenChannel; onShown: (id: string) => void }> = ({
  channel,
  onShown
}) => {
  const { t } = useI18n();
  const show = useAction(unhideChannel, { onSuccess: () => onShown(channel.id) });
  const name = channel.name || channel.login || channel.id;

  return (
    <div className="row" style={{ gridTemplateColumns: 'minmax(0, 1fr) auto', minHeight: '52px' }}>
      <span className="flex items-center gap-3.5 min-w-0">
        <Avatar src={channel.avatar} name={name} size={36} className="w-9 h-9" />
        {channel.login ? (
          <LocaleLink
            href={`/channel/${channel.login}`}
            className="row-name text-base font-bold truncate hover:underline"
          >
            {name}
          </LocaleLink>
        ) : (
          <span className="row-name text-base font-bold truncate">{name}</span>
        )}
      </span>
      <span className="flex items-center gap-3">
        {show.error && (
          <span className="text-ui text-vip" role="alert">
            {show.error}
          </span>
        )}
        <button
          type="button"
          className="btn btn-soft"
          disabled={show.pending}
          onClick={() => void show.run(channel.id)}
        >
          {show.pending ? t('settings.hidden.showing') : t('settings.hidden.show')}
        </button>
      </span>
    </div>
  );
};

export const HiddenChannels: FC<{ initial: HiddenChannel[] }> = ({ initial }) => {
  const { t } = useI18n();
  const [items, setItems] = useState(initial);

  if (items.length === 0) {
    return <p className="text-read text-primary-300">{t('settings.hidden.none')}</p>;
  }

  return (
    <div className="rows">
      {items.map((channel) => (
        <Row
          key={channel.id}
          channel={channel}
          onShown={(id) => setItems((previous) => previous.filter((entry) => entry.id !== id))}
        />
      ))}
    </div>
  );
};
