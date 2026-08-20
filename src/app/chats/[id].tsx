import ChatMessage from "@/components/ChatMessage";
import { useUser } from "@/context/useUser";
import { ChatResponse, Message } from "@/types";
import api from "@/utils/api";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function Messages() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, loading } = useUser();
  const router = useRouter();
  const [title, setTitle] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

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
      const response = await api(`/chats/${id}/messages/`);
      if (response.status === 200) {
        setMessages(response.data.results as Message[]);
      } else {
        console.log("Failed to fetch messages:", response.status);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }, [id]);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }

    if (!id || isNaN(Number(id))) {
      setTitle(null);
      return;
    }

    getChatById(Number(id)).then((chat) => {
      if (!chat) {
        router.replace("/");
        return;
      }

      const otherParticipant =
        chat.participants_detail[0].id === user.id
          ? chat.participants_detail[1]
          : chat.participants_detail[0];

      setTitle(otherParticipant.username);
    });
  }, [loading, user, getChatById, id]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

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
      <ScrollView>
        {messages.map((message) => (
          <View key={message.id}>
            <ChatMessage message={message} user={user} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: "100%",
  },
});
