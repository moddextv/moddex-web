import { OG_CONTENT_TYPE, OG_SIZE, brandCard, profileCard, staticCard } from '@/utils/ogCard';
import { seedRoleLists } from '@/utils/roleSeed';
import { getUser } from '@/utils/user';
import { isUsername } from '@/utils/username';
import { logger } from '@/misc/Logger';

const ROLES = ['mods', 'vips', 'founders'] as const;

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = 'moddex | Twitch mod, vip and founder lists';

interface ImageProps {
  params: Promise<{ username: string }>;
}

export default async function Image({ params }: ImageProps) {
  try {
    const username = decodeURI((await params).username);

    if (!isUsername(username)) return brandCard();

    const { user } = await getUser(username);

    if (!user) return brandCard();

    return profileCard({
      type: 'channel',
      login: user.login,
      name: user.name,
      avatar: user.avatar,
      badges: user.badges,
      roles: ROLES,
      seed: await seedRoleLists(user.id, 'channel', ROLES)
    });
  } catch (error) {
    logger.warn('could not draw the channel card', error);

    return staticCard();
  }
}
