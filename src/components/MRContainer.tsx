export const MRContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="fixed top-0 left-0 w-full z-50">
      <div className="bg-white px-4 py-3 border-b border-gray-200 shadow-md rounded-lg w-auto m-4">
        <div className="flex items-center justify-between gap-4">{children}</div>
      </div>
    </div>
  );
};
