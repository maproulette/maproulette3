import { Link as RouterLink } from '@tanstack/react-router';

export const Link = ({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <RouterLink
      to={href}
      className={
        className ||
        'text-sm font-medium text-black hover:text-black focus:text-black active:text-black'
      }
    >
      {children}
    </RouterLink>
  );
};
