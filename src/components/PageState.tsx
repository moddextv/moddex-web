'use client';

import { Container } from '@/components/UI/Container';
import { ReloadIcon } from '@/components/Icons';
import { FC, ReactNode } from 'react';

export const StatePage: FC<{ children: ReactNode }> = ({ children }) => (
  <main id="main" className="flex-grow">
    <Container>
      <section className="enter pt-16 pb-10 max-w-2xl">{children}</section>
    </Container>
  </main>
);

export const Facts: FC<{ rows: { label: string; value: ReactNode }[] }> = ({ rows }) => (
  <div className="panel-flush mb-8">
    <div className="rows">
      {rows.map((row) => (
        <div key={row.label} className="row" style={{ gridTemplateColumns: 'minmax(0, 1fr) auto' }}>
          <span className="text-base text-primary-300">{row.label}</span>
          <span className="text-ui text-primary-400">{row.value}</span>
        </div>
      ))}
    </div>
  </div>
);

export const Good: FC<{ children: ReactNode }> = ({ children }) => (
  <span className="text-ui text-mod font-semibold">{children}</span>
);

export const Status: FC<{ code: number; children?: ReactNode }> = ({ code, children }) => (
  <>
    HTTP <span className="text-vip font-semibold tabular">{code}</span>.
    {children ? ` ${children}` : ''}
  </>
);

export const ReloadButton: FC<{ children: ReactNode }> = ({ children }) => (
  <button type="button" className="btn" onClick={() => window.location.reload()}>
    <ReloadIcon size={15} />
    {children}
  </button>
);
