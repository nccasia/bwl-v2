import { CreatePostDialog } from "../CreatePostDialog";
import { UserAvatar } from "../UserAvatar";
import Link from "next/link";


type Props = {
    ready: boolean;
    user: any;
    onPostCreated?: () => void;
};

export default function CreatePostBox({ ready, user, onPostCreated }: Props) {
    if (!ready || !user) return null;

    return (
        <div className="bg-card flex items-center gap-4 w-full rounded-2xl p-4 shadow-sm border transition-all duration-200">
            <Link
                href={`/profile/${user.username}`}
                className="cursor-pointer flex items-center gap-1.5 hover:opacity-80 transition-opacity"
            >
                <UserAvatar
                    name={user.username}
                    avatarUrl={user.avatar}
                    size="lg"
                />
            </Link>

            <CreatePostDialog
                authorId={user.username}
                onCreated={onPostCreated}
                className="flex-1"
                trigger={
                    <div className="bg-primary/10 cursor-pointer rounded-full px-6 py-3.5 text-primary/80 text-base font-medium hover:bg-primary/20 transition-colors">
                        {user.name || user.username} ơi, hãy tạo bài bwl nào
                    </div>
                }
            />
        </div>
    );
}