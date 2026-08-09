/**
 * v3 shared chrome: nav, footer, page switcher.
 *
 * The rail is gone. It was v2's most obviously borrowed element and it was
 * taking 240px off the content width, which was part of "clamped". Recently
 * looked up now lives on the home page, where it is a destination rather than
 * permanent furniture.
 *
 * Pages declare their state on <body>:
 *   data-scope="channel|user"   which side the nav search is set to
 *   data-auth="in|out"
 *   data-chrome="bare"          reference pages
 */
const PAGES = [
  {
    group: 'public',
    items: [
      { file: 'home.html', route: '/', title: 'home' },
      { file: 'channel.html', route: '/channel', title: 'channel search' },
      { file: 'channel-detail.html', route: '/channel/[username]', title: 'channel profile' },
      { file: 'user.html', route: '/user', title: 'user search' },
      { file: 'user-detail.html', route: '/user/[username]', title: 'user profile' },
      { file: 'detail-loading.html', route: '/channel/[username]', title: 'profile loading' },
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
      { file: 'index.html', route: 'v3', title: 'index' },
      { file: 'components.html', route: 'v3', title: 'components' }
    ]
  }
];

const MARK = (size, split) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 32 32" role="img" aria-label="moddex" style="flex-shrink:0"${
    split ? '' : ' fill="currentColor"'
  }>
    <path d="M4 4 H18 V10 H10 V18 H4 Z"${split ? ' fill="#4ADE80"' : ''}/>
    <path d="M28 28 H14 V22 H22 V14 H28 Z"${split ? ' fill="#F472B6"' : ''}/>
  </svg>`;

(function mountChrome() {
  const body = document.body;
  const scope = body.dataset.scope || 'channel';
  const auth = body.dataset.auth || 'out';
  const bare = body.dataset.chrome === 'bare';
  const here = location.pathname.split('/').pop() || 'index.html';

  const account =
    auth === 'in'
      ? `<a href="settings.html" class="flex items-center gap-2.5 shrink-0 pl-1 pr-3 h-10 rounded-md hover:bg-primary-700 transition-colors">
           <span class="avatar w-8 h-8 text-meta">n</span>
           <span class="text-ui font-semibold hidden sm:inline">nymn</span>
         </a>`
      : `<a href="login.html" class="btn btn-twitch shrink-0">
           <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M2.149 0l-1.612 4.119v16.836h5.731v3.045h3.224l3.045-3.045h4.657l6.269-6.269v-14.686h-21.314zm19.164 13.612l-3.582 3.582h-5.731l-3.045 3.045v-3.045h-4.836v-15.045h17.194v11.463zm-3.582-7.343v6.262h-2.149v-6.262h2.149zm-5.731 0v6.262h-2.149v-6.262h2.149z"/></svg>
           <span class="hidden sm:inline">Sign in</span>
         </a>`;

  const nav = bare
    ? `<header class="nav">
         <div class="nav-inner mx-auto w-full max-w-page px-6 sm:px-8">
           <a href="index.html" class="flex items-center gap-3 text-primary-100">
             ${MARK(24, true)}
             <span class="text-h3 font-extrabold tracking-tight">moddex</span>
           </a>
           <span class="text-meta text-primary-400">design proposal v3</span>
           <a href="../README.md" class="ml-auto text-ui text-primary-400 hover:text-primary-100 transition-colors">Read the audit</a>
         </div>
       </header>`
    : `<header class="nav">
         <div class="nav-inner mx-auto w-full max-w-page px-6 sm:px-8">
           <a href="home.html" class="flex items-center gap-3 shrink-0 text-primary-100" aria-label="moddex home">
             ${MARK(24, true)}
             <span class="text-h3 font-extrabold tracking-tight hidden sm:inline">moddex</span>
           </a>

           <form class="search flex-1 max-w-[560px]" onsubmit="event.preventDefault(); location.href='${
             scope === 'user' ? 'user-detail.html' : 'channel-detail.html'
           }';">
             <span class="text-meta text-primary-500 shrink-0 hidden sm:inline">twitch.tv/</span>
             <input type="text" placeholder="${scope === 'user' ? 'nymn' : 'forsen'}" maxlength="25"
                    aria-label="Look up a twitch ${scope === 'user' ? 'account' : 'channel'}" class="text-base">
             <span class="scope" role="group" aria-label="What to look up">
               <button type="button" aria-pressed="${scope === 'channel'}">
                 <span class="corner corner-tl ${scope === 'channel' ? 'text-mod' : 'text-primary-600'}" aria-hidden="true"></span>
                 Channel
               </button>
               <button type="button" aria-pressed="${scope === 'user'}">
                 <span class="corner corner-br ${scope === 'user' ? 'text-vip' : 'text-primary-600'}" aria-hidden="true"></span>
                 Person
               </button>
             </span>
           </form>

           <div class="ml-auto flex items-center gap-2 shrink-0">
             <a href="donate.html" class="hidden md:inline-flex btn btn-ghost">Donate</a>
             ${account}
           </div>
         </div>
       </header>`;

  const footer = `
    <footer class="mt-20 border-t border-primary-700/70">
      <div class="mx-auto w-full max-w-page px-6 sm:px-8 py-10 flex flex-col gap-8 lg:flex-row lg:justify-between">
        <div class="max-w-[42ch]">
          <div class="flex items-center gap-3 mb-3 text-primary-200">
            ${MARK(20, true)}
            <span class="text-h3 font-extrabold tracking-tight">moddex</span>
          </div>
          <p class="text-ui text-primary-400 leading-relaxed">
            Every channel a twitch account holds mod or vip in, and the day it
            was granted. Not affiliated with, endorsed by, or sponsored by
            Twitch Interactive.
          </p>
        </div>

        <div class="flex gap-14">
          <div class="flex flex-col gap-2.5">
            <p class="text-meta text-primary-500 mb-0.5">Look up</p>
            <a href="channel.html" class="text-ui text-primary-300 hover:text-primary-100 transition-colors">By channel</a>
            <a href="user.html" class="text-ui text-primary-300 hover:text-primary-100 transition-colors">By person</a>
            <a href="../../no-ui.html" class="text-ui text-primary-300 hover:text-primary-100 transition-colors">API docs</a>
          </div>
          <div class="flex flex-col gap-2.5">
            <p class="text-meta text-primary-500 mb-0.5">Your data</p>
            <a href="settings.html" class="text-ui text-primary-300 hover:text-primary-100 transition-colors">Opt out</a>
            <a href="tos.html" class="text-ui text-primary-300 hover:text-primary-100 transition-colors">Terms</a>
            <a href="../../no-ui.html" class="text-ui text-primary-300 hover:text-primary-100 transition-colors">Status</a>
          </div>
        </div>
      </div>
    </footer>`;

  body.insertAdjacentHTML(
    'afterbegin',
    `<a href="#main" class="skip-link">Skip to content</a>${nav}`
  );
  body.insertAdjacentHTML('beforeend', footer);

  const links = PAGES.map(
    (section) => `<h3>${section.group}</h3>${section.items
      .map(
        (p) =>
          `<a href="${p.file}"${p.file === here ? ' aria-current="page"' : ''}>${p.title}<span>${p.route}</span></a>`
      )
      .join('')}`
  ).join('');

  const el = document.createElement('div');
  el.id = 'vswitch';
  el.dataset.open = 'false';
  el.innerHTML = `<nav aria-label="v3 pages">${links}
      <div class="cross">
        <a href="../../${here}">ship</a>
        <a href="../v1/${here}">v1</a>
        <a href="../v2/${here}">v2</a>
      </div>
    </nav>
    <button type="button" aria-expanded="false">${MARK(13, true)} v3 pages</button>`;

  const button = el.querySelector('button');
  button.addEventListener('click', () => {
    const open = el.dataset.open !== 'true';
    el.dataset.open = String(open);
    button.setAttribute('aria-expanded', String(open));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      el.dataset.open = 'false';
      button.setAttribute('aria-expanded', 'false');
    }
  });

  body.appendChild(el);
})();
