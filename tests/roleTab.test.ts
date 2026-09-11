import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { roleTabIndex } from '../src/misc/roles';

const APP = join(__dirname, '..', 'src', 'app', '[locale]');

const read = (...parts: string[]) => readFileSync(join(APP, ...parts), 'utf8');

describe('the role segment after a profile login', () => {
  it('opens the first tab when there is none', () => {
    expect(roleTabIndex(undefined)).toBe(0);
  });

  it('speaks the plural the api speaks, in tab order', () => {
    expect(roleTabIndex('mods')).toBe(0);
    expect(roleTabIndex('vips')).toBe(1);
    expect(roleTabIndex('founders')).toBe(2);
  });

  // artists is a key in ROLES and still closed on the api, so a url for it is
  // as wrong as any other word
  it.each(['mod', 'artists', 'modding', 'VIPs', ''])('rejects %j', (segment) => {
    expect(roleTabIndex(segment)).toBeNull();
  });
});

describe('every profile route takes the segment', () => {
  it.each(['channel', 'user'])('%s/[username] reads it and redirects the unknown', (type) => {
    const source = read(type, '[username]', 'page.tsx');

    expect(source).toContain('const tab = roleTabIndex(role);');
    expect(source).toContain(
      `if (tab === null) {\n    return redirect(localePath(locale, \`/${type}/\${username}\`));`
    );
    expect(source).toContain('initial={tab}');
  });

  // the segment re-exports the page rather than copying it, and the card too:
  // next hands a segment's opengraph-image to no page below it, measured
  it.each(['channel', 'user'])('%s/[username]/[role] is the same page and card', (type) => {
    expect(read(type, '[username]', '[role]', 'page.tsx')).toBe(
      "export { default, generateMetadata } from '../page';\n"
    );
    expect(read(type, '[username]', '[role]', 'opengraph-image.tsx')).toBe(
      "export { default, alt, contentType, size } from '../opengraph-image';\n"
    );
  });

  it.each([
    ['c', 'channel'],
    ['u', 'user']
  ])('/%s carries it through to /%s', (short, long) => {
    const source = read(short, '[username]', '[[...role]]', 'page.tsx');

    expect(source).toContain('role?.length === 1 && roleTabIndex(role[0]) !== null');
    expect(source).toContain(`\`/${long}/\${username}\${segment}\``);
  });
});

describe('the tabs keep the address bar shareable', () => {
  const source = readFileSync(
    join(__dirname, '..', 'src', 'components', 'User', 'RoleTabs.tsx'),
    'utf8'
  );

  it('start on the tab the url named', () => {
    expect(source).toContain('useState(initial)');
  });

  // replaceState, not a link: a crawler must not find three copies of every profile
  it('rewrite the url on a click without navigating', () => {
    expect(source).toContain("window.history.replaceState(null, '', href)");
    expect(source).not.toMatch(/<(?:Link|a)\s/);
  });
});
