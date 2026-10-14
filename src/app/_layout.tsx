import { Stack } from "expo-router";
import { CallProvider } from "../context/useCallContext";
import { RootWebSocketProvider } from "../context/useRootWebSocket";
import { UserProvider } from "../context/useUser";

export default function RootLayout() {
  return (
    <UserProvider>
      <RootWebSocketProvider>
        <CallProvider>
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
            <Stack.Screen name="call/[id]" />
            <Stack.Screen name="settings" options={{ title: "Settings" }} />
          </Stack>
        </CallProvider>
      </RootWebSocketProvider>
    </UserProvider>
  );
}
