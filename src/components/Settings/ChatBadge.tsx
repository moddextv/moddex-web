'use client';

import { FC, useState } from 'react';
import { Image } from '@/components/UI/Image';
import { UserChatBadges } from '@/misc/Interfaces';
import { setSelectedUserChatBadge } from '@/actions/userChatBadgeState';
import clsx from 'clsx';

interface ChatBadgeComponentProps {
  userChatBadges: UserChatBadges;
  login: string;
}

/**
 * radio cards rather than heroui's <Select>.
 *
 * a dropdown hides every option but one, which is the wrong shape for a choice
 * between two or three images: you had to open it to find out what you owned.
 * these are all visible at once, and the whole card is the hit area.
 *
 * the preview underneath is the point of a cosmetic setting and something the
 * shipped page never showed. choosing a badge you cannot see is guesswork.
 */
export const ChatBadge: FC<ChatBadgeComponentProps> = ({ userChatBadges, login }) => {
  const [selected, setSelected] = useState(userChatBadges.selected);
  const [loading, setLoading] = useState(false);

  const choose = async (name: string) => {
    if (name === selected || loading) return;

    const previous = selected;

    // optimistic, then rolled back on failure: the whole interaction is one
    // click and waiting on a round trip to move the highlight feels broken.
    setSelected(name);
    setLoading(true);

    try {
      await setSelectedUserChatBadge(name);
    } catch {
      setSelected(previous);
    } finally {
      setLoading(false);
    }
  };

  const preview = userChatBadges.available.find((badge) => badge.name === selected && badge.path);

  return (
    <>
      <fieldset disabled={loading}>
        <legend className="sr-only">Chat badge</legend>
        <div className="flex flex-wrap gap-3">
          {userChatBadges.available.map((badge) => {
            const active = badge.name === selected;

            return (
              <label
                key={badge.name}
                className={clsx(
                  'flex items-center gap-3 h-12 px-4 rounded-md border cursor-pointer transition-colors',
                  active
                    ? 'border-primary-300 bg-primary-800'
                    : 'border-primary-700 hover:border-primary-600'
                )}
              >
                <input
                  type="radio"
                  name="chat-badge"
                  value={badge.name}
                  checked={active}
                  onChange={() => choose(badge.name)}
                  className="sr-only"
                />

                {badge.path ? (
                  <Image src={badge.path} alt="" width={20} height={20} radius="sm" />
                ) : (
                  <span
                    aria-hidden="true"
                    className="w-5 h-5 rounded-sm border border-primary-600"
                  />
                )}

                <span className={active ? 'text-base font-bold' : 'text-base text-primary-300'}>
                  {badge.name === 'none' ? 'No badge' : badge.name}
                </span>

                {active && <span className="text-meta text-mod ml-1">Selected</span>}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-7 pt-6 border-t border-primary-700/70">
        {/* not "how it will look in chat", which it is not. twitch renders the
            name in the colour the account picked, and moddex does not have it:
            `chatColor` comes back in the graphql response moddex-api reads but
            is never stored or served, so there is nothing here to colour it
            with. claiming fidelity we cannot deliver makes the reader distrust
            the rest of the page — this says what it actually shows. */}
        <p className="text-meta text-primary-400 mb-3">Where the badge sits</p>
        {/* the gap belongs between the badge and the name, not inside the
            message — in chat the colon sits against the name. so the name and
            what follows it are one flex item, and only the badge is spaced. */}
        <p className="flex items-center gap-2.5 rounded-md bg-primary-900 px-4 py-3">
          {preview && <Image src={preview.path} alt="" width={18} height={18} radius="sm" />}
          <span className="text-base text-primary-300">
            <span className="font-bold text-primary-100">{login}</span>: forsen has 24 mods, wow
          </span>
        </p>
      </div>
    </>
  );
};
