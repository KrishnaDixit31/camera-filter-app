import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useCameraDevice, useCameraPermission } from "react-native-vision-camera";
import { SkiaCamera } from "react-native-vision-camera-skia";

export default function Index() {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice("back");
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Camera permission is required.</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (device == null) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>No back camera device found.</Text>
        <Text style={styles.subtext}>
          If you are running on an Android Emulator, make sure the camera is enabled in Emulator Settings (Camera {">"} Back {">"} Emulated or Webcam0).
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {cameraError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Camera Error: {cameraError}</Text>
        </View>
      ) : null}
      <SkiaCamera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={hasPermission}
        pixelFormat="yuv"
        onError={(error) => {
          console.error("Camera runtime error:", error);
          setCameraError(error.message);
        }}
        onFrame={(frame, render) => {
          "worklet";

          render(({ frameTexture, canvas }) => {
            canvas.drawImage(frameTexture, 0, 0);
          });

          frame.dispose();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
  },
  text: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
  },
  subtext: {
    color: "#aaa",
    fontSize: 13,
    textAlign: "center",
    paddingHorizontal: 24,
    marginTop: 8,
  },
  button: {
    backgroundColor: "#208AEF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  errorContainer: {
    position: "absolute",
    top: 50,
    zIndex: 10,
    backgroundColor: "rgba(255, 0, 0, 0.8)",
    padding: 10,
    borderRadius: 6,
    marginHorizontal: 16,
  },
  errorText: {
    color: "#fff",
    fontSize: 13,
    textAlign: "center",
  },
});
