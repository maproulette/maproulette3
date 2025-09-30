import { useNavigate } from '@tanstack/react-router';
import { Dropdown, DropdownOption } from '../../components/Dropdown';
import { UserAvatar } from '../../components/UserAvatar';
import type { User } from '../../types';

export const UserDropdown = ({ user, logout }: { user: User; logout: () => void }) => {
  const navigate = useNavigate();

  return (
    <Dropdown button={<UserAvatar user={user} />}>
      <DropdownOption
        label="Profile"
        onClick={() => {
          console.log('Navigate to profile');
        }}
      />
      <DropdownOption
        label="Settings"
        onClick={() => {
          navigate({ to: '/settings' });
        }}
      />
      <DropdownOption label="Sign out" onClick={logout} />
    </Dropdown>
  );
};
