import { describe, expect, it } from 'vitest';

import { displayBio, tameCombiningMarks } from '../src/utils/text';

describe('leaves real text alone', () => {
  it('passes plain ascii through untouched', () => {
    expect(tameCombiningMarks('Founder of Susgeebot')).toBe('Founder of Susgeebot');
  });

  it('keeps Vietnamese, which stacks a tone over a diacritic', () => {
    const vietnamese = 'Tiếng Việt';
    expect(tameCombiningMarks(vietnamese.normalize('NFD'))).toBe(vietnamese.normalize('NFD'));
  });

  it('keeps Thai, which stacks a vowel and a tone on one consonant', () => {
    const thai = 'กิ้';
    expect(tameCombiningMarks(thai)).toBe(thai);
  });

  it('keeps Arabic vowelling', () => {
    const arabic = 'مُحَمَّد';
    expect(tameCombiningMarks(arabic)).toBe(arabic);
  });

  it('keeps emoji and other non-mark unicode', () => {
    const text = 'zapraszam na kozackie streamki 🤩';
    expect(tameCombiningMarks(text)).toBe(text);
  });
});

describe('caps stacked marks', () => {
  it('cuts a zalgo run down to the allowance', () => {
    const zalgo = 'A' + '̈'.repeat(60);
    expect(tameCombiningMarks(zalgo)).toBe('Ä̈');
  });

  it('handles the real lucas19961 shape: thai yamakkan repeated', () => {
    const bio = 'Founder of Susgeebot' + 'ฏ' + '๎'.repeat(90);
    const out = tameCombiningMarks(bio);

    expect(out).toBe('Founder of Susgeebotฏ๎๎');
    expect(out.startsWith('Founder of Susgeebot')).toBe(true);
  });

  it('caps each base separately rather than the string as a whole', () => {
    const two = 'A' + '̈'.repeat(9) + 'B' + '́'.repeat(9);
    expect(tameCombiningMarks(two)).toBe('Ä̈B́́');
  });

  it('is idempotent', () => {
    const once = tameCombiningMarks('A' + '̈'.repeat(40));
    expect(tameCombiningMarks(once)).toBe(once);
  });
});

describe('displayBio', () => {
  it('returns an empty string for nothing, so the caller can just test it', () => {
    expect(displayBio(null)).toBe('');
    expect(displayBio(undefined)).toBe('');
    expect(displayBio('   ')).toBe('');
  });

  it('trims', () => {
    expect(displayBio('  hello  ')).toBe('hello');
  });

  it('caps length with an ellipsis', () => {
    const long = 'a'.repeat(400);
    const out = displayBio(long);

    expect(out).toHaveLength(300);
    expect(out.endsWith('…')).toBe(true);
  });

  it('does not truncate a bio at twitch’s own limit', () => {
    const max = 'a'.repeat(300);
    expect(displayBio(max)).toBe(max);
  });

  it('tames before measuring, so a zalgo bomb is not counted as length', () => {
    const bio = 'hi' + '̈'.repeat(5000);
    const out = displayBio(bio);

    expect(out.startsWith('hi')).toBe(true);
    expect(out.endsWith('…')).toBe(false);
    expect(out.length).toBeLessThan(10);
  });
});
