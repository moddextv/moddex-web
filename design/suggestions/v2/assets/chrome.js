/**
 * v2 shared chrome: masthead, colophon, page switcher.
 *
 * The header is a masthead rather than a navbar: a rule, the imprint line, the
 * contents, a thicker rule. It does not stick. A book's running head does not
 * follow you down the page, and on a document this short nothing is gained by
 * it except a permanently occupied 64px.
 *
 * The footer is a colophon. It states what the volume is set in and what it
 * holds. Web footers usually say nothing; a colophon says something true, and
 * it is the natural home for the "not affiliated with Twitch" line.
 *
 * Pages declare their state on <body>:
 *   data-nav="channel|user|donate|api"   which contents entry is current
 *   data-auth="in|out"                   imprint shows the account or sign-in
 *   data-chrome="bare"                   reference pages, minimal masthead
 *   data-running="left|right text"       optional running head on the sheet
 */
const PAGES = [
  {
    group: 'public',
    items: [
      { file: 'home.html', route: '/', title: 'home' },
      { file: 'channel.html', route: '/channel', title: 'channel search' },
      { file: 'channel-detail.html', route: '/channel/[username]', title: 'channel entry' },
      { file: 'user.html', route: '/user', title: 'user search' },
      { file: 'user-detail.html', route: '/user/[username]', title: 'person entry' },
      { file: 'detail-loading.html', route: '/channel/[username]', title: 'entry loading' },
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
      { file: 'error-403.html', route: 'any lookup', title: '403 withheld' },
      { file: 'error-400.html', route: '/donate/success', title: '400 bad request' },
      { file: 'error-500.html', route: 'error boundary', title: '500 thrown' },
      { file: 'error-banned.html', route: 'any lookup', title: 'banned account' }
    ]
  },
  {
    group: 'reference',
    items: [
      { file: 'index.html', route: 'v2', title: 'index' },
      { file: 'components.html', route: 'v2', title: 'components' }
    ]
  }
];

const MARK = (size, split) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 32 32" role="img" aria-label="moddex" class="shrink-0"${
    split ? '' : ' fill="currentColor"'
  }>
    <path d="M4 4 H18 V10 H10 V18 H4 Z"${split ? ' fill="#16A34A"' : ''}/>
    <path d="M28 28 H14 V22 H22 V14 H28 Z"${split ? ' fill="#DB2777"' : ''}/>
  </svg>`;

const NAV = [
  { key: 'channel', label: 'Channels', href: 'channel.html' },
  { key: 'user', label: 'People', href: 'user.html' },
  { key: 'donate', label: 'Support', href: 'donate.html' },
  { key: 'api', label: 'The api', href: '../../no-ui.html', external: true }
];

(function mountChrome() {
  const body = document.body;
  const activeNav = body.dataset.nav || '';
  const auth = body.dataset.auth || 'out';
  const bare = body.dataset.chrome === 'bare';
  const here = location.pathname.split('/').pop() || 'index.html';

  /* ----------------------------------------------------------- masthead -- */
  const contents = NAV.map((item) => {
    const active = item.key === activeNav;
    return `<a href="${item.href}"${item.external ? ' target="_blank" rel="noopener noreferrer"' : ''}
      ${active ? 'aria-current="page"' : ''}
      class="relative text-read transition-colors duration-150 ${
        active ? 'text-primary-100 italic' : 'text-primary-300 hover:text-primary-100'
      }">${item.label}${
      active
        ? '<span aria-hidden="true" class="absolute -bottom-1.5 left-0 right-0 border-b border-primary-100"></span>'
        : ''
    }</a>`;
  }).join('<span class="text-primary-600" aria-hidden="true">&middot;</span>');

  const imprint =
    auth === 'in'
      ? `<a href="settings.html" class="flex items-center gap-2.5 text-note text-primary-400 hover:text-primary-100 transition-colors duration-150">
           <span class="portrait w-6 h-6 text-[11px]">n</span>
           <span class="italic">signed in as nymn</span>
         </a>`
      : `<a href="login.html" class="text-note italic text-primary-400 hover:text-primary-100 link transition-colors duration-150">sign in with twitch</a>`;

  const masthead = bare
    ? `<header class="border-b border-primary-700">
         <div class="mx-auto w-full max-w-sheet px-6 sm:px-10 h-16 flex items-center gap-5">
           <a href="index.html" class="flex items-center gap-3">
             ${MARK(20, true)}
             <span class="text-h3 tracking-tight">moddex</span>
           </a>
           <span class="label text-note">a design proposal</span>
           <a href="../README.md" class="ml-auto text-note italic text-primary-400 hover:text-primary-100 link">read the audit</a>
         </div>
       </header>`
    : `<header>
         <div class="mx-auto w-full max-w-sheet px-6 sm:px-10">
           <div class="flex items-baseline justify-between gap-6 py-4 border-b border-primary-700">
             <p class="label text-note">Every mod and vip list on twitch, indexed both ways</p>
             ${imprint}
           </div>

           <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 py-7">
             <a href="home.html" class="flex items-center gap-3.5" aria-label="moddex home">
               ${MARK(28, true)}
               <span class="text-[2rem] leading-none tracking-tight">moddex</span>
             </a>
             <nav class="flex flex-wrap items-center gap-4" aria-label="Contents">${contents}</nav>
           </div>
         </div>
         <div class="border-b-2 border-primary-100"></div>
       </header>`;

  /* ----------------------------------------------------------- colophon -- */
  const colophon = `
    <footer class="mt-auto">
      <div class="mx-auto w-full max-w-sheet px-6 sm:px-10 pt-10 pb-14">
        <div class="rule-mid pt-8 grid gap-10 sm:grid-cols-12">

          <div class="sm:col-span-5">
            <div class="flex items-center gap-3 mb-4">
              ${MARK(18, true)}
              <span class="text-h3 tracking-tight">moddex</span>
            </div>
            <p class="text-small text-primary-400 max-w-[38ch] leading-relaxed">
              An index of which twitch accounts hold moderator and vip in which
              channels, and the day each role was granted. Not affiliated with,
              endorsed by, or sponsored by Twitch Interactive.
            </p>
          </div>

          <div class="sm:col-span-3">
            <p class="label text-note mb-3">Contents</p>
            <div class="flex flex-col gap-1.5 text-small">
              <a class="text-primary-300 hover:text-primary-100 transition-colors duration-150" href="channel.html">Channels</a>
              <a class="text-primary-300 hover:text-primary-100 transition-colors duration-150" href="user.html">People</a>
              <a class="text-primary-300 hover:text-primary-100 transition-colors duration-150" href="donate.html">Support</a>
              <a class="text-primary-300 hover:text-primary-100 transition-colors duration-150" href="../../no-ui.html">The api</a>
            </div>
          </div>

          <div class="sm:col-span-4">
            <p class="label text-note mb-3">Your entry</p>
            <div class="flex flex-col gap-1.5 text-small">
              <a class="text-primary-300 hover:text-primary-100 transition-colors duration-150" href="settings.html">Remove yourself from the index</a>
              <a class="text-primary-300 hover:text-primary-100 transition-colors duration-150" href="tos.html">Terms and what is held</a>
              <a class="text-primary-300 hover:text-primary-100 transition-colors duration-150" href="mailto:marcel@doubt.ch">marcel@doubt.ch</a>
              <a class="text-primary-300 hover:text-primary-100 transition-colors duration-150" href="../../no-ui.html">Service status</a>
            </div>
          </div>
        </div>

        <!-- the colophon proper: what the volume is set in, and what it holds -->
        <p class="rule-hair mt-10 pt-5 text-note text-primary-400 italic max-w-[70ch] leading-relaxed">
          Set in Newsreader and Archivo. This edition holds
          <span class="datum not-italic">412,847</span> channels and
          <span class="datum not-italic">2,714,096</span> accounts, carrying
          <span class="datum not-italic">8,131,260</span> moderator and
          <span class="datum not-italic">5,611,594</span> vip records. It grows
          whenever somebody looks a channel up. Copyright 2026.
        </p>
      </div>
    </footer>`;

  // the masthead and colophon go INSIDE the sheet, because on paper they are
  // part of the page rather than furniture around it. that is also what puts
  // the mark's two register corners around the whole document.
  const sheet = document.getElementById('sheet') || body;
  sheet.insertAdjacentHTML('afterbegin', masthead);
  sheet.insertAdjacentHTML('beforeend', colophon);
  body.insertAdjacentHTML('afterbegin', '<a href="#main" class="skip-link">Skip to content</a>');

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
  el.innerHTML = `<nav aria-label="v2 pages">${links}
      <div class="cross">
        <a href="../../${here}">shipped</a>
        <a href="../v1/${here}">v1</a>
      </div>
    </nav>
    <button type="button" aria-expanded="false">${MARK(13, true)} v2 &middot; pages</button>`;

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
