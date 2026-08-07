/**
 * v1 shared chrome: header, footer, page switcher.
 *
 * Why this is generated rather than duplicated the way ../../*.html duplicates
 * it: those comps document ONE design, so a self-contained file per page is
 * worth the repetition. These two folders exist to be compared against each
 * other, so every byte that is identical across 17 pages is noise in that
 * comparison. Each page file here holds its <main> and nothing else, which is
 * exactly the part that differs.
 *
 * Pages declare their state on <body>:
 *   data-nav="channel|user|donate|api"   which nav item carries the tick
 *   data-auth="in|out"                   avatar or the twitch button
 *   data-chrome="bare"                   reference pages, minimal header
 */
const PAGES = [
  {
    group: 'public',
    items: [
      { file: 'home.html', route: '/', title: 'home' },
      { file: 'channel.html', route: '/channel', title: 'channel search' },
      { file: 'channel-detail.html', route: '/channel/[username]', title: 'channel detail' },
      { file: 'user.html', route: '/user', title: 'user search' },
      { file: 'user-detail.html', route: '/user/[username]', title: 'user detail' },
      { file: 'detail-loading.html', route: '/channel/[username]', title: 'detail loading' },
      { file: 'donate.html', route: '/donate', title: 'donate' },
      { file: 'donate-success.html', route: '/donate/success', title: 'donate success' },
      { file: 'tos.html', route: '/tos', title: 'terms of service' }
    ]
  },
  {
    group: 'authenticated',
    items: [
      { file: 'login.html', route: 'auth gate', title: 'login required' },
      { file: 'settings.html', route: '/settings', title: 'settings' },
      { file: 'dashboard.html', route: '/dashboard', title: 'dashboard' }
    ]
  },
  {
    group: 'error states',
    items: [
      { file: 'error-404.html', route: 'not-found', title: '404 not found' },
      { file: 'error-403.html', route: 'any lookup', title: '403 forbidden' },
      { file: 'error-400.html', route: '/donate/success', title: '400 bad request' },
      { file: 'error-500.html', route: 'error boundary', title: '500 thrown' },
      { file: 'error-banned.html', route: 'any lookup', title: 'banned account' }
    ]
  },
  {
    group: 'reference',
    items: [
      { file: 'index.html', route: 'v1', title: 'index' },
      { file: 'components.html', route: 'v1', title: 'components' }
    ]
  }
];

const MARK = (size, split) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 32 32" role="img" aria-label="moddex" class="shrink-0"${
    split ? '' : ' fill="currentColor"'
  }>
    <path d="M4 4 H18 V10 H10 V18 H4 Z"${split ? ' fill="#4ADE80"' : ''}/>
    <path d="M28 28 H14 V22 H22 V14 H28 Z"${split ? ' fill="#F472B6"' : ''}/>
  </svg>`;

const TWITCH_GLYPH = (size) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M2.149 0l-1.612 4.119v16.836h5.731v3.045h3.224l3.045-3.045h4.657l6.269-6.269v-14.686h-21.314zm19.164 13.612l-3.582 3.582h-5.731l-3.045 3.045v-3.045h-4.836v-15.045h17.194v11.463zm-3.582-7.343v6.262h-2.149v-6.262h2.149zm-5.731 0v6.262h-2.149v-6.262h2.149z"/>
  </svg>`;

const NAV = [
  { key: 'channel', label: 'channel', href: 'channel.html' },
  { key: 'user', label: 'user', href: 'user.html' },
  { key: 'donate', label: 'donate', href: 'donate.html' },
  { key: 'api', label: 'api', href: '../../no-ui.html', external: true }
];

(function mountChrome() {
  const body = document.body;
  const activeNav = body.dataset.nav || '';
  const auth = body.dataset.auth || 'out';
  const bare = body.dataset.chrome === 'bare';
  const here = location.pathname.split('/').pop() || 'index.html';

  /* ------------------------------------------------------------ header -- */
  const navLinks = NAV.map((item) => {
    const active = item.key === activeNav;
    return `<a href="${item.href}"${item.external ? ' target="_blank" rel="noopener noreferrer"' : ''}
      ${active ? 'aria-current="page"' : ''}
      class="relative flex items-center gap-1.5 px-3 h-9 text-meta transition-colors duration-200 ${
        active ? 'tick text-primary-100' : 'text-primary-400 hover:text-primary-100'
      }">${item.label}${
      item.external
        ? `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><path d="M15 3h6v6"/><path d="M10 14L21 3"/></svg>`
        : ''
    }</a>`;
  }).join('');

  const account =
    auth === 'in'
      ? `<button type="button" class="pressable flex items-center gap-2.5 h-9 pl-1 pr-3 border border-primary-700 hover:border-primary-600 transition-colors duration-200" aria-label="account menu">
           <span class="avatar w-7 h-7 text-[11px]" style="--hue: 200">n</span>
           <span class="text-meta text-primary-300">nymn</span>
         </button>`
      : `<a href="login.html" class="pressable inline-flex items-center gap-2 h-9 px-4 bg-twitch text-white text-meta font-bold hover:brightness-110 transition-[filter] duration-200">
           ${TWITCH_GLYPH(15)} sign in
         </a>`;

  const header = bare
    ? `<header class="sticky top-0 z-40 border-b border-primary-700 bg-primary-900/90 backdrop-blur-md">
         <div class="mx-auto w-full max-w-measure px-6 sm:px-10 flex items-center h-16 gap-6">
           <a href="index.html" class="flex items-center gap-3 text-primary-100 pressable" aria-label="moddex v1">
             ${MARK(22, true)}
             <span class="font-cairo text-h3">moddex</span>
           </a>
           <span class="mono text-micro uppercase text-primary-500">suggestion v1 / index</span>
           <a href="../README.md" class="ml-auto text-meta text-primary-400 hover:text-primary-100 transition-colors duration-200">read the audit</a>
         </div>
       </header>`
    : `<header class="sticky top-0 z-40 border-b border-primary-700 bg-primary-900/90 backdrop-blur-md">
         <div class="mx-auto w-full max-w-measure px-6 sm:px-10 flex items-center h-16 gap-8">
           <a href="home.html" class="flex items-center gap-3 shrink-0 text-primary-100 pressable" aria-label="moddex home">
             ${MARK(22, false)}
             <span class="font-cairo text-h3 leading-none">moddex</span>
           </a>
           <nav class="hidden md:flex items-center gap-1" aria-label="Main">${navLinks}</nav>
           <div class="ml-auto flex items-center gap-3">
             <div class="hidden md:block">${account}</div>
             <button type="button" class="md:hidden flex items-center justify-center w-9 h-9 text-primary-300 pressable" aria-label="open navigation menu">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"><line x1="4" x2="20" y1="7" y2="7"/><line x1="4" x2="20" y1="17" y2="17"/></svg>
             </button>
           </div>
         </div>
       </header>`;

  /* ------------------------------------------------------------ footer -- */
  const footer = `
    <footer class="mt-auto border-t border-primary-700">
      <div class="mx-auto w-full max-w-measure px-6 sm:px-10 py-10 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
        <div class="flex flex-col gap-3">
          <div class="flex items-center gap-3 text-primary-300">${MARK(20, false)}<span class="font-cairo text-h3 leading-none">moddex</span></div>
          <p class="text-meta text-primary-500 max-w-[34ch]">
            Not affiliated with, endorsed by, or sponsored by Twitch Interactive.
          </p>
        </div>
        <nav class="flex flex-wrap gap-x-8 gap-y-2 text-meta" aria-label="Footer">
          <a class="text-primary-400 hover:text-primary-100 transition-colors duration-200" href="tos.html">terms of service</a>
          <a class="text-primary-400 hover:text-primary-100 transition-colors duration-200" href="settings.html">opt out</a>
          <a class="text-primary-400 hover:text-primary-100 transition-colors duration-200" href="../../no-ui.html">api docs</a>
          <a class="text-primary-400 hover:text-primary-100 transition-colors duration-200" href="../../no-ui.html">status</a>
          <span class="mono text-primary-600">&copy; 2026</span>
        </nav>
      </div>
    </footer>`;

  body.insertAdjacentHTML('afterbegin', `<a href="#main" class="skip-link">Skip to content</a>${header}`);
  body.insertAdjacentHTML('beforeend', footer);

  /* ---------------------------------------------------------- switcher -- */
  const links = PAGES.map(
    (section) => `<h3>${section.group}</h3>${section.items
      .map(
        (page) =>
          `<a href="${page.file}"${page.file === here ? ' aria-current="page"' : ''}>${page.title}<span>${page.route}</span></a>`
      )
      .join('')}`
  ).join('');

  const el = document.createElement('div');
  el.id = 'vswitch';
  el.dataset.open = 'false';
  el.innerHTML = `<nav aria-label="v1 pages">${links}
      <div class="cross">
        <a href="../../index.html">shipped</a>
        <a href="../v2/${here}">v2</a>
      </div>
    </nav>
    <button type="button" aria-expanded="false">${MARK(12, true)} v1 / pages</button>`;

  const button = el.querySelector('button');
  button.addEventListener('click', () => {
    const open = el.dataset.open !== 'true';
    el.dataset.open = String(open);
    button.setAttribute('aria-expanded', String(open));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      el.dataset.open = 'false';
      button.setAttribute('aria-expanded', 'false');
    }
  });

  body.appendChild(el);
})();
