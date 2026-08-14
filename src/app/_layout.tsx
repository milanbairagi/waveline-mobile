import { Stack } from "expo-router";
import { ChatProvider } from "../context/useChat";
import { UserProvider } from "../context/useUser";

export default function RootLayout() {
  return (
    <UserProvider>
      <ChatProvider>
        <Stack>
          <Stack.Screen name="index" options={{ title: "Home" }} />
          <Stack.Screen name="login" options={{ title: "Login" }} />
          <Stack.Screen name="register" options={{ title: "Register" }} />
          <Stack.Screen name="chats/[id]" />
        </Stack>
      </ChatProvider>
    </UserProvider>
  );
}
