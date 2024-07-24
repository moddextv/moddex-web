import { IVRUser } from '@/misc/Interfaces';
import { ivr } from '@/utils/api/ivr';
import { regex } from '@/utils/regex';

export const validateUsername = async (
  username: string = ''
): Promise<boolean> => {
  if (!regex.username.test(username)) {
    return false;
  }

  const users: IVRUser[] = await ivr(`user?login=${username}`);
  if (!users.length) {
    return false;
  }

  return !users[0].banned;
};

export const isInteger = (value: any): boolean => {
  const numberValue = Number(value);
  return Number.isInteger(numberValue);
};
