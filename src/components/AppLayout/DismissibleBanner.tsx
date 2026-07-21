import { X } from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { useIntl } from '@/i18n'

interface Props {
  /** localStorage key used to persist the dismissed state across reloads. */
  storageKey: string
  children: ReactNode
}

export const DismissibleBanner = ({ storageKey, children }: Props) => {
  const { t } = useIntl()
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(storageKey) === 'true')

  if (dismissed) return null

  const handleDismiss = () => {
    localStorage.setItem(storageKey, 'true')
    setDismissed(true)
  }

  return (
    <div className="relative mb-2 flex items-center justify-center bg-slate-950 px-10 py-2 font-medium text-sm text-white dark:bg-white dark:text-slate-950">
      <span>{children}</span>
      <button
        type="button"
        onClick={handleDismiss}
        className="-translate-y-1/2 absolute top-1/2 right-3 rounded p-1 hover:bg-slate-800 dark:hover:bg-slate-200"
        aria-label={t('appLayout.dismissibleBanner.dismiss', undefined, 'Dismiss banner')}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
