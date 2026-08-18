import { useUser } from "@/context/useUser";
import type { ChatResponse } from "@/types";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";

export default function ChatCard({ chat }: { chat: ChatResponse }) {
  const { user } = useUser();
  const router = useRouter();

  const handlePress = () => {
    router.push(`/chats/${chat.id}`);
  };

  if (!user) {
    return null;
  }

  const otherParticipant =
    chat.participants_detail[0].id === user.id
      ? chat.participants_detail[1]
      : chat.participants_detail[0];

  return (
    <Pressable style={styles.container} onPress={handlePress}>
      <Text style={styles.username}>{otherParticipant.username}</Text>
      <Text style={styles.lastMessage}>{chat.last_message}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  username: {
    fontWeight: "bold",
  },
  lastMessage: {
    color: "#666",
  },
});
