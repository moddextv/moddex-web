'use client';

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
  const { name } = config.brand;
  const [connected, setConnected] = useState(initialConnected);

  const disconnect = useAction(disconnectChannel, {
    onSuccess: () => setConnected(false)
  });

  if (!connected) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-read text-primary-300 max-w-prose">
          Two things at once. Mod and VIP changes in your channel reach {name} as they happen
          instead of on the next sweep. And the channels <em>you</em> moderate get filled in
          straight from Twitch, including ones nobody has ever looked up here.
        </p>
        <p className="text-read text-primary-300 max-w-prose">
          {name} posts nothing and keeps no token, so we read the list of channels you moderate
          once, right now, and it goes stale from then on. Reconnect to refresh it. You can withdraw
          at Twitch or here whenever you want.
        </p>
        <span>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/api/connect/channel" className="btn btn-twitch-quiet">
            <TwitchIcon size={16} />
            {everConnected ? 'Connect this channel again' : 'Connect this channel'}
          </a>
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-read text-primary-300 max-w-prose">
        <strong className="text-primary-100">Connected.</strong> Mod and VIP changes reach {name} as
        they happen. Founders still come from the normal read, because Twitch has no live event for
        those. Withdrawing changes nothing that&apos;s already recorded.
      </p>
      <span className="flex items-center gap-3">
        <button
          type="button"
          className="btn btn-soft"
          onClick={() => void disconnect.run()}
          disabled={disconnect.pending}
        >
          {disconnect.pending ? 'Disconnecting…' : 'Disconnect'}
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
