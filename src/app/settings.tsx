import { useUser } from "@/context/useUser";
import { getData, saveData } from "@/utils/aStorage";
import { useEffect, useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";
import {
  BACKEND_HOST_KEY,
  BACKEND_HOST_PROTOCOL_KEY,
  DEFAULT_BACKEND_HOST,
  DEFAULT_BACKEND_HOST_PROTOCOL,
} from "../constants";

export default function Settings() {
  const { user, loading, logoutUser } = useUser();
  const [backendHost, setBackendHost] = useState("");
  const [backendHostProtocol, setBackendHostProtocol] = useState("");

  useEffect(() => {
    getData(BACKEND_HOST_KEY).then((savedHost) => {
      if (savedHost) {
        setBackendHost(savedHost as string);
      } else {
        setBackendHost(DEFAULT_BACKEND_HOST);
      }
    });

    getData(BACKEND_HOST_PROTOCOL_KEY).then((savedProtocol) => {
      if (savedProtocol) {
        setBackendHostProtocol(savedProtocol as string);
      } else {
        setBackendHostProtocol(DEFAULT_BACKEND_HOST_PROTOCOL);
      }
    });
  }, []);

  const handleBackendHostProtocolChange = () => {
    if (backendHost.trim() === "" || backendHostProtocol.trim() === "") {
      alert("Please fill in both fields.");
      return;
    }
    saveData(BACKEND_HOST_KEY, backendHost);
    saveData(BACKEND_HOST_PROTOCOL_KEY, backendHostProtocol);
    alert("Settings saved successfully!");
  };

  if (loading) {
    return (
      <View>
        <Text>Loading..</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        Welcome, {user ? user.username : "Guest"}!
      </Text>
      <Text style={styles.label}>Backend Host:</Text>
      <TextInput
        style={styles.input}
        value={backendHost}
        onChangeText={setBackendHost}
      />
      <Text style={styles.label}>Backend Host Protocol:</Text>
      <TextInput
        style={styles.input}
        value={backendHostProtocol}
        onChangeText={setBackendHostProtocol}
      />
      <View style={styles.button}>
        <Button
          title="Save Settings"
          onPress={handleBackendHostProtocolChange}
        />
      </View>
      {user && <Button title="Logout" onPress={logoutUser} color="#e91d1d" />}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 16,
  },
  button: {
    marginTop: 10,
    marginBottom: 10,
  },
});
