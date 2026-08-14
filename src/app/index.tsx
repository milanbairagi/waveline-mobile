import ChatCard from "@/components/ChatCard";
import { useChat } from "@/context/useChat";
import { useUser } from "@/context/useUser";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Button, StyleSheet, Text, View } from "react-native";

export default function Index() {
  const router = useRouter();
  const { user, loading, logoutUser } = useUser();
  const { chats, setChats } = useChat();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (user) {
      // Simulate fetching chats
      setChats([
        {
          id: 1,
          participants: [user.id, 2],
          participants_detail: [
            { id: 1, username: user.username },
            { id: 2, username: "user2" },
          ],
          last_message: "Hello!",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 2,
          participants: [user.id, 3],
          participants_detail: [
            { id: 1, username: user.username },
            { id: 3, username: "user3" },
          ],
          last_message: "How are you?",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);
    }
  }, [user]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text>Welcome, {user?.username}!</Text>
      <Button title="Logout" onPress={logoutUser} />
      <Text style={styles.h1}>Chats:</Text>
      {chats.map((chat) => (
        <ChatCard key={chat.id} chat={chat} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: "center",
    alignContent: "center",
  },
  h1: {
    fontSize: 24,
    fontWeight: "bold",
  },
});
