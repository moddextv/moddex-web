'use client';

import { FC, useRef, useState, useTransition } from 'react';

import { CopyButton } from '@/components/UI/CopyButton';
import { killClientKey, listClientKeys, mintClientKey } from '@/actions/dashboard';
import { useI18n } from '@/i18n/context';
import type { ClientKeyEntry } from '@/utils/api/moddex/admin';

const ENTER = 'Enter';

interface ClientKeysProps {
  keys: ClientKeyEntry[];
}

export const ClientKeys: FC<ClientKeysProps> = ({ keys: initial }) => {
  const { t } = useI18n();
  const [keys, setKeys] = useState(initial);
  const [label, setLabel] = useState('');
  const [minted, setMinted] = useState<string | null>(null);
  const [problem, setProblem] = useState('');
  const [pending, start] = useTransition();
  const secret = useRef<HTMLElement>(null);

  const reload = async () => {
    const result = await listClientKeys();

    if (result.ok) setKeys(result.data.items);
  };

  const create = () =>
    start(async () => {
      setProblem('');

      const result = await mintClientKey(label.trim());

      if (!result.ok) return setProblem(t('dash.keys.createFailed'));

      setMinted(result.data.key);
      setLabel('');
      await reload();
    });

  const revoke = (id: number) =>
    start(async () => {
      setProblem('');

      const result = await killClientKey(id);

      if (!result.ok) return setProblem(t('dash.keys.revokeFailed'));

      await reload();
    });

  const submitOnEnter = (event: { key: string }) => {
    if (event.key === ENTER && label.trim()) create();
  };

  // one click selects the whole key, because half a key looks like a whole one
  const selectAll = () => {
    if (!secret.current) return;

    const range = document.createRange();
    range.selectNodeContents(secret.current);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  };

  return (
    <div className="panel">
      <h2 className="text-h2 mb-2">{t('dash.keys.heading')}</h2>
      <p className="text-read text-primary-300 max-w-prose mb-6">{t('dash.keys.blurb')}</p>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <label className="search flex-1 sm:max-w-md">
          <input
            value={label}
            maxLength={80}
            onChange={(event) => setLabel(event.target.value)}
            onKeyDown={submitOnEnter}
            placeholder={t('dash.keys.labelHint')}
            aria-label={t('dash.keys.label')}
            autoComplete="off"
          />
        </label>

        <button className="btn" disabled={pending || !label.trim()} onClick={create}>
          {t('dash.keys.create')}
        </button>
      </div>

      {problem ? <p className="text-ui text-donator mb-4">{problem}</p> : null}

      {minted ? (
        <div className="rounded-lg border border-mod/40 bg-mod/5 p-4 mb-6">
          <div className="flex items-start justify-between gap-3 mb-3">
            <p className="text-ui text-primary-100">{t('dash.keys.shownOnce')}</p>

            <button className="btn btn-ghost shrink-0 -mt-2 -mr-2" onClick={() => setMinted(null)}>
              {t('dash.keys.hide')}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <pre className="flex-1 min-w-0 overflow-x-auto rounded-md border border-primary-700/70 bg-primary-900/60 px-3 py-2">
              <code
                ref={secret}
                onClick={selectAll}
                className="text-read tabular cursor-pointer select-all whitespace-nowrap"
              >
                {minted}
              </code>
            </pre>

            <CopyButton value={minted} label={t('dash.keys.copy')} />
          </div>
        </div>
      ) : null}

      {keys.length === 0 ? (
        <p className="text-read text-primary-300">{t('dash.keys.none')}</p>
      ) : (
        <ul className="flex flex-col">
          {keys.map((key) => (
            <li
              key={key.id}
              className="flex flex-wrap items-center justify-between gap-3 border-t border-primary-700/70 py-3"
            >
              <span className="flex flex-col min-w-0">
                <span className="text-base font-bold truncate">{key.label}</span>
                <span className="text-ui text-primary-400 tabular">
                  {key.prefix}… ·{' '}
                  {key.lastUsedAt
                    ? t('dash.keys.lastUsed', { when: t.ago(key.lastUsedAt) })
                    : t('dash.keys.neverUsed')}
                </span>
              </span>

              <button className="btn btn-ghost" disabled={pending} onClick={() => revoke(key.id)}>
                {t('dash.keys.revoke')}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
