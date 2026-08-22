import { useUser } from "@/context/useUser";
import { router } from "expo-router";
import { useEffect } from "react";
import { Button, StyleSheet, Text, View } from "react-native";

export default function Settings() {
  const { user, loading, logoutUser } = useUser();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user]);

  if (loading) {
    return (
      <View>
        <Text>Loading..</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Welcome, {user?.username}!</Text>
      <Button title="Logout" onPress={logoutUser} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  container: {
    flex: 1,
    padding: 16,
  },
});
