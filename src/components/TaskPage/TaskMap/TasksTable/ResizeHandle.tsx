import { cn } from '@/lib/utils'

interface ResizeHandleProps {
  onMouseDown: (e: React.MouseEvent) => void
  isDragging: boolean
}

export const ResizeHandle = ({ onMouseDown, isDragging }: ResizeHandleProps) => {
  return (
    <div
      className={cn(
        'absolute top-0 right-0 left-0 h-1 cursor-ns-resize bg-transparent transition-colors hover:bg-blue-500',
        isDragging && 'bg-blue-500'
      )}
      onMouseDown={onMouseDown}
    />
  )
}

