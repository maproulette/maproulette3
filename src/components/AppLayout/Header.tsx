import { Link } from '@tanstack/react-router'
import { ExternalLink, MenuIcon } from 'lucide-react'
import type * as React from 'react'
import { Button } from '@/components/ui/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { Loader } from '@/components/ui/Loader'
import { Logomark } from '@/components/ui/Logomark'
import { useAuth } from '@/contexts/AuthContext'
import { navigation } from '@/data/site.json'
import { cn } from '@/lib/utils'
import { DropdownMenuNotifications } from './DropdownMenuNotifications'
import { DropdownMenuUser } from './DropdownMenuUser'
import { GlobalSearch } from './GlobalSearch'

export const Header = ({ className, ...props }: React.ComponentProps<'header'>) => {
  const { user, logout, login, authLoading } = useAuth()
  const { main: mainNavigation } = navigation

  return (
    <header
      className={cn(
        'relative z-30 flex items-center justify-between gap-4 rounded-full bg-white px-3 py-2.5 md:gap-6 md:px-5 md:py-3.5 lg:gap-12 dark:bg-zinc-950',
        className
      )}
      {...props}
    >
      <Link to="/" rel="home" className="flex items-center gap-2">
        <Logomark className="size-8 md:size-9" aria-hidden="true" />
        <span className="sr-only font-medium text-xl/5 sm:not-sr-only">
          {import.meta.env.VITE_APP_NAME}
        </span>
      </Link>
      <GlobalSearch className="-m-2.5 md:-m-3.5 grow p-2.5 md:p-3.5" />
      <nav aria-label="Primary" className="hidden text-sm lg:flex lg:gap-6">
        {mainNavigation.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            target={item.openInNewTab ? '_blank' : ''}
            className="link-nav flex items-center gap-1.5"
          >
            {item.label}
            {item.openInNewTab && (
              <ExternalLink className="size-3.5" aria-label={`Open ${item.label} in a new tab`} />
            )}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-4">
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
            {mainNavigation.map((item) => (
              <DropdownMenuItem key={item.to} asChild>
                <Link to={item.to} className="flex w-full items-center gap-1.5">
                  {item.label}
                  {item.openInNewTab && (
                    <ExternalLink
                      className="size-3.5"
                      aria-label={`Open ${item.label} in a new tab`}
                    />
                  )}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {user ? (
          <>
            <DropdownMenuNotifications user={user} align="end" />
            <DropdownMenuUser user={user} logout={logout} align="end" />
          </>
        ) : authLoading ? (
          <Loader message="signing in..." />
        ) : (
          <Button size="lg" onClick={login}>
            Sign in
          </Button>
        )}
      </div>
    </header>
  )
}
