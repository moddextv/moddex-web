import Script from 'next/script';

const WEBSITE_ID = '38abf42b-d80e-4088-a7c6-19c738629594';

export const Insights = () => (
  <Script
    src="/insights/script.js"
    data-website-id={WEBSITE_ID}
    data-exclude-search="true"
    strategy="afterInteractive"
  />
);
