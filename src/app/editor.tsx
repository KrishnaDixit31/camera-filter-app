import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  type StyleProp,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { theme } from "../constants/theme";
import FILTERS from "../constants/filters";
import { useState } from "react";
import {
  Canvas,
  ColorMatrix,
  Group,
  Image as SkiaImage,
  useImage,
  type SkImage,
} from "@shopify/react-native-skia";

type FilterName = keyof typeof FILTERS;

type FilterPreviewProps = {
  image: SkImage | null;
  matrix: readonly number[] | null;
  style: StyleProp<ViewStyle>;
  width: number;
  height: number;
  fit: "contain" | "cover";
};

const FilterPreview = ({
  image,
  matrix,
  style,
  width,
  height,
  fit,
}: FilterPreviewProps) => (
  <Canvas style={style}>
    {matrix ? (
      <Group>
        <ColorMatrix matrix={[...matrix]} />
        <SkiaImage
          image={image}
          x={0}
          y={0}
          width={width}
          height={height}
          fit={fit}
        />
      </Group>
    ) : (
      <SkiaImage
        image={image}
        x={0}
        y={0}
        width={width}
        height={height}
        fit={fit}
      />
    )}
  </Canvas>
);

const EditorScreen = () => {
  const { photoUri } = useLocalSearchParams<{ photoUri?: string }>();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<FilterName>("none");
  const [previewSize, setPreviewSize] = useState({ width: 0, height: 0 });
  const image = useImage(photoUri ?? null);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Pressable style={styles.backArrow} onPress={() => router.back()}>
          <ChevronLeft color="#fff" />
        </Pressable>
        <Text style={styles.heading}>Editor</Text>
        <Pressable style={styles.saveBtn}>
          <Text style={styles.btnText}>Done</Text>
        </Pressable>
      </View>
      <View
        style={styles.imageContainer}
        onLayout={({ nativeEvent: { layout } }) =>
          setPreviewSize({ width: layout.width, height: layout.height })
        }
      >
        <FilterPreview
          image={image}
          matrix={FILTERS[selected]}
          style={StyleSheet.absoluteFill}
          width={previewSize.width}
          height={previewSize.height}
          fit="contain"
        />
      </View>
      <View style={styles.footerContainer}>
        {/* <View style={styles.intensity}></View> */}
        <View
          style={[
            styles.filterContainer,
            {
              paddingBottom: insets.bottom + 12,
            },
          ]}
        >
          <ScrollView horizontal contentContainerStyle={styles.filterContent}>
            {(Object.keys(FILTERS) as FilterName[]).map((name) => (
              <View key={name}>
                <Pressable
                  onPress={() => setSelected(name)}
                  style={[styles.chip, selected === name && styles.chipActive]}
                >
                  <View style={styles.chipImageContainer}>
                    <FilterPreview
                      image={image}
                      matrix={FILTERS[name]}
                      style={styles.chipImage}
                      width={56}
                      height={56}
                      fit="cover"
                    />
                  </View>
                </Pressable>
                <Text
                  style={[
                    styles.chipText,
                    selected === name && { color: theme.primary },
                  ]}
                >
                  {name}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default EditorScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  headerContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "space-between",
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
  saveBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: theme.primary,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "700",
    marginTop: -2,
  },
  imageContainer: {
    flex: 1,
    minHeight: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  footerContainer: {
    bottom: 0,
    width: "100%",
    paddingTop: 16,
    backgroundColor: "#000",
  },
  // intensity: {},
  filterContainer: {
    paddingHorizontal: 18,
  },
  filterContent: {
    flexDirection: "row",
    gap: 12,
    alignSelf: "center",
  },
  chip: {
    width: 60,
    height: 60,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "transparent",
    overflow: "hidden",
    marginBottom: 4,
  },
  chipActive: {
    borderColor: theme.primary,
  },
  chipImageContainer: {
    flex: 1,
    borderRadius: 10,
    overflow: "hidden",
  },
  chipImage: {
    flex: 1,
  },
  chipText: {
    fontSize: 11,
    color: "#fff",
    textAlign: "center",
  },
});
