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
import { Switch } from '@/components/ui/Switch'
import { Textarea } from '@/components/ui/Textarea'
import { logger } from '@/lib/logger'
import type { Project } from '@/types/Project'

const projectFormSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(255),
  displayName: z.string().min(1, 'Display name is required').max(255),
  description: z.string().optional().or(z.literal('')),
  enabled: z.boolean(),
  featured: z.boolean(),
})

export type ProjectFormValues = z.infer<typeof projectFormSchema>

interface ProjectFormProps {
  project?: Project
  onSubmit: (values: ProjectFormValues) => Promise<void>
  onCancel: () => void
}

export const ProjectForm = ({ project, onSubmit, onCancel }: ProjectFormProps) => {
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: project?.name || '',
      displayName: project?.displayName || '',
      description: project?.description || '',
      enabled: project?.enabled ?? true,
      featured: project?.featured ?? false,
    },
  })

  const handleSubmit = async (values: ProjectFormValues) => {
    try {
      await onSubmit(values)
      toast.success(project ? 'Project updated successfully' : 'Project created successfully')
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to save project. Please try again.'
      toast.error(errorMessage)
      logger.error('Failed to save project', { error: String(error) })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Name</FormLabel>
              <FormControl>
                <Input placeholder="my-project" {...field} />
              </FormControl>
              <FormDescription>
                A unique identifier for the project (lowercase, no spaces)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Name</FormLabel>
              <FormControl>
                <Input placeholder="My Project" {...field} />
              </FormControl>
              <FormDescription>The display name shown to users</FormDescription>
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
                  placeholder="Describe what this project is about..."
                  className="min-h-32 resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>A brief description of the project</FormDescription>
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
                <FormDescription>Make this project visible and accessible to users</FormDescription>
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
                <FormDescription>Feature this project on the homepage</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
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
              : project
                ? 'Update Project'
                : 'Create Project'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
