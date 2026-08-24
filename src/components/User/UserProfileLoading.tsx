export const UserProfileLoading = () => (
  <div className="profile-head has-bio">
    <span className="profile-avatar skeleton w-16 h-16 sm:w-[88px] sm:h-[88px] rounded-full" />

    <div className="profile-identity min-w-0">
      <span className="skeleton block h-7 w-44 mb-1.5" />
      <span className="skeleton block h-4 w-60" />
    </div>

    <div className="profile-bio">
      <span className="skeleton block h-4 w-full max-w-md mb-2" />
      <span className="skeleton block h-4 w-2/3 max-w-sm" />
    </div>

    <span className="profile-facts skeleton block h-3.5 w-80 max-w-full" />

    <div className="profile-actions flex items-center gap-2">
      <span className="skeleton h-10 w-10 sm:w-[150px]" />
      <span className="skeleton h-10 w-10" />
      <span className="skeleton h-10 w-10" />
    </div>
  </div>
);
