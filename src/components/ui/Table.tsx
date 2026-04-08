import type * as React from 'react'
import { cn } from '@/lib/utils'

export const Table = ({ className, ref, ...props }: React.ComponentProps<'table'>) => (
  <div className="relative w-full">
    <table ref={ref} className={cn('w-full border-collapse text-sm', className)} {...props} />
  </div>
)

export const TableHeader = ({ className, ref, ...props }: React.ComponentProps<'thead'>) => (
  <thead
    ref={ref}
    className={cn('sticky top-0 z-10 bg-zinc-50 dark:bg-slate-900 [&_tr]:border-b', className)}
    {...props}
  />
)

export const TableBody = ({ className, ref, ...props }: React.ComponentProps<'tbody'>) => (
  <tbody ref={ref} className={cn('[&_tr:last-child]:border-0', className)} {...props} />
)

export const TableFooter = ({ className, ref, ...props }: React.ComponentProps<'tfoot'>) => (
  <tfoot
    ref={ref}
    className={cn(
      'border-t bg-zinc-100/50 font-medium dark:bg-slate-800/50 [&>tr]:last:border-b-0',
      className
    )}
    {...props}
  />
)

export const TableRow = ({ className, ref, ...props }: React.ComponentProps<'tr'>) => (
  <tr
    ref={ref}
    className={cn(
      'border-zinc-200 border-b transition-colors hover:bg-zinc-50 data-[state=selected]:bg-zinc-100 dark:border-slate-700 dark:data-[state=selected]:bg-slate-800 dark:hover:bg-slate-800/50',
      className
    )}
    {...props}
  />
)

export const TableHead = ({ className, ref, ...props }: React.ComponentProps<'th'>) => (
  <th
    ref={ref}
    className={cn(
      'px-4 py-3 text-left align-middle font-medium text-xs text-zinc-600 dark:text-slate-400 [&:has([role=checkbox])]:pr-0',
      className
    )}
    {...props}
  />
)

export const TableCell = ({ className, ref, ...props }: React.ComponentProps<'td'>) => (
  <td
    ref={ref}
    className={cn('px-4 py-3 align-middle [&:has([role=checkbox])]:pr-0', className)}
    {...props}
  />
)

export const TableCaption = ({ className, ref, ...props }: React.ComponentProps<'caption'>) => (
  <caption
    ref={ref}
    className={cn('mt-4 text-sm text-zinc-500 dark:text-zinc-400', className)}
    {...props}
  />
)
