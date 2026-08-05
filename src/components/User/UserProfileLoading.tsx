import { Skeleton } from '@heroui/react';

/** matches the real profile geometry so nothing shifts when the data lands */
export const UserProfileLoading = () => (
  <div className="flex flex-col gap-5">
    <div className="flex items-start gap-4">
      <Skeleton className="rounded-full w-16 h-16 shrink-0" />

      <div className="flex-1 min-w-0">
        <Skeleton className="h-8 w-56 rounded-lg mb-2" />
        <Skeleton className="h-5 w-24 rounded-md mb-3" />

        <div className="flex flex-row gap-1 mb-3">
          <Skeleton className="h-[22px] w-[22px] rounded-md" />
          <Skeleton className="h-[22px] w-[22px] rounded-md" />
        </div>

        <Skeleton className="h-4 w-72 max-w-full rounded-md mb-2" />
        <Skeleton className="h-3 w-40 rounded-md" />
      </div>
    </div>

    <Skeleton className="h-8 w-52 rounded-lg" />
  </div>
);
