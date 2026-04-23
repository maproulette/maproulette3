import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react'

export type CongratulateVariant =
  | { kind: 'levelUp'; level: number; score: number }
  | { kind: 'achievement'; achievementId: number }
  | { kind: 'streak'; count: number }
  | { kind: 'challengeCompleted'; challengeId: number; challengeName: string }

export interface CongratulateMessage extends Record<string, unknown> {
  id: string
  variant: CongratulateVariant
}

interface CongratulateContextValue {
  current: CongratulateMessage | null
  enqueue: (variant: CongratulateVariant) => void
  dismiss: () => void
}

const CongratulateContext = createContext<CongratulateContextValue | null>(null)

let nextId = 1

export const CongratulateProvider = ({ children }: { children: ReactNode }) => {
  const [queue, setQueue] = useState<CongratulateMessage[]>([])

  const enqueue = useCallback((variant: CongratulateVariant) => {
    setQueue((q) => [...q, { id: String(nextId++), variant }])
  }, [])

  const dismiss = useCallback(() => {
    setQueue((q) => q.slice(1))
  }, [])

  const value = useMemo<CongratulateContextValue>(
    () => ({ current: queue[0] ?? null, enqueue, dismiss }),
    [queue, enqueue, dismiss]
  )

  return <CongratulateContext.Provider value={value}>{children}</CongratulateContext.Provider>
}

export const useCongratulate = () => {
  const ctx = useContext(CongratulateContext)
  if (!ctx) throw new Error('useCongratulate must be used within CongratulateProvider')
  return ctx
}
