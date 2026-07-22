import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Form } from '@/components/ui/Form'
import { cleanup, render, screen } from '@/test/testUtils'
import { BasicInfoFields } from './BasicInfoFields'
import { buildFormValues, type ChallengeFormValues } from './challengeFormSchema'

afterEach(() => cleanup())

const Harness = ({
  onSubmit,
  namePlaceholder = "Someone's Challenge",
}: {
  onSubmit: (values: ChallengeFormValues) => void
  namePlaceholder?: string
}) => {
  const form = useForm<ChallengeFormValues>({
    defaultValues: buildFormValues(undefined, 1),
  })
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((values) => onSubmit(values))}>
        <BasicInfoFields form={form} namePlaceholder={namePlaceholder} />
        <button type="submit">Submit</button>
      </form>
    </Form>
  )
}

const renderHarness = (namePlaceholder?: string) => {
  const onSubmit = vi.fn()
  render(<Harness onSubmit={onSubmit} namePlaceholder={namePlaceholder} />)
  return { onSubmit }
}

describe('BasicInfoFields', () => {
  it('renders name, description, instructions and difficulty fields with labels', () => {
    renderHarness()

    expect(screen.getByLabelText('Name')).toBeDefined()
    expect(screen.getByLabelText('Description')).toBeDefined()
    expect(screen.getByLabelText('Instructions')).toBeDefined()
    expect(screen.getByText('Difficulty')).toBeDefined()
  })

  it('uses the provided namePlaceholder for the name field', () => {
    renderHarness("Alice's Challenge")

    expect(screen.getByPlaceholderText("Alice's Challenge")).toBeDefined()
  })

  it('shows the default difficulty ("Easy", value 1) from buildFormValues', () => {
    renderHarness()

    expect(screen.getByRole('combobox').textContent).toBe('Easy')
  })

  it('typing into name, description and instructions updates the submitted form values', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderHarness()

    await user.type(screen.getByLabelText('Name'), 'My Challenge')
    await user.type(screen.getByLabelText('Description'), 'A description')
    await user.type(screen.getByLabelText('Instructions'), 'Do the thing')
    await user.click(screen.getByRole('button', { name: /submit/i }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'My Challenge',
        description: 'A description',
        instruction: 'Do the thing',
      })
    )
  })

  it('submits the default difficulty of 1 when left untouched', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderHarness()

    await user.click(screen.getByRole('button', { name: /submit/i }))

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ difficulty: 1 }))
  })

  it('changing the difficulty select updates the displayed and submitted value', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderHarness()

    await user.click(screen.getByRole('combobox'))
    await user.click(await screen.findByRole('option', { name: 'Expert' }))

    expect(screen.getByRole('combobox').textContent).toBe('Expert')

    await user.click(screen.getByRole('button', { name: /submit/i }))

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ difficulty: 3 }))
  })
})
