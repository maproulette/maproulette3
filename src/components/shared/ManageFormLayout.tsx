import { BackLink } from '@/components/ui/BackLink'
import { Skeleton } from '@/components/ui/Skeleton'
import { AuthGuard } from '@/lib/AuthGuard'

interface ManageFormLayoutProps {
  backTo: string
  backParams?: Record<string, string>
  backLabel: string
  pageTitle: string
  pageDescription: string
  cardTitle: string
  cardDescription: string
  isLoading?: boolean
  guidanceTitle?: string
  guidanceDescription?: string
  guidanceItems?: string[]
  guidanceLinks?: { label: string; href: string }[]
  children: React.ReactNode
}

export const ManageFormLayout = ({
  backTo,
  backParams,
  backLabel,
  pageTitle,
  pageDescription,
  cardTitle,
  cardDescription,
  isLoading,
  guidanceTitle,
  guidanceDescription,
  guidanceItems,
  guidanceLinks,
  children,
}: ManageFormLayoutProps) => {
  const hasGuidance =
    !!guidanceTitle ||
    !!guidanceDescription ||
    (guidanceItems?.length ?? 0) > 0 ||
    (guidanceLinks?.length ?? 0) > 0

  return (
    <AuthGuard>
      <div className="h-full overflow-auto px-4 pb-10">
        <BackLink to={backTo} params={backParams}>
          {backLabel}
        </BackLink>

        <div className="space-y-4">
          <div className={hasGuidance ? 'grid grid-cols-1 gap-6 lg:grid-cols-3' : undefined}>
            {hasGuidance && (
              <aside className="lg:sticky lg:top-4 lg:self-start">
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-5 dark:border-slate-700 dark:bg-slate-900">
                  {guidanceTitle && <h2 className="font-semibold text-base">{guidanceTitle}</h2>}
                  {guidanceDescription && (
                    <p className="mt-1 text-sm text-zinc-500 dark:text-slate-400">
                      {guidanceDescription}
                    </p>
                  )}
                  {(guidanceItems?.length ?? 0) > 0 && (
                    <div className="mt-4 space-y-2 text-sm text-zinc-700 dark:text-slate-300">
                      {guidanceItems?.map((item) => (
                        <p key={item}>- {item}</p>
                      ))}
                    </div>
                  )}
                  {(guidanceLinks?.length ?? 0) > 0 && (
                    <div className="mt-4 space-y-2">
                      {guidanceLinks?.map((link) => (
                        <a
                          key={link.href}
                          href={link.href}
                          target="_blank"
                          rel="noreferrer"
                          className="block text-sm text-zinc-700 underline hover:text-zinc-900 dark:text-slate-300 dark:hover:text-white"
                        >
                          {link.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </aside>
            )}

            <div className={hasGuidance ? 'lg:col-span-2' : undefined}>
              <h1 className="font-bold text-base">{pageTitle}</h1>
              <p className="mt-1 text-sm text-zinc-500 dark:text-slate-400">{pageDescription}</p>

              <div className="mt-4 rounded-lg bg-zinc-50 p-4 lg:p-6 dark:bg-slate-900">
                <div className="mb-6 space-y-1">
                  <h2 className="font-semibold text-base">{cardTitle}</h2>
                  <p className="text-sm text-zinc-500 dark:text-slate-400">{cardDescription}</p>
                </div>
                {isLoading ? (
                  <div className="space-y-6">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                ) : (
                  children
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
