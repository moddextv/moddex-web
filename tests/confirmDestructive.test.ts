import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const SRC = join(__dirname, '..', 'src');

const keys = readFileSync(join(SRC, 'components', 'Dashboard', 'ClientKeys.tsx'), 'utf8');
const dialog = readFileSync(join(SRC, 'components', 'UI', 'ConfirmDialog.tsx'), 'utf8');

const messages = (locale: string) =>
  JSON.parse(readFileSync(join(SRC, 'i18n', 'messages', `${locale}.json`), 'utf8'));

describe('a destructive key action asks first', () => {
  it('reads the component at all, so this cannot pass by reading nothing', () => {
    expect(keys).toContain('ConfirmDialog');
    expect(keys.length).toBeGreaterThan(1000);
  });

  // both are irreversible: only the hash is stored, so neither may be one click
  it.each(['revoke', 'rotate'])('opens the dialog rather than acting, for %s', (kind) => {
    expect(keys).toContain(`setAsked({ kind: '${kind}', key })`);
  });

  it('wires no destructive handler straight onto a button', () => {
    expect(keys).not.toMatch(/onClick=\{\(\)\s*=>\s*revoke\(/);
    expect(keys).not.toMatch(/onClick=\{\(\)\s*=>\s*rotate\(/);
  });

  it('reaches both server actions only through the dialog', () => {
    const confirmed = /const confirm = \(\) => \{[\s\S]*?\n  \};/.exec(keys)?.[0] ?? '';

    expect(confirmed).toContain('revoke(asked.key.id)');
    expect(confirmed).toContain('rotate(asked.key.id)');
    expect(keys).toContain('onConfirm={confirm}');
  });

  it('leaves cancelling as the passive outcome, so a stray click loses nothing', () => {
    expect(keys).toContain('onCancel={() => setAsked(null)}');
  });
});

describe('the dialog is the platform one, not a library modal', () => {
  // HeroUI's Modal never completed its exit here, so isOpen=false left it mounted,
  // and it never moved focus into the dialog. TRAPS.md 252
  it('uses <dialog> with showModal, which is what gives Escape and the focus trap', () => {
    expect(dialog).toContain('<dialog');
    expect(dialog).toContain('showModal()');
    expect(dialog).not.toContain('@heroui/react');
  });

  it('lets the browser close reach the state, or Escape would leave it stale', () => {
    expect(dialog).toContain('onClose={onCancel}');
    expect(dialog).toContain('node.close()');
  });
});

describe('the dialog stays translatable', () => {
  // it carries no words of its own, which is what keeps copy.test.ts honest here
  it('takes every label as a prop', () => {
    for (const prop of ['title', 'body', 'confirm', 'cancel']) {
      expect(dialog).toContain(`${prop}`);
    }

    expect(dialog).not.toMatch(/>[A-Za-z]{4,}[^<{]*</);
  });

  it.each(['en', 'de', 'fr'])('%s names both consequences, not just the action', (locale) => {
    const copy = messages(locale).dash.keys;

    for (const key of ['revokeTitle', 'revokeBody', 'rotateTitle', 'rotateBody', 'cancel']) {
      expect(copy[key], `${locale}.${key}`).toBeTruthy();
    }

    expect(copy.rotateBody).toContain('{label}');
    expect(copy.revokeBody).toContain('{label}');
  });
});
