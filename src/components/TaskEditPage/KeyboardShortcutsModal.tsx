import { Keyboard } from 'lucide-react'
import { useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { type KeyboardShortcut, useKeyboardShortcuts } from './contexts/KeyboardShortcutsContext'

// Always show the help shortcut
const GLOBAL_SHORTCUTS: KeyboardShortcut[] = [
  { key: '?', description: 'Show keyboard shortcuts', category: 'General' },
]

export const KeyboardShortcutsModal = () => {
  const { shortcuts, isModalOpen, setModalOpen } = useKeyboardShortcuts()

  // Combine registered shortcuts with global shortcuts
  const allShortcuts = useMemo(() => [...shortcuts, ...GLOBAL_SHORTCUTS], [shortcuts])

  // Group shortcuts by category
  const groupedShortcuts = useMemo(() => {
    return allShortcuts.reduce(
      (acc, shortcut) => {
        if (!acc[shortcut.category]) {
          acc[shortcut.category] = []
        }
        acc[shortcut.category].push(shortcut)
        return acc
      },
      {} as Record<string, KeyboardShortcut[]>
    )
  }, [allShortcuts])

  // Sort categories to ensure consistent order
  const sortedCategories = useMemo(() => {
    const order = ['Bundle', 'Map', 'Navigation', 'General']
    return Object.keys(groupedShortcuts).sort((a, b) => {
      const aIndex = order.indexOf(a)
      const bIndex = order.indexOf(b)
      if (aIndex === -1 && bIndex === -1) return a.localeCompare(b)
      if (aIndex === -1) return 1
      if (bIndex === -1) return -1
      return aIndex - bIndex
    })
  }, [groupedShortcuts])

  return (
    <Dialog open={isModalOpen} onOpenChange={setModalOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>Use these shortcuts to speed up your workflow</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {sortedCategories.map((category) => (
            <div key={category}>
              <h3 className="mb-2 font-medium text-sm text-zinc-500 dark:text-zinc-400">
                {category}
              </h3>
              <div className="space-y-1.5">
                {groupedShortcuts[category].map((shortcut) => (
                  <div
                    key={`${shortcut.category}-${shortcut.key}`}
                    className="flex items-center justify-between rounded-md bg-zinc-50 px-3 py-2 dark:bg-zinc-900"
                  >
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">
                      {shortcut.description}
                    </span>
                    <kbd className="ml-4 shrink-0 rounded border border-zinc-300 bg-white px-2 py-1 font-mono text-xs text-zinc-600 shadow-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
                      {shortcut.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {allShortcuts.length === 1 && (
          <p className="pt-2 text-center text-xs text-zinc-400">No shortcuts registered yet</p>
        )}

        <p className="pt-2 text-center text-xs text-zinc-400">
          Press{' '}
          <kbd className="rounded border border-zinc-300 bg-zinc-100 px-1.5 py-0.5 font-mono text-xs dark:border-zinc-700 dark:bg-zinc-800">
            ?
          </kbd>{' '}
          anytime to show this dialog
        </p>
      </DialogContent>
    </Dialog>
  )
}
