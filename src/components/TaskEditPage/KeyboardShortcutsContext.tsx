import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

export interface KeyboardShortcut {
  key: string
  description: string
  category: string
  /** Handler function called when the shortcut is triggered */
  handler?: () => void
  /** Whether the shortcut is currently enabled (default: true) */
  enabled?: boolean
}

interface KeyboardShortcutsContextValue {
  shortcuts: KeyboardShortcut[]
  registerShortcuts: (id: string, shortcuts: KeyboardShortcut[]) => void
  unregisterShortcuts: (id: string) => void
  isModalOpen: boolean
  setModalOpen: (open: boolean) => void
}

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextValue | null>(null)

export const useKeyboardShortcuts = () => {
  const context = useContext(KeyboardShortcutsContext)
  if (!context) {
    throw new Error('useKeyboardShortcuts must be used within a KeyboardShortcutsProvider')
  }
  return context
}

/**
 * Hook for components to register their keyboard shortcuts.
 * Shortcuts are automatically unregistered when the component unmounts.
 *
 * @param id - Unique identifier for this group of shortcuts
 * @param shortcuts - Array of shortcuts to register (should be memoized or stable)
 */
export const useRegisterShortcuts = (id: string, shortcuts: KeyboardShortcut[]) => {
  const { registerShortcuts, unregisterShortcuts } = useKeyboardShortcuts()

  useEffect(() => {
    registerShortcuts(id, shortcuts)
    return () => unregisterShortcuts(id)
  }, [id, shortcuts, registerShortcuts, unregisterShortcuts])
}

interface KeyboardShortcutsProviderProps {
  children: React.ReactNode
}

export const KeyboardShortcutsProvider = ({ children }: KeyboardShortcutsProviderProps) => {
  const [shortcutGroups, setShortcutGroups] = useState<Map<string, KeyboardShortcut[]>>(new Map())
  const [isModalOpen, setModalOpen] = useState(false)

  // Use ref to always have access to current shortcuts in the event handler
  const shortcutGroupsRef = useRef(shortcutGroups)
  shortcutGroupsRef.current = shortcutGroups

  const registerShortcuts = useCallback((id: string, shortcuts: KeyboardShortcut[]) => {
    setShortcutGroups((prev) => {
      const next = new Map(prev)
      next.set(id, shortcuts)
      return next
    })
  }, [])

  const unregisterShortcuts = useCallback((id: string) => {
    setShortcutGroups((prev) => {
      const next = new Map(prev)
      next.delete(id)
      return next
    })
  }, [])

  // Flatten all shortcut groups into a single array
  const shortcuts = useMemo(() => {
    const all: KeyboardShortcut[] = []
    shortcutGroups.forEach((group) => {
      all.push(...group)
    })
    return all
  }, [shortcutGroups])

  // Global keyboard handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return
      }

      // Handle ? for help modal
      if (e.key === '?') {
        e.preventDefault()
        setModalOpen(true)
        return
      }

      // Normalize key for comparison
      const pressedKey = e.key.toLowerCase()

      // Find matching shortcut from all registered shortcuts
      const allShortcuts: KeyboardShortcut[] = []
      shortcutGroupsRef.current.forEach((group) => {
        allShortcuts.push(...group)
      })

      for (const shortcut of allShortcuts) {
        const shortcutKey = shortcut.key.toLowerCase()
        const isEnabled = shortcut.enabled !== false

        if (!isEnabled || !shortcut.handler) continue

        // Match the key
        const keyMatches =
          shortcutKey === pressedKey ||
          (shortcutKey === 'delete' && (pressedKey === 'delete' || pressedKey === 'backspace')) ||
          (shortcutKey === 'esc' && pressedKey === 'escape')

        if (keyMatches) {
          // For delete/backspace, don't trigger if meta/ctrl is held (browser back)
          if ((pressedKey === 'delete' || pressedKey === 'backspace') && (e.metaKey || e.ctrlKey)) {
            continue
          }

          e.preventDefault()
          shortcut.handler()
          return
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const value = useMemo(
    () => ({
      shortcuts,
      registerShortcuts,
      unregisterShortcuts,
      isModalOpen,
      setModalOpen,
    }),
    [shortcuts, registerShortcuts, unregisterShortcuts, isModalOpen]
  )

  return (
    <KeyboardShortcutsContext.Provider value={value}>{children}</KeyboardShortcutsContext.Provider>
  )
}
