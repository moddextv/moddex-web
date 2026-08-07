'use client';

import { FC, useState } from 'react';
import { setIgnoredUser } from '@/actions/userIgnoreState';

interface OptOutProps {
  initialIsIgnored: boolean;
}

/**
 * the opt-out switch.
 *
 * this was heroui's <Switch>, which needed three class overrides to stop
 * rendering its checked state in the neutral grey ramp. `.toggle` is the same
 * control in pure css and it is mod green when on, because green is this
 * design's affirmative.
 *
 * a <button role="switch"> rather than the comp's <span>: a span cannot be
 * tabbed to or operated with the keyboard, and this is the one control on the
 * site that changes what other people can see about you.
 *
 * the confirmation line is deliberate. the setting saves immediately, so
 * without it the only feedback is the knob moving, which is indistinguishable
 * from a control that did nothing.
 */
export const OptOut: FC<OptOutProps> = ({ initialIsIgnored }) => {
  const [isIgnored, setIsIgnored] = useState(initialIsIgnored);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [failed, setFailed] = useState(false);

  const toggle = async () => {
    const next = !isIgnored;

    setLoading(true);
    setFailed(false);

    try {
      await setIgnoredUser(next);
      setIsIgnored(next);
      setSaved(true);
    } catch {
      // the switch stays where it was: showing it flipped after a failed write
      // would claim a privacy change that did not happen.
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-6 sm:justify-between">
      <div className="max-w-prose">
        <p className="text-base font-bold mb-2">Opt out of the index</p>
        <p className="text-read text-primary-300 leading-relaxed">
          Your profile stops being served, you are removed from every mod and vip
          list, and you disappear from the public api. Channels you moderate are
          unaffected; only your own entry goes. The opt-out is reversible:
          switching it back off restores your entry.
        </p>

        {saved && !failed && (
          <p className="flex items-center gap-3 text-read text-primary-200 mt-4">
            <span className="corner corner-tl text-mod" aria-hidden="true" />
            {isIgnored
              ? 'Saved. Your entry is hidden.'
              : 'Saved. Your entry is listed again.'}
          </p>
        )}

        {failed && (
          <p className="text-read text-vip mt-4">
            That did not save, so nothing changed. Try again in a moment.
          </p>
        )}
      </div>

      <label className="flex items-center gap-3.5 shrink-0 cursor-pointer">
        <span className={isIgnored ? 'text-ui text-primary-200' : 'text-ui text-primary-400'}>
          {isIgnored ? 'Hidden' : 'Listed'}
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={isIgnored}
          aria-label="Opt out of the index"
          data-on={isIgnored}
          disabled={loading}
          onClick={toggle}
          className="toggle cursor-pointer disabled:opacity-60"
        >
          <span />
        </button>
      </label>
    </div>
  );
};
