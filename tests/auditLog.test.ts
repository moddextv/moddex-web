import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const getAuditLog = vi.fn();
const requirePermission = vi.fn();

vi.mock('@/utils/api/moddex/admin', () => ({ getAuditLog }));
vi.mock('@/utils/authz', () => ({ requirePermission }));

const { listAudit } = await import('@/actions/dashboard');

beforeEach(() => {
  getAuditLog.mockReset().mockResolvedValue({ items: [], hasMore: false, cursor: null });
  requirePermission.mockReset().mockResolvedValue({ userId: '48048659' });
});

// every export of a 'use server' file is a public endpoint, so the filter and
// the page size are decided here rather than by whoever holds the action id
describe('what the dashboard will ask the api for', () => {
  it('leaves sign-ins out of the default view rather than listing the types to keep', async () => {
    await listAudit();

    expect(getAuditLog).toHaveBeenCalledWith('48048659', { limit: 50, exclude: 'login' });
  });

  it('asks for sign-ins by name when that is the view', async () => {
    await listAudit('logins');

    expect(getAuditLog).toHaveBeenCalledWith('48048659', { limit: 50, type: 'login' });
  });

  it('filters nothing only when the view says everything', async () => {
    await listAudit('everything');

    expect(getAuditLog).toHaveBeenCalledWith('48048659', { limit: 50 });
  });

  it('sends its own limit no matter what a caller passes', async () => {
    await listAudit('actions', '20');

    expect(getAuditLog).toHaveBeenCalledWith('48048659', {
      limit: 50,
      exclude: 'login',
      cursor: '20'
    });
  });

  it('reads the acting admin from the session and never from an argument', async () => {
    await listAudit();

    expect(requirePermission).toHaveBeenCalled();
  });
});

// The login has broken once across thirteen next-auth betas and nothing but a
// person noticed. Recording it may never be able to cost somebody their sign-in.
describe('the sign-in event', () => {
  const source = readFileSync(join(__dirname, '..', 'src', 'auth.ts'), 'utf8');

  it('is not awaited', () => {
    expect(source).toMatch(/void recordLogin\(/);
    expect(source).not.toMatch(/await recordLogin\(/);
  });

  it('swallows its own failure', () => {
    expect(source).toMatch(/recordLogin\([^)]*\)\.catch\(/);
  });

  it('sits in events rather than in the jwt callback that the token waits on', () => {
    const events = source.slice(source.indexOf('events:'), source.indexOf('callbacks:'));

    expect(events).toContain('recordLogin');
  });
});
