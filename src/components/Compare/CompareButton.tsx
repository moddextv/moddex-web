'use client';

import { useI18n } from '@/i18n/context';
import { FC, MouseEvent, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SearchBox } from '@/components/Search/SearchBox';

export const CompareButton: FC<{ login: string }> = ({ login }) => {
  const { t, path } = useI18n();
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const node = dialog.current;
    if (!node) return;

    if (open && !node.open) {
      node.showModal();
      input.current?.focus();
    }

    if (!open && node.open) node.close();
  }, [open]);

  const onBackdrop = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === dialog.current) setOpen(false);
  };

  const compare = (other: string) => {
    setOpen(false);
    router.push(path(`/compare/${login}/${other.toLowerCase()}`));
  };

  return (
    <>
      <button type="button" className="btn btn-soft" onClick={() => setOpen(true)}>
        {t('compare.button')}
      </button>

      <dialog
        ref={dialog}
        className="dialog quick-search"
        aria-label={t('compare.pick', { login })}
        onClose={() => setOpen(false)}
        onClick={onBackdrop}
      >
        {open && (
          <div className="p-4">
            <p className="text-ui text-primary-400 mb-3">{t('compare.pick', { login })}</p>
            <SearchBox
              scope="channel"
              inputRef={input}
              label={t('compare.pick', { login })}
              onPick={compare}
            />
          </div>
        )}
      </dialog>
    </>
  );
};
