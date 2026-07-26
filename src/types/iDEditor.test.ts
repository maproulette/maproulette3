import { describe, expect, it } from 'vitest'
import type { IdGlobal, IdIframeWindow } from './iDEditor.ts'
import { getIdGlobal } from './iDEditor.ts'

describe('getIdGlobal', () => {
  it('returns the iD global when present on the window', () => {
    const iD = {} as IdGlobal
    const win = { iD } as unknown as IdIframeWindow

    expect(getIdGlobal(win)).toBe(iD)
  })

  it.each([
    ['the window has no iD global', {} as IdIframeWindow],
    ['the window is null', null],
    ['the window is undefined', undefined],
  ] as const)('returns undefined when %s', (_label, win) => {
    expect(getIdGlobal(win)).toBeUndefined()
  })
})
