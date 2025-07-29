export const Loader: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">{message || "Loading..."}</p>
      </div>
    </div>
  );
};
