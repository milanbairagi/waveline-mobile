import { Stack } from "expo-router";
import { UserProvider } from "../context/useUser";

export default function RootLayout() {
  return (
    <UserProvider>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            headerTitle: "WaveLine",
            headerBackVisible: false,
          }}
        />
        <Stack.Screen
          name="login"
          options={{ title: "Login", headerBackVisible: false }}
        />
        <Stack.Screen
          name="register"
          options={{ title: "Register", headerBackVisible: false }}
        />
        <Stack.Screen name="chats/[id]" />
        <Stack.Screen name="chats/search" />
        <Stack.Screen name="userMedia/[id]" />
        <Stack.Screen name="settings" options={{ title: "Settings" }} />
      </Stack>
    </UserProvider>
  );
}
