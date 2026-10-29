import { useUser } from "@/context/useUser";
import type { ChatResponse } from "@/types";
import getOtherParticipant from "@/utils/chatParticipant";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function ChatCard({ chat }: { chat: ChatResponse }) {
  const { user } = useUser();
  const router = useRouter();

  const handlePress = () => {
    router.push(`/chats/${chat.id}`);
  };

  if (!user) {
    return null;
  }

  const otherParticipant = getOtherParticipant(chat, user.id);
  const username = otherParticipant?.username ?? "Loading...";
  const initial = username.charAt(0).toUpperCase();
  const isLastMessageSeen =
    !chat.last_message ||
    chat.last_message.sender === user.id ||
    chat.last_message.status === "seen";

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={handlePress}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initial}</Text>
      </View>
      <View style={styles.details}>
        <Text numberOfLines={1} style={styles.username}>
          {username}
        </Text>
        <Text
          numberOfLines={1}
          style={[styles.lastMessage, !isLastMessageSeen && styles.unreadMessage]}
        >
          {chat.last_message?.content ?? "No messages yet. Say hi!"}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: "#F8F9FB",
    borderColor: "#D1D5DB",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: 10,
    minHeight: 76,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  pressed: {
    backgroundColor: "#EEF4FF",
    borderColor: "#93C5FD",
  },
  avatar: {
    alignItems: "center",
    backgroundColor: "#3B82F6",
    borderRadius: 24,
    height: 48,
    justifyContent: "center",
    marginRight: 14,
    width: 48,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  details: {
    flex: 1,
  },
  username: {
    color: "#1F2937",
    fontSize: 16,
    fontWeight: "bold",
  },
  lastMessage: {
    color: "#7A8495",
    fontSize: 13,
    marginTop: 6,
  },
  unreadMessage: {
    color: "#2563EB",
    fontWeight: "600",
  },
});
