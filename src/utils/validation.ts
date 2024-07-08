import { regex } from '@/utils/regex';
import { ivr } from '@/utils/api/ivr';
import { IVRUser } from '@/misc/Interfaces';

export async function validateUsername(username: string = ''): Promise<boolean> {
    if (!regex.username.test(username)) {
        return false;
    }

    const users: IVRUser[] = await ivr(`user?login=${username}`);
    if (!users.length) {
        return false;
    }

    return !users[0].banned;
}