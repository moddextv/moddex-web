'use client';

import { useI18n } from '@/i18n/context';
import { FC, FormEvent, useState } from 'react';
import clsx from 'clsx';
import { startCheckout } from '@/actions/checkout';
import { useAction } from '@/hooks/useAction';
import { Mark } from '@/components/UI/Mark';
import { BadgePreview } from '@/components/BadgePreview';
import { MAX_CENTS, MIN_CENTS, Tier, isAmount, tierFor, wholeDollars } from '@/misc/donationTiers';

interface DonateFormProps {
  tiers: Tier[];
  login: string | null;
}

export const DonateForm: FC<DonateFormProps> = ({ tiers, login }) => {
  const { t, locale } = useI18n();
  const [choice, setChoice] = useState<string>(tiers[0]?.key ?? 'custom');
  const [custom, setCustom] = useState('');

  const checkout = useAction(startCheckout, {
    onSuccess: ({ url }) => window.location.assign(url)
  });

  const picked = tiers.find((tier) => tier.key === choice) ?? null;
  const typed = Math.round(Number(custom.replace(',', '.')) * 100) || 0;
  const cents = picked ? picked.cents : typed;
  const valid = isAmount(cents);
  const unlocked = picked ?? tierFor(tiers, cents);
  const base = tiers[0];

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!valid) return;

    void checkout.run(locale, cents);
  };

  const short = (value: number) => wholeDollars(t.money(value, 'USD'));
  const amount = short(cents).split('$');

  return (
    <div className="grid items-center gap-10 md:grid-cols-2 max-w-4xl mx-auto">
      <BadgePreview
        badges={unlocked?.badges ?? []}
        locked={base?.badges[0] ?? null}
        startsAt={unlocked?.cents ?? base?.cents ?? 0}
        top={unlocked?.key === 'top'}
        login={login}
      />

      <form onSubmit={handleSubmit} className="panel">
        <p className="flex items-baseline justify-center gap-1 mb-6">
          <span key={cents} className="tip-amount text-[3rem] font-extrabold leading-none tabular">
            {amount.map((part, index) => (
              <span key={index}>
                {index > 0 && <span className="text-mod">$</span>}
                {part}
              </span>
            ))}
          </span>
          <span className="text-meta text-primary-400 ml-2">{t('donate.oneTime')}</span>
        </p>

        <fieldset disabled={checkout.pending} className="mb-5">
          <legend className="sr-only">{t('donate.chooseAmount')}</legend>
          <div className="grid grid-cols-5 gap-1.5">
            {[...tiers.map((tier) => tier.key), 'custom'].map((key) => {
              const tier = tiers.find((one) => one.key === key);

              return (
                <label
                  key={key}
                  className={clsx('option justify-center px-0', choice === key && 'is-active')}
                >
                  <input
                    type="radio"
                    name="amount"
                    value={key}
                    checked={choice === key}
                    onChange={() => setChoice(key)}
                    className="sr-only"
                  />
                  <span className="text-ui font-bold tabular">
                    {key === 'custom'
                      ? t('donate.custom')
                      : key === 'top'
                        ? t('donate.top')
                        : short(tier!.cents)}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {choice === 'custom' && (
          <label className="block mb-5">
            <span className="sr-only">{t('donate.customLabel')}</span>
            <span className="search is-compact">
              <span aria-hidden="true" className="text-lead text-primary-400">
                $
              </span>
              <input
                type="number"
                inputMode="decimal"
                min={MIN_CENTS / 100}
                max={MAX_CENTS / 100}
                step="0.01"
                placeholder={t('donate.customLabel')}
                value={custom}
                onChange={(event) => setCustom(event.target.value)}
                className="text-lead tabular"
                autoFocus
              />
            </span>
            {custom && !valid && (
              <span className="block text-ui text-vip mt-2">
                {t('donate.tooSmall', { amount: t.money(MIN_CENTS, 'USD') })}
              </span>
            )}
          </label>
        )}

        <button
          type="submit"
          disabled={!valid || checkout.pending}
          className="btn w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {checkout.pending ? (
            <>
              <Mark size={15} className="animate-pulse" />
              {t('donate.opening')}
            </>
          ) : (
            t('donate.continue')
          )}
        </button>

        {checkout.error && <p className="text-ui text-vip mt-3">{t('donate.stripeUnreachable')}</p>}

        <p className="text-ui text-primary-400 text-center mt-4">
          {login ? t('donate.signedIn', { login }) : t('donate.signedOut')}
        </p>
      </form>
    </div>
  );
};
