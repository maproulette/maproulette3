import { Link } from '../../components/Link';

export const NavLinks = () => {
  return (
    <div className="flex items-center gap-8">
      <Link href="/dashboard">Dashboard</Link>
      <Link href="/browse/challenges">Find Challenges</Link>
      <Link href="/learn">Learn</Link>
      <Link href="/donate">Donate</Link>
    </div>
  );
};
