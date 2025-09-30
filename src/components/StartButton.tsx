import { useTasks } from '../contexts';

interface StartButtonProps {
  challengeId: number;
}

export const StartButton = ({ challengeId }: StartButtonProps) => {
  const { getPrioritizedTasks, isLoading, error } = useTasks();

  const handleStart = () => {
    getPrioritizedTasks(challengeId);
  };

  return (
    <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-40">
      <div className="bg-white rounded-full shadow-xl p-5">
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleStart}
              disabled={isLoading}
              className="bg-green-500 border border-green-500 hover:bg-green-600 hover:border-green-600 disabled:bg-green-400 disabled:border-green-400 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Loading...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>Start</span>
                </div>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                console.log('Toggle favorite');
              }}
              className="bg-white border border-black text-black font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <div className="flex items-center gap-2">
                <span>Favorite</span>
              </div>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg max-w-sm">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <title>Error</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-sm font-medium">{error}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
