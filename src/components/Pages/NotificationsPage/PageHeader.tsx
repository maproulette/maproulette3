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
      <h1 className="mb-2 font-bold text-base text-zinc-900 dark:text-white">
        {isLoading ? <Skeleton className="h-9 w-96" /> : title}
      </h1>
      {description &&
        (isLoading ? (
          <Skeleton className="h-5 w-full max-w-2xl" />
        ) : (
          <p className="text-zinc-600 dark:text-slate-400">{description}</p>
        ))}
      {actions && !isLoading && actions}
    </div>
  )
}
