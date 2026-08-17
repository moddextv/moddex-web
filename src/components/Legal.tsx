import { CSSProperties, FC, ReactNode } from 'react';
import Link from 'next/link';
import { Container } from '@/components/UI/Container';
import { OptOutEffect, OptOutReversible } from '@/components/OptOutPromise';
import { config } from '@/config';

export interface Section {
  id: string;
  title: string;
  short: string;
}

export const Para: FC<{ children: ReactNode }> = ({ children }) => (
  <p className="text-read text-primary-300 max-w-prose">{children}</p>
);

export const Inline: FC<{ href: string; children: ReactNode }> = ({ href, children }) => (
  <Link href={href} className="text-primary-100 font-semibold hover:underline">
    {children}
  </Link>
);

export const Ext: FC<{ href: string; children: ReactNode }> = ({ href, children }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="text-primary-100 font-semibold hover:underline"
  >
    {children}
  </a>
);

export const Clause: FC<{ id: string; title: string; children: ReactNode }> = ({
  id,
  title,
  children
}) => (
  <section id={id} className="scroll-mt-20">
    <h2 className="text-h2 mb-3">{title}</h2>
    <div className="flex flex-col gap-4">{children}</div>
  </section>
);

const OptOutPanel: FC = () => (
  <div className="panel">
    <div className="flex items-center gap-3 mb-3">
      <span className="corner corner-tl text-mod" aria-hidden="true" />
      <h2 className="text-h2">You can opt out at any time</h2>
    </div>
    <p className="text-read text-primary-300 max-w-prose mb-6">
      Sign in with Twitch and switch the opt-out on. <OptOutEffect /> <OptOutReversible />
    </p>
    <Link href="/settings" className="btn">
      Go to opt-out settings
    </Link>
  </div>
);

const Sidebar: FC<{ sections: readonly Section[] }> = ({ sections }) => (
  <nav className="hidden xl:block w-56 shrink-0" aria-label="Sections">
    <div className="sticky top-[76px] flex flex-col gap-1">
      <p className="text-meta text-primary-400 mb-2 px-3">On this page</p>
      {sections.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          className="px-3 py-2 rounded-md text-ui text-primary-400 hover:bg-primary-800 hover:text-primary-100 transition-colors"
        >
          {section.short}
        </a>
      ))}
    </div>
  </nav>
);

// /privacy and /tos are the same page with different clauses. Keeping the frame
// here is what stops them drifting apart, which they had done in wording before.
export const LegalPage: FC<{
  title: string;
  sections: readonly Section[];
  children: ReactNode;
}> = ({ title, sections, children }) => (
  <main id="main" className="flex-grow">
    <Container>
      <header className="enter pt-12 pb-8">
        <h1 className="text-h1 mb-3">{title}</h1>
        <p className="text-ui text-primary-400">
          Last updated August 2026. {config.brand.name} is not affiliated with, endorsed by, or
          sponsored by Twitch Interactive, Inc.
        </p>
      </header>

      <div className="enter flex gap-12 pb-4" style={{ '--i': 1 } as CSSProperties}>
        <div className="min-w-0 flex-1 max-w-3xl flex flex-col gap-10">
          <OptOutPanel />
          {children}
        </div>

        <Sidebar sections={sections} />
      </div>
    </Container>
  </main>
);
