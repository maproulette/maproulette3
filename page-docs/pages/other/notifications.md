# Notifications (`/notifications`)

**Source**: `src/components/NotificationsPage/`

A page for viewing and managing notifications with Unread and All tabs. Notifications can be filtered by task, type, sender, and challenge. Supports bulk selection with mark-as-read/unread and delete actions.

A "Group by Task" toggle collapses related notifications into threads — clicking a thread opens a modal with all its notifications. Supports deep linking via `?notificationId=` to scroll to and highlight a specific notification.
