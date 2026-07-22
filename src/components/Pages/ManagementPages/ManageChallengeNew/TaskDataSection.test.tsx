import { useForm } from 'react-hook-form'
import { afterEach, describe, expect, it } from 'vitest'
import { Form } from '@/components/ui/Form'
import { cleanup, render, screen } from '@/test/testUtils'
import type { Challenge } from '@/types/Challenge'
import { buildFormValues, type ChallengeFormValues } from './challengeFormSchema'
import { TaskDataSection } from './TaskDataSection'

afterEach(() => cleanup())

const Harness = ({
  dataSource,
  challenge,
  sourceReadOnly,
}: {
  dataSource: ChallengeFormValues['dataSource']
  challenge?: Challenge
  sourceReadOnly: boolean
}) => {
  const form = useForm<ChallengeFormValues>({
    defaultValues: buildFormValues(undefined, 1),
  })
  return (
    <Form {...form}>
      <TaskDataSection
        form={form}
        dataSource={dataSource}
        challenge={challenge}
        sourceReadOnly={sourceReadOnly}
      />
    </Form>
  )
}

describe('TaskDataSection', () => {
  it('renders the editable DataSourceFields (radio group) in create mode', () => {
    render(<Harness dataSource="overpass" sourceReadOnly={false} />)

    expect(screen.getByRole('radiogroup')).toBeDefined()
    expect(
      screen.getByRole('radio', { name: /I want to provide an Overpass query/i })
    ).toBeDefined()
    expect(
      screen.getByText('Choose how you want to provide task data for this challenge.')
    ).toBeDefined()
  })

  it('renders the read-only task data view (no radio group) when sourceReadOnly is true', () => {
    const challenge = { overpassQL: 'existing query' } as unknown as Challenge
    render(<Harness dataSource="overpass" challenge={challenge} sourceReadOnly={true} />)

    expect(screen.queryByRole('radiogroup')).toBeNull()
    expect(screen.getByText('Overpass query')).toBeDefined()
    expect(screen.getByDisplayValue('existing query')).toBeDefined()
  })

  it('shows the read-only description explaining Rebuild Tasks when sourceReadOnly is true', () => {
    render(<Harness dataSource="overpass" sourceReadOnly={true} />)

    expect(
      screen.getByText(/The data source is set when the challenge is created/i)
    ).toBeDefined()
  })

  it('always renders the "Task data" section title', () => {
    render(<Harness dataSource="localGeoJSON" sourceReadOnly={false} />)

    expect(screen.getByText('Task data')).toBeDefined()
  })

  it('passes the current dataSource through to the read-only view for each source', () => {
    const challenge = { remoteGeoJson: 'https://example.com/data.json' } as unknown as Challenge
    render(<Harness dataSource="remoteGeoJSON" challenge={challenge} sourceReadOnly={true} />)

    expect(screen.getByText('GeoJSON URL')).toBeDefined()
    expect(screen.getByDisplayValue('https://example.com/data.json')).toBeDefined()
  })
})
