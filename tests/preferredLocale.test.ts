import { preferredLocale } from '@/i18n/preferred';
import { describe, expect, it } from 'vitest';

describe('preferredLocale', () => {
  it('takes the first browser language the site serves', () => {
    expect(preferredLocale(['es-ES', 'en'])).toBe('es');
    expect(preferredLocale(['es-MX'])).toBe('es');
    expect(preferredLocale(['pt-BR', 'de-CH', 'en'])).toBe('de');
  });

  it('stops at english, so an english-first reader is never offered another language', () => {
    expect(preferredLocale(['en-US', 'de'])).toBe('en');
  });

  it('offers traditional chinese only to a traditional-chinese browser', () => {
    expect(preferredLocale(['zh-TW'])).toBe('zh');
    expect(preferredLocale(['zh-Hant-HK'])).toBe('zh');
    expect(preferredLocale(['zh-CN', 'en'])).toBe('en');
    expect(preferredLocale(['zh'])).toBeNull();
  });

  it('answers nothing when no language matches', () => {
    expect(preferredLocale(['ja', 'ko'])).toBeNull();
    expect(preferredLocale([])).toBeNull();
  });
});
