import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const SRC = join(__dirname, '..', 'src');

const keys = readFileSync(join(SRC, 'components', 'Dashboard', 'ClientKeys.tsx'), 'utf8');
const dialog = readFileSync(join(SRC, 'components', 'UI', 'ConfirmDialog.tsx'), 'utf8');

// /settings is the one of these a member of the public actually uses
const SETTINGS = [
  ['ConnectDiscord.tsx', "remove.run('discord')"],
  ['ConnectChannel.tsx', 'disconnect.run()']
] as const;

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

describe('settings asks before undoing a connection', () => {
  it.each(SETTINGS)('%s opens the dialog rather than acting', (file) => {
    const source = readFileSync(join(SRC, 'components', 'Settings', file), 'utf8');

    expect(source).toContain('ConfirmDialog');
    expect(source).toContain('onClick={() => setAsked(true)}');
  });

  // both are recoverable only by walking the whole oauth flow again
  it.each(SETTINGS)('%s reaches its action only through the confirm', (file, call) => {
    const source = readFileSync(join(SRC, 'components', 'Settings', file), 'utf8');
    const confirmed = /const confirm = \(\) => \{[\s\S]*?\n  \};/.exec(source)?.[0] ?? '';

    expect(confirmed).toContain(call);
    expect(source).not.toContain(`onClick={() => void ${call}}`);
    expect(source).toContain('onConfirm={confirm}');
  });
});

describe('one destination has one name', () => {
  it('takes the shared cancel from common, not from the keys panel', () => {
    const settings = SETTINGS.map(([file]) =>
      readFileSync(join(SRC, 'components', 'Settings', file), 'utf8')
    );

    for (const source of [keys, ...settings]) {
      expect(source).toContain("t('common.cancel')");
      expect(source).not.toContain("t('dash.keys.cancel')");
    }
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

    for (const key of ['revokeTitle', 'revokeBody', 'rotateTitle', 'rotateBody']) {
      expect(copy[key], `${locale}.dash.keys.${key}`).toBeTruthy();
    }

    const all = messages(locale);

    expect(all.common.cancel, `${locale}.common.cancel`).toBeTruthy();

    for (const key of ['discordRemoveTitle', 'discordRemoveBody']) {
      expect(all.settings[key], `${locale}.settings.${key}`).toBeTruthy();
    }

    for (const key of ['disconnectTitle', 'disconnectBody']) {
      expect(all.settings.channel[key], `${locale}.settings.channel.${key}`).toBeTruthy();
    }

    expect(copy.rotateBody).toContain('{label}');
    expect(copy.revokeBody).toContain('{label}');
  });
});
