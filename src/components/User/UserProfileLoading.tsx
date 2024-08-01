import { Title } from '@/components/UI/Title';
import { Skeleton } from '@nextui-org/react';

export const UserProfileLoading = () => {
  return (
    <div className="mb-12 flex flex-col gap-4 md:gap-8 md:flex-row justify-between overflow-hidden">
      <div className="flex flex-row md:flex-col items-center gap-4">
        <Skeleton className="flex rounded-full w-16 h-16" />
      </div>

      <div className="flex-1 min-w-0">

        <Title className="flex flex-row items-center overflow-hidden">
          <Skeleton className="h-6 w-32 rounded-lg" />
        </Title>
        <Title
          level={3}
          className="text-large mb-2"
        >
          @<Skeleton className="h-6 w-16 rounded-lg" />
        </Title>
        <Skeleton className="h-6 w-6 rounded-full" />
        <div className="overflow-hidden text-ellipsis mt-2 break-all hyphens-auto">
          <Skeleton className="h-12 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  );
};
