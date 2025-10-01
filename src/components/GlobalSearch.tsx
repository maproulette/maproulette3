import { Search } from 'lucide-react';
import { useId } from 'react';
import { Input } from './ui/Input';
import { cn } from '../utils/cn';

const GlobalSearch = ({ className, ...props }: React.ComponentProps<'search'>) => {
  const id = useId();

  return (
    <search className={cn('', className)} {...props}>
      <div className="grid grid-cols-1">
        <label htmlFor={id} className="sr-only">
          Search for challenges, tasks or projects
        </label>
        <Input
          id={id}
          type="search"
          placeholder="Search for challenges, tasks or projects"
          className="rounded-full col-start-1 row-start-1 pl-10 md:pr-5 md:py-5"
        />
        <Search
          aria-hidden="true"
          className="pointer-events-none col-start-1 row-start-1 ml-3 size-5 self-center"
        />
      </div>
    </search>
  );
};

export default GlobalSearch;
