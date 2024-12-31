import _each from "lodash/each";
import _find from "lodash/find";
import _groupBy from "lodash/groupBy";
import _isArray from "lodash/isArray";
import _map from "lodash/map";
import { useCallback, useMemo, useState } from "react";

export const useNotificationSelection = (notifications) => {
  notifications.forEach((notification) => {
    if (!notification.taskId && notification.challengeId) {
      notification.taskId = notification.challengeName;
    }
  });

  const [groupByTask, setGroupByTask] = useState(true);
  const [selectedNotifications, setSelectedNotifications] = useState(new Set());

  const selectAll = useCallback(
    () => setSelectedNotifications(new Set(_map(notifications, "id"))),
    [setSelectedNotifications, notifications],
  );

  const deselectAll = useCallback(
    () => setSelectedNotifications(new Set()),
    [setSelectedNotifications],
  );

  const allNotificationsSelected = useMemo(
    () => selectedNotifications.size > 0 && selectedNotifications.size === notifications.length,
    [selectedNotifications, notifications],
  );

  const allNotificationsInThreadSelected = useCallback(
    (thread) => !_find(thread, (notification) => !selectedNotifications.has(notification.id)),
    [selectedNotifications],
  );

  const toggleNotificationSelection = useCallback(
    (notification, thread) => {
      const targetNotifications = _isArray(thread) ? thread : [notification];
      const updatedSelections = new Set(selectedNotifications);
      if (allNotificationsInThreadSelected(targetNotifications)) {
        _each(targetNotifications, (target) => updatedSelections.delete(target.id));
      } else {
        _each(targetNotifications, (target) => updatedSelections.add(target.id));
      }

      setSelectedNotifications(updatedSelections);
    },
    [selectedNotifications, allNotificationsInThreadSelected],
  );

  const toggleNotificationsSelected = useCallback(
    () => (allNotificationsSelected ? deselectAll() : selectAll()),
    [allNotificationsSelected, selectAll, deselectAll],
  );

  const anyNotificationInThreadSelected = useCallback(
    (thread) => !!_find(thread, (notification) => selectedNotifications.has(notification.id)),
    [selectedNotifications],
  );

  const toggleGroupByTask = useCallback(() => setGroupByTask((groupByTask) => !groupByTask), []);

  const threads = useMemo(
    () => (groupByTask ? _groupBy(notifications, "taskId") : {}),
    [groupByTask, notifications],
  );

  return {
    groupByTask,
    selectedNotifications,
    selectAll,
    deselectAll,
    allNotificationsSelected,
    allNotificationsInThreadSelected,
    toggleNotificationSelection,
    toggleNotificationsSelected,
    anyNotificationInThreadSelected,
    toggleGroupByTask,
    threads,
  };
};

export const useNotificationDisplay = () => {
  const [openNotification, setOpenNotification] = useState(null);

  const displayNotification = useCallback(
    (notification) => setOpenNotification(notification),
    [setOpenNotification],
  );

  const closeNotification = useCallback(
    (notification) => {
      if (notification === openNotification) {
        setOpenNotification(null);
      }
    },
    [openNotification, setOpenNotification],
  );

  return {
    openNotification,
    displayNotification,
    closeNotification,
  };
};
