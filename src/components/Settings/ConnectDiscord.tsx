'use client';

import { FC, useState } from 'react';
import { disconnect } from '@/actions/settings';
import { DiscordIcon } from '@/components/Icons';
import { useAction } from '@/hooks/useAction';

interface ConnectDiscordProps {
  initialDiscordId: string | null;
}

export const ConnectDiscord: FC<ConnectDiscordProps> = ({ initialDiscordId }) => {
  const [discordId, setDiscordId] = useState(initialDiscordId);

  const remove = useAction(disconnect, {
    onSuccess: () => setDiscordId(null)
  });

  if (!discordId) {
    return (
      <span className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/api/connect/discord" className="btn btn-discord-quiet">
          <DiscordIcon size={16} />
          Connect Discord
        </a>
      </span>
    );
  }

  return (
    <span className="flex items-center gap-3 flex-wrap justify-end">
      <span className="flex items-center gap-2">
        <DiscordIcon size={16} />
        <span className="text-base tabular">{discordId}</span>
      </span>

      <button
        type="button"
        className="chip"
        onClick={() => void remove.run('discord')}
        disabled={remove.pending}
      >
        {remove.pending ? 'Removing…' : 'Remove'}
      </button>

      {remove.error && (
        <span className="text-ui text-vip" role="alert">
          {remove.error}
        </span>
      )}
    </span>
  );
};
