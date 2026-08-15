export const UserProfileLoading = () => (
  <div className="flex flex-wrap items-start gap-6">
    <span className="skeleton w-[88px] h-[88px] rounded-full" />

    <div className="min-w-0 flex-1">
      <span className="skeleton block h-7 w-44 mb-1.5" />
      <span className="skeleton block h-4 w-60 mb-3" />
      <span className="skeleton block h-4 w-full max-w-md mb-2" />
      <span className="skeleton block h-4 w-2/3 max-w-sm mb-4" />
      <span className="skeleton block h-3.5 w-80 max-w-full" />
    </div>

    <div className="flex items-center gap-2 shrink-0">
      <span className="skeleton h-10 w-[150px]" />
      <span className="skeleton h-10 w-10" />
      <span className="skeleton h-10 w-10" />
    </div>
  </div>
);
