import { useEffect, useRef, useState } from "react";
import { router, useIsFocused } from "expo-router";
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import {
  useCameraDevice,
  useCameraPermission,
  usePhotoOutput,
} from "react-native-vision-camera";
import { SkiaCamera } from "react-native-vision-camera-skia";
import { theme } from "../constants/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SwitchCamera } from "lucide-react-native";

export default function CameraScreen() {
  const { hasPermission, requestPermission } = useCameraPermission();
  const isFocused = useIsFocused();
  const [cameraPosition, setCameraPosition] = useState<"back" | "front">(
    "back",
  );
  let device = useCameraDevice(cameraPosition);
  const photoOutput = usePhotoOutput({ qualityPrioritization: "quality" });
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

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
          If you are running on an Android Emulator, make sure the camera is
          enabled in Emulator Settings (Camera {">"} Back {">"} Emulated or
          Webcam0).
        </Text>
      </View>
    );
  }

  const takePhoto = async () => {
    try {
      const photoFile = await photoOutput.capturePhotoToFile({}, {});
      setPhotoUri(photoFile.filePath);
    } catch (error) {
      console.error("Error taking photo:", error);
    }
  };

  const flipCamera = () => {
    setCameraPosition((pos) => (pos === "back" ? "front" : "back"));
  };

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
        isActive={hasPermission && isFocused}
        pixelFormat="yuv"
        outputs={[photoOutput]}
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

      <View
        style={[styles.bottomContainer, { paddingBottom: insets.bottom + 20 }]}
      >
        <Pressable
          style={styles.imagePreview}
          onPress={() => router.push("/gallery")}
        >
          {photoUri && (
            <Image
              source={{
                uri: photoUri.startsWith("file://")
                  ? photoUri
                  : `file://${photoUri}`,
              }}
              style={styles.image}
              contentFit="cover"
            />
          )}
        </Pressable>
        <Pressable style={styles.captureBtn} onPress={takePhoto}>
          <View style={styles.insideBtn} />
        </Pressable>
        <Pressable style={styles.flip} onPress={flipCamera}>
          <SwitchCamera color="#fff" size={24} />
        </Pressable>
      </View>
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
    backgroundColor: theme.primary,
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
  bottomContainer: {
    width: "100%",
    height: "auto",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingTop: 20,
    position: "absolute",
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 52,
  },
  imagePreview: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: "#00000065",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  captureBtn: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  insideBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.primary,
  },
  flip: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#00000065",
    justifyContent: "center",
    alignItems: "center",
  },
});
