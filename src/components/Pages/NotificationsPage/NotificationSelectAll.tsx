import { useId } from 'react'
import { Checkbox } from '@/components/ui/Checkbox'
import { useNotificationsPageContext } from '@/contexts/NotificationsPageContext'
import { useIntl } from '@/i18n'

export const NotificationSelectAll = () => {
  const { t } = useIntl()
  const {
    groupByTask,
    selectedNotificationIds,
    handleSelectAll,
    allSelected,
    someSelected,
    displayNotifications,
  } = useNotificationsPageContext()

  const selectAllCheckboxId = useId()

  const totalNotificationCount = groupByTask
    ? displayNotifications.reduce((sum, n) => sum + (n.thread || [n]).length, 0)
    : displayNotifications.length

  return (
    <div className="mb-2 flex items-center gap-2 px-1">
      <Checkbox
        id={selectAllCheckboxId}
        checked={allSelected}
        indeterminate={someSelected && !allSelected}
        onCheckedChange={(checked) => handleSelectAll(checked === true)}
        aria-label={t(
          'notificationsPage.selectAll.ariaLabel',
          undefined,
          'Select all notifications'
        )}
      />
      <label htmlFor={selectAllCheckboxId} className="text-sm text-zinc-600 dark:text-slate-400">
        {selectedNotificationIds.size > 0
          ? t(
              'notificationsPage.selectAll.selectedCount',
              { selected: selectedNotificationIds.size, total: totalNotificationCount },
              '{selected} of {total} selected'
            )
          : t('notificationsPage.selectAll.selectAll', undefined, 'Select all')}
      </label>
    </div>
  )
}
