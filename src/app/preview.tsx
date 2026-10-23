import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../constants/theme";
import { useState } from "react";
import { Image } from "expo-image";

const PreviewScreen = () => {
  const { photoUri } = useLocalSearchParams<{ photoUri?: string }>();
  const [previewSize, setPreviewSize] = useState({ width: 0, height: 0 });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Pressable style={styles.backArrow} onPress={() => router.back()}>
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
          style={{
            width: previewSize.width || "100%",
            height: previewSize.height || "100%",
          }}
        />
      </View>
      <View style={styles.btnContainer}></View>
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
  imageContainer: {
    flex: 1,
    minHeight: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  btnContainer: {
    width: "100%",
    height: 100,
    backgroundColor: theme.primary,
  },
});
