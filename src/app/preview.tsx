import { router, useLocalSearchParams } from "expo-router";
import {
  ArrowDownToLine,
  ChevronLeft,
  Share,
  SquarePen,
} from "lucide-react-native";
import {
  ActivityIndicator,
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../constants/theme";
import { useState } from "react";
import { Image } from "expo-image";
import { saveImageToDevice, shareImage } from "../store/storeImage";

const PreviewScreen = () => {
  const { photoUri } = useLocalSearchParams<{ photoUri?: string }>();
  const [previewSize, setPreviewSize] = useState({ width: 0, height: 0 });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!photoUri || isSaving) return;

    setIsSaving(true);
    try {
      await saveImageToDevice(photoUri);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.backArrow,
            pressed && styles.pressed,
          ]}
          onPress={() => router.back()}
        >
          <ChevronLeft color="#fff" />
        </Pressable>
        <Text style={styles.heading}>Preview</Text>
      </View>
      <View
        style={styles.imageContainer}
        onLayout={({ nativeEvent: { layout } }) =>
          setPreviewSize({ width: layout.width, height: layout.height })
        }
      >
        <Image
          source={{ uri: photoUri }}
          contentFit="contain"
          contentPosition="top"
          style={{
            width: previewSize.width || "100%",
            height: previewSize.height || "100%",
          }}
        />
      </View>
      <View style={styles.btnContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.saveGallery,
            pressed && styles.pressed,
          ]}
          onPress={handleSave}
          disabled={isSaving || !photoUri}
          accessibilityRole="button"
          accessibilityState={{
            busy: isSaving,
            disabled: isSaving || !photoUri,
          }}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ArrowDownToLine color="#fff" size={20} />
          )}
          <Text style={styles.btnText}>
            {isSaving ? "Saving..." : "Save to Device"}
          </Text>
        </Pressable>
        <View style={styles.btnRow}>
          <Pressable
            style={({ pressed }) => [
              styles.commonBtn,
              pressed && styles.pressed,
            ]}
            onPress={() => {
              if (photoUri) shareImage(photoUri);
            }}
          >
            <Share color="#fff" size={20} />
            <Text style={styles.btnText}>Share</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.commonBtn,
              pressed && styles.pressed,
            ]}
            onPress={() =>
              router.replace({
                pathname: "/editor",
                params: { photoUri: photoUri },
              })
            }
          >
            <SquarePen color="#fff" size={20} />
            <Text style={styles.btnText}>Edit</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default PreviewScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingHorizontal: 16,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  heading: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginLeft: 22,
  },
  backArrow: {
    padding: 2,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#ffffff4c",
  },
  pressed: {
    opacity: 0.7,
  },
  imageContainer: {
    flex: 1,
    minHeight: 0,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 16,
  },
  btnContainer: {
    width: "100%",
    gap: 12,
    marginBottom: 12,
  },
  saveGallery: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: theme.primary,
    borderRadius: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.25,
  },
  btnRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  commonBtn: {
    flexGrow: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "#000",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#ffffff4c",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
});
