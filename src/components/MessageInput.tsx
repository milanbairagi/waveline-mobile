import { Lucide } from "@react-native-vector-icons/lucide";
import { useEffect, useState } from "react";
import { Keyboard, Pressable, StyleSheet, TextInput, View } from "react-native";

type MessageInputProps = {
  handleSendMessage: (message: string) => void;
};

export default function MessageInput({ handleSendMessage }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShow = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHide = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidShow.remove();
      keyboardDidHide.remove();
    };
  }, []);

  return (
    <View
      style={[
        styles.container,
        keyboardVisible && styles.containerKeyboardVisible,
      ]}
    >
      <TextInput
        style={styles.input}
        value={message}
        onChangeText={setMessage}
        placeholder="Type a message..."
        placeholderTextColor="#9AA4B2"
        returnKeyType="send"
        onSubmitEditing={() => {
          if (message.trim()) {
            handleSendMessage(message);
            setMessage("");
          }
        }}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Send message"
        onPress={() => {
          handleSendMessage(message);
          setMessage("");
        }}
        style={({ pressed }) => [
          styles.sendButton,
          pressed && styles.sendPressed,
        ]}
      >
        {/* <Text style={styles.sendIcon}>➤</Text> */}
        <Lucide name="send-horizontal" style={styles.sendIcon} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderTopColor: "#D9DEE6",
    borderTopWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  containerKeyboardVisible: {
    paddingBottom: 100,
  },
  input: {
    backgroundColor: "#F4F5F7",
    flex: 1,
    borderColor: "#D9DEE6",
    borderRadius: 14,
    borderWidth: 1,
    color: "#1F2937",
    fontSize: 15,
    minHeight: 46,
    paddingHorizontal: 15,
    paddingVertical: 11,
    marginRight: 10,
  },
  sendButton: {
    alignItems: "center",
    backgroundColor: "#DDE1E8",
    borderRadius: 14,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  sendPressed: {
    backgroundColor: "#BFDBFE",
  },
  sendIcon: {
    color: "#64748B",
    fontSize: 20,
  },
});
