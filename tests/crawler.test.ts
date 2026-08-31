import { describe, expect, it } from 'vitest';

import { isCrawler } from '../src/misc/crawler';

// the agent applebot actually sent while it was filling the refresh queue
const APPLEBOT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15 (Applebot/0.1; +http://www.apple.com/go/applebot)';

describe('the crawler test', () => {
  it.each([
    ['applebot', APPLEBOT],
    ['googlebot', 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'],
    ['gptbot', 'Mozilla/5.0 (compatible; GPTBot/1.2; +https://openai.com/gptbot)'],
    ['bingbot', 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)'],
    ['bytespider', 'Mozilla/5.0 (compatible; Bytespider; spider-feedback@bytedance.com)'],
    ['meta', 'meta-externalagent/1.1 (+https://developers.facebook.com/docs/sharing/webmasters)']
  ])('recognises %s', (_name, agent) => {
    expect(isCrawler(agent)).toBe(true);
  });

  /**
   * Applebot's agent opens with a full Safari string, so a test that only
   * checked the front of it would call this a person. Both failure directions
   * are cheap — a crawler mistaken for a person queues one scrape, a person
   * mistaken for a crawler reads a list one sweep older.
   */
  it.each([
    [
      'safari',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15'
    ],
    [
      'chrome',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'
    ],
    ['nothing at all', '']
  ])('leaves %s alone', (_name, agent) => {
    expect(isCrawler(agent)).toBe(false);
  });
});
