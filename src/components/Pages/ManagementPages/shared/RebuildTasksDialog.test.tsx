import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@/test/testUtils'
import { RebuildTasksDialog } from './RebuildTasksDialog'

const { rebuildMock, uploadGeoJSONMock } = vi.hoisted(() => ({
  rebuildMock: vi.fn(),
  uploadGeoJSONMock: vi.fn(),
}))

vi.mock('@/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api')>()
  return {
    ...actual,
    api: {
      ...actual.api,
      challenge: {
        ...actual.api.challenge,
        useRebuildChallenge: rebuildMock,
        useUploadGeoJSON: uploadGeoJSONMock,
      },
    },
  }
})

const makeMutation = () => ({
  mutateAsync: vi.fn().mockResolvedValue(undefined),
  isPending: false,
})

let rebuildMutation: ReturnType<typeof makeMutation>
let uploadMutation: ReturnType<typeof makeMutation>

beforeEach(() => {
  rebuildMutation = makeMutation()
  uploadMutation = makeMutation()
  rebuildMock.mockReturnValue(rebuildMutation)
  uploadGeoJSONMock.mockReturnValue(uploadMutation)
})

afterEach(() => cleanup())

describe('RebuildTasksDialog', () => {
  it('renders nothing observable when closed', () => {
    render(<RebuildTasksDialog challengeId={1} open={false} onOpenChange={vi.fn()} />)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('shows the overpass-specific intro copy and does not show a file input', () => {
    render(<RebuildTasksDialog challengeId={1} open onOpenChange={vi.fn()} sourceType="overpass" />)
    expect(screen.getByText(/re-run the Overpass query/)).toBeDefined()
    expect(screen.queryByLabelText('New GeoJSON file')).toBeNull()
  })

  it('shows the remote-specific intro copy', () => {
    render(<RebuildTasksDialog challengeId={1} open onOpenChange={vi.fn()} sourceType="remote" />)
    expect(screen.getByText(/re-download the GeoJSON data/)).toBeDefined()
  })

  it('shows the local-specific intro copy and a file input, disabling Proceed until a file is chosen', () => {
    render(<RebuildTasksDialog challengeId={1} open onOpenChange={vi.fn()} sourceType="local" />)

    expect(screen.getByText(/upload a new local file/)).toBeDefined()
    expect(screen.getByLabelText('New GeoJSON file')).toBeDefined()
    expect((screen.getByRole('button', { name: 'Proceed' }) as HTMLButtonElement).disabled).toBe(
      true
    )
  })

  it('shows generic copy when no sourceType is provided', () => {
    render(<RebuildTasksDialog challengeId={1} open onOpenChange={vi.fn()} />)
    expect(screen.getByText('Rebuild the challenge tasks from its source data.')).toBeDefined()
  })

  it('rebuilds from the remote/overpass source with the removeUnmatched flag when confirmed', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(
      <RebuildTasksDialog challengeId={7} open onOpenChange={onOpenChange} sourceType="overpass" />
    )

    await user.click(screen.getByLabelText('First remove incomplete tasks'))
    await user.click(screen.getByRole('button', { name: 'Proceed' }))

    expect(rebuildMutation.mutateAsync).toHaveBeenCalledWith({
      challengeId: 7,
      removeUnmatched: true,
      skipSnapshot: true,
    })
    expect(uploadMutation.mutateAsync).not.toHaveBeenCalled()
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('uploads the chosen file for a local source, detecting single-document JSON', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(
      <RebuildTasksDialog challengeId={3} open onOpenChange={onOpenChange} sourceType="local" />
    )

    const file = new File(['{"type":"FeatureCollection","features":[]}'], 'data.geojson', {
      type: 'application/json',
    })
    await user.upload(screen.getByLabelText('New GeoJSON file'), file)

    const proceed = screen.getByRole('button', { name: 'Proceed' }) as HTMLButtonElement
    expect(proceed.disabled).toBe(false)
    await user.click(proceed)

    expect(uploadMutation.mutateAsync).toHaveBeenCalledWith({
      challengeId: 3,
      geoJSONFile: file,
      options: {
        lineByLine: false,
        removeUnmatched: false,
        dataOriginDate: undefined,
        skipSnapshot: true,
      },
    })
    expect(rebuildMutation.mutateAsync).not.toHaveBeenCalled()
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('detects line-by-line GeoJSON files', async () => {
    const user = userEvent.setup()
    render(<RebuildTasksDialog challengeId={3} open onOpenChange={vi.fn()} sourceType="local" />)

    const file = new File(
      ['{"type":"Feature","id":1}\n{"type":"Feature","id":2}'],
      'data.geojson',
      { type: 'application/json' }
    )
    await user.upload(screen.getByLabelText('New GeoJSON file'), file)
    await user.click(screen.getByRole('button', { name: 'Proceed' }))

    expect(uploadMutation.mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ options: expect.objectContaining({ lineByLine: true }) })
    )
  })

  it('includes an ISO dataOriginDate when the optional date is provided', async () => {
    const user = userEvent.setup()
    render(<RebuildTasksDialog challengeId={3} open onOpenChange={vi.fn()} sourceType="local" />)

    const file = new File(['{"type":"FeatureCollection","features":[]}'], 'data.geojson', {
      type: 'application/json',
    })
    await user.upload(screen.getByLabelText('New GeoJSON file'), file)
    const dateInput = screen.getByLabelText('Date data was sourced (optional)')
    await user.type(dateInput, '2024-01-15')
    await user.click(screen.getByRole('button', { name: 'Proceed' }))

    expect(uploadMutation.mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          dataOriginDate: new Date('2024-01-15').toISOString(),
        }),
      })
    )
  })

  it('cancel closes the dialog without running any mutation', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(
      <RebuildTasksDialog challengeId={1} open onOpenChange={onOpenChange} sourceType="overpass" />
    )

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(rebuildMutation.mutateAsync).not.toHaveBeenCalled()
    expect(uploadMutation.mutateAsync).not.toHaveBeenCalled()
  })

  it('disables Cancel and shows progress copy while a rebuild is pending', () => {
    rebuildMutation.isPending = true
    rebuildMock.mockReturnValue(rebuildMutation)
    render(<RebuildTasksDialog challengeId={1} open onOpenChange={vi.fn()} sourceType="overpass" />)

    expect((screen.getByRole('button', { name: 'Cancel' }) as HTMLButtonElement).disabled).toBe(
      true
    )
    expect(
      (screen.getByRole('button', { name: 'Rebuilding…' }) as HTMLButtonElement).disabled
    ).toBe(true)
  })

  it('shows an error toast and keeps the dialog open when the mutation rejects', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    rebuildMutation.mutateAsync.mockRejectedValue(new Error('boom'))
    render(
      <RebuildTasksDialog challengeId={1} open onOpenChange={onOpenChange} sourceType="overpass" />
    )

    await user.click(screen.getByRole('button', { name: 'Proceed' }))

    expect(rebuildMutation.mutateAsync).toHaveBeenCalledTimes(1)
    expect(onOpenChange).not.toHaveBeenCalledWith(false)
  })
})
