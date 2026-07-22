import { ChevronDown } from 'lucide-react'
import { api } from '@/api'
import { ProjectPickerModal } from '@/components/shared/ProjectPickerModal'
import { Button } from '@/components/ui/Button'
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form'
import { useIntl } from '@/i18n'
import { cn } from '@/lib/utils'

interface ProjectPickerFieldProps {
  value: number
  onChange: (value: number) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Fetching the currently selected project lets the picker show its name even
// when it's outside the modal's first page of results (the previous Select
// silently dropped any project beyond the first batch).
export const ProjectPickerField = ({
  value,
  onChange,
  open,
  onOpenChange,
}: ProjectPickerFieldProps) => {
  const { t } = useIntl()
  const { data: selectedProject } = api.project.getProject(value > 0 ? value : undefined)
  const label = selectedProject
    ? `${selectedProject.id} - ${selectedProject.displayName || selectedProject.name}`
    : value > 0
      ? t('common.projectWithId', { id: value }, 'Project #{id}')
      : t('common.selectAProject', undefined, 'Select a project')

  return (
    <FormItem>
      <FormLabel>{t('common.project', undefined, 'Project')}</FormLabel>
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
      <FormDescription>
        {t(
          'manageChallengeNew.challengeForm.projectPicker.description',
          undefined,
          'Select the project this challenge belongs to'
        )}
      </FormDescription>
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
