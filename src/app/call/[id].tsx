import { useCall } from "@/context/useCallContext";
import { useUser } from "@/context/useUser";
import type { ParticipantDetails } from "@/types";
import { getOtherParticipantFromChatId } from "@/utils/chatParticipant";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { RTCView } from "react-native-webrtc";

export default function CallView() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useUser();
  const {
    localStream,
    remoteStream,
    endCall,
    toggleMute,
    toggleCamera,
    flipCamera,
    isAudioOnly,
  } = useCall();
  const [callee, setCallee] = useState<ParticipantDetails | null>(null);

  const router = useRouter();

  const streamUrl = localStream?.toURL?.();
  const remoteUrl = remoteStream?.toURL?.();

  useEffect(() => {
    const loadCallee = async () => {
      if (!id) {
        setCallee(null);
        return;
      }
      const callee = await getOtherParticipantFromChatId(
        Number(id),
        user?.id ?? null,
      );
      setCallee(callee);
    };
    void loadCallee();
  }, [id, user?.id]);

  const handleEndCall = useCallback(() => {
    endCall();
    router.replace({ pathname: "/chats/[id]" as never, params: { id } });
  }, [endCall, router, id]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.videoContainer}>
        {isAudioOnly ? (
          <View style={styles.audioState}>
            <Text style={styles.audioBadge}>Audio call</Text>
            <Text style={styles.audioLabel}>Connected</Text>
          </View>
        ) : remoteUrl ? (
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

        {!isAudioOnly && streamUrl ? (
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
        {!isAudioOnly ? (
          <>
            <Pressable style={styles.controlButton} onPress={toggleCamera}>
              <Text style={styles.controlText}>Camera</Text>
            </Pressable>
            <Pressable style={styles.controlButton} onPress={flipCamera}>
              <Text style={styles.controlText}>Flip</Text>
            </Pressable>
          </>
        ) : null}
        <Pressable
          style={[styles.controlButton, styles.endButton]}
          onPress={handleEndCall}
        >
          <Text style={styles.controlText}>End</Text>
        </Pressable>
      </View>

      <Text style={styles.roomLabel}>
        {callee ? `Calling: ${callee.username}` : "Loading callee info..."}
      </Text>
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
  audioState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1f2937",
    padding: 24,
  },
  audioBadge: {
    color: "#f8fafc",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  audioLabel: {
    color: "#cbd5e1",
    fontSize: 16,
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
