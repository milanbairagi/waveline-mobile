import ChatCard from "@/components/ChatCard";
import MainDropdownMenu from "@/components/DropDown";
import { useRootWebSocket } from "@/context/useRootWebSocket";
import { useUser } from "@/context/useUser";
import type { ChatResponse } from "@/types";
import api from "@/utils/api";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

export default function Index() {
  const router = useRouter();
  const { user, loading, logoutUser } = useUser();
  const [chats, setChats] = useState<ChatResponse[]>([]);
  const {
    isConnected,
    messages: wsMessages,
    setMessages: wsSetMessages,
  } = useRootWebSocket();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  useFocusEffect(
    useCallback(() => {
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
          console.log("Error fetching chats:", error);
          router.replace("/login");
        }
      };
      fetchChats().then(() => {
        console.log("Chats fetched successfully");
      });
    }, [user]),
  );

  // Process incoming WebSocket messages
  useEffect(() => {
    if (!isConnected || wsMessages.length === 0) {
      return;
    }

    wsMessages.forEach((msg) => {
      // Check if the message belongs to a chat that is not in the current list of chats
      if (!chats.some((chat) => chat.id === msg.chat)) {
        // Fetch the chat details and add it to the list of chats
        api<ChatResponse>(`/chats/${msg.chat}/`).then((res) => {
          if (res.status === 200) {
            setChats((prevChats) => [res.data, ...prevChats]);
          }
        });
      }
      // Update last message in the corresponding chat
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === msg.chat ? { ...chat, last_message: msg } : chat,
        ),
      );
    });

    // Clear the WebSocket messages after processing to avoid re-processing
    wsSetMessages([]);
  }, [wsMessages, isConnected, chats, wsSetMessages]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <Image
              source={require("@/assets/images/logowithname.png")}
              style={{ maxWidth: 150, height: 28 }}
            />
          ),
          headerBackVisible: false,
          headerRight: () => (
            <MainDropdownMenu
              trigger={<Text style={{ fontSize: 24 }}>⋮</Text>}
              items={[
                { label: "Logout", onPress: logoutUser },
                {
                  label: "Settings",
                  onPress: () => {
                    router.push("/settings");
                  },
                },
              ]}
            />
          ),
        }}
      />

      <View style={styles.container}>
        <DummySearchBar handleClick={() => router.push("/chats/search")} />
        {chats.map((chat) => (
          <ChatCard key={chat.id} chat={chat} />
        ))}
      </View>
    </>
  );
}

function DummySearchBar({ handleClick }: { handleClick: () => void }) {
  return (
    <Pressable onPress={handleClick}>
      <View style={styles.searchContainer}>
        <Text style={styles.searchText}>Search</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: "center",
    alignContent: "center",
  },

  searchContainer: {
    padding: 10,
    backgroundColor: "#e1e1e1",
    borderRadius: 8,
    margin: 10,
  },
  searchText: {
    color: "#888",
    fontSize: 16,
  },
});
