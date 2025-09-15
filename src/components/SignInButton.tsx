export const SignInButton = ({
  onClick,
  size,
}: {
  onClick: () => void;
  size: 'small' | 'medium' | 'large';
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white transition-colors ${
        size === 'small'
          ? 'px-3 py-1.5 text-sm'
          : size === 'medium'
            ? 'px-4 py-2 text-sm'
            : 'px-6 py-3 text-base'
      }`}
    >
      Sign in
    </button>
  );
};
