/**
 * the known-bot list.
 *
 * this is curated by hand on purpose. twitch does expose a `verifiedBot` field
 * through ivr, but it came back null for nightbot, fossabot, streamelements and
 * moobot when checked on 2026-08-06 -- so it cannot seed this, and the list is
 * a mix of twitch-verified bots and ones that simply are bots.
 *
 * matched on LOGIN rather than id because that is what a human adding an entry
 * will have. logins can be changed by their owner, so an entry going stale means
 * a bot stops being flagged -- it never mis-flags someone else, because twitch
 * does not release logins for reuse while the account exists.
 *
 * two ways an account gets flagged:
 *   1. it is in this list when `updateUserInDb` writes the row
 *   2. migration 012 applied the list to rows that already existed
 *
 * so adding a name here is not retroactive on its own. re-run the flagging
 * statement at the bottom of 012 after editing, or wait for the user to be
 * refreshed.
 *
 * keep it lowercase and sorted.
 */
export const KNOWN_BOTS: readonly string[] = [
  // chat/moderation platforms
  'botisimo',
  'coebot',
  'deepbot',
  'fossabot',
  'moobot',
  'nightbot',
  'phantombot',
  'streamelements',
  'streamlabs',
  'wizebot',

  // widely deployed community bots
  'anotherttvviewer',
  'commanderroot',
  'pajbot',
  'sery_bot',
  'spanixbot',
  'supibot',
  'thepositivebot',

  // alerts / overlays / integrations
  'blerp',
  'own3d',
  'soundalerts',
  'streamstickers',
  'tangiabot',

  // ours and adjacent
  'modcheckerbot',
  'susgeebot'
] as const;

const BOT_SET = new Set(KNOWN_BOTS);

/** case-insensitive, so a caller can pass a display name without thinking */
export const isKnownBot = (login?: string | null): boolean =>
  !!login && BOT_SET.has(login.toLowerCase());
