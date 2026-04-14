import type { ReactNode } from 'react'
import { Skeleton } from '@/components/ui/Skeleton'
import { AuthGuard } from '@/lib/AuthGuard'

export const ManageFormLayout = ({ children }: { children: ReactNode }) => (
  <AuthGuard>
    <div className="flex h-full min-h-0 flex-col overflow-hidden">{children}</div>
  </AuthGuard>
)

export const FormCard = ({
  title,
  description,
  isLoading,
  children,
}: {
  title: string
  description: string
  isLoading?: boolean
  children: ReactNode
}) => (
  <div className="mx-auto flex h-full min-h-0 w-full max-w-4xl flex-col rounded-lg bg-zinc-50 p-4 dark:bg-slate-900">
    <div className="mb-4 shrink-0 space-y-1">
      <h2 className="font-semibold text-base">{title}</h2>
      <p className="text-sm text-zinc-500 dark:text-slate-400">{description}</p>
    </div>
    {isLoading ? (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    ) : (
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    )}
  </div>
)
