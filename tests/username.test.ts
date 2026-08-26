import { describe, expect, it } from 'vitest';
import { isUsername } from '@/utils/username';

// This is what stops junk reaching the api from /user/[username], /channel and
// the donation receipt, so the rejections matter as much as the acceptances.

describe('isUsername', () => {
  it.each(['forsen', 'nightbot', 'a', 'x_1', 'A_B_9', '_leading'])('accepts %s', (name) => {
    expect(isUsername(name)).toBe(true);
  });

  it('accepts 25 characters and refuses 26', () => {
    expect(isUsername('a'.repeat(25))).toBe(true);
    expect(isUsername('a'.repeat(26))).toBe(false);
  });

  it('refuses an empty login', () => {
    expect(isUsername('')).toBe(false);
  });

  it.each([
    ['a dash', 'not-a-login'],
    ['a dot', 'not.a.login'],
    ['a space', 'two words'],
    ['a slash, which would be a path', 'forsen/../admin'],
    ['a percent escape', 'forsen%2f'],
    ['an at sign', '@forsen']
  ])('refuses %s', (_why, value) => {
    expect(isUsername(value)).toBe(false);
  });

  it('is anchored at both ends, so a valid name inside junk does not pass', () => {
    expect(isUsername('!forsen')).toBe(false);
    expect(isUsername('forsen!')).toBe(false);
    expect(isUsername('\nforsen')).toBe(false);
  });

  // In JS `$` matches only the end of input, so a trailing newline is refused.
  // The same pattern in python would accept it and forward "forsen\n" to the api.
  it('refuses a trailing line terminator', () => {
    expect(isUsername('forsen\n')).toBe(false);
    expect(isUsername('forsen\r')).toBe(false);
  });
});
