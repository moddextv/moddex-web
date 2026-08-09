'use client';

import { CheckIcon, CopyIcon } from '@/components/Icons';
import { FC, useEffect, useState } from 'react';

interface CopyButtonProps {
  value: string;
  label: string;
}

/**
 * replaces heroui's <Snippet>, which rendered a whole code-block component and
 * a tooltip in order to be one 40px square. this is the same thing in fifteen
 * lines and with no dependency.
 *
 * the confirmation is the icon swapping to a tick for two seconds rather than a
 * tooltip: a tooltip that appears on click and not on hover is a message
 * pretending to be a label.
 */
export const CopyButton: FC<CopyButtonProps> = ({ value, label }) => {
  const [copied, setCopied] = useState(false);

  // cleared on unmount as well as on the timer, so navigating away mid-timeout
  // does not set state on a gone component.
  useEffect(() => {
    if (!copied) return;

    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    // navigator.clipboard is undefined outside a secure context, so this has to
    // fail quietly rather than throw an unhandled rejection at the reader.
    try {
      await navigator.clipboard?.writeText(value);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      title={`${label}: ${value}`}
      aria-label={label}
      className="btn btn-soft w-10 p-0"
    >
      {copied ? <CheckIcon size={16} color="text-mod" /> : <CopyIcon size={16} />}
    </button>
  );
};
