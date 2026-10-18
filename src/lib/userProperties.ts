import type { UserProperties } from '@/types/User'

export const getAppSetting = (
  properties: UserProperties | null | undefined,
  appId: string,
  key: string
): unknown =>
  (properties?.[appId] as { settings?: Record<string, unknown> } | undefined)?.settings?.[key]

export const withAppSetting = (
  properties: UserProperties | null | undefined,
  appId: string,
  key: string,
  value: unknown,
  now: Date = new Date()
): UserProperties => {
  const existing = (properties?.[appId] ?? {}) as {
    meta?: Record<string, unknown>
    settings?: Record<string, unknown>
  }
  return {
    ...properties,
    [appId]: {
      ...existing,
      meta: { ...existing.meta, revision: now.getTime() },
      settings: { ...existing.settings, [key]: value },
    },
  }
}
