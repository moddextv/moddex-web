/**
 * matches the real profile geometry — 88px avatar, three text lines, three
 * controls — so nothing moves when the data lands. the tabs are not in here on
 * purpose: they are already known before the fetch, so UserProfile keeps
 * drawing the real ones around this.
 */
export const UserProfileLoading = () => (
  <div className="flex flex-wrap items-start gap-6">
    <span className="skeleton w-[88px] h-[88px] rounded-pill" />

    <div className="min-w-0 flex-1">
      <span className="skeleton block h-7 w-44 mb-3" />
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
