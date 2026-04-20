import { zodResolver } from '@hookform/resolvers/zod'
import { useId } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
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
import { useChallengeFormContext } from '@/contexts/ChallengeFormContext'
import { logger } from '@/lib/logger'
import { cn } from '@/lib/utils'

const challengeFormSchema = z
  .object({
    projectId: z.number().min(1, 'Please select a project'),
    name: z.string().min(1, 'Challenge name is required').max(255),
    description: z.string().optional().or(z.literal('')),
    blurb: z.string().optional().or(z.literal('')),
    instruction: z.string().optional().or(z.literal('')),
    difficulty: z.number().min(1).max(3),
    enabled: z.boolean(),
    featured: z.boolean(),
    dataSource: z.enum(['overpass', 'localGeoJSON', 'remoteGeoJSON']),
    overpassQL: z.string().optional().or(z.literal('')),
    localGeoJSON: z.instanceof(File).nullable().optional(),
    remoteGeoJSON: z.string().optional().or(z.literal('')),
    dataOriginDate: z.string().optional().or(z.literal('')),
  })
  .refine(
    (data) => {
      if (data.dataSource === 'overpass') {
        return true
      }
      if (data.dataSource === 'localGeoJSON') {
        return !!data.localGeoJSON
      }
      if (data.dataSource === 'remoteGeoJSON') {
        return !!data.remoteGeoJSON && data.remoteGeoJSON.length > 0
      }
      return true
    },
    {
      message: 'Please provide the required data source',
      path: ['dataSource'],
    }
  )

export type ChallengeFormValues = z.infer<typeof challengeFormSchema>

export const ChallengeForm = () => {
  const { challenge, projectId, projects, onSubmit, onCancel } = useChallengeFormContext()
  const overpassId = useId()
  const localGeoJSONId = useId()
  const remoteGeoJSONId = useId()

  const getDefaultDataSource = (): 'overpass' | 'localGeoJSON' | 'remoteGeoJSON' => {
    if (challenge?.remoteGeoJson) return 'remoteGeoJSON'
    if (challenge && !challenge.overpassQL) return 'localGeoJSON'
    return 'overpass'
  }

  const form = useForm<ChallengeFormValues>({
    resolver: zodResolver(challengeFormSchema),
    defaultValues: {
      projectId: projectId,
      name: challenge?.name || '',
      description: challenge?.description || '',
      blurb: challenge?.blurb || '',
      instruction: challenge?.instruction || '',
      difficulty: challenge?.difficulty || 1,
      enabled: challenge?.enabled ?? true,
      featured: challenge?.featured ?? false,
      dataSource: getDefaultDataSource(),
      overpassQL: challenge?.overpassQL || '',
      localGeoJSON: null,
      remoteGeoJSON: challenge?.remoteGeoJson || '',
      dataOriginDate: '',
    },
  })

  const dataSource = form.watch('dataSource')

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
      <form onSubmit={form.handleSubmit(handleSubmit)} className="flex min-h-0 flex-1 flex-col">
        <FormSectionGroup className="min-h-0 flex-1 overflow-y-auto pr-1">
          <FormSection
            title="Challenge details"
            description="The basic information shown to mappers browsing this challenge."
          >
            {projects && projects.length > 0 && (
              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a project" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id?.toString() || ''}>
                            {project.id} - {project.displayName || project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Select the project this challenge belongs to</FormDescription>
                    <FormMessage />
                  </FormItem>
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
              name="blurb"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Blurb</FormLabel>
                  <FormControl>
                    <Input placeholder="A brief summary..." {...field} />
                  </FormControl>
                  <FormDescription>A short summary of the challenge</FormDescription>
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
          </FormSection>

          <FormSection
            title="Task data"
            description="Choose how you want to provide task data for this challenge."
          >
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
                            Use Overpass QL to automatically generate tasks from OpenStreetMap data
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
                        <RadioGroupItem value="localGeoJSON" id={localGeoJSONId} className="mt-1" />
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
                      Overpass query language to automatically generate tasks for this challenge.
                      Please see the{' '}
                      <a
                        href="https://learn.maproulette.org/documentation/overpass-queries/"
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
                      Upload a GeoJSON file from your computer. The file should contain Feature or
                      FeatureCollection objects. For large files, consider using{' '}
                      <a
                        href="https://learn.maproulette.org/documentation/line-by-line-geojson/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline hover:text-blue-700 dark:text-blue-400"
                      >
                        line-by-line GeoJSON format
                      </a>
                      .
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
                      Provide a URL pointing to a GeoJSON file. The URL should point directly to the
                      raw GeoJSON file, not a page that contains a link to the file.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </FormSection>
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
