'use client';

import { useT } from '@/i18n';
import { FC, useState } from 'react';
import { disconnect } from '@/actions/settings';
import { DiscordIcon } from '@/components/Icons';
import { useAction } from '@/hooks/useAction';

interface ConnectDiscordProps {
  initialDiscordId: string | null;
}

export const ConnectDiscord: FC<ConnectDiscordProps> = ({ initialDiscordId }) => {
  const t = useT();
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
          {t('settings.connectDiscord')}
        </a>
      </span>
    );
  }

  return (
    <span className="flex items-center gap-3 flex-wrap sm:justify-end">
      <span className="flex items-center gap-2 min-w-0">
        <DiscordIcon size={16} />
        <span className="text-base tabular break-all">{discordId}</span>
      </span>

      <button
        type="button"
        className="chip"
        onClick={() => void remove.run('discord')}
        disabled={remove.pending}
      >
        {remove.pending ? t('common.removing') : t('common.remove')}
      </button>

      {remove.error && (
        <span className="text-ui text-vip" role="alert">
          {remove.error}
        </span>
      )}
    </span>
  );
};
