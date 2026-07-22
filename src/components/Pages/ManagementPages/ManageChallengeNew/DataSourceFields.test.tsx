import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Form } from '@/components/ui/Form'
import { cleanup, render, screen } from '@/test/testUtils'
import { buildFormValues, type ChallengeFormValues } from './challengeFormSchema'
import { DataSourceFields } from './DataSourceFields'

afterEach(() => cleanup())

// Mirrors how ChallengeForm.tsx wires this component up: `dataSource` is
// read via `form.watch('dataSource')` in the render body so the visible
// fields update reactively as the radio selection changes.
const Harness = ({ onSubmit }: { onSubmit: (values: ChallengeFormValues) => void }) => {
  const form = useForm<ChallengeFormValues>({
    defaultValues: buildFormValues(undefined, 1),
  })
  const dataSource = form.watch('dataSource')
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((values) => onSubmit(values))}>
        <DataSourceFields form={form} dataSource={dataSource} />
        <button type="submit">Submit</button>
      </form>
    </Form>
  )
}

const renderHarness = () => {
  const onSubmit = vi.fn()
  render(<Harness onSubmit={onSubmit} />)
  return { onSubmit }
}

// The file input's <FormControl> id/aria attributes land on its wrapping
// <div> rather than the <input> itself (it's nested one level deeper), so
// the "GeoJSON File" <FormLabel> isn't associated with a labellable
// element and getByLabelText can't find it. Query the file input directly.
const getFileInput = () => document.querySelector<HTMLInputElement>('input[type="file"]')

describe('DataSourceFields', () => {
  it('defaults to the overpass option selected and shows only the Overpass QL field', () => {
    renderHarness()

    expect(
      screen
        .getByRole('radio', { name: /I want to provide an Overpass query/i })
        .getAttribute('data-state')
    ).toBe('checked')
    expect(screen.getByLabelText('Overpass QL')).toBeDefined()
    expect(getFileInput()).toBeNull()
    expect(screen.queryByLabelText('GeoJSON URL')).toBeNull()
  })

  it('selecting the local GeoJSON option shows the file input and hides the overpass field', async () => {
    const user = userEvent.setup()
    renderHarness()

    await user.click(screen.getByRole('radio', { name: /I want to upload a GeoJSON file/i }))

    expect(getFileInput()).not.toBeNull()
    expect(screen.queryByLabelText('Overpass QL')).toBeNull()
    expect(screen.queryByLabelText('GeoJSON URL')).toBeNull()
  })

  it('selecting the remote GeoJSON option shows the URL input and hides the other fields', async () => {
    const user = userEvent.setup()
    renderHarness()

    await user.click(screen.getByRole('radio', { name: /I have a URL to the GeoJSON data/i }))

    expect(screen.getByLabelText('GeoJSON URL')).toBeDefined()
    expect(screen.queryByLabelText('Overpass QL')).toBeNull()
    expect(getFileInput()).toBeNull()
  })

  it('typing an overpass query updates the submitted form value', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderHarness()

    await user.type(screen.getByLabelText('Overpass QL'), 'a query')
    await user.click(screen.getByRole('button', { name: /submit/i }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ dataSource: 'overpass', overpassQL: 'a query' })
    )
  })

  it('typing a remote GeoJSON URL updates the submitted form value', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderHarness()

    await user.click(screen.getByRole('radio', { name: /I have a URL to the GeoJSON data/i }))
    await user.type(screen.getByLabelText('GeoJSON URL'), 'https://example.com/data.json')
    await user.click(screen.getByRole('button', { name: /submit/i }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        dataSource: 'remoteGeoJSON',
        remoteGeoJSON: 'https://example.com/data.json',
      })
    )
  })

  it('uploading a local GeoJSON file sets the field value and shows the selected file summary', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderHarness()

    await user.click(screen.getByRole('radio', { name: /I want to upload a GeoJSON file/i }))
    const file = new File(['{"type":"FeatureCollection","features":[]}'], 'data.geojson', {
      type: 'application/json',
    })
    const input = getFileInput()
    if (!input) throw new Error('expected a file input to be rendered')
    await user.upload(input, file)

    expect(await screen.findByText(/Selected: data\.geojson/)).toBeDefined()

    await user.click(screen.getByRole('button', { name: /submit/i }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ dataSource: 'localGeoJSON', localGeoJSON: file })
    )
  })

  it('switching away from local GeoJSON after uploading a file hides the file input', async () => {
    const user = userEvent.setup()
    renderHarness()

    await user.click(screen.getByRole('radio', { name: /I want to upload a GeoJSON file/i }))
    const file = new File(['{}'], 'data.geojson', { type: 'application/json' })
    const input = getFileInput()
    if (!input) throw new Error('expected a file input to be rendered')
    await user.upload(input, file)
    expect(await screen.findByText(/Selected: data\.geojson/)).toBeDefined()

    await user.click(screen.getByRole('radio', { name: /I want to provide an Overpass query/i }))

    expect(getFileInput()).toBeNull()
    expect(screen.queryByText(/Selected: data\.geojson/)).toBeNull()
    expect(screen.getByLabelText('Overpass QL')).toBeDefined()
  })

  it('renders a docs link in the Overpass QL field description', () => {
    renderHarness()

    const link = screen.getByRole('link', { name: /docs/i })
    expect(link.getAttribute('href')).toBe(
      'https://learn.maproulette.org/en-US/documentation/using-overpass-to-create-challenges/#content'
    )
  })
})
