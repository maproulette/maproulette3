/**
 * Date formatting utilities built on the native Intl APIs.
 *
 * All formatters accept a `Date`; callers are responsible for constructing one
 * (the backend returns Unix milliseconds, so `new Date(timestamp)` works
 * directly) and for handling missing values themselves.
 *
 * `locale` is optional and falls back to the browser default. Components that
 * want app-locale-aware output should read it from `useIntl()` and pass it in.
 */

export function formatDate(date: Date, locale?: string): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date)
}

export function formatLongDate(date: Date, locale?: string): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(date)
}

export function formatDateTime(date: Date, locale?: string): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

const RELATIVE_UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ['year', 365 * 24 * 60 * 60 * 1000],
  ['month', 30 * 24 * 60 * 60 * 1000],
  ['week', 7 * 24 * 60 * 60 * 1000],
  ['day', 24 * 60 * 60 * 1000],
  ['hour', 60 * 60 * 1000],
  ['minute', 60 * 1000],
  ['second', 1000],
]

export function formatTimeAgo(date: Date, locale?: string): string {
  const diffMs = date.getTime() - Date.now()
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  for (const [unit, unitMs] of RELATIVE_UNITS) {
    if (Math.abs(diffMs) >= unitMs) {
      return formatter.format(Math.round(diffMs / unitMs), unit)
    }
  }
  return formatter.format(0, 'second')
}

export function daysSince(date: Date): number {
  return Math.floor((Date.now() - date.getTime()) / (24 * 60 * 60 * 1000))
}
