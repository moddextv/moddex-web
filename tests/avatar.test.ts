import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { avatarVariant } from '../src/misc/avatar';

const PICTURES = 'https://static-cdn.jtvnw.net/jtv_user_pictures';

/**
 * Twitch writes a profile picture two ways, and both are live in production.
 * The hashed one is the trap: an earlier regex anchored on `-profile_image-`
 * being followed by the size, which is only true of the uuid form, so 23 of 52
 * avatars on `/channel/forsen` stayed at 150 while every test passed.
 */
const uuid = `${PICTURES}/4058d275-ca87-4cf3-b736-c0392b81b6ed-profile_image-150x150.png`;
const hashed = `${PICTURES}/snusbot-profile_image-fb10e995b329fd44-150x150.png`;

describe('the twitch avatar variant', () => {
  it('takes 70 for a list row, which is what stops the 150 being fetched', () => {
    expect(avatarVariant(uuid, 36)).toBe(
      `${PICTURES}/4058d275-ca87-4cf3-b736-c0392b81b6ed-profile_image-70x70.png`
    );
  });

  it('resizes a hashed url too, which is the half a green suite once missed', () => {
    expect(avatarVariant(hashed, 36)).toBe(
      `${PICTURES}/snusbot-profile_image-fb10e995b329fd44-70x70.png`
    );
  });

  it('takes 70 for the search suggestion too', () => {
    expect(avatarVariant(hashed, 28)).toBe(
      `${PICTURES}/snusbot-profile_image-fb10e995b329fd44-70x70.png`
    );
  });

  // the profile header draws at 88, so 70 would be visibly soft on a 2x screen
  it('takes 300 for the profile header', () => {
    expect(avatarVariant(hashed, 88)).toBe(
      `${PICTURES}/snusbot-profile_image-fb10e995b329fd44-300x300.png`
    );
  });

  it('keeps the extension, because twitch serves png, jpeg and jpg', () => {
    const jpeg = `${PICTURES}/aea0c669-profile_image-150x150.jpeg`;

    expect(avatarVariant(jpeg, 36)).toBe(`${PICTURES}/aea0c669-profile_image-70x70.jpeg`);
    expect(avatarVariant(hashed.replace('.png', '.jpg'), 36)).toMatch(/-70x70\.jpg$/);
  });

  /**
   * Measured against the cdn on 2026-08-31: the default pictures answer 404 at
   * 70 and 50, and only 150 exists. Resizing one blanks the avatar.
   */
  it('leaves a default picture alone, which has no smaller variant', () => {
    const fallback =
      'https://static-cdn.jtvnw.net/user-default-pictures-uv/998cbd42-profile_image-150x150.png';

    expect(avatarVariant(fallback, 36)).toBe(fallback);
  });

  it('leaves anything that is not a twitch url alone', () => {
    expect(avatarVariant('/badges/top-donator/icon.svg', 36)).toBe('/badges/top-donator/icon.svg');
  });
});

/**
 * The variant is only half of it: the point is that the avatar never reaches
 * the optimizer. Applebot walking distinct profiles wrote 1,227,106 entries
 * into `.next/cache/images` in two days and read none of them back, because a
 * crawler does not return to a profile. Dropping `unoptimized` restores that
 * silently — the page still renders.
 */
describe('the avatar components', () => {
  it.each(['src/components/UI/Avatar.tsx', 'src/components/Dashboard/BadgeManager.tsx'])(
    '%s renders its avatar unoptimized',
    (file) => {
      const source = readFileSync(join(__dirname, '..', file), 'utf8');

      expect(source).toContain('unoptimized');
      expect(source).toContain('avatarVariant');
    }
  );
});
