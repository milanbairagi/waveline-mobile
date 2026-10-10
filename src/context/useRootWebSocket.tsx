import { createContext, useContext, useEffect, useState } from "react";
import { ACCESS_TOKEN_KEY } from "../constants";
import { useWebSocket } from "../hooks/useWebSocket";
import { getData } from "../utils/aStorage";
import { getSocketBaseURL } from "../utils/getBaseUrl";

const RootWebSocketContext = createContext<
  ReturnType<typeof useWebSocket> & {
    loading: boolean;
  }
>({
  socketURL: null,
  setSocketURL: () => {},
  connect: () => {},
  disconnect: () => {},
  sendMessage: () => {},
  isConnected: false,
  messages: [],
  setMessages: () => {},
  seenMessageIds: [],
  setSeenMessageIds: () => {},
  sendSeenMessageFlag: () => {},
  loading: true,
});

export const RootWebSocketProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const {
    socketURL,
    setSocketURL,
    connect,
    disconnect,
    isConnected,
    sendMessage,
    messages: wsMessage,
    setMessages: wsSetMessages,
    seenMessageIds,
    setSeenMessageIds,
    sendSeenMessageFlag,
  } = useWebSocket();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getSocketBaseURL().then((url) => {
      setSocketURL(`${url}/chats/message/`);
      setLoading(false);
    });
  }, [setSocketURL]);

  useEffect(() => {
    getData(ACCESS_TOKEN_KEY).then((token) => {
      if (token) {
        connect(token as string);
      }
    });

    return () => {
      disconnect();
    };
  }, [connect]);

  return (
    <RootWebSocketContext.Provider
      value={{
        socketURL,
        setSocketURL,
        connect,
        disconnect,
        sendMessage,
        isConnected,
        messages: wsMessage,
        setMessages: wsSetMessages,
        seenMessageIds,
        setSeenMessageIds,
        sendSeenMessageFlag,
        loading,
      }}
    >
      {children}
    </RootWebSocketContext.Provider>
  );
};

export const useRootWebSocket = () => {
  return useContext(RootWebSocketContext);
};
