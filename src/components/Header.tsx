import type React from 'react';
import { useAuth } from '../context';

export const Header: React.FC = () => {
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
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg 
                    className="w-4 h-4 text-white" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                    role="img"
                    aria-label="User profile icon"
                  >
                    <title>User Profile</title>
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="text-sm text-gray-700">
                  {user.osmProfile?.displayName || 'User'}
                </span>
              </div>
            )}

            {isAuthenticated ? (
              <button
                type="button"
                onClick={logout}
                className="px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-white transition-colors"
              >
                Logout
              </button>
            ) : (
              <button
                type="button"
                onClick={login}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white transition-colors"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
