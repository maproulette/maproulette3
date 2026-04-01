import { Link } from '@tanstack/react-router'
import { useAuthContext } from '@/components/AuthContext'
import { Button } from '@/components/ui/Button'
import { Loader } from '@/components/ui/Loader'
import { Logomark } from '@/components/ui/Logomark'
import { DesktopNav } from './DesktopNav'
import { DropdownMenuNotifications } from './DropdownMenuNotifications'
import { DropdownMenuUser } from './DropdownMenuUser'
import { GlobalSearch } from './GlobalSearch'
import { MobileNav } from './MobileNav'

export const Header = () => {
  const { user, login, authLoading } = useAuthContext()

  return (
    <header className="relative z-30 flex items-center justify-between gap-4 px-3 py-2.5 md:gap-6 md:px-5 md:py-3.5 lg:gap-12">
      <Link to="/" rel="home" className="flex items-center gap-2">
        <Logomark className="size-8 md:size-9" aria-hidden="true" />
        <span className="whitespace-nowrap font-medium text-xl/5">
          {import.meta.env.VITE_APP_NAME || 'MapRoulette'}
        </span>
      </Link>
      <GlobalSearch className="-m-2.5 md:-m-3.5 grow p-2.5 md:p-3.5" />
      <DesktopNav />
      <div className="flex items-center gap-4">
        <MobileNav />
        {user ? (
          <>
            <DropdownMenuNotifications user={user} />
            <DropdownMenuUser user={user} />
          </>
        ) : authLoading ? (
          <Loader message="signing in..." />
        ) : (
          <Button size="lg" onClick={login} className="rounded-full">
            Sign in
          </Button>
        )}
      </div>
    </header>
  )
}
