type WebSocketMessage = {
  messageType: string
  data: unknown
}

type SubscribeMessage = WebSocketMessage & {
  messageType: 'subscribe'
  data: {
    subscriptionName: string
  }
}

type NotificationNewMessage = WebSocketMessage & {
  messageType: 'notification-new'
  data: {
    userId: number
  }
}

export type WebSocketMessageTypes = SubscribeMessage | NotificationNewMessage
