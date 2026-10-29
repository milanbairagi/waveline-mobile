import ChatCard from "@/components/ChatCard";
import MainDropdownMenu from "@/components/DropDown";
import { useRootWebSocket } from "@/context/useRootWebSocket";
import { useUser } from "@/context/useUser";
import type { ChatResponse } from "@/types";
import api from "@/utils/api";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

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
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          // headerTitle: () => (
          //   <Image
          //     source={require("@/assets/images/logowithname.png")}
          //     style={{ maxWidth: 150, height: 28 }}
          //   />
          // ),
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
        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {chats.length > 0 ? (
            chats.map((chat) => <ChatCard key={chat.id} chat={chat} />)
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Text style={styles.emptyIconText}>◌</Text>
              </View>
              <Text style={styles.emptyTitle}>No conversations yet</Text>
              <Text style={styles.emptyText}>
                Start your first conversation to see it here.
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </>
  );
}

function DummySearchBar({ handleClick }: { handleClick: () => void }) {
  return (
    <Pressable onPress={handleClick}>
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>⌕</Text>
        <Text style={styles.searchText}>Search conversations...</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  listHeader: {
    alignItems: "center",
    backgroundColor: "#EAF2FF",
    borderBottomColor: "#D7E5FA",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  heading: {
    color: "#1F2937",
    fontSize: 18,
    fontWeight: "700",
  },
  countBadge: {
    alignItems: "center",
    backgroundColor: "#DBEAFE",
    borderRadius: 12,
    minWidth: 28,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  countText: {
    color: "#1D4ED8",
    fontSize: 12,
    fontWeight: "700",
  },
  searchContainer: {
    alignItems: "center",
    backgroundColor: "#F4F5F7",
    borderColor: "#D9DEE6",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    margin: 14,
    minHeight: 46,
    paddingHorizontal: 14,
  },
  searchIcon: {
    color: "#7A8495",
    fontSize: 24,
    marginRight: 8,
  },
  searchText: {
    color: "#9AA4B2",
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 14,
    paddingBottom: 24,
  },
  emptyState: {
    alignItems: "center",
    paddingHorizontal: 28,
    paddingTop: 64,
  },
  emptyIcon: {
    alignItems: "center",
    backgroundColor: "#DBEAFE",
    borderRadius: 36,
    height: 72,
    justifyContent: "center",
    marginBottom: 16,
    width: 72,
  },
  emptyIconText: {
    color: "#2563EB",
    fontSize: 40,
  },
  emptyTitle: {
    color: "#1F2937",
    fontSize: 18,
    fontWeight: "700",
  },
  emptyText: {
    color: "#7A8495",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
});

const colors = {
  primary: "#3B82F6",
};
