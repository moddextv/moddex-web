import { Skeleton } from '@nextui-org/react';
import { FC } from 'react';

export const UserListLoading: FC = () => {
  return (
    <>
      <p className="text-center mt-1 mb-2 text-large">loading...</p>
      <div className="max-w-[300px] w-full flex items-center gap-3 my-4">
        <div>
          <Skeleton className="flex rounded-full w-12 h-12" />
        </div>
        <div className="w-full flex flex-col gap-2">
          <Skeleton className="h-6 w-3/5 rounded-lg" />
          <Skeleton className="h-6 w-6 rounded-full" />
        </div>
      </div>
    </>
  );
};
