import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Form } from '@/components/ui/Form'
import { cleanup, render, screen } from '@/test/testUtils'
import type { User } from '@/types/User'
import { ProjectPickerField } from './ProjectPickerField'

const { apiProjectMock, useAuthContextMock } = vi.hoisted(() => ({
  apiProjectMock: {
    getProject: vi.fn(),
    getManagedProjects: vi.fn(),
  },
  useAuthContextMock: vi.fn(),
}))

vi.mock('@/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api')>()
  return {
    ...actual,
    api: {
      ...actual.api,
      project: {
        ...actual.api.project,
        getProject: apiProjectMock.getProject,
        getManagedProjects: apiProjectMock.getManagedProjects,
      },
    },
  }
})

vi.mock('@/contexts/AuthContext', () => ({
  useAuthContext: useAuthContextMock,
}))

const fakeUser = { osmProfile: { id: 1, displayName: 'TestUser' }, grants: [] } as unknown as User

afterEach(() => cleanup())

beforeEach(() => {
  vi.clearAllMocks()
  apiProjectMock.getProject.mockReturnValue({ data: undefined, isLoading: false })
  apiProjectMock.getManagedProjects.mockReturnValue({
    data: [],
    isLoading: false,
    isFetching: false,
  })
  useAuthContextMock.mockReturnValue({
    user: fakeUser,
    isAuthenticated: true,
    authLoading: false,
    error: null,
    login: vi.fn(),
    logout: vi.fn(),
  })
})

// FormItem/FormControl/FormLabel/FormMessage (used inside ProjectPickerField)
// read from react-hook-form's context via useFormContext/useFormState, so a
// <Form> (FormProvider) ancestor is required even though this field isn't
// wired up through <FormField>.
const Harness = ({
  value,
  onChange,
  open,
  onOpenChange,
}: {
  value: number
  onChange: (value: number) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}) => {
  const form = useForm()
  return (
    <Form {...form}>
      <ProjectPickerField value={value} onChange={onChange} open={open} onOpenChange={onOpenChange} />
    </Form>
  )
}

// The picker's trigger button is a plain <button> associated with the
// "Project" <FormLabel> via `htmlFor`/`id`, so testing-library computes its
// accessible name as "Project" (the label text) rather than its own visible
// text — the visible placeholder/selection text is asserted separately.
const getTriggerButton = () => screen.getByRole('button', { name: 'Project' })

describe('ProjectPickerField', () => {
  it('shows a placeholder when no project is selected', () => {
    render(<Harness value={0} onChange={vi.fn()} open={false} onOpenChange={vi.fn()} />)

    expect(getTriggerButton().textContent).toMatch(/select a project/i)
  })

  it('shows "Project #<id>" while the selected project has not loaded yet', () => {
    apiProjectMock.getProject.mockReturnValue({ data: undefined, isLoading: true })

    render(<Harness value={7} onChange={vi.fn()} open={false} onOpenChange={vi.fn()} />)

    expect(getTriggerButton().textContent).toMatch(/project #7/i)
  })

  it('shows the project id and display name once the selected project has loaded', () => {
    apiProjectMock.getProject.mockReturnValue({
      data: { id: 7, name: 'internal-name', displayName: 'My Great Project' },
      isLoading: false,
    })

    render(<Harness value={7} onChange={vi.fn()} open={false} onOpenChange={vi.fn()} />)

    expect(getTriggerButton().textContent).toMatch(/7 - My Great Project/i)
  })

  it('falls back to the internal name when the project has no displayName', () => {
    apiProjectMock.getProject.mockReturnValue({
      data: { id: 7, name: 'internal-name', displayName: '' },
      isLoading: false,
    })

    render(<Harness value={7} onChange={vi.fn()} open={false} onOpenChange={vi.fn()} />)

    expect(getTriggerButton().textContent).toMatch(/7 - internal-name/i)
  })

  it('does not query for a project when value is 0', () => {
    render(<Harness value={0} onChange={vi.fn()} open={false} onOpenChange={vi.fn()} />)

    expect(apiProjectMock.getProject).toHaveBeenCalledWith(undefined)
  })

  it('opens the picker modal when the button is clicked', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(<Harness value={0} onChange={vi.fn()} open={false} onOpenChange={onOpenChange} />)

    await user.click(getTriggerButton())

    expect(onOpenChange).toHaveBeenCalledWith(true)
  })

  it('calls onChange with the chosen project id and closes the modal when a project is picked', async () => {
    const user = userEvent.setup()
    apiProjectMock.getManagedProjects.mockReturnValue({
      data: [{ id: 3, name: 'proj-3', displayName: 'Project Three' }],
      isLoading: false,
      isFetching: false,
    })
    const onChange = vi.fn()
    const onOpenChange = vi.fn()
    render(<Harness value={0} onChange={onChange} open={true} onOpenChange={onOpenChange} />)

    await user.click(screen.getByRole('button', { name: /project three/i }))

    expect(onChange).toHaveBeenCalledWith(3)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})
