import { Button, Field, Input, Menu, Transition } from '@headlessui/react';
import { BellIcon, MagnifyingGlassIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import type React from 'react';
import logoUrl from '../assets/logo.png';
import { useAuth } from '../context';

export const Header: React.FC = () => {
  const { isAuthenticated, logout, login, user } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-md rounded-lg m-4">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center flex-none">
            <img src={logoUrl} alt="MapRoulette" className="h-8 w-auto" />
          </div>

          <div className="flex-1 max-w-xl w-full">
            <Field>
              <div className="relative">
                <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search"
                  className="w-full rounded-md bg-gray-100 py-2 pl-10 pr-3 text-sm text-gray-900 placeholder:text-gray-500 outline-none ring-1 ring-transparent focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </Field>
          </div>

          <div className="flex items-center gap-5 flex-none">
            <a
              href="/donate"
              className="text-sm font-medium text-black hover:text-black focus:text-black active:text-black"
            >
              Dashboard
            </a>
            <a
              href="/donate"
              className="text-sm font-medium text-black hover:text-black focus:text-black active:text-black"
            >
              Find Challenges
            </a>
            <a
              href="/donate"
              className="text-sm font-medium text-black hover:text-black focus:text-black active:text-black"
            >
              Learn
            </a>
            <a
              href="/donate"
              className="text-sm font-medium text-black hover:text-black focus:text-black active:text-black"
            >
              Donate
            </a>
            <button
              type="button"
              aria-label="Notifications"
              className="relative rounded-md p-1 text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <BellIcon className="h-5 w-5" />
              <span
                aria-hidden="true"
                className="absolute -top-0.5 -right-0.5 inline-block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"
              />
            </button>
            {isAuthenticated && user && (
              <Menu as="div" className="relative">
                <Menu.Button
                  type="button"
                  className="flex items-center text-sm text-gray-700 hover:text-gray-900 rounded-md p-1"
                >
                  <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                    <UserCircleIcon className="w-4 h-4 text-white" />
                  </div>
                </Menu.Button>

                <Transition
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-2 border-b border-gray-100">
                      <div className="px-4 text-sm font-semibold text-gray-900 truncate">
                        {user.osmProfile?.displayName || 'User'}
                      </div>
                    </div>
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            type="button"
                            className={`${
                              active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                            } block w-full text-left px-4 py-2 text-sm`}
                            onClick={() => {
                              // TODO: Navigate to user profile
                              console.log('Navigate to profile');
                            }}
                          >
                            Profile
                          </button>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            type="button"
                            className={`${
                              active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                            } block w-full text-left px-4 py-2 text-sm`}
                            onClick={() => {
                              // TODO: Navigate to settings
                              console.log('Navigate to settings');
                            }}
                          >
                            Settings
                          </button>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            type="button"
                            className={`${
                              active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                            } block w-full text-left px-4 py-2 text-sm`}
                            onClick={logout}
                          >
                            Sign out
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            )}

            {!isAuthenticated && (
              <Button
                type="button"
                onClick={login}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white transition-colors"
              >
                Sign in
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
