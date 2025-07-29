export interface WebSocketMessage {
  messageType: string;
  data: any;
}

export interface SubscribeMessage extends WebSocketMessage {
  messageType: "subscribe";
  data: {
    subscriptionName: string;
  };
}

export interface NotificationNewMessage extends WebSocketMessage {
  messageType: "notification-new";
  data: {
    userId: number;
  };
}

export type WebSocketMessageTypes = SubscribeMessage | NotificationNewMessage;
