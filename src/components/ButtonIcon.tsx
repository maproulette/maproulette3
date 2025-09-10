export const ButtonIcon = ({ icon, onClick }: { icon: React.ReactNode; onClick: () => void }) => {
  return (
    <button
      onClick={onClick}
      className="relative rounded-md p-1 text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {icon}
      <span
        aria-hidden="true"
        className="absolute -top-0.5 -right-0.5 inline-block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"
      />
    </button>
  );
};
