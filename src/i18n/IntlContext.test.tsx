import { describe, expect, it } from 'vitest'
import { renderHook } from '@/test/testUtils'
import { useIntl } from './IntlContext'

describe('useIntl t()', () => {
  it('interpolates plain named placeholders', () => {
    const { result } = renderHook(() => useIntl())
    expect(result.current.t('missing.id', { name: 'Ada' }, 'Hello {name}')).toBe('Hello Ada')
  })

  it('selects the ICU plural branch based on count', () => {
    const { result } = renderHook(() => useIntl())
    const template = '{count, plural, one {# task} other {# tasks}}'
    expect(result.current.t('missing.id', { count: 1 }, template)).toBe('1 task')
    expect(result.current.t('missing.id', { count: 0 }, template)).toBe('0 tasks')
    expect(result.current.t('missing.id', { count: 5 }, template)).toBe('5 tasks')
  })

  it('formats the # placeholder as a locale-aware number', () => {
    const { result } = renderHook(() => useIntl())
    const template = '{count, plural, one {# task} other {# tasks}}'
    expect(result.current.t('missing.id', { count: 1234 }, template)).toBe('1,234 tasks')
  })

  it('falls back to the raw template when ICU parsing fails', () => {
    const { result } = renderHook(() => useIntl())
    expect(result.current.t('missing.id', undefined, 'Unmatched {brace')).toBe('Unmatched {brace')
  })

  it('resolves real catalog ids using the plural rule', () => {
    const { result } = renderHook(() => useIntl())
    expect(result.current.t('common.tasksWithCount', { count: 1 })).toBe('1 task')
    expect(result.current.t('common.tasksWithCount', { count: 2 })).toBe('2 tasks')
  })
})
