import { IVRUser } from '@/misc/Interfaces';

export const ivr = async (path: string): Promise<IVRUser[]> => {
  try {
    const response = await fetch(`https://api.ivr.fi/v2/twitch/${path}`);
    return await response.json();
  } catch (err) {
    return [];
  }
}

export const getUser = async function(user: string) {
  const encodedUser = encodeURIComponent(user);

  const data = await getUserByLogin(encodedUser) ?? await getUserById(encodedUser);
  if (data?.id) return data;

  return null;
};

export const getUserById = async (userId: string) => {
  if (isNaN(Number(userId))) return null;

  const data = await ivr(`user?id=${userId}`);
  if (!data?.[0]?.id) return null;
  return data[0];
};

export const getUserByLogin = async (user: string) => {
  const data = await ivr(`user?login=${user}`);
  if (!data?.[0]?.id) return null;
  return data[0];
};
