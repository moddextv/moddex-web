import { Locale, localePath } from '@/i18n/locales';
import { getTranslator } from '@/i18n/dictionary';
import { Avatar } from '@/components/UI/Avatar';
import type { RoleUser } from '@/misc/account';
import type { Role } from '@/utils/api/moddex/public';
import Link from 'next/link';
import clsx from 'clsx';
import { CSSProperties, FC } from 'react';

export interface CareerStep {
  role: Role;
  at: string;
  channel: RoleUser;
}

// up to this many steps every one gets a row; past it, a year is one line
const DETAILED = 8;
const FACES = 6;

const TONE: Record<Role, { corner: string; tone: string }> = {
  mods: { corner: 'corner-tl', tone: 'text-mod' },
  vips: { corner: 'corner-br', tone: 'text-vip' },
  founders: { corner: 'corner-bl', tone: 'text-founder' }
};

const byYear = (steps: CareerStep[]) =>
  steps.reduce<[string, CareerStep[]][]>((years, step) => {
    const year = step.at.slice(0, 4);
    const last = years.at(-1);

    if (last?.[0] === year) last[1].push(step);
    else years.push([year, [step]]);

    return years;
  }, []);

export const careerFrom = (pages: Partial<Record<Role, RoleUser[]>>): CareerStep[] =>
  (Object.entries(pages) as [Role, RoleUser[]][])
    .flatMap(([role, items]) =>
      items
        .filter((channel) => channel.grantedAt)
        .map((channel) => ({ role, at: channel.grantedAt!, channel }))
    )
    .sort((a, b) => a.at.localeCompare(b.at));

const Years: FC<{ steps: CareerStep[]; locale: Locale; offset: number }> = ({
  steps,
  locale,
  offset
}) => {
  const t = getTranslator(locale);

  return byYear(steps).map(([year, entries]) => (
    <div key={year} className="career-year">
      <p className="career-year-label text-meta text-primary-400 tabular">{year}</p>
      <ol>
        {entries.map((step, index) => (
          <li
            key={`${step.role}-${step.channel.id}`}
            className="career-step"
            style={{ '--i': Math.min(offset + index, 14) } as CSSProperties}
          >
            <span className={clsx('career-dot', TONE[step.role].tone)} aria-hidden="true" />
            <Link
              href={localePath(locale, `/channel/${step.channel.login}`)}
              className="flex items-center gap-2.5 min-w-0"
            >
              <Avatar
                src={step.channel.avatar}
                name={step.channel.name || step.channel.login}
                size={24}
                className="w-6 h-6 shrink-0"
              />
              <span className="text-base font-bold truncate">
                {step.channel.name || step.channel.login}
              </span>
            </Link>
            <span className={clsx('text-ui shrink-0', TONE[step.role].tone)}>
              {t(`career.became.${step.role}`)}
            </span>
            <span className="text-ui text-primary-400 tabular shrink-0 ml-auto">
              {t.date(step.at)}
            </span>
          </li>
        ))}
      </ol>
    </div>
  ));
};

export const CareerTimeline: FC<{ steps: CareerStep[]; capped: boolean; locale: Locale }> = ({
  steps,
  capped,
  locale
}) => {
  const t = getTranslator(locale);

  if (steps.length < 2) return null;

  const first = steps[0]!;

  return (
    <div className="panel mt-6">
      <div className="flex items-baseline gap-3 flex-wrap mb-5">
        <h2 className="text-h2">{t('career.title')}</h2>
        <span className="text-ui text-primary-400">
          {t('career.since', { date: t.monthYear(first.at) })}
        </span>
      </div>

      <div className="career">
        {steps.length <= DETAILED ? (
          <Years steps={steps} locale={locale} offset={0} />
        ) : (
          byYear(steps).map(([year, entries], index) => (
            <YearLine key={year} year={year} steps={entries} index={index} locale={locale} />
          ))
        )}
      </div>

      {capped && <p className="text-ui text-primary-400 mt-4">{t('career.capped')}</p>}
    </div>
  );
};

// a long career is one line a year; the year opens to its own rows
const YearLine: FC<{ year: string; steps: CareerStep[]; index: number; locale: Locale }> = ({
  year,
  steps,
  index,
  locale
}) => {
  const t = getTranslator(locale);
  const biggest = [...steps]
    .sort((a, b) => (b.channel.followers ?? 0) - (a.channel.followers ?? 0))
    .slice(0, FACES);
  const tally = (Object.keys(TONE) as Role[])
    .map((role) => [role, steps.filter((step) => step.role === role).length] as const)
    .filter(([, count]) => count > 0);

  return (
    <details className="career-line" style={{ '--i': index } as CSSProperties}>
      <summary>
        <span className="career-dot text-primary-300" aria-hidden="true" />
        <span className="text-base font-bold tabular w-12 shrink-0">{year}</span>
        <span className="flex items-center gap-3 flex-wrap text-ui">
          {tally.map(([role, count]) => (
            <span key={role} className={TONE[role].tone}>
              {t(`career.count.${role}`, { count, n: t.number(count) })}
            </span>
          ))}
        </span>
        <span className="career-faces ml-auto" aria-hidden="true">
          {biggest.map((step) => (
            <Avatar
              key={`${step.role}-${step.channel.id}`}
              src={step.channel.avatar}
              name={step.channel.name || step.channel.login}
              size={24}
              className="w-6 h-6"
            />
          ))}
          {steps.length > FACES && (
            <span className="text-micro text-primary-400 tabular pl-2">
              +{t.number(steps.length - FACES)}
            </span>
          )}
        </span>
      </summary>

      <div className="career-line-body">
        <Years steps={steps} locale={locale} offset={0} />
      </div>
    </details>
  );
};
