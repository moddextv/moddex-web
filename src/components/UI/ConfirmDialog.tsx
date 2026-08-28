'use client';

import { FC, MouseEvent, ReactNode, useEffect, useId, useRef } from 'react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  body: ReactNode;
  confirm: string;
  cancel: string;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Carries no words of its own: every label is passed in, so it stays translatable. */
export const ConfirmDialog: FC<ConfirmDialogProps> = ({
  open,
  title,
  body,
  confirm,
  cancel,
  pending = false,
  onConfirm,
  onCancel
}) => {
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useId();

  useEffect(() => {
    const node = dialog.current;

    if (!node) return;
    if (open && !node.open) node.showModal();
    if (!open && node.open) node.close();
  }, [open]);

  // a click on the backdrop reports the dialog itself as its target
  const onBackdrop = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === dialog.current && !pending) onCancel();
  };

  return (
    <dialog
      ref={dialog}
      className="dialog"
      aria-labelledby={heading}
      onClose={onCancel}
      onClick={onBackdrop}
    >
      {open ? (
        <div className="p-6">
          <h2 id={heading} className="text-h2 mb-2">
            {title}
          </h2>

          <div className="text-read text-primary-300">{body}</div>

          <div className="flex justify-end gap-3 mt-5">
            <button className="btn btn-ghost" disabled={pending} onClick={onCancel}>
              {cancel}
            </button>

            <button className="btn" disabled={pending} onClick={onConfirm}>
              {confirm}
            </button>
          </div>
        </div>
      ) : null}
    </dialog>
  );
};
