import { zodResolver } from '@hookform/resolvers/zod'
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
import { Input } from '@/components/ui/Input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { Switch } from '@/components/ui/Switch'
import { Textarea } from '@/components/ui/Textarea'
import type { Challenge } from '@/types/Challenge'
import type { Project } from '@/types/Project'

const challengeFormSchema = z.object({
  projectId: z.number().min(1, 'Please select a project'),
  name: z.string().min(1, 'Challenge name is required').max(255),
  description: z.string().optional().or(z.literal('')),
  blurb: z.string().optional().or(z.literal('')),
  instruction: z.string().optional().or(z.literal('')),
  difficulty: z.number().min(1).max(3),
  enabled: z.boolean(),
  featured: z.boolean(),
  overpassQL: z.string().optional().or(z.literal('')),
})

export type ChallengeFormValues = z.infer<typeof challengeFormSchema>

interface ChallengeFormProps {
  challenge?: Challenge
  projectId?: number
  projects?: Project[]
  onSubmit: (values: ChallengeFormValues) => Promise<void>
  onCancel: () => void
}

export const ChallengeForm = ({
  challenge,
  projectId,
  projects,
  onSubmit,
  onCancel,
}: ChallengeFormProps) => {
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
      overpassQL: challenge?.overpassQL || '',
    },
  })

  const handleSubmit = async (values: ChallengeFormValues) => {
    try {
      await onSubmit(values)
      toast.success(challenge ? 'Challenge updated successfully' : 'Challenge created successfully')
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to save challenge. Please try again.'
      toast.error(errorMessage)
      console.error('Failed to save challenge:', error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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
                Overpass query language to automatically generate tasks for this challenge
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-end gap-3">
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
