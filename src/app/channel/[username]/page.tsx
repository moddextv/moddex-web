import { UserProfile } from '@/components/User/UserProfile';
import { getUser } from '@/utils/user';
import { NotFound } from '@/components/Errors';
import { UserList } from '@/components/User/UserList';

interface PageProps {
    params: { username: string };
}

export default async function ChannelUsernamePage({ params }: PageProps) {
    const username = decodeURI(params.username);

    const user = await getUser(username);
    if (!user) {
        return (
            <NotFound message={`User «${username}» not found`}/>
        );
    }

    return (
        <div className="user-grid">
            <UserProfile user={user}/>

            <div className="list-section">
                <UserList type="channel" role="mods" user={user} />
                <UserList type="channel" role="vips" user={user} />
            </div>
        </div>
    );
}