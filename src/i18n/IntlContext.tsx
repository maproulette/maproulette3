import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { defaultLocale, type Locale, resolveInitialLocale } from './locales'
import enUS from './messages/en-US.json'

const LOCALE_STORAGE_KEY = 'mr4:locale'

type MessageCatalog = Record<string, string>

const baseCatalog: MessageCatalog = enUS as MessageCatalog

const loadCatalog = async (locale: Locale): Promise<MessageCatalog> => {
  if (locale === 'en-US') return baseCatalog
  try {
    const mod = (await import(`./messages/${locale}.json`)) as { default: MessageCatalog }
    return { ...baseCatalog, ...mod.default }
  } catch {
    return baseCatalog
  }
}

type FormatValues = Record<string, string | number>

const interpolate = (template: string, values: FormatValues | undefined): string => {
  if (!values) return template
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    Object.hasOwn(values, key) ? String(values[key]) : `{${key}}`
  )
}

interface IntlContextValue {
  locale: Locale
  setLocale: (next: Locale) => void
  t: (id: string, values?: FormatValues, defaultMessage?: string) => string
  formatDate: (date: Date | number | string, options?: Intl.DateTimeFormatOptions) => string
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string
}

const IntlContext = createContext<IntlContextValue | null>(null)

interface ProviderProps {
  initialLocale?: Locale
  children: ReactNode
}

export const IntlProvider = ({ initialLocale, children }: ProviderProps) => {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === 'undefined') return initialLocale ?? defaultLocale
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY)
    return resolveInitialLocale(initialLocale ?? stored ?? undefined)
  })
  const [catalog, setCatalog] = useState<MessageCatalog>(baseCatalog)

  useEffect(() => {
    let cancelled = false
    loadCatalog(locale).then((next) => {
      if (!cancelled) setCatalog(next)
    })
    return () => {
      cancelled = true
    }
  }, [locale])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, locale)
      document.documentElement.lang = locale
    }
  }, [locale])

  const setLocale = useCallback((next: Locale) => setLocaleState(next), [])

  const t = useCallback(
    (id: string, values?: FormatValues, defaultMessage?: string) => {
      const template = catalog[id] ?? defaultMessage ?? id
      return interpolate(template, values)
    },
    [catalog]
  )

  const formatDate = useCallback(
    (date: Date | number | string, options?: Intl.DateTimeFormatOptions) => {
      const d = date instanceof Date ? date : new Date(date)
      return new Intl.DateTimeFormat(locale, options).format(d)
    },
    [locale]
  )

  const formatNumber = useCallback(
    (value: number, options?: Intl.NumberFormatOptions) =>
      new Intl.NumberFormat(locale, options).format(value),
    [locale]
  )

  const value = useMemo<IntlContextValue>(
    () => ({ locale, setLocale, t, formatDate, formatNumber }),
    [locale, setLocale, t, formatDate, formatNumber]
  )

  return <IntlContext.Provider value={value}>{children}</IntlContext.Provider>
}

export const useIntl = () => {
  const ctx = useContext(IntlContext)
  if (!ctx) throw new Error('useIntl must be used within IntlProvider')
  return ctx
}
