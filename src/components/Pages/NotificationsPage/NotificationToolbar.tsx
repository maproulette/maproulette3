import { Button } from '@/components/ui/Button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { useNotificationsPageContext } from '@/contexts/NotificationsPageContext'
import { useIntl } from '@/i18n'

export const NotificationToolbar = () => {
  const { t } = useIntl()
  const {
    activeTab,
    setActiveTab,
    filteredUnreadCount,
    filteredAllCount,
    selectedNotificationIds,
    allSelectedAreRead,
    handleMarkSelectedAsRead,
    handleMarkSelectedAsUnread,
    isMarkingSelected,
    filteredNotifications,
  } = useNotificationsPageContext()

  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'unread' | 'all')}>
        <TabsList>
          <TabsTrigger value="unread">
            {t(
              'notificationsPage.toolbar.unreadTab',
              { count: filteredUnreadCount },
              'Unread ({count})'
            )}
          </TabsTrigger>
          <TabsTrigger value="all">
            {t('notificationsPage.toolbar.allTab', { count: filteredAllCount }, 'All ({count})')}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-wrap items-center gap-2">
        {allSelectedAreRead ? (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkSelectedAsUnread}
            disabled={isMarkingSelected || filteredNotifications.length === 0}
          >
            {isMarkingSelected
              ? t('notificationsPage.toolbar.marking', undefined, 'Marking...')
              : selectedNotificationIds.size > 0
                ? t(
                    'notificationsPage.toolbar.markSelectedUnread',
                    { count: selectedNotificationIds.size },
                    'Mark {count} as unread'
                  )
                : t('notificationsPage.toolbar.markAllUnread', undefined, 'Mark all as unread')}
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkSelectedAsRead}
            disabled={isMarkingSelected || filteredNotifications.length === 0}
          >
            {isMarkingSelected
              ? t('notificationsPage.toolbar.marking', undefined, 'Marking...')
              : selectedNotificationIds.size > 0
                ? t(
                    'notificationsPage.toolbar.markSelectedRead',
                    { count: selectedNotificationIds.size },
                    'Mark {count} as read'
                  )
                : t('notificationsPage.toolbar.markAllRead', undefined, 'Mark all as read')}
          </Button>
        )}
      </div>
    </div>
  )
}
