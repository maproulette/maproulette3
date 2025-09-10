import { Field, Input } from "@headlessui/react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export const SearchInput = () => {
  return (
    <div className="flex-1 max-w-xl w-full">
      <Field>
        <div className="relative">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="search"
            placeholder="Search"
            className="w-full rounded-md bg-gray-100 py-2 pl-10 pr-3 text-sm text-gray-900 placeholder:text-gray-500 outline-none ring-1 ring-transparent focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </Field>
    </div>
  );
};
