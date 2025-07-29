export interface Notification {
  id: number;
  userId: number;
  notificationType: number;
  created: string;
  modified: string;
  description: string;
  fromUsername: string;
  challengeName: string;
  isRead: boolean;
  emailStatus: number;
  taskId: number;
  challengeId: number;
  errorTags: string;
}
