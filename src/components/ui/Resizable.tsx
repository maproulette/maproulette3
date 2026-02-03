import { GripVerticalIcon } from 'lucide-react'
import type * as React from 'react'
import * as ResizablePrimitive from 'react-resizable-panels'

import { cn } from '@/lib/utils'

function ResizablePanelGroup({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) {
  return (
    <ResizablePrimitive.PanelGroup
      data-slot="resizable-panel-group"
      className={cn('flex h-full w-full data-[panel-group-direction=vertical]:flex-col', className)}
      {...props}
    />
  )
}

function ResizablePanel({ ...props }: React.ComponentProps<typeof ResizablePrimitive.Panel>) {
  return <ResizablePrimitive.Panel data-slot="resizable-panel" {...props} />
}

function ResizableHandle({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  withHandle?: boolean
}) {
  return (
    <ResizablePrimitive.PanelResizeHandle
      data-slot="resizable-handle"
      className={cn(
        'group relative z-50 flex w-1.5 items-center justify-center bg-zinc-200/50 transition-all duration-150 hover:bg-blue-400/30 active:bg-blue-500/40 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 dark:bg-zinc-700/50 dark:hover:bg-blue-400/30 dark:active:bg-blue-500/40',
        'data-[panel-group-direction=vertical]:h-1.5 data-[panel-group-direction=vertical]:w-full',
        '[&[data-panel-group-direction=vertical]>div]:rotate-90',
        className
      )}
      {...props}
    >
      {withHandle && (
        <div className="z-10 flex h-6 w-4 items-center justify-center rounded-md border border-zinc-300 bg-white shadow-sm transition-all duration-150 group-hover:border-blue-400 group-hover:bg-blue-50 group-hover:shadow-md group-active:scale-95 dark:border-zinc-600 dark:bg-zinc-800 dark:group-hover:border-blue-400 dark:group-hover:bg-zinc-700">
          <GripVerticalIcon className="size-3 text-zinc-400 transition-colors group-hover:text-blue-500 dark:text-zinc-500 dark:group-hover:text-blue-400" />
        </div>
      )}
    </ResizablePrimitive.PanelResizeHandle>
  )
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
