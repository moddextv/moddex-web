'use client';

import { FC, useState, useTransition } from 'react';

import { killClientKey, listClientKeys, mintClientKey } from '@/actions/dashboard';
import { useI18n } from '@/i18n/context';
import type { ClientKeyEntry } from '@/utils/api/moddex/admin';

interface ClientKeysProps {
  keys: ClientKeyEntry[];
}

export const ClientKeys: FC<ClientKeysProps> = ({ keys: initial }) => {
  const { t } = useI18n();
  const [keys, setKeys] = useState(initial);
  const [label, setLabel] = useState('');
  const [login, setLogin] = useState('');
  const [minted, setMinted] = useState<{ prefix: string; key: string } | null>(null);
  const [problem, setProblem] = useState('');
  const [pending, start] = useTransition();

  const reload = async () => {
    const result = await listClientKeys();

    if (result.ok) setKeys(result.data.items);
  };

  const create = () =>
    start(async () => {
      setProblem('');

      const result = await mintClientKey(label.trim(), login.trim() || undefined);

      if (!result.ok) {
        setProblem(t('dash.keys.createFailed'));
        return;
      }

      setMinted({ prefix: result.data.prefix, key: result.data.key });
      setLabel('');
      setLogin('');
      await reload();
    });

  const revoke = (id: number) =>
    start(async () => {
      setProblem('');

      const result = await killClientKey(id);

      if (!result.ok) {
        setProblem(t('dash.keys.revokeFailed'));
        return;
      }

      await reload();
    });

  return (
    <div className="panel">
      <h2 className="text-h2 mb-2">{t('dash.keys.heading')}</h2>
      <p className="text-read text-primary-300 max-w-prose mb-6">{t('dash.keys.blurb')}</p>

      <div className="flex flex-wrap items-end gap-3 mb-6">
        <label className="flex flex-col gap-1">
          <span className="text-ui text-primary-300">{t('dash.keys.label')}</span>
          <input
            className="input"
            value={label}
            maxLength={80}
            onChange={(event) => setLabel(event.target.value)}
            placeholder={t('dash.keys.labelHint')}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-ui text-primary-300">{t('dash.keys.account')}</span>
          <input
            className="input"
            value={login}
            maxLength={25}
            onChange={(event) => setLogin(event.target.value)}
            placeholder={t('dash.keys.accountHint')}
          />
        </label>

        <button className="btn" disabled={pending || !label.trim()} onClick={create}>
          {t('dash.keys.create')}
        </button>
      </div>

      {problem ? <p className="text-ui text-donator mb-4">{problem}</p> : null}

      {minted ? (
        <div className="panel-inset mb-6">
          <p className="text-ui text-primary-100 mb-2">{t('dash.keys.shownOnce')}</p>
          <code className="block break-all text-read tabular">{minted.key}</code>
          <button className="btn btn-soft mt-3" onClick={() => setMinted(null)}>
            {t('dash.keys.hide')}
          </button>
        </div>
      ) : null}

      {keys.length === 0 ? (
        <p className="text-read text-primary-300">{t('dash.keys.none')}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {keys.map((key) => (
            <li
              key={key.id}
              className="flex flex-wrap items-center justify-between gap-3 border-t border-primary-700/70 pt-3"
            >
              <span className="flex flex-col">
                <span className="text-base font-bold">
                  {key.label}
                  {key.login ? <span className="text-primary-300"> · {key.login}</span> : null}
                </span>
                <span className="text-ui text-primary-400 tabular">
                  {key.prefix}… ·{' '}
                  {key.lastUsedAt
                    ? t('dash.keys.lastUsed', { when: t.ago(key.lastUsedAt) })
                    : t('dash.keys.neverUsed')}
                </span>
              </span>

              {key.revokedAt ? (
                <span className="text-ui text-primary-400">
                  {t('dash.keys.revokedAt', { when: t.date(key.revokedAt) })}
                </span>
              ) : (
                <button className="btn btn-soft" disabled={pending} onClick={() => revoke(key.id)}>
                  {t('dash.keys.revoke')}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
