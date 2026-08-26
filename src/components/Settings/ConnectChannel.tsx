'use client';

import { useI18n } from '@/i18n/context';
import { FC, useState } from 'react';
import { disconnectChannel } from '@/actions/settings';
import { TwitchIcon } from '@/components/Icons';
import { config } from '@/config';
import { useAction } from '@/hooks/useAction';

interface ConnectChannelProps {
  initialConnected: boolean;
  everConnected: boolean;
}

export const ConnectChannel: FC<ConnectChannelProps> = ({ initialConnected, everConnected }) => {
  const { t, rich } = useI18n();
  const { name } = config.brand;
  const [connected, setConnected] = useState(initialConnected);

  const disconnect = useAction(disconnectChannel, {
    onSuccess: () => setConnected(false)
  });

  if (!connected) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-read text-primary-300 max-w-prose">
          {rich(
            'settings.channel.pitch',
            { you: (chunk) => <em>{chunk}</em> },
            { brandName: name }
          )}
        </p>
        <p className="text-read text-primary-300 max-w-prose">
          {t('settings.channel.noToken', { brandName: name })}
        </p>
        <span>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/api/connect/channel" className="btn btn-twitch-quiet">
            <TwitchIcon size={16} />
            {everConnected ? t('settings.channel.again') : t('settings.channel.connect')}
          </a>
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-read text-primary-300 max-w-prose">
        <strong className="text-primary-100">{t('misc.connectedShort')}</strong>{' '}
        {t('settings.channel.live', { brandName: name })}
      </p>
      <span className="flex items-center gap-3">
        <button
          type="button"
          className="btn btn-soft"
          onClick={() => void disconnect.run()}
          disabled={disconnect.pending}
        >
          {disconnect.pending ? t('settings.disconnecting') : t('settings.disconnect')}
        </button>
        {disconnect.error && (
          <span className="text-ui text-vip" role="alert">
            {disconnect.error}
          </span>
        )}
      </span>
    </div>
  );
};
