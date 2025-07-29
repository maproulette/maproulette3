import { createContext, useContext, useEffect } from "react";
import type { ReactNode } from "react";
import type { Notification } from "../types";
import { api, useApiQuery, QUERY_KEYS } from "../utils";
import { useAuth } from "./AuthContext";
import { useWebSocketContext } from "./WebSocketContext";

interface NotificationsContextType {
  notifications: Notification[];
}

const NotificationsContext = createContext<
  NotificationsContextType | undefined
>(undefined);

export const useNotificationsQuery = (userId?: number) => {
  return useApiQuery({
    queryKey: QUERY_KEYS.notifications.all,
    queryFn: async (): Promise<Notification[]> => {
      const response = await api.user.notifications(userId!);
      return response.data;
    },
    enabled: !!userId,
  });
};

export const NotificationsProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { user } = useAuth();
  const { lastMessage } = useWebSocketContext();
  const { data: notifications = [], refetch } = useNotificationsQuery(user?.id);

  useEffect(() => {
    if (lastMessage?.messageType === "notification-new") {
      refetch();
    }
  }, [lastMessage]);

  return (
    <NotificationsContext.Provider value={{ notifications }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationsProvider"
    );
  }
  return context;
};
