import { useRootWebSocket } from "@/context/useRootWebSocket";
import { useUser } from "@/context/useUser";
import { CallMediaType, useVideoCall } from "@/hooks/useCall";
import type { ParticipantDetails } from "@/types";
import { getOtherParticipantFromChatId } from "@/utils/chatParticipant";
import { useRouter } from "expo-router";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

type CallContextValue = Omit<ReturnType<typeof useVideoCall>, "startCall"> & {
  startCall: (roomId: number, mediaType?: CallMediaType) => Promise<void>;
  answerIncomingCall: () => Promise<void>;
};

const CallContext = createContext<CallContextValue | null>(null);

export function CallProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { socketRef, isConnected } = useRootWebSocket();
  const { user } = useUser();
  const call = useVideoCall(socketRef, isConnected);
  const [caller, setCaller] = useState<ParticipantDetails | null>(null);

  useEffect(() => {
    const loadCaller = async () => {
      if (!call.incomingOffer) {
        setCaller(null);
        return;
      }
      const { chatId } = call.incomingOffer;
      const otherParticipant = await getOtherParticipantFromChatId(
        chatId,
        user?.id ?? null,
      );
      setCaller(otherParticipant);
    };
    void loadCaller();
  }, [call.incomingOffer, user?.id]);

  const handleStartCall = useCallback(
    async (roomId: number, mediaType: CallMediaType = "video") => {
      await call.startCall(roomId, mediaType);
      router.replace({
        pathname: "/call/[id]" as never,
        params: { id: String(roomId) },
      });
    },
    [call, router],
  );

  const handleAnswerIncomingCall = useCallback(async () => {
    if (!call.incomingOffer) {
      return;
    }

    await call.joinCall(
      call.incomingOffer.chatId,
      call.incomingOffer.mediaType,
    );
    router.replace({
      pathname: "/call/[id]" as never,
      params: { id: String(call.incomingOffer.chatId) },
    });
  }, [call, router]);

  const handleRejectIncomingCall = useCallback(() => {
    call.rejectCall();
  }, [call]);

  const value = useMemo<CallContextValue>(
    () => ({
      ...call,
      startCall: handleStartCall,
      answerIncomingCall: handleAnswerIncomingCall,
    }),
    [call, handleAnswerIncomingCall, handleStartCall],
  );

  return (
    <CallContext.Provider value={value}>
      {children}
      <Modal
        transparent
        animationType="fade"
        visible={call.incomingOffer !== null}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.callPopup}>
            <Text style={styles.popupTitle}>
              {call.incomingOffer?.mediaType === "audio"
                ? "Incoming audio call"
                : "Incoming video call"}
            </Text>
            <Text style={styles.popupSubtitle}>
              {/* Chat #{call.incomingOffer?.chatId ?? "-"} */}
              {caller ? `From: ${caller.username}` : "Loading caller info..."}
            </Text>
            <View style={styles.popupActions}>
              <Pressable
                style={[styles.actionButton, styles.rejectButton]}
                onPress={handleRejectIncomingCall}
              >
                <Text style={styles.actionText}>Reject</Text>
              </Pressable>
              <Pressable
                style={[styles.actionButton, styles.answerButton]}
                onPress={handleAnswerIncomingCall}
              >
                <Text style={styles.actionText}>Answer</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </CallContext.Provider>
  );
}

export function useCall() {
  const context = useContext(CallContext);

  if (!context) {
    throw new Error("useCall must be used within a CallProvider");
  }

  return context;
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    padding: 24,
  },
  callPopup: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  popupTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  popupSubtitle: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 20,
  },
  popupActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  rejectButton: {
    backgroundColor: "#ef4444",
  },
  answerButton: {
    backgroundColor: "#22c55e",
  },
  actionText: {
    color: "#fff",
    fontWeight: "700",
  },
});
