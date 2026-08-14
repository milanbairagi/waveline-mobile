import { useChat } from "@/context/useChat";
import { useUser } from "@/context/useUser";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function ChatMessage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, loading } = useUser();
  const { getChatById } = useChat();
  const router = useRouter();
  const [title, setTitle] = useState<string | null>(null);

  useEffect(() => {
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
    const chat = getChatById(Number(id));
    if (!chat) {
      router.replace("/");
      return;
    }

    const otherParticipant =
      chat.participants_detail[0].id === user.id
        ? chat.participants_detail[1]
        : chat.participants_detail[0];

    setTitle(otherParticipant.username);
  }, [loading, user, getChatById, id]);

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
      <Text>Chat Message with id: {id}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
});
