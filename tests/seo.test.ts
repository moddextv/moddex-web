import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import robots from '@/app/robots';
import manifest from '@/app/manifest';
import sitemap from '@/app/sitemap';
import { profileGraph, siteGraph } from '@/components/JsonLd';

const ROOT = join(__dirname, '..');
const APP = join(ROOT, 'src', 'app');

const read = (...parts: string[]) => readFileSync(join(APP, ...parts), 'utf8');

const pages = (dir = APP, prefix = ''): { route: string; file: string }[] =>
  readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);

    if (statSync(path).isDirectory()) {
      return entry === 'api' || entry === 'fonts' ? [] : pages(path, `${prefix}/${entry}`);
    }

    return entry === 'page.tsx' ? [{ route: prefix || '/', file: path }] : [];
  });

const ROUTES = pages();

// /c and /u only call permanentRedirect, so they render nothing to describe
const REDIRECTS = ['/c/[username]', '/u/[username]'];

describe('every page carries metadata', () => {
  it('found the route tree', () => {
    expect(ROUTES.map((page) => page.route)).toContain('/');
    expect(ROUTES.length).toBeGreaterThan(10);
  });

  it.each(ROUTES.filter((page) => !REDIRECTS.includes(page.route)))(
    '$route declares a title',
    ({ file }) => {
      const source = readFileSync(file, 'utf8');

      expect(source).toMatch(/export const metadata|generateMetadata/);
    }
  );

  it.each(ROUTES.filter((page) => !REDIRECTS.includes(page.route)))(
    '$route declares a canonical or is deliberately noindex',
    ({ file }) => {
      const source = readFileSync(file, 'utf8');

      expect(source).toMatch(/alternates: \{ canonical|robots: \{ index: false/);
    }
  );
});

describe('robots.txt', () => {
  const rules = robots();
  const disallow = (rules.rules as { disallow: string[] }).disallow;

  it('points at the sitemap on the canonical host', () => {
    expect(rules.sitemap).toBe('https://moddex.tv/sitemap.xml');
  });

  it.each(['/dashboard', '/settings', '/insights', '/donate/success', '/design'])(
    'keeps %s out',
    (path) => {
      expect(disallow).toContain(path);
    }
  );

  it.each(['/', '/channel', '/user', '/donate', '/privacy', '/tos'])('allows %s', (path) => {
    expect(disallow.some((rule) => path === rule || path.startsWith(`${rule}/`))).toBe(false);
  });
});

describe('a page disallowed in robots.txt also sends noindex', () => {
  it.each([
    ['dashboard', 'page.tsx'],
    ['settings', 'page.tsx'],
    ['design', 'page.tsx'],
    ['donate', 'success', 'page.tsx']
  ])('%s/%s', (...parts) => {
    expect(read(...parts)).toContain('robots: { index: false, follow: false }');
  });
});

describe('the profile routes cannot serve a soft 404', () => {
  it.each([
    ['channel', '[username]', 'page.tsx'],
    ['user', '[username]', 'page.tsx']
  ])('%s/%s answers noindex when there is no row', (...parts) => {
    const source = read(...parts);

    expect(source).toContain(
      'if (!user) return { title, robots: { index: false, follow: false } }'
    );
    expect(source).toContain('if (!isUsername(username))');
  });
});

describe('the sitemap lists pages, not rows', () => {
  const urls = sitemap().map((entry) => entry.url);

  it.each(['/', '/channel', '/user', '/donate', '/privacy', '/tos'])('carries %s', (path) => {
    expect(urls).toContain(`https://moddex.tv${path}`);
  });

  it('carries no profile', () => {
    expect(urls.filter((url) => /\/(channel|user)\/./.test(url))).toEqual([]);
    expect(urls).toHaveLength(6);
  });

  it('carries no field a search engine ignores', () => {
    expect(sitemap().flatMap((entry) => Object.keys(entry))).toEqual(Array(6).fill('url'));
  });
});

describe('every image says what it is', () => {
  const tsx = (dir: string, out: string[] = []): string[] => {
    for (const entry of readdirSync(dir)) {
      const path = join(dir, entry);
      if (statSync(path).isDirectory()) tsx(path, out);
      else if (entry.endsWith('.tsx')) out.push(path);
    }
    return out;
  };

  const RENDERED_BY_SATORI_NOT_HTML = 'ogCard.tsx';
  const sources = tsx(join(ROOT, 'src')).filter(
    (file) => !file.endsWith(RENDERED_BY_SATORI_NOT_HTML)
  );

  it('found the components', () => {
    expect(sources.length).toBeGreaterThan(30);
  });

  it.each(sources.map((file) => [file.replace(/\\/g, '/').split('/src/')[1], file]))(
    '%s',
    (_name, file) => {
      const source = readFileSync(file, 'utf8');
      const tags = [...source.matchAll(/<(?:Image|img)\s[\s\S]{0,400}?\/>/g)].map((m) => m[0]);

      for (const tag of tags) {
        expect(tag, `an image here has no alt`).toMatch(/\salt=/);
        expect(tag, `an image here has an empty alt`).not.toMatch(/\salt=""/);
      }
    }
  );
});

describe('a profile puts its role lists in the html', () => {
  it.each([
    ['channel', ['mods', 'vips', 'founders']],
    ['user', ['modding', 'viping']]
  ] as const)('%s/[username] seeds every list on the server', (kind, roles) => {
    const source = read(kind, '[username]', 'page.tsx');

    expect(source).toContain('await seedRoleLists(user.id');

    for (const role of roles) {
      expect(source).toContain(`initial={seeded.${role}}`);
    }
  });

  it('the hook renders the seed instead of refetching it', () => {
    const source = readFileSync(join(ROOT, 'src', 'hooks', 'useUserListData.tsx'), 'utf8');

    expect(source).toContain('useState<RoleUser[]>(initial?.items ?? [])');
    expect(source).toContain('const seeded = useRef(Boolean(initial))');
  });

  it('one page of rows is not virtualised, or the server html holds ten of them', () => {
    const source = readFileSync(join(ROOT, 'src', 'components', 'User', 'UserList.tsx'), 'utf8');

    expect(source).toContain('visibleUsers.length <= PAGE_SIZE ?');
  });
});

describe('structured data', () => {
  it('names the site and its publisher', () => {
    const graph = JSON.stringify(siteGraph());

    expect(graph).toContain('"WebSite"');
    expect(graph).toContain('"Organization"');
    expect(graph).toContain('https://moddex.tv');
  });

  it('describes a profile and where it sits', () => {
    const graph = JSON.stringify(profileGraph('channel', 'forsen', 'forsen'));

    expect(graph).toContain('"ProfilePage"');
    expect(graph).toContain('"BreadcrumbList"');
    expect(graph).toContain('https://moddex.tv/channel/forsen');
  });

  it('cannot be closed by a hostile name', () => {
    const source = readFileSync(join(ROOT, 'src', 'components', 'JsonLd.tsx'), 'utf8');

    expect(source).toContain(String.raw`replace(/</g, '\\u003c')`);
  });
});

describe('the brand images exist at the sizes the tags claim', () => {
  it.each([
    ['public/og.png', 1200, 630],
    ['public/icon-512.png', 512, 512],
    ['public/icon-192.png', 192, 192],
    ['src/app/apple-icon.png', 180, 180]
  ])('%s', async (file, width, height) => {
    const path = join(ROOT, file);
    expect(existsSync(path), `${file} is missing — run npm run og`).toBe(true);

    // png header: width and height are big-endian uint32 at byte 16 and 20
    const header = readFileSync(path).subarray(16, 24);
    expect([header.readUInt32BE(0), header.readUInt32BE(4)]).toEqual([width, height]);
  });

  it('the manifest points at icons that are there', () => {
    for (const icon of manifest().icons ?? []) {
      expect(existsSync(join(ROOT, 'public', icon.src!)), `${icon.src} is missing`).toBe(true);
    }
  });
});
