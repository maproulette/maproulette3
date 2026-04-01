import { Link } from '@tanstack/react-router'
import { ExternalLink, MenuIcon } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { useNavigation } from '@/contexts/NavigationContext'

export const MobileNav = () => {
  const { allNavigationItems } = useNavigation()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="hover:text-lime-600 lg:hidden"
          aria-label="Mobile navigation"
        >
          <MenuIcon className="size-6" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center">
        {allNavigationItems.map((item) => (
          <DropdownMenuItem key={item.to} asChild>
            <Link to={item.to} className="flex w-full items-center gap-1.5">
              {item.icon && <span className="inline-flex">{item.icon}</span>}
              {item.label}
              {item.openInNewTab && (
                <ExternalLink className="size-3.5" aria-label={`Open ${item.label} in a new tab`} />
              )}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
