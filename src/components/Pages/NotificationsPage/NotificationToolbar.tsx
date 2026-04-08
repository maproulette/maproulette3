import { Button } from '@/components/ui/Button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { useNotificationsPageContext } from '@/contexts/NotificationsPageContext'

export const NotificationToolbar = () => {
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
          <TabsTrigger value="unread">Unread ({filteredUnreadCount})</TabsTrigger>
          <TabsTrigger value="all">All ({filteredAllCount})</TabsTrigger>
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
              ? 'Marking...'
              : selectedNotificationIds.size > 0
                ? `Mark ${selectedNotificationIds.size} as unread`
                : 'Mark all as unread'}
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkSelectedAsRead}
            disabled={isMarkingSelected || filteredNotifications.length === 0}
          >
            {isMarkingSelected
              ? 'Marking...'
              : selectedNotificationIds.size > 0
                ? `Mark ${selectedNotificationIds.size} as read`
                : 'Mark all as read'}
          </Button>
        )}
      </div>
    </div>
  )
}
