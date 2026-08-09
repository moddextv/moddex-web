'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    _mtm: Array<{ 'mtm.startTime': number; event: string }>;
  }
}

export default function Tracking() {
  useEffect(() => {
    window._mtm = window._mtm || [];
    window._mtm.push({ 'mtm.startTime': new Date().getTime(), event: 'mtm.Start' });

    const matomoScript = document.createElement('script');
    matomoScript.async = true;
    matomoScript.src = 'https://analytics.maersux.dev/js/container_OuUrFD1r.js';
    const firstScript = document.getElementsByTagName('script')[0];
    firstScript?.parentNode?.insertBefore(matomoScript, firstScript);
  }, []);

  return null;
}
