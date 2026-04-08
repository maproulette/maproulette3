import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from 'lucide-react'
import type * as React from 'react'
import { type Button, buttonVariants } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export const Pagination = ({ className, ...props }: React.ComponentProps<'nav'>) => (
  <nav
    aria-label="pagination"
    data-slot="pagination"
    className={cn('mx-auto flex w-full justify-center', className)}
    {...props}
  />
)

export const PaginationContent = ({ className, ...props }: React.ComponentProps<'ul'>) => (
  <ul
    data-slot="pagination-content"
    className={cn('flex flex-row items-center gap-1', className)}
    {...props}
  />
)

export const PaginationItem = ({ ...props }: React.ComponentProps<'li'>) => (
  <li data-slot="pagination-item" {...props} />
)

type PaginationLinkProps = {
  isActive?: boolean
} & Pick<React.ComponentProps<typeof Button>, 'size'> &
  React.ComponentProps<'a'>

export const PaginationLink = ({
  className,
  isActive,
  size = 'icon',
  ...props
}: PaginationLinkProps) => (
  <a
    aria-current={isActive ? 'page' : undefined}
    data-slot="pagination-link"
    data-active={isActive}
    className={cn(
      buttonVariants({
        variant: isActive ? 'outline' : 'ghost',
        size,
      }),
      className
    )}
    {...props}
  />
)

export const PaginationPrevious = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to previous page"
    size="default"
    className={cn('gap-1 px-2.5 sm:pl-2.5', className)}
    {...props}
  >
    <ChevronLeftIcon />
    <span className="hidden sm:block">Previous</span>
  </PaginationLink>
)

export const PaginationNext = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to next page"
    size="default"
    className={cn('gap-1 px-2.5 sm:pr-2.5', className)}
    {...props}
  >
    <span className="hidden sm:block">Next</span>
    <ChevronRightIcon />
  </PaginationLink>
)

export const PaginationEllipsis = ({ className, ...props }: React.ComponentProps<'span'>) => (
  <span
    aria-hidden
    data-slot="pagination-ellipsis"
    className={cn('flex size-9 items-center justify-center', className)}
    {...props}
  >
    <MoreHorizontalIcon className="size-4" />
    <span className="sr-only">More pages</span>
  </span>
)
