import { UserType } from '@/misc/roles';
import { FC } from 'react';

const ROWS = [
  ['w-24', 'w-16', 'w-14'],
  ['w-32', 'w-16', 'w-12'],
  ['w-20', 'w-16', 'w-16'],
  ['w-28', 'w-16', 'w-12'],
  ['w-36', 'w-16', 'w-14'],
  ['w-24', 'w-16', 'w-16']
];

export const UserListLoading: FC<{ type: UserType }> = ({ type }) => (
  <div className="rows">
    <div className="row-head cols-people">
      <span>{type === 'channel' ? 'Account' : 'Channel'}</span>
      <span className="text-right">Granted</span>
      <span className="text-right">Followers</span>
    </div>

    {ROWS.map(([name, granted, followers], index) => (
      <div key={index} className="row cols-people">
        <span className="flex items-center gap-3.5 min-w-0">
          <span className="skeleton w-9 h-9 rounded-full" />
          <span className={`skeleton h-4 ${name}`} />
        </span>
        <span className={`skeleton h-3.5 ${granted} justify-self-end`} />
        <span className={`skeleton h-3.5 ${followers} justify-self-end`} />
      </div>
    ))}
  </div>
);
