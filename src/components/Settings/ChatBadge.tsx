'use client';

import { FC, useRef, useState } from 'react';
import { useT } from '@/i18n/context';
import { Image } from '@/components/UI/Image';
import { UserChatBadges } from '@/misc/badges';
import { setSelectedUserChatBadge } from '@/actions/settings';
import { useAction } from '@/hooks/useAction';
import clsx from 'clsx';

const badgeAlt = (name: string) => `The ${name} badge`;

interface ChatBadgeComponentProps {
  userChatBadges: UserChatBadges;
  login: string;
}

export const ChatBadge: FC<ChatBadgeComponentProps> = ({ userChatBadges, login }) => {
  const t = useT();
  const [selected, setSelected] = useState(userChatBadges.selected);

  const rollback = useRef(selected);

  const save = useAction(setSelectedUserChatBadge, {
    onFailure: () => setSelected(rollback.current)
  });

  const loading = save.pending;

  const choose = (name: string) => {
    if (name === selected || loading) return;

    rollback.current = selected;
    setSelected(name);

    void save.run(name);
  };

  const preview = userChatBadges.available.find((badge) => badge.name === selected && badge.webp);

  return (
    <>
      <fieldset disabled={loading}>
        <legend className="sr-only">{t('chatBadge.title')}</legend>
        <div className="flex flex-wrap gap-3">
          {userChatBadges.available.map((badge) => {
            const active = badge.name === selected;

            return (
              <label key={badge.name} className={clsx('option', active && 'is-active')}>
                <input
                  type="radio"
                  name="chat-badge"
                  value={badge.name}
                  checked={active}
                  onChange={() => choose(badge.name)}
                  className="sr-only"
                />

                {badge.webp ? (
                  <Image
                    src={badge.webp}
                    alt={badgeAlt(badge.name)}
                    width={20}
                    height={20}
                    radius="sm"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="w-5 h-5 rounded-sm border border-primary-600"
                  />
                )}

                <span className={active ? 'text-base font-bold' : 'text-base text-primary-300'}>
                  {badge.name === 'none' ? 'No badge' : badge.name}
                </span>

                {active && (
                  <span className="text-meta text-mod ml-1">{t('chatBadge.selected')}</span>
                )}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-7 pt-6 border-t border-primary-700/70">
        <p className="text-meta text-primary-400 mb-3">{t('chatBadge.where')}</p>
        <p className="flex items-center gap-2.5 rounded-md bg-primary-900 px-4 py-3">
          {preview && (
            <Image
              src={preview.webp}
              alt={badgeAlt(preview.name)}
              width={18}
              height={18}
              radius="sm"
            />
          )}
          <span className="text-base text-primary-300 min-w-0 break-words">
            <span className="font-bold text-primary-100">{login}</span>: forsen has 24 mods, wow
          </span>
        </p>
      </div>
    </>
  );
};
