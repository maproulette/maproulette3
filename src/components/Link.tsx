export const Link = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => {
  return (
    <a
      href={href}
      className="text-sm font-medium text-black hover:text-black focus:text-black active:text-black"
    >
      {children}
    </a>
  );
};
