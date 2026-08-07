import { UserType } from '@/misc/Interfaces';
import { FC } from 'react';

/**
 * everything already known is already drawn: the column labels stay, only the
 * values are blank. that is the whole point of the state — the row template and
 * the 52px height are identical to the real thing, so nothing shifts when the
 * response lands.
 *
 * the widths vary per row on purpose. six identical bars read as a progress
 * indicator; uneven ones read as text that has not arrived.
 */
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
          <span className="skeleton w-9 h-9 rounded-pill" />
          <span className={`skeleton h-4 ${name}`} />
        </span>
        <span className={`skeleton h-3.5 ${granted} justify-self-end`} />
        <span className={`skeleton h-3.5 ${followers} justify-self-end`} />
      </div>
    ))}
  </div>
);
