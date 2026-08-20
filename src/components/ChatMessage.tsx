import type { Message, UserResponse } from "@/types";
import { StyleSheet, Text, View } from "react-native";

type ChatMessageProps = {
  message: Message;
  user: UserResponse | null;
};

function formatTime(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ChatMessage({ message, user }: ChatMessageProps) {
  const isOwn = user ? message.sender === user.id : false;
  const status = isOwn ? message.status : null;
  const showDoubleCheck = status === "delivered" || status === "seen";
  const isSeen = status === "seen";

  return (
    <View style={[styles.row, isOwn ? styles.rowOwn : styles.rowOther]}>
      <View
        style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}
      >
        <Text
          style={[
            styles.messageText,
            isOwn ? styles.messageTextOwn : styles.messageTextOther,
          ]}
        >
          {message.content}
        </Text>

        <View
          style={[
            styles.metaRow,
            isOwn ? styles.metaRowOwn : styles.metaRowOther,
          ]}
        >
          <Text
            style={[
              styles.timestamp,
              isOwn ? styles.timestampOwn : styles.timestampOther,
            ]}
          >
            {formatTime(message.timestamp)}
          </Text>

          {isOwn && status === "sent" ? (
            <Text style={styles.checkMark}>✓</Text>
          ) : null}
          {showDoubleCheck ? (
            <Text style={[styles.checkMark, isSeen && styles.checkMarkRead]}>
              ✓✓
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    width: "100%",
    flexDirection: "row",
    marginVertical: 6,
    paddingHorizontal: 12,
  },
  rowOwn: {
    justifyContent: "flex-end",
  },
  rowOther: {
    justifyContent: "flex-start",
  },
  bubble: {
    maxWidth: "82%",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  bubbleOwn: {
    backgroundColor: "#5666ab",
    borderBottomRightRadius: 6,
  },
  bubbleOther: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderBottomLeftRadius: 6,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 21,
  },
  messageTextOwn: {
    color: "#FFFFFF",
  },
  messageTextOther: {
    color: "#111827",
  },
  metaRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  metaRowOwn: {
    gap: 4,
  },
  metaRowOther: {
    gap: 0,
  },
  timestamp: {
    fontSize: 11,
  },
  timestampOwn: {
    color: "rgba(255,255,255,0.75)",
  },
  timestampOther: {
    color: "#6B7280",
  },
  checkMark: {
    fontSize: 12,
    lineHeight: 12,
    color: "rgba(255,255,255,0.82)",
    marginLeft: 2,
  },
  checkMarkRead: {
    color: "#A5B4FC",
  },
});
