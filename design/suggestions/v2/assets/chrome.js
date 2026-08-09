/**
 * v2 shared chrome: top nav, left rail, page switcher.
 *
 * Both are structural borrows, not decoration:
 *
 *   the nav search   Twitch keeps search in the top bar at all times because
 *                    search is how you get anywhere. On moddex, search IS the
 *                    product, so putting it here means no page ever needs a
 *                    hero whose only job is to hold a search box. That single
 *                    move is why the home page in this direction looks nothing
 *                    like the home page in the other two.
 *   the rail         Twitch's left rail is followed channels. moddex's is
 *                    recently looked up. Same job, and on a lookup tool it is
 *                    arguably more useful than it is on Twitch.
 *
 * Pages declare their state on <body>:
 *   data-nav="channel|user|donate"   which rail section is current
 *   data-scope="channel|user"        what the nav search will look up
 *   data-auth="in|out"               account button or Log in
 *   data-chrome="bare"               reference pages, no rail
 */
const PAGES = [
  {
    group: 'public',
    items: [
      { file: 'home.html', route: '/', title: 'home' },
      { file: 'channel.html', route: '/channel', title: 'channel search' },
      { file: 'channel-detail.html', route: '/channel/[username]', title: 'channel page' },
      { file: 'user.html', route: '/user', title: 'user search' },
      { file: 'user-detail.html', route: '/user/[username]', title: 'user page' },
      { file: 'detail-loading.html', route: '/channel/[username]', title: 'page loading' },
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
      { file: 'error-403.html', route: 'any lookup', title: '403 not shown' },
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
    <path d="M4 4 H18 V10 H10 V18 H4 Z"${split ? ' fill="#4ADE80"' : ''}/>
    <path d="M28 28 H14 V22 H22 V14 H28 Z"${split ? ' fill="#F472B6"' : ''}/>
  </svg>`;

/**
 * The chat badge. 18px, drawn as one half of the moddex mark on the role's
 * colour, and rendered immediately before a username with no label.
 *
 * That is the Twitch chat convention exactly: a moderator is a green sword
 * before the name, a VIP is a pink gem before the name. moddex's mod green and
 * vip pink were never an invention that happens to match Twitch, they ARE that
 * convention, so this is the most native component in the direction and it
 * costs one SVG.
 */
const BADGE = (role) => {
  const spec = {
    mod: { fill: '#4ADE80', path: 'M4 4 H18 V10 H10 V18 H4 Z', label: 'Moderator' },
    vip: { fill: '#F472B6', path: 'M28 28 H14 V22 H22 V14 H28 Z', label: 'VIP' },
    founder: { fill: '#FBBF24', path: 'M4 28 H18 V22 H10 V14 H4 Z', label: 'Founder' }
  }[role];

  return `<span class="chat-badge" style="background:${spec.fill}" title="${spec.label}" role="img" aria-label="${spec.label}">
    <svg width="11" height="11" viewBox="0 0 32 32" fill="#0B0B0C" aria-hidden="true"><path d="${spec.path}"/></svg>
  </span>`;
};

/** channels the reader has looked at, which is what the rail is for */
const RECENT = [
  { login: 'forsen', name: 'forsen', roles: 26, hue: 12, href: 'channel-detail.html' },
  { login: 'nymn', name: 'NymN', roles: 41, hue: 200, href: 'channel-detail.html' },
  { login: 'xqc', name: 'xQc', roles: 88, hue: 340, href: 'channel-detail.html' },
  { login: 'pajlada', name: 'pajlada', roles: 19, hue: 96, href: 'channel-detail.html' },
  { login: 'knut', name: 'knut', roles: 33, hue: 55, href: 'channel-detail.html' },
  { login: 'alinity', name: 'Alinity', roles: 12, hue: 300, href: 'channel-detail.html' },
  { login: 'kkona', name: 'KKona', roles: 9, hue: 270, href: 'channel-detail.html' }
];

(function mountChrome() {
  const body = document.body;
  const scope = body.dataset.scope || 'channel';
  const auth = body.dataset.auth || 'out';
  const bare = body.dataset.chrome === 'bare';
  const here = location.pathname.split('/').pop() || 'index.html';

  /* --------------------------------------------------------------- nav -- */
  const account =
    auth === 'in'
      ? `<div class="flex items-center gap-2">
           <a href="donate.html" class="btn btn-alt hidden sm:inline-flex">
             <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
             Donate
           </a>
           <button type="button" class="p-0.5 rounded-pill hover:bg-primary-700 transition-colors" aria-label="Account menu">
             <span class="avatar w-[30px] h-[30px] text-[12px]" style="background:hsl(200 14% 22%);color:hsl(200 22% 70%)">n</span>
           </button>
         </div>`
      : `<div class="flex items-center gap-2">
           <a href="donate.html" class="btn btn-alt hidden sm:inline-flex">
             <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
             Donate
           </a>
           <a href="login.html" class="btn">Log in</a>
         </div>`;

  const nav = `
    <header class="nav">
      <a href="home.html" class="flex items-center gap-2 shrink-0 pr-1 text-primary-100" aria-label="moddex home">
        ${MARK(22, true)}
        <span class="text-[17px] font-bold tracking-tight hidden sm:inline">moddex</span>
      </a>

      <form class="nav-search mx-auto" onsubmit="event.preventDefault(); location.href='${
        scope === 'user' ? 'user-detail.html' : 'channel-detail.html'
      }';">
        <button type="button" class="nav-scope" aria-label="Change what is searched">
          ${scope === 'user' ? 'People' : 'Channels'}
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
        </button>
        <input type="text" placeholder="${scope === 'user' ? 'nymn' : 'forsen'}" aria-label="Search twitch ${scope === 'user' ? 'accounts' : 'channels'}" maxlength="25">
        <button type="submit" aria-label="Search">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
        </button>
      </form>

      <div class="shrink-0">${account}</div>
    </header>`;

  /* -------------------------------------------------------------- rail -- */
  const railItems = RECENT.map(
    (c) => `
      <a href="${c.href}" class="rail-item"${c.login === 'forsen' && here.startsWith('channel-detail') ? ' aria-current="page"' : ''}>
        <span class="avatar w-[30px] h-[30px] text-[12px]" style="background:hsl(${c.hue} 14% 20%);color:hsl(${c.hue} 24% 68%)" aria-hidden="true">${c.login[0]}</span>
        <span class="min-w-0 flex-1">
          <span class="block text-ui font-semibold truncate leading-tight">${c.name}</span>
          <span class="block text-meta text-primary-400 truncate leading-tight">${c.roles} roles held</span>
        </span>
      </a>`
  ).join('');

  const rail = `
    <aside class="rail hidden lg:block" aria-label="Recently looked up">
      <div class="rail-head">
        <span>Recently looked up</span>
      </div>
      ${railItems}

      <div class="rail-head mt-3 pt-3 border-t border-primary-700">
        <span>Browse</span>
      </div>
      <a href="channel.html" class="rail-item">
        <span class="w-[30px] grid place-items-center text-mod" aria-hidden="true">
          <span class="block w-3 h-3 border-2 border-b-0 border-r-0 border-current"></span>
        </span>
        <span class="text-ui font-semibold">Channels</span>
      </a>
      <a href="user.html" class="rail-item">
        <span class="w-[30px] grid place-items-center text-vip" aria-hidden="true">
          <span class="block w-3 h-3 border-2 border-t-0 border-l-0 border-current"></span>
        </span>
        <span class="text-ui font-semibold">People</span>
      </a>

      <div class="px-4 py-4 mt-2 border-t border-primary-700">
        <p class="text-meta text-primary-400 leading-relaxed">
          Listed here yourself?
          <a href="settings.html" class="text-primary-200 hover:text-twitch-hover transition-colors">Opt out</a>
          at any time.
        </p>
      </div>
    </aside>`;

  /* -------------------------------------------------------------- shell -- */
  const main = document.getElementById('main');
  const shell = document.createElement('div');
  shell.className = 'flex items-start';
  main.parentNode.insertBefore(shell, main);
  if (!bare) shell.insertAdjacentHTML('afterbegin', rail);
  shell.appendChild(main);

  body.insertAdjacentHTML(
    'afterbegin',
    `<a href="#main" class="skip-link">Skip to content</a>${bare ? bareNav() : nav}`
  );

  function bareNav() {
    return `
      <header class="nav">
        <a href="index.html" class="flex items-center gap-2 shrink-0 text-primary-100">
          ${MARK(22, true)}
          <span class="text-[17px] font-bold tracking-tight">moddex</span>
        </a>
        <span class="text-meta text-primary-400">design proposal v2</span>
        <a href="../README.md" class="ml-auto text-ui text-primary-400 hover:text-primary-100 transition-colors">Read the audit</a>
      </header>`;
  }

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
        <a href="../v3/${here}">v3</a>
      </div>
    </nav>
    <button type="button" aria-expanded="false">${MARK(12, true)} v2 pages</button>`;

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
