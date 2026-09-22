import { LOCALES } from '@/i18n/locales';
import { getTranslator } from '@/i18n/dictionary';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const ROOT = join(__dirname, '..');
const SRC = join(ROOT, 'src');
const CSS = readFileSync(join(SRC, 'styles', 'globals.css'), 'utf8');

const tsx = (dir: string, out: string[] = []): string[] => {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) tsx(path, out);
    else if (entry.endsWith('.tsx')) out.push(path);
  }

  return out;
};

const FILES = tsx(SRC).map((path) => ({
  name: path
    .slice(SRC.length + 1)
    .split('\\')
    .join('/'),
  source: readFileSync(path, 'utf8')
}));

describe('one picker, defined once', () => {
  it('found the components', () => {
    expect(FILES.length).toBeGreaterThan(30);
  });

  // DashboardNav, BadgeManager and ChatBadge each carried their own copy at a
  // different height, which is what "it does not feel like one design" was
  it('no component rebuilds the active-option look out of tailwind parts', () => {
    const offenders = FILES.filter(({ source }) =>
      /border-primary-300[^`'"]*bg-primary-800|bg-primary-800[^`'"]*border-primary-300/.test(source)
    ).map(({ name }) => name);

    expect(offenders, 'use the .option class from globals.css').toEqual([]);
  });

  it('the option and role-tab pickers share one declaration block', () => {
    expect(CSS).toMatch(/\.role-tab,\s*\n\s*\.option \{/);
    expect(CSS).toMatch(/\.role-tab\.is-active,\s*\n\s*\.option\.is-active \{/);
  });
});

describe('a control row may not hide what it cannot fit', () => {
  const blockFor = (selector: string): string => {
    const start = CSS.indexOf(`${selector} {`);
    expect(start, `no rule for ${selector}`).toBeGreaterThan(-1);

    return CSS.slice(start, CSS.indexOf('}', start));
  };

  // the three role chips are 445px against a phone's ~350, and the founder one
  // simply vanished behind a scrollbar that was styled away
  it('the role chips wrap instead of scrolling out of sight', () => {
    const block = blockFor('.role-tabs');

    expect(block).toContain('flex-wrap: wrap');
    expect(block).not.toContain('overflow-x');
    expect(CSS).not.toContain('.role-tabs::-webkit-scrollbar');
  });

  it('nothing else styles a scrollbar away without saying why', () => {
    const hidden = [...CSS.matchAll(/([.\w-]+) \{[^}]*scrollbar-width: none/g)].map(
      (match) => match[1]
    );

    expect(hidden, 'a hidden scrollbar loses content with no affordance').toEqual(['.tabs']);
  });
});

describe('the bot control says the same thing everywhere', () => {
  // the literal moved into the message file, so the shared thing is now the key.
  // the role lists fold the bot control into their filter menu since 2026-09-22,
  // where the three states keep their words and the chip label is the group's
  it('every surface reaches for the same message key, through the one menu', () => {
    // the leaderboard keeps its one switch in the open, drawn with the menu's own chips
    const surfaces: [string, string][] = [
      ['components/Browse/BrowseList.tsx', '<FilterMenu'],
      ['components/User/ListFilters.tsx', '<FilterMenu'],
      ['app/[locale]/leaderboard/page.tsx', '<FilterChoice']
    ];

    for (const [name, control] of surfaces) {
      const file = FILES.find((entry) => entry.name === name);
      expect(file, `${name} moved`).toBeTruthy();
      expect(file!.source, `${name} labels the bot control its own way`).toMatch(
        /controls\.botModes\./
      );
      expect(file!.source, `${name} draws its own control`).toContain(control);
    }
  });

  it('and those keys exist in every language', () => {
    for (const locale of LOCALES) {
      const t = getTranslator(locale);

      for (const mode of ['all', 'hide', 'only']) {
        expect(t(`controls.botModes.${mode}`)).not.toBe(`controls.botModes.${mode}`);
      }
      expect(t('controls.groups.bots')).not.toBe('controls.groups.bots');
    }
  });

  it('nobody says "Include bots" any more', () => {
    const offenders = FILES.filter(({ source }) => /Include bots/.test(source)).map(
      ({ name }) => name
    );

    expect(offenders).toEqual([]);
  });
});
