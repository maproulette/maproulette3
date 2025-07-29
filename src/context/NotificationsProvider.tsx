import { createContext, useContext, useEffect } from "react";
import type { ReactNode } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { useApiQuery } from "../utils/useApiQuery";
import type { Notification } from "../types";
import { api } from "../utils/api";
import { QUERY_KEYS } from "../utils/queryKeys";
import { useAuth } from "./AuthContext";

interface NotificationsContextType {
  notifications: Notification[];
}

const NotificationsContext = createContext<
  NotificationsContextType | undefined
>(undefined);

const SOCKET_URL =
  import.meta.env.VITE_MAP_ROULETTE_SERVER_WEBSOCKET_URL || null;

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

  const { lastMessage, readyState, sendMessage } = useWebSocket(SOCKET_URL, {
    shouldReconnect: () => true,
  });

  const { data: notifications = [], refetch } = useNotificationsQuery(user?.id);

  useEffect(() => {
    if (readyState === ReadyState.OPEN && user?.id) {
      const subscribeMessage = {
        messageType: "subscribe",
        data: { subscriptionName: `user_${user.id}` },
      };
      sendMessage(JSON.stringify(subscribeMessage));
    }
  }, [readyState, user?.id, sendMessage]);

  useEffect(() => {
    if (lastMessage && lastMessage.data) {
      const messageObject = JSON.parse(lastMessage.data);

      if (
        messageObject.messageType === "notification-new" &&
        messageObject?.data?.userId === user?.id
      ) {
        refetch();
      }
    }
  }, [lastMessage, refetch, user?.id]);

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
