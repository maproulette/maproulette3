import type * as React from 'react'
import { useRef } from 'react'
import { useIntl } from '@/i18n'
import { cn } from '@/lib/utils'

export const Table = ({ className, ref, ...props }: React.ComponentProps<'table'>) => (
  <div className="relative w-full overflow-x-auto">
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

export const TableHead = ({ className, children, ref, ...props }: React.ComponentProps<'th'>) => {
  const { t } = useIntl()
  const internalRef = useRef<HTMLTableCellElement>(null)

  const setRef = (node: HTMLTableCellElement | null) => {
    internalRef.current = node
    if (typeof ref === 'function') ref(node)
    else if (ref) (ref as React.MutableRefObject<HTMLTableCellElement | null>).current = node
  }

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const th = internalRef.current
    if (!th) return
    const table = th.closest('table') as HTMLTableElement | null
    if (!table) return

    if (table.style.tableLayout !== 'fixed') {
      const initialThs = Array.from(table.querySelectorAll<HTMLTableCellElement>('thead > tr > th'))
      initialThs.forEach((other) => {
        other.style.width = `${other.offsetWidth}px`
      })
      table.style.tableLayout = 'fixed'

      if (!table.querySelector('th[data-resize-spacer]')) {
        const headRow = table.querySelector('thead > tr')
        if (headRow) {
          const spacerTh = document.createElement('th')
          spacerTh.setAttribute('data-resize-spacer', '')
          spacerTh.setAttribute('aria-hidden', 'true')
          spacerTh.style.padding = '0'
          spacerTh.style.border = '0'
          headRow.appendChild(spacerTh)
        }
        table.querySelectorAll('tbody > tr, tfoot > tr').forEach((row) => {
          const spacerCell = document.createElement('td')
          spacerCell.setAttribute('data-resize-spacer', '')
          spacerCell.setAttribute('aria-hidden', 'true')
          spacerCell.style.padding = '0'
          spacerCell.style.border = '0'
          row.appendChild(spacerCell)
        })
      }
    }

    const syncTableWidth = () => {
      const realThs = Array.from(
        table.querySelectorAll<HTMLTableCellElement>('thead > tr > th:not([data-resize-spacer])')
      )
      const total = realThs.reduce((sum, t) => sum + t.offsetWidth, 0)
      table.style.minWidth = `${total}px`
    }
    syncTableWidth()

    const startX = e.clientX
    const startWidth = th.offsetWidth

    const onMouseMove = (ev: MouseEvent) => {
      const newWidth = Math.max(40, startWidth + ev.clientX - startX)
      th.style.width = `${newWidth}px`
      syncTableWidth()
    }
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  return (
    <th
      ref={setRef}
      className={cn(
        'relative min-w-[40px] px-4 py-3 text-left align-middle font-medium text-xs text-zinc-600 dark:text-slate-400 [&:has([role=checkbox])]:pr-0',
        className
      )}
      {...props}
    >
      <div className="overflow-hidden text-ellipsis whitespace-nowrap">{children}</div>
      <button
        type="button"
        aria-label={t('ui.table.resizeColumn', undefined, 'Resize column')}
        onMouseDown={handleResizeMouseDown}
        className="absolute top-0 right-0 z-20 h-full w-1 cursor-col-resize select-none border-0 bg-transparent p-0 hover:bg-blue-500"
      />
    </th>
  )
}

export const TableCell = ({ className, children, ref, ...props }: React.ComponentProps<'td'>) => (
  <td
    ref={ref}
    className={cn('px-4 py-3 align-middle [&:has([role=checkbox])]:pr-0', className)}
    {...props}
  >
    <div className="overflow-hidden text-ellipsis whitespace-nowrap">{children}</div>
  </td>
)

export const TableCaption = ({ className, ref, ...props }: React.ComponentProps<'caption'>) => (
  <caption
    ref={ref}
    className={cn('mt-4 text-sm text-zinc-500 dark:text-zinc-400', className)}
    {...props}
  />
)
