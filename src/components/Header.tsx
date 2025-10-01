import { Link } from '@tanstack/react-router';
import { Bell } from 'lucide-react';
import type * as React from 'react';
import { Button } from './ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../utils/cn';
import Logomark from '../svg/logomark.svg?react';
import GlobalSearch from './GlobalSearch.tsx';
import UserDropdownMenu from './UserDropdownMenu.tsx';

const Header = ({ className, ...props }: React.ComponentProps<'header'>) => {
  const { user, login } = useAuth();

  return (
    <header
      className={cn(
        'bg-card text-card-foreground flex items-center justify-between gap-4 rounded-full border px-3 py-2.5 md:px-5 md:py-3.5 md:gap-10',
        className
      )}
      {...props}
    >
      <Link to="/" rel="home" className="flex items-center gap-2">
        <Logomark className="size-8 md:size-9" aria-hidden="true" />
        <span className="sr-only text-xl/5 font-medium sm:not-sr-only">
          {import.meta.env.VITE_APP_NAME}
        </span>
      </Link>
      <GlobalSearch className="grow" />
      <div className="flex items-center gap-4">
        <nav aria-label="Primary" className="hidden lg:flex">
          <Button asChild variant="link" size="sm">
            <Link to="/">Dashboard</Link>
          </Button>
          <Button asChild variant="link" size="sm">
            <Link to="/browse/challenges">Find Challenges</Link>
          </Button>
          <Button asChild variant="link" size="sm">
            <Link to="/learn">Learn</Link>
          </Button>
          <Button asChild variant="link" size="sm">
            <Link to="/donate">Donate</Link>
          </Button>
        </nav>
        {user ? (
          <>
            <div>
              <Bell className="size-5" />
            </div>
            <UserDropdownMenu />
          </>
        ) : (
          <Button onClick={login} variant="secondary" className="rounded-full">
            Sign in
          </Button>
        )}
      </div>
    </header>
  );
};

export default Header;
