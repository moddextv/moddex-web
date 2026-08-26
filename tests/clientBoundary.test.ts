import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

const SRC = join(__dirname, '..', 'src');

const walk = (dir: string, out: string[] = []): string[] => {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.tsx?$/.test(name)) out.push(full);
  }
  return out;
};

const files = walk(SRC);
const rel = (file: string) => relative(SRC, file).replace(/\\/g, '/');

const directive = (source: string) => source.trimStart().slice(0, 20);
const clientFiles = files.filter((f) => directive(readFileSync(f, 'utf8')).includes('use client'));
const serverActionFiles = files.filter((f) =>
  directive(readFileSync(f, 'utf8')).includes('use server')
);

describe('the client boundary', () => {
  it('finds client files at all, so this cannot pass by reading nothing', () => {
    expect(clientFiles.length).toBeGreaterThan(5);
  });

  // UserProfile called redirect() from inside a useEffect on 2026-08-13. That
  // function belongs to server components, route handlers and server actions; a
  // client component may only reach it during render, so it silently did
  // nothing. Use router.replace() from next/navigation instead.
  it.each(clientFiles.map(rel))('%s does not import redirect from next/navigation', (name) => {
    const source = readFileSync(join(SRC, name), 'utf8');
    const importLine = /import\s*\{([^}]*)\}\s*from\s*'next\/navigation'/.exec(source);

    const imported = (importLine?.[1] ?? '').split(',').map((part) => part.trim());

    expect(imported).not.toContain('redirect');
    expect(imported).not.toContain('permanentRedirect');
  });
});

describe("every export of a 'use server' file is a public endpoint", () => {
  it('finds the action files at all', () => {
    expect(serverActionFiles.length).toBeGreaterThan(5);
  });

  // An unused export here is not lint, it is attack surface: Next registers each
  // one as a Server Action callable by anyone holding its id. fetchUserListData
  // sat here unreferenced, calling the api without a limit — 174 MB of json for
  // nightbot, unauthenticated. Only async functions and erased types belong.
  it.each(serverActionFiles.map(rel))('%s exports only actions and types', (name) => {
    const source = readFileSync(join(SRC, name), 'utf8');

    const offenders = source
      .split('\n')
      .filter((line) => line.startsWith('export '))
      .filter((line) => !/^export\s+async\s+function\s/.test(line))
      .filter((line) => !/^export\s+(type|interface)\s/.test(line));

    expect(offenders).toEqual([]);
  });
});
