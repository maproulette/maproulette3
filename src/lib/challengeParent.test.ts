import { describe, expect, it } from 'vitest'
import { getParentInfo } from './challengeParent'

describe('getParentInfo', () => {
  it('extracts id and name from a parent object', () => {
    const result = getParentInfo({ id: 42, name: 'My Project' })
    expect(result).toEqual({ id: 42, name: 'My Project' })
  })

  it('defaults name to "Unknown Project" when the parent object has no name', () => {
    const result = getParentInfo({ id: 42 })
    expect(result).toEqual({ id: 42, name: 'Unknown Project' })
  })

  it('defaults name to "Unknown Project" when the parent object has an empty name', () => {
    const result = getParentInfo({ id: 42, name: '' })
    expect(result).toEqual({ id: 42, name: 'Unknown Project' })
  })

  it('defaults id to null when the parent object has no id', () => {
    const result = getParentInfo({ name: 'Orphan Project' })
    expect(result).toEqual({ id: null, name: 'Orphan Project' })
  })

  it('treats a numeric parent as the id, with an unknown name', () => {
    const result = getParentInfo(10)
    expect(result).toEqual({ id: 10, name: 'Unknown Project' })
  })

  it('treats a string parent as the id, with an unknown name', () => {
    const result = getParentInfo('project-10')
    expect(result).toEqual({ id: 'project-10', name: 'Unknown Project' })
  })

  it('returns null id and unknown name for null parent', () => {
    const result = getParentInfo(null)
    expect(result).toEqual({ id: null, name: 'Unknown Project' })
  })

  it('returns null id and unknown name for undefined parent', () => {
    const result = getParentInfo(undefined)
    expect(result).toEqual({ id: null, name: 'Unknown Project' })
  })

  it('returns null id and unknown name for other malformed input (e.g. a boolean)', () => {
    const result = getParentInfo(true)
    expect(result).toEqual({ id: null, name: 'Unknown Project' })
  })
})
