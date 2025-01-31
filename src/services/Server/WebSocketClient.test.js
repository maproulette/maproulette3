import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import WebSocketClient from "./WebSocketClient";

describe("WebSocketClient", () => {
  let client;
  let mockWebSocket;

  beforeEach(() => {
    // Mock WebSocket implementation
    mockWebSocket = {
      OPEN: 1,
      readyState: 1,
      send: vi.fn(),
      close: vi.fn(),
      onopen: null,
      onmessage: null,
      onclose: null,
    };

    // Clear any previous mocks
    vi.clearAllMocks();

    // Mock the global WebSocket
    global.WebSocket = vi.fn(() => {
      // Set up the mock WebSocket and return it
      setTimeout(() => {
        if (mockWebSocket.onopen) {
          mockWebSocket.onopen();
        }
      }, 0);
      return mockWebSocket;
    });

    // Mock setInterval and setTimeout
    vi.useFakeTimers();
  });

  afterEach(() => {
    if (client) {
      client.cleanup();
    }
    vi.clearAllTimers();
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  describe("connection management", () => {
    it("establishes connection on instantiation", () => {
      // Mock the WebSocket constructor before creating the client
      const wsConstructorSpy = vi.fn(() => mockWebSocket);
      global.WebSocket = wsConstructorSpy;

      client = new WebSocketClient();
      vi.runOnlyPendingTimers();

      expect(wsConstructorSpy).toHaveBeenCalledTimes(1);
    });

    it("attempts reconnection on close", () => {
      // Mock the WebSocket constructor before creating the client
      const firstMockWebSocket = {
        OPEN: 1,
        readyState: 1,
        send: vi.fn(),
        close: vi.fn(),
        onopen: null,
        onmessage: null,
        onclose: null,
      };

      const secondMockWebSocket = {
        OPEN: 1,
        readyState: 1,
        send: vi.fn(),
        close: vi.fn(),
        onopen: null,
        onmessage: null,
        onclose: null,
      };

      const wsConstructorSpy = vi
        .fn()
        .mockReturnValueOnce(firstMockWebSocket)
        .mockReturnValueOnce(secondMockWebSocket);

      global.WebSocket = wsConstructorSpy;

      client = new WebSocketClient();
      vi.runOnlyPendingTimers(); // Run initial connection timer

      // Clear the constructor calls from initial connection
      wsConstructorSpy.mockClear();

      // Store original websocket and trigger close
      const originalWebSocket = client.websocket;
      client.handleClose();

      // Advance time to trigger reconnection
      vi.advanceTimersByTime(1000);
      vi.runOnlyPendingTimers();

      expect(wsConstructorSpy).toHaveBeenCalledTimes(1);
      expect(client.websocket).not.toBe(originalWebSocket);
    });

    it("sends ping messages at regular intervals", () => {
      client = new WebSocketClient();
      vi.runOnlyPendingTimers(); // Run the initial connection timer

      // Advance time to trigger ping
      vi.advanceTimersByTime(45000);
      expect(mockWebSocket.send).toHaveBeenCalledWith(JSON.stringify({ messageType: "ping" }));
    });
  });

  describe("subscription management", () => {
    beforeEach(() => {
      client = new WebSocketClient();
      vi.runOnlyPendingTimers(); // Run the initial connection timer
      client.websocket = mockWebSocket;
    });

    it("adds server subscription", () => {
      const handler = vi.fn();
      client.addServerSubscription("testType", "123", "handler1", handler);

      expect(mockWebSocket.send).toHaveBeenCalledWith(
        JSON.stringify({
          messageType: "subscribe",
          data: { subscriptionName: "testType_123" },
        }),
      );
    });

    it("removes server subscription", () => {
      const handler = vi.fn();
      client.addServerSubscription("testType", "123", "handler1", handler);
      mockWebSocket.send.mockClear();

      client.removeServerSubscription("testType", "123", "handler1");

      expect(mockWebSocket.send).toHaveBeenCalledWith(
        JSON.stringify({
          messageType: "unsubscribe",
          data: { subscriptionName: "testType_123" },
        }),
      );
    });

    it("handles incoming messages for subscriptions", () => {
      const handler = vi.fn();
      client.addServerSubscription("testType", "123", "handler1", handler);

      const message = {
        meta: { subscriptionName: "testType_123" },
        data: { test: "data" },
      };

      client.handleMessage({ data: JSON.stringify(message) });
      expect(handler).toHaveBeenCalledWith(message);
    });
  });

  describe("message handling", () => {
    beforeEach(() => {
      client = new WebSocketClient();
      vi.runOnlyPendingTimers(); // Run the initial connection timer
      client.websocket = mockWebSocket;
    });

    it("queues messages when socket is not ready", () => {
      mockWebSocket.readyState = 0;
      const message = { test: "data" };
      client.sendMessage(message);
      expect(mockWebSocket.send).not.toHaveBeenCalled();
      expect(client.queuedMessages).toHaveLength(1);
    });

    it("sends queued messages when connection opens", () => {
      mockWebSocket.readyState = 0;
      const message = { test: "data" };
      client.sendMessage(message);
      mockWebSocket.readyState = 1;

      client.handleOpen();
      expect(mockWebSocket.send).toHaveBeenCalledWith(JSON.stringify(message));
      expect(client.queuedMessages).toHaveLength(0);
    });

    it("does not queue messages when noQueue is true", () => {
      mockWebSocket.readyState = 0;
      const message = { test: "data" };
      client.sendMessage(message, true);
      expect(client.queuedMessages).toHaveLength(0);
    });
  });

  describe("cleanup", () => {
    beforeEach(() => {
      client = new WebSocketClient();
      vi.runOnlyPendingTimers(); // Run the initial connection timer
      client.websocket = mockWebSocket;
    });

    it("properly cleans up resources", () => {
      client.cleanup();

      expect(mockWebSocket.close).toHaveBeenCalled();
      expect(client.websocket).toBeNull();
      expect(client.pingHandle).toBeNull();
      expect(client.reconnectionHandle).toBeNull();
      expect(client.queuedMessages).toHaveLength(0);
      expect(client.isCleanedUp).toBe(true);
    });

    it("prevents operations after cleanup", () => {
      client.cleanup();
      const message = { test: "data" };
      client.sendMessage(message);

      expect(mockWebSocket.send).not.toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    beforeEach(() => {
      client = new WebSocketClient();
      vi.runOnlyPendingTimers(); // Run the initial connection timer
      client.websocket = mockWebSocket;
    });

    it("handles message handler errors gracefully", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      const handler = () => {
        throw new Error("Test error");
      };

      client.addServerSubscription("testType", "123", "handler1", handler);
      client.handleMessage({
        data: JSON.stringify({
          meta: { subscriptionName: "testType_123" },
          data: {},
        }),
      });

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
