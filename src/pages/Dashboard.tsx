import { useAuth } from '../context';

export const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="grid items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8">Welcome to MapRoulette 4!</h1>
        <div className="mb-8">
          {isAuthenticated ? (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              <p className="font-semibold">Authenticated!</p>
              <p>Welcome, {user?.osmProfile?.displayName || user?.settings?.email || 'User'}!</p>
            </div>
          ) : (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
              <p className="font-semibold">Not Authenticated</p>
              <p>Please log in to continue.</p>
            </div>
          )}
        </div>
        {isAuthenticated && user && (
          <div className="mt-8 text-left bg-gray-100 p-4 rounded">
            <h2 className="text-xl font-semibold mb-2">User Information:</h2>
            <pre className="text-sm overflow-auto">{JSON.stringify(user, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};
