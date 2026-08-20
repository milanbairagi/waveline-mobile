import { useState } from "react";
import { Button, StyleSheet, TextInput, View } from "react-native";

type MessageInputProps = {
  handleSendMessage: (message: string) => void;
};

export default function MessageInput({ handleSendMessage }: MessageInputProps) {
  const [message, setMessage] = useState("");

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={message}
        onChangeText={setMessage}
        placeholder="Type a message..."
      />
      <Button
        title="Send"
        onPress={() => {
          handleSendMessage(message);
          setMessage("");
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  input: {
    flex: 1,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
  },
});
