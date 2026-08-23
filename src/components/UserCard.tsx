import type { UserResponse } from "@/types";
import { Pressable, StyleSheet, Text } from "react-native";

export default function UserCard({
  user: userProp,
  handleClick,
}: {
  user: UserResponse;
  handleClick: (userId: number) => void;
}) {
  const handlePress = () => {
    handleClick(userProp.id);
  };

  return (
    <Pressable style={styles.container} onPress={handlePress}>
      <Text style={styles.username}>{userProp.username}</Text>
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
