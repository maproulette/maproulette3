import { UserAvatar } from "../components/UserAvatar";
import { Dropdown, DropdownOption } from "../components/Dropdown";
import { BellIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../context";
import { Link } from "../components/Link";
import { ButtonIcon, SearchInput } from "../components";
import { MapRouletteLogo } from "../components/MapRouletteLogo";
import { SignInButton } from "../components/SignInButton";
import type { User } from "../types";

export const Header = () => {
  const { isAuthenticated, logout, login, user } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-md rounded-lg m-4">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <MapRouletteLogo size="medium" />

          <SearchInput />

          <Link href="/dashboard">Dashboard</Link>
          <Link href="/find-challenges">Find Challenges</Link>
          <Link href="/learn">Learn</Link>
          <Link href="/donate">Donate</Link>

          <ButtonIcon
            icon={<BellIcon className="h-5 w-5" />}
            onClick={() => {
              console.log("Navigate to notifications");
            }}
          />

          {isAuthenticated && user ? (
            <UserDropdown user={user} logout={logout} />
          ) : (
            <SignInButton onClick={login} size="medium" />
          )}
        </div>
      </div>
    </header>
  );
};

const UserDropdown = ({ user, logout }: { user: User; logout: () => void }) => {
  return (
    <Dropdown button={<UserAvatar user={user} />}>
      <DropdownOption
        label="Profile"
        onClick={() => {
          console.log("Navigate to profile");
        }}
      />
      <DropdownOption
        label="Settings"
        onClick={() => {
          console.log("Navigate to settings");
        }}
      />
      <DropdownOption label="Sign out" onClick={logout} />
    </Dropdown>
  );
};
