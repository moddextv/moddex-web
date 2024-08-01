import { Skeleton } from '@nextui-org/react';

export const UserProfileLoading = () => {
  return (
    <div className="mb-12 flex flex-col gap-4 md:gap-8 md:flex-row justify-between overflow-hidden">
      <Skeleton className="rounded-full w-16 h-16" />

      <div className="flex-1 min-w-0">
        <Skeleton className="h-8 w-64 rounded-lg mb-1" />
        <Skeleton className="h-6 w-16 rounded-lg mb-2" />

        <div className="flex flex-row gap-1">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-6 w-6 rounded-full" />
        </div>

        <Skeleton className="h-6 w-32 rounded-lg opacity-50 mt-2" />
        <Skeleton className="h-4 w-24 rounded-md opacity-25 mt-1" />
      </div>
    </div>
  );
};
