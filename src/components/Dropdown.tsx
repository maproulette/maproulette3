import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';

export const Dropdown = ({
  button,
  children,
}: {
  button: React.ReactNode;
  children: React.ReactNode;
}) => {
  return (
    <Menu as="div" className="relative">
      <MenuButton>{button}</MenuButton>
      <Transition
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <MenuItems className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">{children}</div>
        </MenuItems>
      </Transition>
    </Menu>
  );
};

export const DropdownOption = ({ label, onClick }: { label: string; onClick: () => void }) => {
  return (
    <MenuItem>
      <button
        type="button"
        className={'hover:bg-gray-100  text-gray-900 block w-full text-left px-4 py-2 text-sm'}
        onClick={onClick}
      >
        {label}
      </button>
    </MenuItem>
  );
};
