import type { User } from "../types";

export const UserAvatar = ({ user }: { user: User }) => {
  console.log(user);
  return (
    <div className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md p-1">
      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
        <img src={user.osmProfile.avatarURL} />
      </div>
    </div>
  );
};
