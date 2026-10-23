import { useEffect, useMemo, useState } from "react";
import { router, useIsFocused } from "expo-router";
import {
  Pressable,
  ScrollView,
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
import { Skia } from "@shopify/react-native-skia";
import FILTERS from "../constants/filters";
import ApplyFilter from "../utils/applyFilter";
import { createFile } from "../store/storeImage";

type FilterName = keyof typeof FILTERS;

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
  const [filter, setFilter] = useState<FilterName>("none");
  const paint = useMemo(() => Skia.Paint(), []);

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  useEffect(() => {
    const m = FILTERS[filter];
    paint.setColorFilter(m ? Skia.ColorFilter.MakeMatrix([...m]) : null);
  }, [filter, paint]);

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
      const finalUri = await ApplyFilter(photoFile.filePath, FILTERS[filter]);
      createFile(finalUri);
      setPhotoUri(finalUri);
    } catch (error) {
      console.error("Error taking photo:", error);
      setCameraError(
        error instanceof Error ? error.message : "Could not save the photo.",
      );
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
        mirrorMode="auto"
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
            canvas.drawImage(frameTexture, 0, 0, paint);
          });

          frame.dispose();
        }}
      />

      <View
        style={[styles.bottomContainer, { paddingBottom: insets.bottom + 20 }]}
      >
        <ScrollView horizontal contentContainerStyle={styles.filterRow}>
          {(Object.keys(FILTERS) as FilterName[]).map((name) => (
            <Pressable
              key={name}
              onPress={() => setFilter(name)}
              style={[styles.chip, filter === name && styles.chipActive]}
            >
              <Text
                style={[styles.chipText, filter === name && { color: "#000" }]}
              >
                {name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
        <Pressable onPress={() => router.push("/gallery")}>
          <Text>Gallery</Text>
        </Pressable>
        <View style={styles.flexRow}>
          <Pressable
            style={styles.imagePreview}
            onPress={() => {
              if (photoUri) {
                router.push({ pathname: "/preview", params: { photoUri } });
              }
            }}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "pink",
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
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  flexRow: {
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
  filterRow: {
    paddingHorizontal: 18,
    flexDirection: "row",
    gap: 12,
    alignSelf: "center",
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#00000070",
  },
  chipActive: { backgroundColor: theme.primary },
  chipText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
    textAlign: "center",
  },
});
