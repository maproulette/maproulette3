import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { api } from '@/api'
import { Button } from '@/components/ui/Button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { useIntl } from '@/i18n'
import { logger } from '@/lib/logger'
import type { Team } from '@/types/Team'
import { type TeamFormValues, teamFormSchema } from './teamSchema'

interface Props {
  team?: Team
}

export const TeamForm = ({ team }: Props) => {
  const { t } = useIntl()
  const navigate = useNavigate()
  const create = api.team.useCreateTeam()
  const update = api.team.useUpdateTeam()

  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamFormSchema),
    defaultValues: {
      name: team?.name ?? '',
      description: team?.description ?? '',
      avatarURL: team?.avatarURL ?? '',
    },
  })

  const onSubmit = async (values: TeamFormValues) => {
    const payload = {
      name: values.name,
      description: values.description || undefined,
      avatarURL: values.avatarURL || undefined,
    }
    try {
      const result = team
        ? await update.mutateAsync({ teamId: team.id, payload })
        : await create.mutateAsync(payload)
      toast.success(
        team
          ? t('teams.form.updateSuccess', undefined, 'Team updated')
          : t('teams.form.createSuccess', undefined, 'Team created')
      )
      navigate({ to: '/teams/$teamId', params: { teamId: String(result.id) } })
    } catch (error) {
      logger.error('Team save failed', { error })
      toast.error(t('teams.form.saveError', undefined, 'Could not save team'))
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('teams.form.nameLabel', undefined, 'Name')}</FormLabel>
              <FormControl>
                <Input autoFocus maxLength={100} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('teams.form.descriptionLabel', undefined, 'Description')}</FormLabel>
              <FormControl>
                <Textarea rows={4} maxLength={1000} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="avatarURL"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('teams.form.avatarUrlLabel', undefined, 'Avatar URL (optional)')}
              </FormLabel>
              <FormControl>
                <Input type="url" placeholder="https://…" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate({ to: '/teams' })}
            disabled={form.formState.isSubmitting}
          >
            {t('common.cancel', undefined, 'Cancel')}
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {team
              ? t('common.save', undefined, 'Save')
              : t('teams.form.createButton', undefined, 'Create team')}
          </Button>
        </div>
      </form>
    </Form>
  )
}
