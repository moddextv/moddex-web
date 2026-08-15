'use client';

import { CheckIcon, CopyIcon } from '@/components/Icons';
import { FC, useEffect, useState } from 'react';

interface CopyButtonProps {
  value: string;
  label: string;
}

export const CopyButton: FC<CopyButtonProps> = ({ value, label }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;

    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
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
