export const supportedLocales = [
  'en-US',
  'de',
  'es',
  'fr',
  'it',
  'ja',
  'ko',
  'nl',
  'pl',
  'pt-BR',
  'pt-PT',
  'ru-RU',
  'sv',
  'tr',
  'uk',
  'vi',
  'zh-TW',
] as const

export type Locale = (typeof supportedLocales)[number]

export const defaultLocale: Locale = 'en-US'

export const isSupportedLocale = (value: string | undefined | null): value is Locale =>
  !!value && (supportedLocales as readonly string[]).includes(value)

export const resolveInitialLocale = (preferred?: string | null): Locale => {
  if (isSupportedLocale(preferred)) return preferred
  if (typeof navigator !== 'undefined') {
    const candidates = [navigator.language, ...(navigator.languages ?? [])]
    for (const candidate of candidates) {
      if (isSupportedLocale(candidate)) return candidate
      const prefix = candidate.split('-')[0]
      const match = supportedLocales.find((l) => l.startsWith(prefix))
      if (match) return match
    }
  }
  return defaultLocale
}
