import { createContext, type ReactNode, useContext, useMemo, useState } from 'react'

export interface TimeRangeState {
  monthDuration: number
}

interface ProfilePageContextValue {
  userId: number
  timeRange: TimeRangeState
  setMonthDuration: (monthDuration: number) => void
}

const ProfilePageContext = createContext<ProfilePageContextValue | null>(null)

interface ProviderProps {
  userId: number
  children: ReactNode
}

export const ProfilePageProvider = ({ userId, children }: ProviderProps) => {
  const [timeRange, setTimeRange] = useState<TimeRangeState>({ monthDuration: -1 })

  const value = useMemo<ProfilePageContextValue>(
    () => ({
      userId,
      timeRange,
      setMonthDuration: (monthDuration) => setTimeRange({ monthDuration }),
    }),
    [userId, timeRange]
  )

  return <ProfilePageContext.Provider value={value}>{children}</ProfilePageContext.Provider>
}

export const useProfilePageContext = () => {
  const ctx = useContext(ProfilePageContext)
  if (!ctx) {
    throw new Error('useProfilePageContext must be used within ProfilePageProvider')
  }
  return ctx
}
