import { Text, View, StyleSheet } from "react-native";
import { Link } from "expo-router";

export default function Index() {
  return (
    <View style={styles.container}>
      <Text>Index Page</Text>
      <Link href="/login" style={{ marginTop: 20 }}>
        Go to Login
      </Link>
      <Link href="/register" style={{ marginTop: 20 }}>
        Go to Register
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
