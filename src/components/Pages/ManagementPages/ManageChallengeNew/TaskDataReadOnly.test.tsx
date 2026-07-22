import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@/test/testUtils'
import type { Challenge } from '@/types/Challenge'
import { TaskDataReadOnly } from './TaskDataReadOnly'

afterEach(() => cleanup())

describe('TaskDataReadOnly', () => {
  it('shows the overpass query read-only when dataSource is overpass', () => {
    const challenge = { overpassQL: 'way[highway=primary];' } as unknown as Challenge
    render(<TaskDataReadOnly dataSource="overpass" challenge={challenge} />)

    expect(screen.getByText('Overpass query')).toBeDefined()
    const textarea = screen.getByDisplayValue('way[highway=primary];') as HTMLTextAreaElement
    expect(textarea.readOnly).toBe(true)
    expect(screen.getByText(/Overpass queries cannot be edited here/i)).toBeDefined()
    expect(screen.queryByText('GeoJSON URL')).toBeNull()
    expect(screen.queryByText('Uploaded GeoJSON file')).toBeNull()
  })

  it('renders an empty overpass textarea when the challenge has no overpassQL', () => {
    render(<TaskDataReadOnly dataSource="overpass" challenge={undefined} />)

    const textarea = screen.getByDisplayValue('') as HTMLTextAreaElement
    expect(textarea.readOnly).toBe(true)
  })

  it('shows the remote GeoJSON URL read-only when dataSource is remoteGeoJSON', () => {
    const challenge = { remoteGeoJson: 'https://example.com/data.json' } as unknown as Challenge
    render(<TaskDataReadOnly dataSource="remoteGeoJSON" challenge={challenge} />)

    expect(screen.getByText('GeoJSON URL')).toBeDefined()
    const input = screen.getByDisplayValue('https://example.com/data.json') as HTMLInputElement
    expect(input.readOnly).toBe(true)
    expect(screen.getByText(/Remote URLs cannot be edited here/i)).toBeDefined()
    expect(screen.queryByText('Overpass query')).toBeNull()
  })

  it('shows the local GeoJSON explanation, with no editable field, when dataSource is localGeoJSON', () => {
    render(<TaskDataReadOnly dataSource="localGeoJSON" challenge={undefined} />)

    expect(screen.getByText('Uploaded GeoJSON file')).toBeDefined()
    expect(
      screen.getByText(/This challenge was built from an uploaded GeoJSON file/i)
    ).toBeDefined()
    expect(screen.queryByText('Overpass query')).toBeNull()
    expect(screen.queryByText('GeoJSON URL')).toBeNull()
    expect(document.querySelector('textarea')).toBeNull()
    expect(document.querySelector('input')).toBeNull()
  })

  it('shows every data source section as blank text when no challenge is provided', () => {
    render(<TaskDataReadOnly dataSource="remoteGeoJSON" challenge={undefined} />)

    const input = screen.getByDisplayValue('') as HTMLInputElement
    expect(input.readOnly).toBe(true)
  })
})
