import { Skeleton } from '@/components/ui/Skeleton'

interface PageHeaderProps {
  title: string | React.ReactNode
  description?: string
  isLoading?: boolean
  actions?: React.ReactNode
  className?: string
}

export const PageHeader = ({
  title,
  description,
  isLoading,
  actions,
  className,
}: PageHeaderProps) => {
  return (
    <div className={className}>
      <h1 className="mb-2 font-bold text-3xl text-zinc-900 dark:text-zinc-50">
        {isLoading ? <Skeleton className="h-9 w-96" /> : title}
      </h1>
      {description && (
        <p className="text-zinc-600 dark:text-zinc-400">
          {isLoading ? <Skeleton className="h-5 w-full max-w-2xl" /> : description}
        </p>
      )}
      {actions && !isLoading && actions}
    </div>
  )
}








