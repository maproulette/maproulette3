import { act, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { binaryToBackendJson } from '@/components/shared/TaskPropertyQueryBuilder/backendRuleShape'
import type { BinaryLeaf } from '@/components/shared/TaskPropertyQueryBuilder/propertyRuleTypes'
import { cleanup, render, screen } from '@/test/testUtils'
import { TaskPriority } from '@/types/Priority'
import type { TaskMarker } from '@/types/Task'
import {
  type PrioritizationDraft,
  PrioritizationProvider,
  usePrioritizationContext,
} from './PrioritizationContext'
import { TaskPreviewProvider, useTaskPreview } from './TaskPreviewContext'

const { usePreviewPrioritiesMock } = vi.hoisted(() => ({
  usePreviewPrioritiesMock: vi.fn(),
}))

vi.mock('@/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api')>()
  return {
    ...actual,
    api: {
      ...actual.api,
      challenge: {
        ...actual.api.challenge,
        usePreviewPriorities: usePreviewPrioritiesMock,
      },
    },
  }
})

const marker = (id: number, priority: number, lng = 0, lat = 0): TaskMarker =>
  ({
    id,
    priority,
    status: 0,
    location: { lng, lat },
  }) as unknown as TaskMarker

const emptyTier = { rules: null, bounds: null }

const makeDraft = (overrides: Partial<PrioritizationDraft> = {}): PrioritizationDraft => ({
  defaultPriority: TaskPriority.MEDIUM,
  high: { ...emptyTier },
  medium: { ...emptyTier },
  low: { ...emptyTier },
  ...overrides,
})

let latestPrioritization: ReturnType<typeof usePrioritizationContext> | null = null
let latestPreview: ReturnType<typeof useTaskPreview> | null = null

const Harness = () => {
  latestPrioritization = usePrioritizationContext()
  latestPreview = useTaskPreview()
  return (
    <div>
      <span data-testid="counts">{JSON.stringify(latestPreview.preview.counts)}</span>
      <span data-testid="changed">{latestPreview.preview.changedCount}</span>
      <span data-testid="loading">{String(latestPreview.isLoading)}</span>
      <span data-testid="evaluating">{String(latestPreview.preview.isEvaluating)}</span>
    </div>
  )
}

const renderHarness = ({
  markers = [],
  isLoading = false,
  challengeId = 1,
  initialDraft = makeDraft(),
  children,
}: {
  markers?: TaskMarker[]
  isLoading?: boolean
  challengeId?: number
  initialDraft?: PrioritizationDraft
  children?: ReactNode
} = {}) =>
  render(
    <PrioritizationProvider initialDraft={initialDraft}>
      <TaskPreviewProvider markers={markers} isLoading={isLoading} challengeId={challengeId}>
        {children ?? <Harness />}
      </TaskPreviewProvider>
    </PrioritizationProvider>
  )

beforeEach(() => {
  usePreviewPrioritiesMock.mockReset()
  usePreviewPrioritiesMock.mockReturnValue({
    data: undefined,
    isLoading: false,
    isFetching: false,
  })
  latestPrioritization = null
  latestPreview = null
})

afterEach(() => {
  cleanup()
})

describe('useTaskPreview', () => {
  it('throws when used outside of a TaskPreviewProvider', () => {
    const OnlyPreview = () => {
      useTaskPreview()
      return null
    }
    expect(() =>
      render(
        <PrioritizationProvider initialDraft={makeDraft()}>
          <OnlyPreview />
        </PrioritizationProvider>
      )
    ).toThrow('useTaskPreview must be used inside TaskPreviewProvider')
  })

  it('uses empty counts and no changes when the preview query has no data yet', () => {
    renderHarness({ markers: [marker(1, 1)] })

    expect(screen.getByTestId('counts').textContent).toBe(JSON.stringify({ 0: 0, 1: 0, 2: 0 }))
    expect(screen.getByTestId('changed').textContent).toBe('0')
  })

  it('maps high/medium/low counts from the preview response onto priority values 0/1/2', () => {
    usePreviewPrioritiesMock.mockReturnValue({
      data: { priorities: {}, counts: { high: 2, medium: 3, low: 5 } },
      isLoading: false,
      isFetching: false,
    })

    renderHarness({ markers: [] })

    expect(screen.getByTestId('counts').textContent).toBe(JSON.stringify({ 0: 2, 1: 3, 2: 5 }))
  })

  it('builds byTaskId from the response and counts tasks whose priority changed', () => {
    usePreviewPrioritiesMock.mockReturnValue({
      data: {
        priorities: { '1': 0, '2': 1 },
        counts: { high: 1, medium: 1, low: 0 },
      },
      isLoading: false,
      isFetching: false,
    })

    renderHarness({ markers: [marker(1, 1), marker(2, 1), marker(3, 2)] })

    expect(latestPreview?.preview.byTaskId.get(1)).toBe(0)
    expect(latestPreview?.preview.byTaskId.get(2)).toBe(1)
    // Marker 3 is absent from the response's `priorities` map, so it's left out.
    expect(latestPreview?.preview.byTaskId.has(3)).toBe(false)
    // Marker 1: server priority 1 -> computed 0, changed. Marker 2: 1 -> 1, unchanged.
    expect(screen.getByTestId('changed').textContent).toBe('1')
  })

  it('isLoading is true while markers are loading even if the preview query already has data', () => {
    usePreviewPrioritiesMock.mockReturnValue({
      data: { priorities: {}, counts: { high: 0, medium: 0, low: 0 } },
      isLoading: false,
      isFetching: false,
    })

    renderHarness({ markers: [], isLoading: true })

    expect(screen.getByTestId('loading').textContent).toBe('true')
  })

  it('isLoading is true while the initial preview fetch is in flight with no data yet', () => {
    usePreviewPrioritiesMock.mockReturnValue({ data: undefined, isLoading: true, isFetching: true })

    renderHarness({ markers: [], isLoading: false })

    expect(screen.getByTestId('loading').textContent).toBe('true')
  })

  it('isLoading is false once markers are loaded and preview data has arrived', () => {
    usePreviewPrioritiesMock.mockReturnValue({
      data: { priorities: {}, counts: { high: 0, medium: 0, low: 0 } },
      isLoading: false,
      isFetching: false,
    })

    renderHarness({ markers: [], isLoading: false })

    expect(screen.getByTestId('loading').textContent).toBe('false')
  })

  it('surfaces the preview query isFetching flag as isEvaluating', () => {
    usePreviewPrioritiesMock.mockReturnValue({
      data: { priorities: {}, counts: { high: 0, medium: 0, low: 0 } },
      isLoading: false,
      isFetching: true,
    })

    renderHarness({ markers: [] })

    expect(screen.getByTestId('evaluating').textContent).toBe('true')
  })

  it('computes warnings via analyzeWarnings based on tier configuration and counts', () => {
    usePreviewPrioritiesMock.mockReturnValue({
      data: { priorities: {}, counts: { high: 0, medium: 0, low: 0 } },
      isLoading: false,
      isFetching: false,
    })

    renderHarness({
      markers: [],
      initialDraft: makeDraft(),
    })

    // No tiers configured at all -> the 'no-rules' global warning.
    expect(latestPreview?.preview.warnings.global).toEqual([
      {
        kind: 'no-rules',
        message: 'No rules configured — every task will use the default priority.',
      },
    ])
  })

  it('debounces preview requests: editing the draft does not call usePreviewPriorities again until 250ms pass', async () => {
    renderHarness({ markers: [] })
    usePreviewPrioritiesMock.mockClear()

    const leaf: BinaryLeaf = { key: 'highway', value: 'primary', operator: 'equals' }
    act(() => {
      latestPrioritization?.setTierRules('high', leaf)
    })

    // Not yet debounced through - still called with the old (empty) draft body.
    expect(usePreviewPrioritiesMock).toHaveBeenLastCalledWith(
      1,
      expect.objectContaining({ highPriorityRule: '' })
    )

    await waitFor(() =>
      expect(usePreviewPrioritiesMock).toHaveBeenLastCalledWith(
        1,
        expect.objectContaining({ highPriorityRule: binaryToBackendJson(leaf) })
      )
    )
  })

  it('sends the challenge id and translated draft body (rules + bounds) to usePreviewPriorities', () => {
    const bounds: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: [{ type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [1, 2] } }],
    }
    renderHarness({
      markers: [],
      challengeId: 77,
      initialDraft: makeDraft({
        defaultPriority: TaskPriority.HIGH,
        low: { rules: null, bounds },
      }),
    })

    expect(usePreviewPrioritiesMock).toHaveBeenLastCalledWith(
      77,
      expect.objectContaining({
        defaultPriority: TaskPriority.HIGH,
        lowPriorityBounds: JSON.stringify(bounds.features),
      })
    )
  })

  it('sends an empty-string bounds value (not undefined) when a tier has no features', () => {
    renderHarness({ markers: [] })

    expect(usePreviewPrioritiesMock).toHaveBeenLastCalledWith(
      1,
      expect.objectContaining({
        highPriorityBounds: '',
        mediumPriorityBounds: '',
        lowPriorityBounds: '',
      })
    )
  })
})
