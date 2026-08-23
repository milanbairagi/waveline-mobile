import UserCard from "@/components/UserCard";
import { useUser } from "@/context/useUser";
import type { ChatResponse, UserResponse } from "@/types";
import api from "@/utils/api";
import { AxiosError, AxiosResponse } from "axios";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchedUser, setSearchedUser] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, loading: userLoading } = useUser();
  const router = useRouter();

  const fetchUsers = async () => {
    if (userLoading || !user) {
      return;
    }

    setLoading(true);
    try {
      const response: AxiosResponse<UserResponse[]> = await api.get(
        `/accounts/?search=${searchQuery}`,
      );
      const data = response.data.filter((u) => u.id !== user.id);
      setSearchedUser(data);
    } catch (error) {
      alert("Error fetching users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResultClick = async (userId: number) => {
    try {
      const response: AxiosResponse<ChatResponse> = await api.post("/chats/", {
        participants: userId,
      });

      if (response.status === 201) {
        console.log("Chat created successfully:", response.data);
        router.push(`/chats/${response.data.id}`);
      }
    } catch (error: AxiosError | any) {
      alert(`Error creating chat. Please try again.\n${error.message}`);
    }
  };

  if (userLoading) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerBackVisible: true,
          headerSearchBarOptions: {
            placeholder: "Search...",
            autoFocus: true,
            barTintColor: "#ffffff",
            textColor: "#000000",
            onChangeText: (event) => {
              setSearchQuery(event.nativeEvent.text);
            },
            onSearchButtonPress: () => fetchUsers(),
          },
        }}
      />
      <View style={styles.resultsContainer}>
        {loading ? (
          <Text>Loading...</Text>
        ) : (
          searchedUser.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              handleClick={handleResultClick}
            />
          ))
        )}
        {searchQuery && searchedUser.length === 0 && !loading && (
          <Text>No users found.</Text>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 2,
    backgroundColor: "#fff",
    gap: 4,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 16,
    color: "#000",
  },
  resultsContainer: {
    marginTop: 16,
  },
  userCard: {
    padding: 16,
    backgroundColor: "#f0f0f0",
    marginBottom: 8,
    borderRadius: 8,
  },
  username: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
});
