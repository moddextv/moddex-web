'use client';

import { FC, useEffect } from 'react';

const CODE = [
  'arrowup',
  'arrowup',
  'arrowdown',
  'arrowdown',
  'arrowleft',
  'arrowright',
  'arrowleft',
  'arrowright',
  'b',
  'a'
];

const PARTY_MS = 6000;

const RAIN = [
  'donator',
  'donator-sky',
  'donator-violet',
  'donator-rose',
  'donator-ember',
  'top-donator',
  'top-donator-onyx',
  'booster',
  'verified',
  'translator',
  'partner',
  'affiliate'
];

// a page with no badge on it still gets some, falling
const rain = () => {
  const sky = document.createElement('div');
  sky.className = 'konami-rain';
  sky.setAttribute('aria-hidden', 'true');

  for (let drop = 0; drop < 30; drop++) {
    const img = document.createElement('img');
    img.src = `/badges/${RAIN[drop % RAIN.length]}/icon.svg`;
    img.alt = '';
    img.style.left = `${Math.random() * 96}vw`;
    img.style.animationDelay = `${Math.random() * 1.6}s`;
    img.style.animationDuration = `${2.2 + Math.random() * 1.8}s`;
    img.style.setProperty('--spin', `${Math.random() * 720 - 360}deg`);
    sky.appendChild(img);
  }

  document.body.appendChild(sky);
  window.setTimeout(() => sky.remove(), PARTY_MS);
};

export const Konami: FC = () => {
  useEffect(() => {
    let at = 0;
    let timer = 0;

    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target?.isContentEditable ||
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName ?? '')
      ) {
        return;
      }

      const key = event.key.toLowerCase();
      // a third up after two is still the start of the code
      at = key === CODE[at] ? at + 1 : key === 'arrowup' ? (at === 2 ? 2 : 1) : 0;

      if (at < CODE.length) return;

      at = 0;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const root = document.documentElement;
      root.classList.add('konami');
      rain();
      window.clearTimeout(timer);
      timer = window.setTimeout(() => root.classList.remove('konami'), PARTY_MS);
    };

    window.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('keydown', onKey);
      window.clearTimeout(timer);
    };
  }, []);

  return null;
};
