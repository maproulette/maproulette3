import { describe, expect, it } from 'vitest'
import { PRIORITY_COLOR, PRIORITY_LABEL, PRIORITY_TIERS, TaskPriority } from './Priority.ts'

describe('PRIORITY_LABEL', () => {
  it('labels every priority value', () => {
    expect(PRIORITY_LABEL[TaskPriority.HIGH]).toBe('High')
    expect(PRIORITY_LABEL[TaskPriority.MEDIUM]).toBe('Medium')
    expect(PRIORITY_LABEL[TaskPriority.LOW]).toBe('Low')
  })
})

describe('PRIORITY_COLOR', () => {
  it('provides light, dark, hex, and bg classes for every priority value', () => {
    for (const value of Object.values(TaskPriority)) {
      const color = PRIORITY_COLOR[value]
      expect(color.light).toMatch(/^bg-/)
      expect(color.dark).toMatch(/^dark:bg-/)
      expect(color.hex).toMatch(/^#[0-9a-f]{6}$/)
      expect(color.bg).toContain(color.light)
      expect(color.bg).toContain(color.dark)
    }
  })
})

describe('PRIORITY_TIERS', () => {
  it('orders tiers from high to low priority', () => {
    expect(PRIORITY_TIERS).toEqual([TaskPriority.HIGH, TaskPriority.MEDIUM, TaskPriority.LOW])
  })
})
