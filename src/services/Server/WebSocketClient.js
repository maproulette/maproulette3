import _get from 'lodash/get'

/**
 * Client for websocket messages to/from the server, which handles automatic
 * reconnection (with retransmission of server subscription messages)
 *
 * To receive messages, a service should register a message handler with this
 * client for the type of message it wishes to process
 *
 * The sendMessage function can be used to send messages to the server. If
 * messages are sent while the socket is not open, they will be queued and
 * transmitted when the the socket does open
 *
 * Services should use the addServerSubscription and removeServerSubscription
 * functions to handle subscribe/unsubscribe messages instead of sending them
 * directly. This allows the client to automatically refresh active
 * subscriptions in the event of a disconnect/reconnect.
 */
export default class WebSocketClient {
  constructor() {
    this.websocket = null
    this.reconnectionAttempts = 0
    this.reconnectionHandle = null
    this.pingHandle = null
    this.subscriptionHandlers = new Map()
    this.serverSubscriptions = new Map()
    this.queuedMessages = []

    this.connect()
  }

  /**
   * Add a subscription to server events identified by the given subscription type
   * and optional objectId
   */
  addServerSubscription(subscriptionType, objectId, handlerId, handler) {
    const subscriptionName = this.canonicalSubscriptionName(subscriptionType, objectId)
    const subscribeMessage = {
      messageType: "subscribe",
      data: { subscriptionName }
    }

    this.serverSubscriptions.set(subscriptionName, subscribeMessage)
    this.addSubscriptionHandler(subscriptionName, handlerId, handler)
    this.sendMessage(subscribeMessage)
  }

  /**
   * Remove a previously-added subscription identified by the given
   * subscription type and optional objectId
   */
  removeServerSubscription(subscriptionType, objectId, handlerId) {
    const subscriptionName = this.canonicalSubscriptionName(subscriptionType, objectId)
    const unsubscribeMessage = {
      messageType: "unsubscribe",
      data: { subscriptionName }
    }

    this.serverSubscriptions.delete(subscriptionName)
    this.removeSubscriptionHandler(subscriptionName, handlerId)
    this.sendMessage(unsubscribeMessage)
  }

  /**
   * Transmit the given message object over the websocket connection to the
   * server. If the websocket is still in the process of connecting, the message
   * will be queued and transmitted once the connection is complete unless noQueue
   * is set to true, in which case the message is discarded if it cannot be
   * immediately transmitted
   */
  sendMessage(messageObject, noQueue=false) {
    const jsonMessage = JSON.stringify(messageObject)

    if (this.websocket && this.websocket.readyState === this.websocket.OPEN) {
      this.websocket.send(jsonMessage)
    }
    else if (!noQueue) {
      this.queuedMessages.push(jsonMessage)
    }
  }

  /**
   * Connect this websocket to the server. This is invoked automatically when
   * the client is constructed, and is also invoked upon disconnection. It
   * makes use of exponential backoff to avoid flooding the server with the
   * connection attempts in the event of a problem
   *
   * @private
   */
  connect() {
    if (!this.reconnectionHandle) {
      // Use exponential backoff
      this.reconnectionAttempts++
      const delay = 1000 // milliseconds
      const backoffTime = Math.floor(Math.random() * Math.pow(2, this.reconnectionAttempts) * delay)

      this.reconnectionHandle = setTimeout(() => this.open(), backoffTime)
    }
  }

  /**
   * Instantiates (or reinstantiates) the underlying websocket and sets up the
   * appropriate event handlers
   *
   * @private
   */
  open() {
    this.reconnectionHandle = null
    if (this.websocket) {
      this.websocket.close()
    }

    this.websocket = new WebSocket(process.env.REACT_APP_MAP_ROULETTE_SERVER_WEBSOCKET_URL)
    this.websocket.onopen = e => this.handleOpen(e)
    this.websocket.onmessage = e => this.handleMessage(e)
    this.websocket.onclose = e => this.handleClose(e)

    if (!this.pingHandle) {
      // Ping the server every 45 seconds to avoid an idle timeout
      this.pingHandle = setInterval(() => this.sendPing(), 45000)
    }
  }

  /**
   * Handles websocket open events, retransmitting subscribe messages for any
   * active subscriptions, followed by transmission of any messages pending in
   * the message queue
   *
   * @private
   */
  handleOpen() {
    this.reconnectionAttempts = 0

    // Reactivate any active subscriptions
    for (let subscriptionMessage of this.serverSubscriptions.values()) {
      this.sendMessage(subscriptionMessage)
    }

    // Transmit any queued messages
    this.queuedMessages.forEach(message => this.websocket.send(message))
    this.queuedMessages = []
  }

  /**
   * Handles websocket message events, parsing the JSON and passing the message
   * objects on to the appropriate registered message handlers
   *
   * @private
   */
  handleMessage(messageEvent) {
    const messageObject = JSON.parse(messageEvent.data)
    const subscriptionName = _get(messageObject, 'meta.subscriptionName')

    if (subscriptionName && this.subscriptionHandlers.has(subscriptionName)) {
      for (let handler of this.subscriptionHandlers.get(subscriptionName).values()) {
        try {
          handler(messageObject)
        }
        catch(error) {
          console.log(error)
        }
      }
    }
  }

  sendPing() {
    const pingMessage = {
      messageType: "ping",
    }

    this.sendMessage(pingMessage, true)
  }

  /**
   * Handles websocket close events, attempting to reconnect
   *
   * @private
   */
  handleClose(closeEvent) {
    this.connect()
  }

  /**
   * Register a handler function, identified by the given handlerId, for the
   * given websocket subscription name. Whenever a message from that
   * subscription is received from the server, the handler will be invoked
   * with the message object
   *
   * @private
   */
  addSubscriptionHandler(subscriptionName, handlerId, handler) {
    if (!this.subscriptionHandlers.has(subscriptionName)) {
      this.subscriptionHandlers.set(subscriptionName, new Map())
    }

    this.subscriptionHandlers.get(subscriptionName).set(handlerId, handler)
  }

  /**
   * Remove the websocket subscription handler function identified by the
   * given handlerId for the given subscription name
   *
   * @private
   */
  removeSubscriptionHandler(subscriptionName, handlerId) {
    if (this.subscriptionHandlers.has(subscriptionName)) {
      this.subscriptionHandlers.get(subscriptionName).delete(handlerId)
    }
  }

  /**
   * Returns the canonical subscription name for the given subscription type
   * and optional objectId, useful for adding/removing subscription handlers
   *
   * @private
   */
  canonicalSubscriptionName(subscriptionType, objectId) {
    return subscriptionType.toString() + (objectId ? `_${objectId}` : '')
  }
}
