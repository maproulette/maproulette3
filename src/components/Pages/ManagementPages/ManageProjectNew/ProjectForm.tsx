import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo } from 'react'
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
import { Switch } from '@/components/ui/Switch'
import { Textarea } from '@/components/ui/Textarea'
import { useAuthContext } from '@/contexts/AuthContext'
import { useIntl } from '@/i18n'
import { logger } from '@/lib/logger'
import { isSuperUser } from '@/lib/SuperAdminGuard'
import type { Project } from '@/types/Project'

type T = ReturnType<typeof useIntl>['t']

// Building the schema requires translated validation messages, so it's built
// from a function (called from within the component, where `t` is available)
// rather than as a static module-level constant.
const makeProjectFormSchema = (t: T) =>
  z.object({
    name: z
      .string()
      .min(
        1,
        t(
          'manageProjectNew.projectForm.validation.nameRequired',
          undefined,
          'Project name is required'
        )
      )
      .max(255),
    displayName: z
      .string()
      .min(
        1,
        t(
          'manageProjectNew.projectForm.validation.displayNameRequired',
          undefined,
          'Display name is required'
        )
      )
      .max(255),
    description: z.string().optional().or(z.literal('')),
    enabled: z.boolean(),
    featured: z.boolean(),
  })

export type ProjectFormValues = z.infer<ReturnType<typeof makeProjectFormSchema>>

interface ProjectFormProps {
  project?: Project
  onSubmit: (values: ProjectFormValues) => Promise<void>
  onCancel: () => void
}

export const ProjectForm = ({ project, onSubmit, onCancel }: ProjectFormProps) => {
  const { t } = useIntl()
  const { user } = useAuthContext()
  const canSetFeatured = isSuperUser(user)

  const resolver = useMemo(() => zodResolver(makeProjectFormSchema(t)), [t])

  const form = useForm<ProjectFormValues>({
    resolver,
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
      toast.success(
        project
          ? t(
              'manageProjectNew.projectForm.updateSuccessToast',
              undefined,
              'Project updated successfully'
            )
          : t(
              'manageProjectNew.projectForm.createSuccessToast',
              undefined,
              'Project created successfully'
            )
      )
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : t(
              'manageProjectNew.projectForm.saveErrorToast',
              undefined,
              'Failed to save project. Please try again.'
            )
      toast.error(errorMessage)
      logger.error('Failed to save project', { error: String(error) })
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
            title={t(
              'manageProjectNew.projectForm.detailsSectionTitle',
              undefined,
              'Project details'
            )}
            description={t(
              'manageProjectNew.projectForm.detailsSectionDescription',
              undefined,
              'Basic identifying information for this project.'
            )}
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('manageProjectNew.projectForm.nameLabel', undefined, 'Project Name')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t(
                        'manageProjectNew.projectForm.namePlaceholder',
                        undefined,
                        'my-project'
                      )}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {t(
                      'manageProjectNew.projectForm.nameDescription',
                      undefined,
                      'A unique identifier for the project (lowercase, no spaces)'
                    )}
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
                  <FormLabel>
                    {t('manageProjectNew.projectForm.displayNameLabel', undefined, 'Display Name')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t(
                        'manageProjectNew.projectForm.displayNamePlaceholder',
                        undefined,
                        'My Project'
                      )}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {t(
                      'manageProjectNew.projectForm.displayNameDescription',
                      undefined,
                      'The display name shown to users'
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('manageProjectNew.projectForm.descriptionLabel', undefined, 'Description')}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t(
                        'manageProjectNew.projectForm.descriptionPlaceholder',
                        undefined,
                        'Describe what this project is about...'
                      )}
                      className="min-h-32 resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {t(
                      'manageProjectNew.projectForm.descriptionDescription',
                      undefined,
                      'A brief description of the project'
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormSection>

          <FormSection
            title={t(
              'manageProjectNew.projectForm.visibilitySectionTitle',
              undefined,
              'Visibility'
            )}
            description={t(
              'manageProjectNew.projectForm.visibilitySectionDescription',
              undefined,
              'Control how this project appears across MapRoulette.'
            )}
          >
            <FormField
              control={form.control}
              name="enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      {t('manageProjectNew.projectForm.enabledLabel', undefined, 'Enabled')}
                    </FormLabel>
                    <FormDescription>
                      {t(
                        'manageProjectNew.projectForm.enabledDescription',
                        undefined,
                        'Make this project visible and accessible to users'
                      )}
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
                      <FormLabel className="text-base">
                        {t('manageProjectNew.projectForm.featuredLabel', undefined, 'Featured')}
                      </FormLabel>
                      <FormDescription>
                        {t(
                          'manageProjectNew.projectForm.featuredDescription',
                          undefined,
                          'Feature this project on the homepage'
                        )}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}
          </FormSection>
        </FormSectionGroup>
        <div className="mt-4 flex shrink-0 items-center justify-end gap-3 border-zinc-200 border-t pt-4 dark:border-slate-700">
          <Button type="button" variant="outline" onClick={onCancel}>
            {t('common.cancel', undefined, 'Cancel')}
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? t('manageProjectNew.projectForm.savingButton', undefined, 'Saving...')
              : project
                ? t('manageProjectNew.projectForm.updateButton', undefined, 'Update Project')
                : t('manageProjectNew.projectForm.createButton', undefined, 'Create Project')}
          </Button>
        </div>
      </form>
    </Form>
  )
}
