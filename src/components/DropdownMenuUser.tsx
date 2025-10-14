import { Link } from '@tanstack/react-router'
import { CircleUser, LogOut, SwatchBook } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { cn, initials } from '@/lib/utils'
import type { User } from '@/types/User'
import { ThemeSwitcher } from './ThemeSwitcher'

function DropdownMenuUser({
  user,
  className,
  logout,
  ...props
}: React.ComponentProps<typeof DropdownMenuContent> & {
  user: User
  logout: () => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex cursor-pointer">
        <Avatar className="size-8 md:size-9">
          <AvatarImage src={user.osmProfile.avatarURL} alt={user.osmProfile.displayName} />
          <AvatarFallback>{initials(user.osmProfile.displayName)}</AvatarFallback>
        </Avatar>
        <span className="sr-only">User menu</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className={cn('w-56', className)}
        sideOffset={10}
        alignOffset={-10}
        {...props}
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center gap-2">
            <Avatar className="size-10">
              <AvatarImage src={user.osmProfile.avatarURL} alt={user.osmProfile.displayName} />
              <AvatarFallback>{initials(user.osmProfile.displayName)}</AvatarFallback>
            </Avatar>
            <div>
              <span className="font-medium">{user.osmProfile.displayName}</span>
              <br />
              <span className="text-xs text-zinc-500">View user profile</span>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/account">
            <CircleUser className="size-4" aria-hidden="true" /> Account
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={logout}>
          <LogOut className="size-4" aria-hidden="true" /> Sign out
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          asChild
          onSelect={(e) => {
            e.preventDefault()
          }}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="flex gap-2">
              <SwatchBook className="size-4" aria-hidden="true" /> Theme
            </span>
            <ThemeSwitcher />
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { DropdownMenuUser }
