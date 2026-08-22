import ChatMessage from "@/components/ChatMessage";
import MessageInput from "@/components/MessageInput";
import { ACCESS_TOKEN, SOCKET_URL } from "@/constants";
import { useUser } from "@/context/useUser";
import { useWebSocket } from "@/hooks/useWebSocket";
import { ChatResponse, Message } from "@/types";
import api from "@/utils/api";
import { getData } from "@/utils/aStorage";
import { AxiosResponse } from "axios";
import {
  Stack,
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  type ListRenderItem,
} from "react-native";

type Pagination = {
  next: string | null;
  previous: string | null;
};

type MessagesResponse = {
  results: Message[];
  next: string | null;
  previous: string | null;
};

export default function Messages() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, loading } = useUser();
  const router = useRouter();
  const listRef = useRef<FlatList<Message> | null>(null);
  const shouldScrollToBottomRef = useRef(false);
  const isTopVisibleRef = useRef(false);
  const loadingMoreRef = useRef(false);
  const [title, setTitle] = useState<string | null>(null);
  const [chat, setChat] = useState<ChatResponse | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    next: null,
    previous: null,
  });

  const {
    connect,
    disconnect,
    isConnected,
    sendMessage,
    messages: wsMessage,
    setMessages: wsSetMessages,
    seenMessageIds,
    setSeenMessageIds,
    sendSeenMessageFlag,
  } = useWebSocket(`${SOCKET_URL}/chats/message/`);

  const getChatById = useCallback(
    async (id: number) => {
      try {
        const response = await api<ChatResponse>(`/chats/${id}/`);
        if (response.status !== 200) {
          return null;
        }
        return response.data;
      } catch (error) {
        return null;
      }
    },
    [id],
  );

  const fetchMessages = useCallback(async () => {
    if (!id || isNaN(Number(id))) {
      return;
    }

    try {
      const response: AxiosResponse<MessagesResponse> = await api(
        `/chats/${id}/messages/`,
      );
      if (response.status === 200) {
        setPagination({
          next: response.data.next,
          previous: response.data.previous,
        });
        setMessages(response.data.results as Message[]);
        shouldScrollToBottomRef.current = true;
      } else {
        console.log("Failed to fetch messages:", response.status);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const prepareChat = async () => {
        if (loading) {
          return;
        }

        if (!user) {
          router.replace("/login");
          return;
        }

        if (!id || isNaN(Number(id))) {
          setTitle(null);
          return;
        }

        const chatRes = await getChatById(Number(id));
        if (!chatRes || !isActive) {
          if (!chatRes) {
            router.replace("/");
          }
          return;
        }
        setChat(chatRes);

        await fetchMessages();

        const token = await getData(ACCESS_TOKEN);
        if (token && isActive) {
          connect(token as string);
        }
      };

      prepareChat();

      return () => {
        isActive = false;
        disconnect();
      };
    }, [
      loading,
      user,
      router,
      id,
      getChatById,
      fetchMessages,
      connect,
      disconnect,
    ]),
  );

  // Update the title when the chat data changes
  useEffect(() => {
    if (chat && user) {
      const otherParticipant =
        chat.participants_detail[0].id === user.id
          ? chat.participants_detail[1]
          : chat.participants_detail[0];

      setTitle(otherParticipant.username);
    }
  }, [chat, user]);

  // Process incoming WebSocket messages
  useEffect(() => {
    if (wsMessage.length === 0) {
      return;
    }

    const seenIds = new Set(messages.map((msg) => msg.id));
    const newMessages = wsMessage.filter((msg) => !seenIds.has(msg.id));

    if (newMessages.length > 0) {
      setMessages((prev) => [...prev, ...newMessages]);
    }

    wsSetMessages([]); // Clear wsMessage after processing
  }, [wsMessage, wsSetMessages, messages]);

  // Update message status to "seen" when the user views them
  useEffect(() => {
    if (!user || messages.length === 0) {
      return;
    }

    const unseenMessages = messages
      .filter((msg) => msg.sender !== user.id && msg.status !== "seen")
      .map((msg) => msg.id);

    if (unseenMessages.length > 0) {
      sendSeenMessageFlag(Number(id), unseenMessages);
    }
  }, [messages, user, id, sendSeenMessageFlag]);

  // Update seen messages when other participant reads them
  useEffect(() => {
    if (seenMessageIds.length === 0) {
      return;
    }

    const ids = new Set(seenMessageIds);
    setMessages((prev) =>
      prev.map((msg) => (ids.has(msg.id) ? { ...msg, status: "seen" } : msg)),
    );
    setSeenMessageIds([]); // Clear seenMessageIds after processing
  }, [seenMessageIds, setSeenMessageIds]);

  const handleSendMessage = async (content: string) => {
    console.log("Sending message:", content);
    if (content.trim() && isConnected && id) {
      sendMessage(Number(id), content);
    }
  };

  const handleLoadMore = useCallback(async () => {
    if (!pagination.next || loadingMoreRef.current) return;

    loadingMoreRef.current = true;

    try {
      const response: AxiosResponse<MessagesResponse> = await api(
        pagination.next,
      );
      if (response.status === 200) {
        setPagination({
          next: response.data.next,
          previous: response.data.previous,
        });
        setMessages((prev) => [...response.data.results, ...prev]);
      }
    } catch (error) {
      console.error("Error fetching more messages:", error);
    } finally {
      loadingMoreRef.current = false;
    }
  }, [pagination.next]);

  const renderMessage = useCallback<ListRenderItem<Message>>(
    ({ item }) => <ChatMessage message={item} user={user} />,
    [user],
  );

  const keyExtractor = useCallback((item: Message) => String(item.id), []);

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 100,
  }).current;

  const handleViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: Array<{ index: number | null }> }) => {
      const topItemVisible = viewableItems.some((item) => item.index === 0);

      if (!topItemVisible) {
        isTopVisibleRef.current = false;
        return;
      }

      if (isTopVisibleRef.current) {
        return;
      }

      isTopVisibleRef.current = true;

      if (pagination.next) {
        void handleLoadMore();
      }
    },
    [handleLoadMore, pagination.next],
  );

  const handleContentSizeChange = useCallback(() => {
    if (!shouldScrollToBottomRef.current) {
      return;
    }

    shouldScrollToBottomRef.current = false;
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: false });
    });
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: title ?? `Chat ${id}` }} />
      <FlatList
        ref={listRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={keyExtractor}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        onContentSizeChange={handleContentSizeChange}
        maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={handleViewableItemsChanged}
        ItemSeparatorComponent={() => <View style={styles.messageSeparator} />}
      />
      <MessageInput handleSendMessage={handleSendMessage} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 12,
  },

  messageSeparator: {
    height: 12,
  },
});
