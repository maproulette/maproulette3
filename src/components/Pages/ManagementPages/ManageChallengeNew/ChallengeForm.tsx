import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronDown } from 'lucide-react'
import { useId, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { api } from '@/api'
import { ProjectPickerModal } from '@/components/shared/ProjectPickerModal'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form'
import { FormSection, FormSectionGroup } from '@/components/ui/FormSection'
import { Input } from '@/components/ui/Input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { Switch } from '@/components/ui/Switch'
import { Textarea } from '@/components/ui/Textarea'
import { useAuthContext } from '@/contexts/AuthContext'
import { useChallengeFormContext } from '@/contexts/ChallengeFormContext'
import { logger } from '@/lib/logger'
import { isSuperUser } from '@/lib/SuperAdminGuard'
import { cn } from '@/lib/utils'
import type { Challenge } from '@/types/Challenge'

const baseChallengeFormSchema = z.object({
  projectId: z.number().min(1, 'Please select a project'),
  name: z.string().min(3, 'Challenge name must be at least 3 characters').max(255),
  description: z.string().min(1, 'Description is required'),
  instruction: z.string().min(1, 'Instructions are required'),
  difficulty: z.number().min(1).max(3),
  enabled: z.boolean(),
  featured: z.boolean(),
  dataSource: z.enum(['overpass', 'localGeoJSON', 'remoteGeoJSON']),
  overpassQL: z.string().optional().or(z.literal('')),
  localGeoJSON: z.instanceof(File).nullable().optional(),
  remoteGeoJSON: z.string().optional().or(z.literal('')),
  dataOriginDate: z.string().optional().or(z.literal('')),
  automatedEditsCodeAgreement: z.boolean(),
})

export type ChallengeFormValues = z.infer<typeof baseChallengeFormSchema>

// When editing, the challenge's task data already lives on the server, so a
// local GeoJSON re-upload isn't required to save — only enforce it when
// creating. Overpass and remote sources still need their value either way.
const makeChallengeFormSchema = (isEdit: boolean) =>
  baseChallengeFormSchema.superRefine((data, ctx) => {
    if (data.dataSource === 'overpass') {
      if (!data.overpassQL || data.overpassQL.trim().length === 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['overpassQL'],
          message: 'An Overpass query is required',
        })
      }
    } else if (data.dataSource === 'localGeoJSON') {
      if (!isEdit && !data.localGeoJSON) {
        ctx.addIssue({
          code: 'custom',
          path: ['localGeoJSON'],
          message: 'Please upload a GeoJSON file',
        })
      }
    } else if (data.dataSource === 'remoteGeoJSON') {
      if (!data.remoteGeoJSON || data.remoteGeoJSON.trim().length === 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['remoteGeoJSON'],
          message: 'A GeoJSON URL is required',
        })
      }
    }

    if (!isEdit && data.automatedEditsCodeAgreement !== true) {
      ctx.addIssue({
        code: 'custom',
        path: ['automatedEditsCodeAgreement'],
        message: 'You must read and accept the Automated Edits code of conduct',
      })
    }
  })

const getDefaultDataSource = (
  challenge?: Challenge
): 'overpass' | 'localGeoJSON' | 'remoteGeoJSON' => {
  // New challenge: default to Overpass. For an existing challenge the source
  // is inferred from which field is populated; with neither an Overpass query
  // nor a remote URL the tasks came from a local upload. `requiresLocal` can't
  // be trusted here — it defaults to false and is frequently never set.
  if (!challenge) return 'overpass'
  if (challenge.overpassQL) return 'overpass'
  if (challenge.remoteGeoJson) return 'remoteGeoJSON'
  return 'localGeoJSON'
}

const buildFormValues = (
  challenge: Challenge | undefined,
  projectId: number
): ChallengeFormValues => ({
  projectId: challenge?.parent ?? projectId,
  name: challenge?.name ?? '',
  description: challenge?.description ?? '',
  instruction: challenge?.instruction ?? '',
  difficulty: challenge?.difficulty ?? 1,
  enabled: challenge?.enabled ?? true,
  featured: challenge?.featured ?? false,
  dataSource: getDefaultDataSource(challenge),
  overpassQL: challenge?.overpassQL ?? '',
  localGeoJSON: null,
  remoteGeoJSON: challenge?.remoteGeoJson ?? '',
  dataOriginDate: '',
  // Editing an existing challenge isn't an automated edit, so the agreement is
  // pre-satisfied; new challenges must explicitly accept it (see schema).
  automatedEditsCodeAgreement: challenge !== undefined,
})

interface ProjectPickerFieldProps {
  value: number
  onChange: (value: number) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Fetching the currently selected project lets the picker show its name even
// when it's outside the modal's first page of results (the previous Select
// silently dropped any project beyond the first batch).
const ProjectPickerField = ({ value, onChange, open, onOpenChange }: ProjectPickerFieldProps) => {
  const { data: selectedProject } = api.project.getProject(value > 0 ? value : undefined)
  const label = selectedProject
    ? `${selectedProject.id} - ${selectedProject.displayName || selectedProject.name}`
    : value > 0
      ? `Project #${value}`
      : 'Select a project'

  return (
    <FormItem>
      <FormLabel>Project</FormLabel>
      <FormControl>
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(true)}
          className="w-full justify-between font-normal"
        >
          <span className={cn('truncate', value > 0 ? '' : 'text-zinc-500 dark:text-zinc-400')}>
            {label}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </FormControl>
      <FormDescription>Select the project this challenge belongs to</FormDescription>
      <FormMessage />
      <ProjectPickerModal
        open={open}
        onOpenChange={onOpenChange}
        selectedProjectId={value > 0 ? value : undefined}
        onSelectProject={(project) => {
          if (project.id != null) onChange(project.id)
        }}
      />
    </FormItem>
  )
}

export const ChallengeForm = () => {
  const { challenge, projectId, onSubmit, onCancel } = useChallengeFormContext()
  const { user } = useAuthContext()
  const canSetFeatured = isSuperUser(user)
  const overpassId = useId()
  const localGeoJSONId = useId()
  const remoteGeoJSONId = useId()
  const isEdit = !!challenge
  const [pickerOpen, setPickerOpen] = useState(false)

  const resolver = useMemo(() => zodResolver(makeChallengeFormSchema(isEdit)), [isEdit])
  // Drive the form off `values` (not just `defaultValues`) so it reactively
  // fills once the challenge query resolves or the cache is refreshed —
  // `defaultValues` alone is read only on mount. `keepDirtyValues` keeps any
  // edits in progress from being clobbered by a background refetch.
  const values = useMemo(
    () => (challenge ? buildFormValues(challenge, projectId ?? 0) : undefined),
    [challenge, projectId]
  )

  const form = useForm<ChallengeFormValues>({
    resolver,
    defaultValues: buildFormValues(undefined, projectId ?? 0),
    values,
    resetOptions: { keepDirtyValues: true },
  })

  const dataSource = form.watch('dataSource')
  // The data source can only be set while creating. Once a challenge exists,
  // its tasks are already built from that source, so it's shown read-only here
  // (matching MR3) — regenerating tasks is done via Rebuild Tasks instead.
  const sourceReadOnly = isEdit

  const handleSubmit = async (values: ChallengeFormValues) => {
    try {
      await onSubmit(values)
      toast.success(challenge ? 'Challenge updated successfully' : 'Challenge created successfully')
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to save challenge. Please try again.'
      toast.error(errorMessage)
      logger.error('Failed to save challenge', { error: String(error) })
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="absolute inset-0 flex min-h-0 flex-col"
      >
        <FormSectionGroup className="min-h-0 flex-1 overflow-y-auto pr-1">
          <FormSection
            title="Challenge details"
            description="The basic information shown to mappers browsing this challenge."
          >
            {!isEdit && (
              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <ProjectPickerField
                    value={field.value}
                    onChange={field.onChange}
                    open={pickerOpen}
                    onOpenChange={setPickerOpen}
                  />
                )}
              />
            )}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Challenge Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My Challenge" {...field} />
                  </FormControl>
                  <FormDescription>A descriptive name for your challenge</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe what this challenge is about..."
                      className="min-h-32 resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>A detailed description of the challenge</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="instruction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instructions</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Instructions for completing tasks..."
                      className="min-h-32 resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Instructions for users completing tasks in this challenge
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="difficulty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Difficulty</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Easy</SelectItem>
                      <SelectItem value="2">Normal</SelectItem>
                      <SelectItem value="3">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>The difficulty level of this challenge</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormSection>

          <FormSection
            title="Visibility"
            description="Control how this challenge appears across MapRoulette."
          >
            <FormField
              control={form.control}
              name="enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Enabled</FormLabel>
                    <FormDescription>
                      Make this challenge visible and accessible to users
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            {canSetFeatured && (
              <FormField
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Featured</FormLabel>
                      <FormDescription>Feature this challenge on the homepage</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}
          </FormSection>

          <FormSection
            title="Task data"
            description={
              sourceReadOnly
                ? 'The data source is set when the challenge is created. To regenerate tasks from updated data, use Rebuild Tasks when managing the challenge.'
                : 'Choose how you want to provide task data for this challenge.'
            }
          >
            {sourceReadOnly ? (
              <div className="space-y-4">
                {dataSource === 'overpass' && (
                  <div className="space-y-2">
                    <p className="font-medium text-sm">Overpass query</p>
                    <Textarea
                      readOnly
                      value={challenge?.overpassQL ?? ''}
                      className="min-h-32 resize-none bg-zinc-100 font-mono text-sm dark:bg-slate-800"
                    />
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Overpass queries cannot be edited here. Use Rebuild Tasks when managing your
                      challenge to re-run the query and refresh your tasks.
                    </p>
                  </div>
                )}
                {dataSource === 'remoteGeoJSON' && (
                  <div className="space-y-2">
                    <p className="font-medium text-sm">GeoJSON URL</p>
                    <Input
                      readOnly
                      value={challenge?.remoteGeoJson ?? ''}
                      className="bg-zinc-100 dark:bg-slate-800"
                    />
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Remote URLs cannot be edited here. Use Rebuild Tasks when managing your
                      challenge to re-download the GeoJSON and refresh your tasks.
                    </p>
                  </div>
                )}
                {dataSource === 'localGeoJSON' && (
                  <div className="space-y-2">
                    <p className="font-medium text-sm">Uploaded GeoJSON file</p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      This challenge was built from an uploaded GeoJSON file, which can't be shown
                      here. To replace it with fresh GeoJSON, use Rebuild Tasks when managing your
                      challenge.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <>
                <FormField
                  control={form.control}
                  name="dataSource"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="grid grid-cols-1 gap-4"
                        >
                          <label
                            htmlFor={overpassId}
                            className={cn(
                              'flex cursor-pointer items-start space-x-3 rounded-lg border border-zinc-200 p-4 transition-all dark:border-slate-700',
                              field.value === 'overpass'
                                ? 'bg-blue-50/60 ring-2 ring-blue-500 hover:bg-blue-100/60 dark:bg-blue-950/30 dark:ring-blue-400 dark:hover:bg-blue-950/50'
                                : 'hover:bg-zinc-50 dark:hover:bg-slate-900/50'
                            )}
                          >
                            <RadioGroupItem value="overpass" id={overpassId} className="mt-1" />
                            <div className="flex-1 space-y-1">
                              <div className="font-medium">I want to provide an Overpass query</div>
                              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                Use Overpass QL to automatically generate tasks from OpenStreetMap
                                data
                              </p>
                            </div>
                          </label>
                          <label
                            htmlFor={localGeoJSONId}
                            className={cn(
                              'flex cursor-pointer items-start space-x-3 rounded-lg border border-zinc-200 p-4 transition-all dark:border-slate-700',
                              field.value === 'localGeoJSON'
                                ? 'bg-blue-50/60 ring-2 ring-blue-500 hover:bg-blue-100/60 dark:bg-blue-950/30 dark:ring-blue-400 dark:hover:bg-blue-950/50'
                                : 'hover:bg-zinc-50 dark:hover:bg-slate-900/50'
                            )}
                          >
                            <RadioGroupItem
                              value="localGeoJSON"
                              id={localGeoJSONId}
                              className="mt-1"
                            />
                            <div className="flex-1 space-y-1">
                              <div className="font-medium">I want to upload a GeoJSON file</div>
                              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                Upload a GeoJSON file from your computer
                              </p>
                            </div>
                          </label>
                          <label
                            htmlFor={remoteGeoJSONId}
                            className={cn(
                              'flex cursor-pointer items-start space-x-3 rounded-lg border border-zinc-200 p-4 transition-all dark:border-slate-700',
                              field.value === 'remoteGeoJSON'
                                ? 'bg-blue-50/60 ring-2 ring-blue-500 hover:bg-blue-100/60 dark:bg-blue-950/30 dark:ring-blue-400 dark:hover:bg-blue-950/50'
                                : 'hover:bg-zinc-50 dark:hover:bg-slate-900/50'
                            )}
                          >
                            <RadioGroupItem
                              value="remoteGeoJSON"
                              id={remoteGeoJSONId}
                              className="mt-1"
                            />
                            <div className="flex-1 space-y-1">
                              <div className="font-medium">I have a URL to the GeoJSON data</div>
                              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                Provide a URL pointing to a GeoJSON file
                              </p>
                            </div>
                          </label>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Overpass QL Field */}
                {dataSource === 'overpass' && (
                  <FormField
                    control={form.control}
                    name="overpassQL"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Overpass QL</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="[out:xml][timeout:25];(way[highway=primary];);out meta;"
                            className="min-h-32 resize-none font-mono text-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Overpass query language to automatically generate tasks for this
                          challenge. Please see the{' '}
                          <a
                            href="https://learn.maproulette.org/en-US/documentation/using-overpass-to-create-challenges/#content"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            docs
                          </a>{' '}
                          for important details and common pitfalls when creating challenges using
                          Overpass queries.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {dataSource === 'localGeoJSON' && (
                  <FormField
                    control={form.control}
                    name="localGeoJSON"
                    render={({ field: { value, onChange, ...field } }) => (
                      <FormItem>
                        <FormLabel>GeoJSON File</FormLabel>
                        <FormControl>
                          <div className="flex flex-col gap-2">
                            <Input
                              type="file"
                              accept=".geojson,.json"
                              onChange={(e) => {
                                const file = e.target.files?.[0] || null
                                onChange(file)
                              }}
                              {...field}
                            />
                            {value && (
                              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                Selected: {value.name} ({(value.size / 1024).toFixed(2)} KB)
                              </p>
                            )}
                          </div>
                        </FormControl>
                        <FormDescription>
                          Upload a GeoJSON file from your computer. Standard GeoJSON and{' '}
                          <a
                            href="https://learn.maproulette.org/en-US/documentation/line-by-line-geojson/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline hover:text-blue-700 dark:text-blue-400"
                          >
                            line-by-line GeoJSON format
                          </a>{' '}
                          are supported.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Remote GeoJSON URL */}
                {dataSource === 'remoteGeoJSON' && (
                  <FormField
                    control={form.control}
                    name="remoteGeoJSON"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>GeoJSON URL</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://www.example.com/geojson.json"
                            type="url"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Provide a URL pointing to a GeoJSON file. The URL should point directly to
                          the raw GeoJSON file, not a page that contains a link to the file.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </>
            )}
          </FormSection>

          {!isEdit && (
            <FormSection
              title="Automated Edits Code of Conduct Agreement"
              description={
                <>
                  You are about to create a MapRoulette challenge. With this power comes
                  responsibility. Make sure that your Challenge is designed to encourage careful
                  human attention to each task, in the spirit of OpenStreetMap's{' '}
                  <a
                    href="https://wiki.openstreetmap.org/wiki/Automated_Edits_code_of_conduct"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Automated Edits code of conduct
                  </a>
                  . Please read this document carefully. By checking the box below, you acknowledge
                  that you understand and accept this responsibility.
                </>
              }
            >
              <FormField
                control={form.control}
                name="automatedEditsCodeAgreement"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start gap-3 rounded-lg border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="mt-0.5"
                      />
                    </FormControl>
                    <div className="space-y-1">
                      <FormLabel>
                        I have read and understand the OSM Automated Edits code of conduct
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </FormSection>
          )}
        </FormSectionGroup>
        <div className="mt-4 flex shrink-0 items-center justify-end gap-3 border-zinc-200 border-t pt-4 dark:border-slate-700">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? 'Saving...'
              : challenge
                ? 'Update Challenge'
                : 'Create Challenge'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
