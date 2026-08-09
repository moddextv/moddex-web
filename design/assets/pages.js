/**
 * the page registry — the single list of every comp in this folder, and the
 * floating switcher that links them together.
 *
 * index.html reads PAGES to build its table; every other page includes this
 * script and gets the bottom-right switcher, so any comp is one click from any
 * other without a nav that would pollute the design itself.
 *
 * adding a comp: add a row here and write the file. nothing else to update.
 */
const PAGES = [
  {
    group: 'public',
    items: [
      { file: 'home.html', route: '/', title: 'home', note: 'hero, search, the four counts' },
      { file: 'channel.html', route: '/channel', title: 'channel search', note: 'empty search state' },
      { file: 'channel-detail.html', route: '/channel/[username]', title: 'channel detail', note: 'profile + mods / vips / founders' },
      { file: 'user.html', route: '/user', title: 'user search', note: 'empty search state' },
      { file: 'user-detail.html', route: '/user/[username]', title: 'user detail', note: 'profile + modding / viping' },
      { file: 'detail-loading.html', route: '/channel/[username]', title: 'detail loading', note: 'skeletons while the lists resolve' },
      { file: 'donate.html', route: '/donate', title: 'donate', note: 'benefits + stripe checkout' },
      { file: 'donate-success.html', route: '/donate/success', title: 'donate success', note: 'after the stripe redirect' },
      { file: 'tos.html', route: '/tos', title: 'terms of service', note: 'prose page' }
    ]
  },
  {
    group: 'authenticated',
    items: [
      { file: 'login.html', route: 'auth gate', title: 'login required', note: 'what /settings and /dashboard render when signed out' },
      { file: 'settings.html', route: '/settings', title: 'settings', note: 'opt-out switch + chat badge' },
      { file: 'dashboard.html', route: '/dashboard', title: 'dashboard', note: 'team permission only' }
    ]
  },
  {
    group: 'error states',
    items: [
      { file: 'error-404.html', route: 'not-found', title: '404 not found', note: 'unknown page or unknown twitch account' },
      { file: 'error-403.html', route: 'any lookup', title: '403 forbidden', note: 'the account opted out of being tracked' },
      { file: 'error-400.html', route: '/donate/success', title: '400 bad request', note: 'missing or unreadable stripe session' },
      { file: 'error-500.html', route: 'error boundary', title: '500 / thrown error', note: 'app/error.tsx, with its retry button' },
      { file: 'error-banned.html', route: 'any lookup', title: 'banned or deactivated', note: 'no status code — twitch removed the account' }
    ]
  },
  {
    group: 'reference',
    items: [
      { file: 'index.html', route: '—', title: 'index', note: 'this folder, and how it maps to src/' },
      { file: 'components.html', route: '—', title: 'components', note: 'every primitive on one page' },
      { file: 'no-ui.html', route: '—', title: 'routes with no ui', note: 'redirects, api handlers, /health' }
    ]
  }
];

(function mountSwitcher() {
  const here = location.pathname.split('/').pop() || 'index.html';

  const links = PAGES.map(
    (section) => `
      <h3>${section.group}</h3>
      ${section.items
        .map(
          (page) => `<a href="${page.file}"${page.file === here ? ' aria-current="page"' : ''}>
            ${page.title}<span>${page.route}</span>
          </a>`
        )
        .join('')}
    `
  ).join('');

  const el = document.createElement('div');
  el.id = 'comp-switcher';
  el.dataset.open = 'false';
  el.innerHTML = `<nav aria-label="Design comps">${links}
      <div class="cross">
        <a href="suggestions/v1/${here}">v1</a>
        <a href="suggestions/v2/${here}">v2</a>
        <a href="suggestions/v3/${here}">v3</a>
      </div>
    </nav>
    <button type="button" aria-expanded="false">
      <svg width="12" height="12" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
        <path d="M4 4 H18 V10 H10 V18 H4 Z"/><path d="M28 28 H14 V22 H22 V14 H28 Z"/>
      </svg>
      pages
    </button>`;

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

  document.body.appendChild(el);
})();
