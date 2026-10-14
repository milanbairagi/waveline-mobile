import { useCall } from "@/context/useCallContext";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { RTCView } from "react-native-webrtc";

export default function CallView() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    localStream,
    remoteStream,
    endCall,
    toggleMute,
    toggleCamera,
    flipCamera,
  } = useCall();

  const router = useRouter();

  const streamUrl = localStream?.toURL?.();
  const remoteUrl = remoteStream?.toURL?.();

  const handleEndCall = useCallback(() => {
    endCall();
    router.replace({ pathname: "/chats/[id]" as never, params: { id } });
  }, [endCall, router, id]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.videoContainer}>
        {remoteUrl ? (
          <RTCView
            streamURL={remoteUrl}
            style={styles.remoteVideo}
            objectFit="cover"
          />
        ) : (
          <View style={styles.waitingState}>
            <Text style={styles.waitingText}>Waiting for connection...</Text>
          </View>
        )}

        {streamUrl ? (
          <RTCView
            streamURL={streamUrl}
            style={styles.localVideo}
            objectFit="cover"
            mirror
          />
        ) : null}
      </View>

      <View style={styles.controls}>
        <Pressable style={styles.controlButton} onPress={toggleMute}>
          <Text style={styles.controlText}>Mute</Text>
        </Pressable>
        <Pressable style={styles.controlButton} onPress={toggleCamera}>
          <Text style={styles.controlText}>Camera</Text>
        </Pressable>
        <Pressable style={styles.controlButton} onPress={flipCamera}>
          <Text style={styles.controlText}>Flip</Text>
        </Pressable>
        <Pressable
          style={[styles.controlButton, styles.endButton]}
          onPress={handleEndCall}
        >
          <Text style={styles.controlText}>End</Text>
        </Pressable>
      </View>

      <Text style={styles.roomLabel}>Call room: {id ?? "-"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
  },
  videoContainer: {
    flex: 1,
    backgroundColor: "#0f172a",
    position: "relative",
  },
  remoteVideo: {
    flex: 1,
    backgroundColor: "#1f2937",
  },
  waitingState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1f2937",
  },
  waitingText: {
    color: "#e5e7eb",
    fontSize: 18,
  },
  localVideo: {
    position: "absolute",
    right: 18,
    bottom: 90,
    width: 110,
    height: 150,
    borderRadius: 14,
    backgroundColor: "#374151",
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#fff",
  },
  controls: {
    position: "absolute",
    bottom: 24,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  controlButton: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  endButton: {
    backgroundColor: "#ef4444",
  },
  controlText: {
    color: "#fff",
    fontWeight: "700",
  },
  roomLabel: {
    position: "absolute",
    top: 40,
    left: 16,
    right: 16,
    textAlign: "center",
    color: "#f8fafc",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
});
