import { Link } from '@tanstack/react-router';
import { Avatar, AvatarFallback, AvatarImage } from './ui/Avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from './ui/DropdownMenu';
import { cn } from '../utils/cn';
import { initials } from '../utils/initials';
import { useAuth } from '../contexts/AuthContext';

interface UserDropdownMenuProps {
  className?: string;
}

const UserDropdownMenu: React.FC<UserDropdownMenuProps> = (props) => {
  const { className } = props;
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className={cn('', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger className="flex">
          <Avatar className="size-8 md:size-9">
            <AvatarImage src={user.osmProfile.avatarURL} alt={user.osmProfile.displayName} />
            <AvatarFallback>{initials(user?.osmProfile.displayName)}</AvatarFallback>
          </Avatar>
          <span className="sr-only">User menu</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link to="/settings" className="flex items-center gap-2">
                <Avatar className="size-10">
                  <AvatarImage src={user.osmProfile.avatarURL} alt={user.osmProfile.displayName} />
                  <AvatarFallback>{initials(user.osmProfile.displayName)}</AvatarFallback>
                </Avatar>
                <div>
                  <span className="font-medium">{user.osmProfile.displayName}</span>
                  <br />
                  <span className="text-muted-foreground text-xs tracking-widest font-normal">
                    Edit profile
                  </span>
                </div>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout}>
            <span>Sign out</span>
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserDropdownMenu;
