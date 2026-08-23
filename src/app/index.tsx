import ChatCard from "@/components/ChatCard";
import MainDropdownMenu from "@/components/DropDown";
import { useUser } from "@/context/useUser";
import type { ChatResponse } from "@/types";
import api from "@/utils/api";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function Index() {
  const router = useRouter();
  const { user, loading, logoutUser } = useUser();
  const [chats, setChats] = useState<ChatResponse[]>([]);

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
          headerTitle: "WaveLine",
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
