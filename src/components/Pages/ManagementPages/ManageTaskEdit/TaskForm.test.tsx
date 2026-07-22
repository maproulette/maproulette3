import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@/test/testUtils'
import type { TaskGetResponse } from '@/types/Task'
import { TaskForm } from './TaskForm.tsx'

const baseTask = {
  name: 'Fix the sidewalk',
  instruction: 'Please fix the broken sidewalk segment',
  geometries: { type: 'Point', coordinates: [0, 0] },
  status: 0,
  errorTags: '',
} as unknown as TaskGetResponse

afterEach(() => cleanup())

const renderForm = (task: TaskGetResponse = baseTask) => {
  const onSubmit = vi.fn().mockResolvedValue(undefined)
  const onCancel = vi.fn()
  render(<TaskForm task={task} onSubmit={onSubmit} onCancel={onCancel} />)
  return { onSubmit, onCancel }
}

describe('TaskForm validation (taskFormSchema)', () => {
  it('submits successfully with the default valid values', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderForm()

    await user.click(screen.getByRole('button', { name: /^save$/i }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Fix the sidewalk', status: 0 })
    )
  })

  it('shows an error when the name is shorter than 3 characters', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderForm()

    const nameInput = screen.getByPlaceholderText('Task name')
    await user.clear(nameInput)
    await user.type(nameInput, 'ab')
    await user.click(screen.getByRole('button', { name: /^save$/i }))

    expect(await screen.findByText('Name must be at least 3 characters')).toBeDefined()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('accepts a name exactly 3 characters long', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderForm()

    const nameInput = screen.getByPlaceholderText('Task name')
    await user.clear(nameInput)
    await user.type(nameInput, 'abc')
    await user.click(screen.getByRole('button', { name: /^save$/i }))

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ name: 'abc' }))
  })

  it('shows an error when the GeoJSON field is cleared', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderForm()

    const geometriesInput = screen.getByPlaceholderText('{"type":"Point","coordinates":[0,0]}')
    await user.clear(geometriesInput)
    await user.click(screen.getByRole('button', { name: /^save$/i }))

    expect(await screen.findByText('GeoJSON is required')).toBeDefined()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('allows the optional instruction and errorTags fields to be cleared', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderForm()

    const instructionInput = screen.getByPlaceholderText(
      'Instructions for this task (overrides challenge instructions)'
    )
    await user.clear(instructionInput)
    await user.click(screen.getByRole('button', { name: /^save$/i }))

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ instruction: '' }))
  })

  it('calls onCancel (and not onSubmit) when the Cancel button is clicked', async () => {
    const user = userEvent.setup()
    const { onSubmit, onCancel } = renderForm()

    await user.click(screen.getByRole('button', { name: /^cancel$/i }))

    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits a non-JSON, non-empty GeoJSON string as-is (the schema only checks for non-emptiness)', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderForm()

    const geometriesInput = screen.getByPlaceholderText('{"type":"Point","coordinates":[0,0]}')
    await user.clear(geometriesInput)
    await user.type(geometriesInput, 'not valid json')
    await user.click(screen.getByRole('button', { name: /^save$/i }))

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ geometries: 'not valid json' }))
  })

  it('changes the submitted status when a different status option is selected', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderForm()

    await user.click(screen.getByRole('combobox'))
    await user.click(await screen.findByRole('option', { name: 'Fixed' }))
    await user.click(screen.getByRole('button', { name: /^save$/i }))

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ status: 1 }))
  })

  it('pre-fills the form from the given task, including a non-zero status', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderForm({
      ...baseTask,
      name: 'Repair the bench',
      instruction: 'Careful with the bolts',
      status: 2,
      errorTags: 'amenity',
    } as unknown as TaskGetResponse)

    expect(screen.getByPlaceholderText('Task name')).toHaveProperty('value', 'Repair the bench')
    expect(screen.getByRole('combobox').textContent).toContain('False Positive')

    await user.click(screen.getByRole('button', { name: /^save$/i }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Repair the bench',
        instruction: 'Careful with the bolts',
        status: 2,
        errorTags: 'amenity',
      })
    )
  })
})
