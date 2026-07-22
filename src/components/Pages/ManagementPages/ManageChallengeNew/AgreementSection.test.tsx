import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Form } from '@/components/ui/Form'
import { cleanup, render, screen } from '@/test/testUtils'
import { AgreementSection } from './AgreementSection'
import { buildFormValues, type ChallengeFormValues } from './challengeFormSchema'

afterEach(() => cleanup())

const Harness = ({ onSubmit }: { onSubmit: (values: ChallengeFormValues) => void }) => {
  const form = useForm<ChallengeFormValues>({
    defaultValues: buildFormValues(undefined, 1),
  })
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((values) => onSubmit(values))}>
        <AgreementSection form={form} />
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

describe('AgreementSection', () => {
  it('renders the section title, description and a link to the code of conduct', () => {
    renderHarness()

    expect(
      screen.getByText('Automated Edits Code of Conduct Agreement')
    ).toBeDefined()
    const link = screen.getByRole('link', { name: /automated edits code of conduct/i })
    expect(link.getAttribute('href')).toBe(
      'https://wiki.openstreetmap.org/wiki/Automated_Edits_code_of_conduct'
    )
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toBe('noopener noreferrer')
  })

  it('renders the checkbox unchecked by default (buildFormValues defaults to false for create mode)', () => {
    renderHarness()

    const checkbox = screen.getByRole('checkbox', {
      name: /I have read and understand the OSM Automated Edits code of conduct/i,
    })
    expect(checkbox.getAttribute('aria-checked')).toBe('false')
  })

  it('checking the box updates the form value, submitted as true', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderHarness()

    await user.click(
      screen.getByRole('checkbox', {
        name: /I have read and understand the OSM Automated Edits code of conduct/i,
      })
    )
    await user.click(screen.getByRole('button', { name: /submit/i }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ automatedEditsCodeAgreement: true })
    )
  })

  it('submits false when the box is left unchecked', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderHarness()

    await user.click(screen.getByRole('button', { name: /submit/i }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ automatedEditsCodeAgreement: false })
    )
  })

  it('toggling the checkbox twice returns it to unchecked', async () => {
    const user = userEvent.setup()
    renderHarness()

    const checkbox = screen.getByRole('checkbox', {
      name: /I have read and understand the OSM Automated Edits code of conduct/i,
    })
    await user.click(checkbox)
    expect(checkbox.getAttribute('aria-checked')).toBe('true')
    await user.click(checkbox)
    expect(checkbox.getAttribute('aria-checked')).toBe('false')
  })
})
