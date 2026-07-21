import { FormCard, ManageFormLayout } from '@/components/shared/ManageFormLayout'
import { useIntl } from '@/i18n'

export const ManageTaskNew = () => {
  const { t } = useIntl()
  return (
    <ManageFormLayout>
      <FormCard
        title={t('manageTaskNew.title', undefined, 'New Task')}
        description={t(
          'manageTaskNew.description',
          undefined,
          'Task management functionality is under development'
        )}
      >
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {t(
            'manageTaskNew.body',
            undefined,
            'Tasks are typically created in bulk through challenges. Individual task creation will be available in a future update.'
          )}
        </p>
      </FormCard>
    </ManageFormLayout>
  )
}
