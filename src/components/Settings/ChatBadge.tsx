'use client';

import { Select, SelectedItemProps, SelectedItems, SelectItem } from '@nextui-org/react';
import { FC, Key, useState } from 'react';
import { BadgeSelectItem } from '@/components/Settings/BadgeSelectItem';
import { UserChatBadges, ChatBadge as ChatBadgeProps } from '@/misc/Interfaces';
import { setSelectedUserChatBadge } from '@/actions/userChatBadgeState';

interface ChatBadgeComponentProps {
  userId: string;
  userChatBadges: UserChatBadges;
}

export const ChatBadge: FC<ChatBadgeComponentProps> = ({ userId, userChatBadges }) => {
  const [selectedBadge, setSelectedBadge] = useState(userChatBadges.selected);
  const [loading, setLoading] = useState(false);

  const handleBadgeChange = async (selectedKeys: 'all' | Set<Key>) => {
    const newSelectedBadge = Array.from(selectedKeys)[0]?.toString();
    if (!newSelectedBadge || newSelectedBadge === selectedBadge) return;

    setLoading(true);

    try {
      await setSelectedUserChatBadge(userId, newSelectedBadge);
      setSelectedBadge(newSelectedBadge);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Select
      aria-label="select badge"
      variant="bordered"
      size="md"
      className="max-w-xs"
      isRequired
      isDisabled={loading}
      items={userChatBadges.available}
      selectedKeys={new Set([selectedBadge])}
      onSelectionChange={handleBadgeChange}
      renderValue={(items: SelectedItems<ChatBadgeProps>) => (
        items.map((item: SelectedItemProps<ChatBadgeProps>) => {
          const badge = userChatBadges.available.find(b => b.name === item.key);
          return badge ? (
            <div key={item.key}>
              <BadgeSelectItem name={badge.name} path={badge.path} size={24} />
            </div>
          ) : null;
        })
      )}
    >
      {userChatBadges.available.map((badge) => (
        <SelectItem key={badge.name} textValue={badge.name}>
          <BadgeSelectItem name={badge.name} path={badge.path} size={24} />
        </SelectItem>
      ))}
    </Select>
  );
};
