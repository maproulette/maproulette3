import { X } from 'lucide-react'
import { useState } from 'react'

const STORAGE_KEY = 'mr-beta-banner-dismissed'

export const BetaBanner = () => {
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(STORAGE_KEY) === 'true')

  if (dismissed) return null

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true')
    setDismissed(true)
  }

  return (
    <div className="relative mb-2 flex items-center justify-center bg-[#0b1026] px-10 py-2 font-medium text-sm text-white dark:bg-white dark:text-[#0b1026]">
      <span>
        This is a beta version of MapRoulette and is actively being worked on. Some features may be
        incomplete or unavailable.
      </span>
      <button
        onClick={handleDismiss}
        className="-translate-y-1/2 absolute top-1/2 right-3 rounded p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800"
        aria-label="Dismiss beta banner"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
