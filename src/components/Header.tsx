import { Button, Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context';

export const Header = () => {
  const { isAuthenticated, logout, login, user } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-lg font-bold text-gray-900">MapRoulette 4</h1>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated && user && (
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md p-1">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <UserCircleIcon className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-medium">{user.osmProfile?.displayName || 'User'}</span>
                  <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                </Menu.Button>

                <Transition
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <button
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
