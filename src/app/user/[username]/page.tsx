import { UserProfile } from '@/components/User/UserProfile';
import { getUser } from '@/utils/user';
import { NotFound } from '@/components/Errors';
import { UserList } from '@/components/User/UserList';

interface PageProps {
    params: { username: string };
}

export default async function UserUsernamePage({ params }: PageProps) {
    const username = decodeURI(params.username);

    const user = await getUser(username);
    if (!user) {
        return (
            <NotFound message={`User «${username}» not found`}/>
        );
    }

    return (
        <div className="user-grid">
            <UserProfile user={user} isUser={true} />

            <div className="list-section">
                <UserList type="user" role="modding" user={user} />
                <UserList type="user" role="viping" user={user} />
            </div>
        </div>
    );
}