/* eslint-disable @next/next/no-img-element -- satori renders no html, so next/image has nothing to optimise */

import { DEFAULT_LOCALE, getTranslator } from '@/i18n';
import 'server-only';

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { ImageResponse } from 'next/og';
import sharp from 'sharp';
import type { ReactNode } from 'react';

import { ROLES, roleByLabel, type RoleKey, type RoleType, type UserType } from '@/misc/roles';
import { logger } from '@/misc/Logger';
import type { Badge } from '@/misc/badges';
import type { Seed } from '@/utils/roleSeed';

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = 'image/png';

const CACHE = {
  'content-type': OG_CONTENT_TYPE,
  'cache-control': 'public, max-age=86400, stale-while-revalidate=604800'
};

const PUBLIC = join(process.cwd(), 'public');

export const staticCard = async (): Promise<Response> =>
  new Response(await readFile(join(PUBLIC, 'og.png')), { headers: CACHE });

// next's image optimizer blocks every libvips loader process-wide and leaves svg blocked
const allowSvgRasterisation = () => {
  try {
    sharp.unblock({ operation: ['VipsForeignLoadSvg'] });
  } catch (error) {
    logger.warn('could not unblock the svg loader for the card', error);
  }
};

const rasterise = async (draw: () => ImageResponse): Promise<Response> => {
  try {
    allowSvgRasterisation();

    return new Response(await draw().arrayBuffer(), { headers: CACHE });
  } catch (error) {
    logger.warn('the card could not be drawn, serving the static one', error);

    return staticCard();
  }
};

const INK = '#0B0B0C';
const RAISED = '#111113';
const LINE = '#232326';
const TEXT = '#E7E7EA';
const TEXT_ALT = '#8A8A93';
const TEXT_DIM = '#55555F';

// satori reads no css variable, so tests/og.test.ts holds these equal to globals.css
const ROLE_COLOR: Record<RoleKey, string> = {
  mod: '#4ADE80',
  vip: '#F472B6',
  founder: '#FBBF24',
  artist: '#60A5FA'
};

const MARK_IN = ROLE_COLOR.mod;
const MARK_OUT = ROLE_COLOR.vip;

const INSET = 56;
const RADIUS = 28;

const isAscii = (value: string): boolean => /^[\x20-\x7e]+$/.test(value);

const HEADLINE_WIDTH = 380;

// the headline shares the row with the counts, so it shrinks to stay inside its column
const headlineSize = (login: string): number =>
  Math.max(26, Math.min(68, Math.round(580 / (login.length + 1))));

const countSize = (count: string): number => (count.length > 5 ? 42 : 50);

// undici implements no file: protocol, so these are read rather than fetched
const readFonts = async () => {
  const [medium, extraBold] = await Promise.all([
    readFile(new URL('../fonts/Manrope-Medium.ttf', import.meta.url)),
    readFile(new URL('../fonts/Manrope-ExtraBold.ttf', import.meta.url))
  ]);

  return [
    { name: 'Manrope', data: medium, weight: 500 as const, style: 'normal' as const },
    { name: 'Manrope', data: extraBold, weight: 800 as const, style: 'normal' as const }
  ];
};

let fonts: ReturnType<typeof readFonts> | null = null;

const loadFonts = async () => {
  fonts ??= readFonts();

  try {
    return await fonts;
  } catch (error) {
    fonts = null;
    throw error;
  }
};

const loadBadge = async (url: string): Promise<string | null> => {
  const file = url.split('/').pop() || '';

  if (!/^[a-z0-9_]+\.svg$/.test(file)) return null;

  try {
    const svg = await readFile(join(PUBLIC, 'badges', file));

    return `data:image/svg+xml;base64,${svg.toString('base64')}`;
  } catch {
    return null;
  }
};

// satori decodes png and jpeg only, and anything else takes the whole route down
const decodable = (bytes: Buffer): 'image/png' | 'image/jpeg' | null => {
  if (bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return 'image/png';
  }

  if (bytes.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) return 'image/jpeg';

  return null;
};

const loadAvatar = async (url: string | null): Promise<string | null> => {
  if (!url) return null;

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(2500) });

    if (!response.ok) return null;

    const bytes = Buffer.from(await response.arrayBuffer());
    const type = decodable(bytes);

    if (!type || bytes.byteLength > 2_000_000) {
      logger.warn(`the avatar at ${url} is not a png or jpeg, drawing the card without it`);

      return null;
    }

    return `data:${type};base64,${bytes.toString('base64')}`;
  } catch {
    return null;
  }
};

const cornerStyle = (corner: string, color: string) => ({
  width: 18,
  height: 18,
  borderStyle: 'solid' as const,
  borderColor: color,
  borderTopWidth: corner.includes('t') ? 3 : 0,
  borderBottomWidth: corner.includes('b') ? 3 : 0,
  borderLeftWidth: corner.includes('l') ? 3 : 0,
  borderRightWidth: corner.includes('r') ? 3 : 0
});

const Mark = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32">
    <rect width="32" height="32" rx="6" fill={INK} />
    <path d="M4 4 H18 V10 H10 V18 H4 Z" fill={MARK_IN} />
    <path d="M28 28 H14 V22 H22 V14 H28 Z" fill={MARK_OUT} />
  </svg>
);

const labelFor = (role: RoleKey, type: UserType): string =>
  type === 'channel' ? ROLES[role].channelLabel : ROLES[role].userTitle.toLowerCase();

const Stat = ({ role, type, count }: { role: RoleKey; type: UserType; count: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        width: 175,
        fontSize: countSize(count),
        fontWeight: 800,
        color: ROLE_COLOR[role]
      }}
    >
      {count}
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: 176 }}>
      <div style={cornerStyle(ROLES[role].corner, ROLE_COLOR[role])} />
      <div style={{ fontSize: 26, fontWeight: 500, color: TEXT_ALT }}>{labelFor(role, type)}</div>
    </div>
  </div>
);

// the card's own labels are english, so its numbers are too
const countOf = (seed: Seed, role: RoleType): string | null => {
  const page = seed[role];
  const { number } = getTranslator(DEFAULT_LOCALE);

  if (!page) return null;
  if (page.total !== null) return number(page.total);

  return page.items.length ? `${number(page.items.length)}${page.hasMore ? '+' : ''}` : '0';
};

const Frame = ({ kind, children }: { kind?: string; children: ReactNode }) => (
  <div
    style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      backgroundColor: INK,
      padding: INSET,
      fontFamily: 'Manrope'
    }}
  >
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        padding: 48,
        borderRadius: RADIUS,
        backgroundColor: RAISED,
        backgroundImage: `radial-gradient(circle at 0% 0%, ${MARK_IN}1f, transparent 55%), radial-gradient(circle at 100% 100%, ${MARK_OUT}24, transparent 55%)`
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Mark size={46} />
          <div style={{ fontSize: 36, fontWeight: 800, color: TEXT }}>moddex</div>
        </div>
        {kind ? (
          <div
            style={{
              display: 'flex',
              fontSize: 25,
              fontWeight: 500,
              color: TEXT_ALT,
              border: `2px solid ${LINE}`,
              borderRadius: 999,
              padding: '10px 26px'
            }}
          >
            {kind}
          </div>
        ) : null}
      </div>
      {children}
    </div>
  </div>
);

export const brandCard = async (): Promise<Response> => {
  const fonts = await loadFonts();

  return rasterise(
    () =>
      new ImageResponse(
        <Frame>
          <div
            style={{
              display: 'flex',
              flexGrow: 1,
              alignItems: 'center',
              fontSize: 44,
              fontWeight: 500,
              color: TEXT_ALT
            }}
          >
            Twitch mod, vip and founder lists
          </div>
        </Frame>,
        { ...OG_SIZE, fonts }
      )
  );
};

interface CardProps {
  type: UserType;
  login: string;
  name: string | null;
  avatar: string | null;
  badges: Badge[];
  roles: readonly RoleType[];
  seed: Seed;
}

export const profileCard = async ({
  type,
  login,
  name,
  avatar,
  badges: worn,
  roles,
  seed
}: CardProps): Promise<Response> => {
  const [fonts, picture, drawn] = await Promise.all([
    loadFonts(),
    loadAvatar(avatar),
    Promise.all(worn.map((badge) => loadBadge(badge.svg)))
  ]);
  const badges = drawn.filter((badge): badge is string => badge !== null);
  const subtitle =
    name && name.toLowerCase() !== login.toLowerCase() && isAscii(name) ? name : null;

  const stats = roles
    .map((role) => ({ key: roleByLabel(role), count: countOf(seed, role) }))
    .filter((stat): stat is { key: RoleKey; count: string } => Boolean(stat.key && stat.count));

  return rasterise(
    () =>
      new ImageResponse(
        <Frame kind={type === 'channel' ? 'channel' : 'account'}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 36,
              flexGrow: 1
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
              {picture ? (
                <img
                  src={picture}
                  alt=""
                  width={168}
                  height={168}
                  style={{ borderRadius: 999, border: `4px solid ${LINE}` }}
                />
              ) : null}
              <div style={{ display: 'flex', flexDirection: 'column', width: HEADLINE_WIDTH }}>
                <div
                  style={{
                    fontSize: headlineSize(login),
                    fontWeight: 800,
                    color: TEXT,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {`@${login}`}
                </div>
                {subtitle ? (
                  <div style={{ fontSize: 32, fontWeight: 500, color: TEXT_ALT, marginTop: 2 }}>
                    {subtitle}
                  </div>
                ) : null}
                {badges.length ? (
                  <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
                    {badges.map((badge) => (
                      <img key={badge} src={badge} alt="" width={46} height={46} />
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 22, flexShrink: 0 }}>
              {stats.map((stat) => (
                <Stat key={stat.key} role={stat.key} type={type} count={stat.count} />
              ))}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              fontSize: 23,
              fontWeight: 500,
              color: TEXT_DIM
            }}
          >
            {`moddex.tv/${type}/${login}`}
          </div>
        </Frame>,
        { ...OG_SIZE, fonts }
      )
  );
};
