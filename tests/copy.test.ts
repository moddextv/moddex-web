import { describe, expect, it } from 'vitest';
import ts from 'typescript';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * The message files are held against each other by the tests above, which says
 * nothing about whether a component asks for a message at all. This one parses
 * every .tsx and reports each piece of prose that never reaches a translator —
 * the regex sweep this replaced only ever saw whole sentences, and missed 85.
 */

// attributes that are never prose. anything else holding words is something a
// person can read, whatever the prop happens to be called
const TECHNICAL = new Set([
  'className',
  'key',
  'id',
  'type',
  'role',
  'href',
  'src',
  'rel',
  'target',
  'style',
  'color',
  'scope',
  'name',
  'method',
  'action',
  'autoComplete',
  'inputMode',
  'spellCheck',
  'width',
  'height',
  'size',
  'radius',
  'variant',
  'placement',
  'as',
  'sizes',
  'loading',
  'fetchPriority',
  'dateTime',
  'lang',
  'dir',
  'charSet',
  'property',
  'content',
  'rev',
  'crossOrigin',
  'preload',
  'aria-checked',
  'aria-hidden',
  'aria-busy',
  'aria-current',
  'aria-controls',
  'aria-expanded',
  'data-on',
  'data-theme',
  'textValue',
  'tone',
  'corner',
  'kind',
  'axis',
  'scale',
  'roleKey',
  'suppressHydrationWarning',
  'shouldBlockScroll',
  'closeOnSelect',
  'disabled',
  'tabbed',
  'preserveAspectRatio',
  'fill',
  'stroke',
  'strokeWidth',
  'strokeLinecap',
  'strokeLinejoin',
  'vectorEffect',
  'viewBox',
  'd',
  'points',
  'x',
  'y',
  'x1',
  'x2',
  'y1',
  'y2',
  'cx',
  'cy',
  'r',
  'aria-autocomplete',
  'aria-live',
  'aria-haspopup',
  'data-exclude-search',
  'strategy',
  'selectionMode',
  'column',
  'align',
  'scaleKey',
  'flow',
  'purpose',
  'defaultTheme',
  'attribute',
  'redirectTo',
  'aria-labelledby',
  'hover',
  'example'
]);

// english on purpose, and why. the legal pages carry their own notice
const ENGLISH_ON_PURPOSE =
  /Icons\.tsx|[\\/]design[\\/]|[\\/]privacy[\\/]|[\\/]tos[\\/]|Legal\.tsx|ogCard\.tsx/;

// a name is not copy: nothing below is translatable in any language
const NAMES = new Set(['moddex', 'twitch', 'HTTP', '&copy;']);

// values that read like prose and are not: dom attribute values, a directive,
// and the api's own error slug
const NOT_COPY = new Set(['noopener noreferrer', 'use server', 'use client', 'opted out']);

/** prose has a space, opens with a capital, or trails off — a value does none */
const reads = (text: string): boolean =>
  !NOT_COPY.has(text) && (/\s/.test(text) || /^[A-Z]/.test(text) || /[…?]$/.test(text));

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((entry: string) => {
    const full = join(dir, entry);

    if (statSync(full).isDirectory()) return entry === 'messages' ? [] : walk(full);

    return full.endsWith('.tsx') ? [full] : [];
  });

const prose = (file: string): string[] => {
  const source = ts.createSourceFile(
    file,
    readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );

  const found: string[] = [];
  const words = (text: string) => /[A-Za-z]{2}/.test(text) && !NAMES.has(text.trim());

  const visit = (node: ts.Node): void => {
    if (ts.isJsxText(node) && words(node.text.trim()) && node.text.trim()) {
      found.push(node.text.trim().slice(0, 60));
    }

    if (ts.isJsxAttribute(node) && node.initializer) {
      const name = node.name.getText();
      const init = node.initializer;

      if (!TECHNICAL.has(name) && !name.startsWith('on')) {
        if (ts.isStringLiteral(init) && words(init.text)) found.push(`${name}="${init.text}"`);

        if (ts.isJsxExpression(init) && init.expression) {
          const inner = init.expression;

          if (ts.isStringLiteral(inner) && words(inner.text)) found.push(`${name}="${inner.text}"`);

          if (ts.isTemplateExpression(inner)) {
            const bare = inner.getText().replace(/\$\{[^}]*\}/g, '');

            if (/[A-Za-z]{3,}/.test(bare)) found.push(`${name}={${inner.getText().slice(0, 40)}}`);
          }
        }
      }
    }

    /**
     * `{pending ? 'Loading' : 'Load more'}` is neither jsx text nor an
     * attribute, so the two checks above walk straight past it. A literal in a
     * child expression is prose unless it is being handed to t() or rich().
     */
    if (ts.isJsxExpression(node) && node.expression) {
      const inCall = (child: ts.Node): boolean => {
        for (let up = child.parent; up && up !== node; up = up.parent) {
          if (ts.isCallExpression(up)) return true;
        }

        return false;
      };

      // a nested element is visited on its own; descending into one here would
      // report its className strings as prose
      const nested = (child: ts.Node): boolean =>
        ts.isJsxElement(child) || ts.isJsxSelfClosingElement(child) || ts.isJsxFragment(child);

      const literals = (child: ts.Node): void => {
        if (nested(child)) return;

        const spoken =
          ts.isStringLiteral(child) &&
          words(child.text) &&
          !inCall(child) &&
          !ts.isJsxAttribute(child.parent) &&
          !ts.isPropertyAssignment(child.parent) &&
          !/[/_-]|^[a-z]{1,2}$/.test(child.text) &&
          reads(child.text);

        if (spoken) found.push(`{… '${child.text.slice(0, 40)}'}`);

        ts.forEachChild(child, literals);
      };

      literals(node.expression);
    }

    ts.forEachChild(node, visit);
  };

  visit(source);

  return found;
};

describe('every word a visitor reads comes from a message file', () => {
  it('leaves no prose in jsx outside the files that keep english on purpose', () => {
    const root = join(__dirname, '..', 'src');

    const offenders = walk(root)
      .filter((file) => !ENGLISH_ON_PURPOSE.test(file))
      .flatMap((file) => prose(file).map((hit) => `${file.split('src')[1]}: ${hit}`));

    expect(offenders).toEqual([]);
  });
});

describe('no dash a keyboard has no key for', () => {
  /**
   * An em dash reads as a tic rather than as punctuation, and every one that
   * ever appeared here came from a translation being written rather than from
   * the source copy. A comma, a colon or a full stop always says the same thing.
   */
  it.each(['en', 'de'])('%s.json uses ordinary punctuation', (locale) => {
    const file = join(__dirname, '..', 'src', 'i18n', 'messages', `${locale}.json`);
    const messages = readFileSync(file, 'utf8');

    const offenders = messages
      .split('\n')
      .filter((line) => /[—–]/.test(line))
      .map((line) => line.trim());

    expect(offenders).toEqual([]);
  });
});
