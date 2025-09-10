import { BellIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context';
import { ButtonIcon, MRLogo, SearchInput } from '../../components';
import { SignInButton } from '../../components/SignInButton';
import { UserDropdown } from './UserDropdown';
import { MRContainer } from '../../components/MRContainer';
import { NavLinks } from './NavLinks';

export const Header = () => {
  const { isAuthenticated, logout, login, user } = useAuth();

  return (
    <header>
      <MRContainer>
        <MRLogo size="medium" />
        <SearchInput />
        <NavLinks />
        {isAuthenticated && user ? (
          <div className="flex items-center gap-6">
            <ButtonIcon
              icon={<BellIcon className="h-5 w-5" />}
              onClick={() => {
                console.log('Navigate to notifications');
              }}
            />
            <UserDropdown user={user} logout={logout} />
          </div>
        ) : (
          <SignInButton onClick={login} size="medium" />
        )}
      </MRContainer>
    </header>
  );
};
