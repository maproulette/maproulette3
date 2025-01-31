import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import WebSocketClient from "./WebSocketClient";

describe("WebSocketClient", () => {
  let client;
  let mockWebSocket;

  beforeEach(() => {
    mockWebSocket = {
      OPEN: 1,
      readyState: 1,
      send: vi.fn(),
      close: vi.fn(),
      onopen: null,
      onmessage: null,
      onclose: null,
    };

    vi.clearAllMocks();
    vi.useFakeTimers();

    // Setup WebSocket mock
    global.WebSocket = vi.fn(() => {
      setTimeout(() => mockWebSocket.onopen?.(), 0);
      return mockWebSocket;
    });

    // Create and initialize client
    client = new WebSocketClient();
    vi.runOnlyPendingTimers();
  });

  afterEach(() => {
    client?.cleanup();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe("basic functionality", () => {
    it("establishes connection and sends pings", () => {
      expect(global.WebSocket).toHaveBeenCalled();

      vi.advanceTimersByTime(45000);
      expect(mockWebSocket.send).toHaveBeenCalledWith(JSON.stringify({ messageType: "ping" }));
    });

    it("handles reconnection", () => {
      const newMockWebSocket = { ...mockWebSocket };
      global.WebSocket.mockReturnValueOnce(newMockWebSocket);

      client.handleClose();
      vi.advanceTimersByTime(1000);

      expect(client.websocket).toBe(newMockWebSocket);
    });
  });

  describe("subscriptions and messages", () => {
    it("manages subscriptions", () => {
      const handler = vi.fn();
      const subscriptionName = "testType_123";

      // Add subscription
      client.addServerSubscription("testType", "123", "handler1", handler);
      expect(mockWebSocket.send).toHaveBeenCalledWith(
        JSON.stringify({
          messageType: "subscribe",
          data: { subscriptionName },
        }),
      );

      // Handle message
      const message = {
        meta: { subscriptionName },
        data: { test: "data" },
      };
      client.handleMessage({ data: JSON.stringify(message) });
      expect(handler).toHaveBeenCalledWith(message);

      // Remove subscription
      mockWebSocket.send.mockClear();
      client.removeServerSubscription("testType", "123", "handler1");
      expect(mockWebSocket.send).toHaveBeenCalledWith(
        JSON.stringify({
          messageType: "unsubscribe",
          data: { subscriptionName },
        }),
      );
    });

    it("handles message queueing", () => {
      mockWebSocket.readyState = 0;
      const message = { test: "data" };

      // Queue message
      client.sendMessage(message);
      expect(client.queuedMessages).toHaveLength(1);

      // Send queued messages on open
      mockWebSocket.readyState = 1;
      client.handleOpen();
      expect(mockWebSocket.send).toHaveBeenCalledWith(JSON.stringify(message));
      expect(client.queuedMessages).toHaveLength(0);

      // No queue option
      client.sendMessage(message, true);
      expect(client.queuedMessages).toHaveLength(0);
    });
  });

  describe("cleanup and error handling", () => {
    it("cleans up resources and prevents further operations", () => {
      client.cleanup();
      expect(mockWebSocket.close).toHaveBeenCalled();
      expect(client.websocket).toBeNull();

      client.sendMessage({ test: "data" });
      expect(mockWebSocket.send).not.toHaveBeenCalled();
    });

    it("handles errors gracefully", () => {
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
