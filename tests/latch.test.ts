import { describe, expect, it } from 'vitest';
import { acquire, release } from '@/hooks/latch';

describe('acquire', () => {
  it('lets the first caller through', () => {
    const latch = { current: false };

    expect(acquire(latch)).toBe(true);
  });

  it('refuses the second caller in the same tick', () => {
    const latch = { current: false };

    expect(acquire(latch)).toBe(true);
    expect(acquire(latch)).toBe(false);
  });

  it('refuses every further caller, not just the second', () => {
    const latch = { current: false };
    acquire(latch);

    expect([acquire(latch), acquire(latch), acquire(latch)]).toEqual([false, false, false]);
  });
});

describe('release', () => {
  it('lets the next caller through', () => {
    const latch = { current: false };
    acquire(latch);
    release(latch);

    expect(acquire(latch)).toBe(true);
  });

  it('is what makes a failed call survivable', () => {
    const latch = { current: false };

    try {
      acquire(latch);
      throw new Error('the action threw');
    } catch {
      release(latch);
    }

    expect(acquire(latch)).toBe(true);
  });

  it('is safe when nothing holds it', () => {
    const latch = { current: false };

    expect(() => release(latch)).not.toThrow();
    expect(acquire(latch)).toBe(true);
  });
});
