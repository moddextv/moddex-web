'use client';

import Image from 'next/image';
import { FC, useState } from 'react';
import { Badges } from '@/components/User/Badges';
import { SvgIcon } from '@/components/Icons/SvgIcon';
import { User } from '@/misc/Interfaces';
import { formatDate } from '@/utils/utils';

export const UserProfile: FC<{ user: User, isUser?: boolean }> = ({ user, isUser }) => {
  const [isPopupVisible, setPopupVisible] = useState(false);

  const shortUrl = `https://mdc.lol/${isUser ? 'u' : 'c'}/${user.login}`;
  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl)
      .then(() => {
        setPopupVisible(true);

        setTimeout(() => {
          setPopupVisible(false);
        }, 3000);
      })
      .catch(err => {
        console.error('Could not copy text: ', err);
      });
  };

  return (
    <div className="profile">
      <div className="avatar">
        <Image src={user.avatar} alt={`${user.login}'s avatar`} width={70} height={70} />
        <div className="copy" onClick={handleCopy}>
          <SvgIcon name="copy" size={20} />
        </div>
      </div>

      <div className="details">
        <h2 className="display-name">
          <span>{user.name}</span>
          <a href={`https://twitch.tv/${user.login}`}
             title={`view ${user.login} on twitch`}
             target="_blank">
            <SvgIcon name="twitch" size={24} />
          </a>
          {user.discord &&
            <a href={`https://discord.com/users/${user.discord}`}
               title={`view ${user.login} on discord`}
               target="_blank">
              <SvgIcon name="discord" size={24} />
            </a>
          }
        </h2>
        <h3 className="login">@{user.login}</h3>
        <Badges badges={user.badges} />
        <div className="bio">{user.bio}</div>
        <p className="created smol">created on {formatDate(user.created)}</p>
      </div>

      {isPopupVisible && <div className="popup">Successfully copied link to clipboard</div>}
    </div>
  );
};