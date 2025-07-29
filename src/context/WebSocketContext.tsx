import { createContext, useContext, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import useWebSocketHook, { ReadyState } from "react-use-websocket";
import { useAuth } from "./AuthContext";
import type { WebSocketMessage } from "../types";

interface WebSocketContextType {
  lastMessage: WebSocketMessage | null;
  readyState: ReadyState;
  sendMessage: (message: string) => void;
  subscribe: (subscriptionName: string) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined
);

const SOCKET_URL =
  import.meta.env.VITE_MAP_ROULETTE_SERVER_WEBSOCKET_URL || null;

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();

  const { lastMessage, readyState, sendMessage } = useWebSocketHook(
    SOCKET_URL,
    {
      shouldReconnect: () => true,
    }
  );

  const subscribe = useCallback(
    (subscriptionName: string) => {
      if (readyState === ReadyState.OPEN) {
        const subscribeMessage = {
          messageType: "subscribe",
          data: { subscriptionName },
        };
        sendMessage(JSON.stringify(subscribeMessage));
      }
    },
    [readyState, sendMessage]
  );

  useEffect(() => {
    if (readyState === ReadyState.OPEN && user?.id) {
      subscribe(`user_${user.id}`);
    }
  }, [readyState, user?.id, subscribe]);

  const messageObject =
    lastMessage && lastMessage.data ? JSON.parse(lastMessage.data) : null;

  return (
    <WebSocketContext.Provider
      value={{ lastMessage: messageObject, readyState, sendMessage, subscribe }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error(
      "useWebSocketContext must be used within a WebSocketProvider"
    );
  }
  return context;
};
