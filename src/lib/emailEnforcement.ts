import type { User } from '@/types/User'

export type EmailEnforcement = 'required' | 'encouraged' | 'none'

export const getEmailEnforcement = (): EmailEnforcement => {
  const value = window.env.VITE_EMAIL_ENFORCEMENT
  if (value === 'required' || value === 'none') return value
  return 'encouraged'
}

export const isMissingEmail = (user: User | undefined): boolean => {
  if (!user) return false
  const email = user.settings?.email
  return !email
}

export const canPerformAdminActions = (user: User | undefined): boolean => {
  if (getEmailEnforcement() !== 'required') return true
  return !isMissingEmail(user)
}
