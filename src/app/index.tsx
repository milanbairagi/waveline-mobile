import ChatCard from "@/components/ChatCard";
import { useUser } from "@/context/useUser";
import type { ChatResponse } from "@/types";
import api from "@/utils/api";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";

export default function Index() {
  const router = useRouter();
  const { user, loading, logoutUser } = useUser();
  const [chats, setChats] = useState<ChatResponse[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) {
      return;
    }
    const fetchChats = async () => {
      try {
        const response = await api<ChatResponse[]>("/chats/");
        if (response.status === 200) {
          setChats(response.data);
        } else {
          console.log("Failed to fetch chats:", response.status);
        }
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    };
    fetchChats().then(() => {
      console.log("Chats fetched successfully");
    });
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
