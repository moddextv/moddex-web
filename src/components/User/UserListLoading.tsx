import { Skeleton } from '@heroui/react';
import { FC } from 'react';

/**
 * mirrors the real row geometry (72px, rail + avatar + two text lines) so the
 * list does not reflow when the data lands.
 */
export const UserListLoading: FC = () => (
  <div className="border-t border-primary-700">
    {[0, 1, 2].map((row) => (
      <div
        key={row}
        className="flex items-center gap-3 h-[72px] px-2 border-b border-primary-800"
      >
        <Skeleton className="w-[3px] h-9 rounded-full" />
        <Skeleton className="w-10 h-10 rounded-full shrink-0" />
        <div className="flex-1 flex flex-col gap-2">
          <Skeleton className="h-4 w-2/5 rounded" />
          <Skeleton className="h-3 w-1/4 rounded" />
        </div>
      </div>
    ))}
  </div>
);
