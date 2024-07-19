import { IVRUser } from '@/misc/Interfaces';

export async function ivr(path: string): Promise<IVRUser[]> {
  try {
    const response = await fetch(`https://api.ivr.fi/v2/twitch/${path}`);
    return await response.json();
  } catch (err) {
    return [];
  }
}
