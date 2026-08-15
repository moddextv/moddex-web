import { Container } from '@/components/UI/Container';
import { Image } from '@/components/UI/Image';
import { TwitchIcon } from '@/components/Icons';
import { ROLES, ROLE_KEYS, ACTIVE_ROLE_KEYS, roleCornerClass, roleTextClass } from '@/misc/roles';
import { Metadata } from 'next';
import { FC, ReactNode } from 'react';
import clsx from 'clsx';

export const metadata: Metadata = {
  alternates: { canonical: '/design' },
  title: 'Components',
  robots: { index: false, follow: false }
};

const Section: FC<{ title: string; children: ReactNode; blurb?: string }> = ({
  title,
  blurb,
  children
}) => (
  <section className="panel">
    <h2 className="text-h2 mb-2">{title}</h2>
    {blurb && <p className="text-read text-primary-300 max-w-prose mb-6">{blurb}</p>}
    {children}
  </section>
);

const Swatch: FC<{ token: string; label: string; outlined?: boolean }> = ({
  token,
  label,
  outlined
}) => (
  <div>
    <div
      className={clsx('h-14 rounded-md', outlined && 'border border-primary-700')}
      style={{ background: `rgb(var(${token}))` }}
    />
    <p className="text-micro text-primary-400 mt-2">{label}</p>
    <p className="text-micro text-primary-400 tabular">{token}</p>
  </div>
);

const Specimen: FC<{ caption: string; children: ReactNode }> = ({ caption, children }) => (
  <div className="flex flex-col gap-3">
    {children}
    <span className="text-micro text-primary-400">{caption}</span>
  </div>
);

const TYPE = [
  { cls: 'text-display', name: 'display', spec: 'clamp(2rem, 3.6vw, 2.75rem)' },
  { cls: 'text-h1', name: 'h1', spec: '28px / 1.25' },
  { cls: 'text-h2', name: 'h2', spec: '22px / 1.3' },
  { cls: 'text-h3', name: 'h3', spec: '18px / 1.35' },
  { cls: 'text-lead', name: 'lead', spec: '18px / 1.6' },
  { cls: 'text-read', name: 'read', spec: '16px / 1.65' },
  { cls: 'text-base', name: 'base', spec: '15px / 1.6' },
  { cls: 'text-ui', name: 'ui', spec: '14px / 1.5' },
  { cls: 'text-meta', name: 'meta', spec: '13px / 1.5' },
  { cls: 'text-micro', name: 'micro', spec: '12px / 1.45' }
];

const MOTION = [
  ['hover', '150ms, background and the name underline'],
  ['section entry', '320ms fade and 8px rise, staggered 50ms, capped at 250ms'],
  ['loading', '1.3s sweep, transform only'],
  ['press', '1px down on the primary button'],
  ['reduced motion', 'all of it stops']
];

const BADGES = ['affiliate', 'partner', 'staff', 'donator', 'top_donator', 'admin', 'bot'];

export default function DesignPage() {
  return (
    <main id="main" className="flex-grow">
      <Container>
        <div className="flex flex-col gap-6 py-12">
          <header className="mb-2">
            <p className="text-ui text-primary-400 mb-4">Design system</p>
            <h1 className="text-h1 mb-3">Components</h1>
            <p className="text-lead text-primary-300 max-w-prose">
              Every primitive, with the verdict it answers. Check a new component against this page
              before adding it. Four earlier directions were tried and rejected on the way here, and
              most obvious improvements are one of them.
            </p>
          </header>

          <Section
            title="Type"
            blurb="Manrope, one file, 200 to 800 interpolated. 15px base, not 13: the rejected attempt set everything at 13px and it read as clamped."
          >
            <div className="flex flex-col gap-4">
              {TYPE.map((entry) => (
                <div key={entry.name} className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
                  <span className="text-micro text-primary-400 w-16 shrink-0">{entry.name}</span>
                  <span className={clsx(entry.cls, 'min-w-0')}>Every mod list on Twitch</span>
                  <span className="text-micro text-primary-400 tabular ml-auto">{entry.spec}</span>
                </div>
              ))}
            </div>
          </Section>

          <section className="panel-flush">
            <div className="px-4 pb-5">
              <h2 className="text-h2 mb-2">Rows</h2>
              <p className="text-read text-primary-300 max-w-prose">
                Not a table. A CSS grid on a shared column template, hover, and nothing between rows
                but air. Column labels sit light and unboxed above the first row, so the numbers on
                the right are still explained without the thing reading as a spreadsheet. 52px,
                which is the fix for &quot;clamped&quot;.
              </p>
            </div>

            <div className="rows">
              <div className="row-head cols-people">
                <span>Account</span>
                <span className="text-right">Granted</span>
                <span className="text-right">Followers</span>
              </div>

              <a href="#main" className="row cols-people">
                <span className="flex items-center gap-3.5 min-w-0">
                  <span className="avatar w-9 h-9 text-meta" aria-hidden="true">
                    n
                  </span>
                  <span className="row-name text-base font-bold truncate">nymn</span>
                </span>
                <span className="text-ui text-primary-300 tabular text-right">Apr 2016</span>
                <span className="text-ui text-primary-400 tabular text-right">614,201</span>
              </a>

              <a href="#main" className="row cols-people">
                <span className="flex items-center gap-3.5 min-w-0">
                  <span className="avatar w-9 h-9 text-meta" aria-hidden="true">
                    s
                  </span>
                  <span className="flex items-center gap-2 min-w-0">
                    <span className="row-name text-base font-bold truncate">supibot</span>
                    <Image
                      src="/badges/bot.svg"
                      alt="bot"
                      title="bot"
                      width={18}
                      height={18}
                      radius="none"
                      className="shrink-0"
                    />
                  </span>
                </span>
                <span className="text-ui text-primary-300 tabular text-right">Nov 2019</span>
                <span className="text-ui text-primary-400 tabular text-right">1,204</span>
              </a>

              <a href="#main" className="row cols-people">
                <span className="flex items-center gap-3.5 min-w-0">
                  <span className="avatar w-9 h-9 text-meta" aria-hidden="true">
                    e
                  </span>
                  <span className="row-name text-base font-bold truncate">elis</span>
                </span>
                <span
                  className="text-ui text-primary-400 text-right"
                  title="Twitch returned no grant date"
                >
                  no date
                </span>
                <span className="text-ui text-primary-400 tabular text-right">8,910</span>
              </a>

              <div className="row cols-people">
                <span className="flex items-center gap-3.5 min-w-0">
                  <span className="skeleton w-9 h-9 rounded-full" />
                  <span className="skeleton h-4 w-24" />
                </span>
                <span className="skeleton h-3.5 w-16 justify-self-end" />
                <span className="skeleton h-3.5 w-14 justify-self-end" />
              </div>
            </div>
          </section>

          <Section
            title="Color"
            blurb="One ramp, read from both ends: 900 is the canvas and 100 is the brightest text in both themes, and the light theme restates the ten ramp entries rather than a second palette. These swatches read the live custom properties, so switching the theme in the header switches them too. Purple is not the primary action color: it appears filled once per page at most, on the control that signs you into Twitch. The accent doing identity work is the mark's own pair."
          >
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
              <Swatch token="--primary-900" label="900 base" outlined />
              <Swatch token="--primary-800" label="800 panel" outlined />
              <Swatch token="--primary-700" label="700 line" />
              <Swatch token="--primary-400" label="400 alt text" />
              <Swatch token="--primary-100" label="100 text" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {ROLE_KEYS.map((key) => (
                <Swatch
                  key={key}
                  token={`--${ROLES[key].tailwind}-rgb`}
                  label={ACTIVE_ROLE_KEYS.includes(key) ? key : `${key}, not yet used`}
                />
              ))}
              <Swatch token="--twitch-rgb" label="twitch, sign-in only" />
            </div>
          </Section>

          <Section
            title="The mark, at UI scale"
            blurb="Two corners a hundred and eighty degrees apart. Mod takes the top-left, vip the bottom-right, founder the bottom-left, artist the top-right. This is the notation that replaced purple as the thing carrying identity: every section heading, every tab and every scope switch is marked with it."
          >
            <div className="flex flex-wrap items-center gap-x-10 gap-y-5 mb-6">
              {ROLE_KEYS.map((key) => (
                <span key={key} className="flex items-center gap-3">
                  <span className={clsx('corner', roleCornerClass[key], roleTextClass[key])} />
                  <span className="text-ui text-primary-300">{ROLES[key].channelLabel}</span>
                </span>
              ))}
              <span className="flex items-center gap-3">
                <span className="corner corner-tl text-primary-600" />
                <span className="text-ui text-primary-400">inactive</span>
              </span>
            </div>

            <div className="rounded-md bg-primary-900 p-4 max-w-prose">
              <p className="text-ui text-primary-300 leading-relaxed">
                <span className="text-artist font-bold">Artist</span> is declared in{' '}
                <span className="text-primary-100">misc/roles.ts</span> with its own color and
                corner, but it is not in <span className="text-primary-100">ACTIVE_ROLE_KEYS</span>:
                Twitch doesn&apos;t expose artists through the public unauthenticated surface, so
                nothing renders it today. It&apos;s here so the system already has an answer when
                that changes.
              </p>
            </div>
          </Section>

          <Section title="Controls">
            <div className="flex flex-wrap items-start gap-8 mb-8">
              <Specimen caption="primary">
                <button type="button" className="btn">
                  Index a channel
                </button>
              </Specimen>
              <Specimen caption="soft">
                <button type="button" className="btn btn-soft">
                  Show 18 more
                </button>
              </Specimen>
              <Specimen caption="ghost">
                <button type="button" className="btn btn-ghost">
                  Donate
                </button>
              </Specimen>
              <Specimen caption="twitch, quiet">
                <button type="button" className="btn btn-twitch-quiet">
                  <TwitchIcon size={15} />
                  Open on Twitch
                </button>
              </Specimen>
              <Specimen caption="once per page, at most">
                <button type="button" className="btn btn-twitch">
                  <TwitchIcon size={15} color="text-white" />
                  Sign in
                </button>
              </Specimen>
            </div>

            <div className="flex flex-wrap items-start gap-8">
              <Specimen caption="chips, for filters and sorts">
                <span className="flex gap-2">
                  <button type="button" className="chip" aria-pressed="true">
                    Recently read
                  </button>
                  <button type="button" className="chip" aria-pressed="false">
                    Most roles
                  </button>
                </span>
              </Specimen>
              <Specimen caption="toggle, mod green when on">
                <span className="toggle" data-on="true">
                  <span />
                </span>
              </Specimen>
              <Specimen caption="tabs, underlined in the role color">
                <nav className="tabs">
                  <span className="tab tab-mod" aria-current="page">
                    <span className="corner corner-tl text-mod" />
                    As a channel
                  </span>
                  <span className="tab tab-vip">
                    <span className="corner corner-br text-primary-600" />
                    As a person
                  </span>
                </nav>
              </Specimen>
            </div>
          </Section>

          <Section
            title="Badges"
            blurb="Awarded, not decorative. 18px beside a name in a row, 24px on a profile. Drawn by scripts/build-badges.mjs from one description, so this row is the generated set rather than a copy of it; run npm run badges:check before trusting a file in public/badges."
          >
            <div className="flex flex-wrap items-center gap-5">
              {BADGES.map((badge) => (
                <Image
                  key={badge}
                  src={`/badges/${badge}.svg`}
                  alt={badge.replace('_', ' ')}
                  title={badge.replace('_', ' ')}
                  width={32}
                  height={32}
                  radius="sm"
                />
              ))}
            </div>
          </Section>

          <section className="panel-flush">
            <h2 className="text-h2 px-4 pb-5">Motion</h2>
            <div className="rows">
              {MOTION.map(([name, spec]) => (
                <div
                  key={name}
                  className="row"
                  style={{
                    gridTemplateColumns: '220px minmax(0, 1fr)',
                    minHeight: '44px'
                  }}
                >
                  <span className="text-ui text-primary-400">{name}</span>
                  <span className="text-ui text-primary-300">{spec}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </Container>
    </main>
  );
}
