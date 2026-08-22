import { useCallback, useEffect, useRef, useState } from "react";

import type { Message } from "../types";

type IncomingSocketEvent =
  | {
      type: "chat_message";
      message: Message;
    }
  | {
      type: "message_seen";
      message_ids: number[];
      user_id: number;
    }
  | {
      type: "error";
      detail: string;
    }
  | {
      type: "auth";
      token: string;
    }
  | {
      type: "authenticated";
    };

type WebSocketMessageSender = (
  chatId: number | string,
  content: string,
) => void;

type WebSocketSeenSender = (
  chatId: number | string,
  messageIds: number[],
) => void;

export const useWebSocket = (url: string) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [seenMessageIds, setSeenMessageIds] = useState<number[]>([]);
  const socketRef = useRef<WebSocket | null>(null);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const connect = useCallback(
    (token: string) => {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.close();
      }

      const ws = new WebSocket(url);
      socketRef.current = ws;

      ws.onopen = () => {
        // console.log("WebSocket connection established");
        setIsConnected(true);
        socketRef.current = ws;

        if (token) {
          ws.send(
            JSON.stringify({
              type: "auth",
              token: token,
            }),
          );
        }
      };

      ws.onmessage = (event: MessageEvent<string>) => {
        const data = JSON.parse(event.data) as IncomingSocketEvent;

        if (data.type == "chat_message") {
          setMessages((prev) => [...prev, data.message]);
        } else if (data.type === "message_seen") {
          const { message_ids } = data;
          setSeenMessageIds((prev) => [...prev, ...message_ids]);
        } else if (data.type === "error") {
          disconnect();
        } else if (data.type === "authenticated") {
          // console.log("User authenticated successfully");
        }
      };

      ws.onclose = () => {
        // console.log("WebSocket connection closed");
        setIsConnected(false);
        socketRef.current = null;
      };

      ws.onerror = (error: Event) => {
        console.error("WebSocket error:", error);
        setIsConnected(false);
        socketRef.current = null;
      };

      return ws;
    },
    [url, disconnect],
  );

  const sendMessage = useCallback<WebSocketMessageSender>((chatId, content) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: "chat_message",
          chat_id: chatId,
          content: content,
        }),
      );
    }
  }, []);

  const sendSeenMessageFlag = useCallback<WebSocketSeenSender>(
    (chatId, messageIds) => {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(
          JSON.stringify({
            type: "messages_seen",
            chat_id: chatId,
            message_ids: messageIds,
          }),
        );
      }
    },
    [],
  );

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    connect,
    disconnect,
    sendMessage,
    isConnected,
    messages,
    setMessages,
    seenMessageIds,
    setSeenMessageIds,
    sendSeenMessageFlag,
  };
};
