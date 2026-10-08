import {
  CameraType,
  CameraView,
  useCameraPermissions,
  useMicrophonePermissions,
} from "expo-camera";
import { useState } from "react";
import { Button, Text, View } from "react-native";

export default function UserMediaScreen() {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [microphonePermission, requestMicrophonePermission] =
    useMicrophonePermissions();
  const [cameraFacing, setCameraFacing] = useState<CameraType>("back");

  if (!cameraPermission || !microphonePermission) {
    return <Text>Loading permissions...</Text>;
  }

  if (!cameraPermission.granted || !microphonePermission.granted) {
    return (
      <View>
        <Text>We need your permission to show the camera and microphone</Text>
        <Button
          title="Grant Camera Permission"
          onPress={requestCameraPermission}
        />
        <Button
          title="Grant Microphone Permission"
          onPress={requestMicrophonePermission}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <CameraView style={{ flex: 1 }} facing={cameraFacing} />
      <View style={{ position: "absolute", bottom: 24, alignSelf: "center" }}>
        <Button
          title={
            cameraFacing === "back"
              ? "Switch to front camera"
              : "Switch to back camera"
          }
          onPress={() =>
            setCameraFacing((current) =>
              current === "back" ? "front" : "back",
            )
          }
        />
      </View>
    </View>
  );
}
