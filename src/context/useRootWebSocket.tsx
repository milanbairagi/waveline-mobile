import { useUser } from "@/context/useUser";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { ACCESS_TOKEN_KEY } from "../constants";
import { useWebSocket } from "../hooks/useWebSocket";
import { getData } from "../utils/aStorage";
import { getSocketBaseURL } from "../utils/getBaseUrl";

const RootWebSocketContext = createContext<
  ReturnType<typeof useWebSocket> & {
    loading: boolean;
    reinitialize: () => Promise<void>;
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
  socketRef: { current: null },
  loading: true,
  reinitialize: async () => {},
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
    socketRef,
  } = useWebSocket();

  const { user, loading: userLoading } = useUser();

  const [loading, setLoading] = useState(true);
  const disconnectRef = useRef(disconnect);

  useEffect(() => {
    disconnectRef.current = disconnect;
  }, [disconnect]);

  useEffect(() => {
    setLoading(true);

    void getSocketBaseURL()
      .then((url) => {
        setSocketURL(`${url}/chats/message/`);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [setSocketURL]);

  const initializeWebSocket = useCallback(async () => {
    if (isConnected) {
      return;
    }

    const token = await getData(ACCESS_TOKEN_KEY);
    if (!token) {
      return;
    }

    disconnectRef.current();
    connect(token as string);
  }, [connect, isConnected]);

  useEffect(() => {
    if (!socketURL || userLoading || !user || isConnected) {
      return;
    }

    void initializeWebSocket();
  }, [socketURL, user, userLoading, isConnected, initializeWebSocket]);

  useEffect(() => {
    return () => {
      disconnectRef.current();
    };
  }, []);

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
        socketRef,
        loading,
        reinitialize: initializeWebSocket,
      }}
    >
      {children}
    </RootWebSocketContext.Provider>
  );
};

export const useRootWebSocket = () => {
  return useContext(RootWebSocketContext);
};
