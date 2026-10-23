import { useCallback, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { readDir } from "../store/storeImage";
import { router, useFocusEffect } from "expo-router";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Images } from "lucide-react-native";
import { theme } from "../constants/theme";

const Gallery = () => {
  const [list, setList] = useState<ReturnType<typeof readDir>>([]);
  const insets = useSafeAreaInsets();

  const loadList = () => {
    const data = readDir();
    setList(data);
  };
  useFocusEffect(
    useCallback(() => {
      loadList();
    }, []),
  );

  const emptyComponent = () => {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Images size={52} color={theme.primary} style={styles.icon} />
        <Text style={styles.text}>
          No images yet. Your captured photos will appear here.
        </Text>
        <Pressable onPress={() => router.replace("/")} style={styles.btn}>
          <Text style={styles.btnText}>Got ot Camera</Text>
        </Pressable>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gallery</Text>
        <Text style={styles.total}>{list?.length} Images</Text>
      </View>
      <Pressable
        onPress={() => router.push("/preview")}
        style={[styles.imageContainer, { paddingBottom: insets.bottom + 12 }]}
      >
        <FlatList
          data={list ?? []}
          keyExtractor={(item) => item.name}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => (
            <Image
              source={{ uri: item.uri }}
              style={styles.image}
              contentFit="cover"
            />
          )}
          ListEmptyComponent={() => emptyComponent()}
        />
      </Pressable>
    </SafeAreaView>
  );
};

export default Gallery;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
  },
  total: {
    fontSize: 16,
    fontWeight: "400",
    color: "#fff",
  },
  imageContainer: {
    flexGrow: 1,
  },
  grid: {
    padding: 8,
    flexGrow: 1,
  },
  row: {
    gap: 8,
    marginBottom: 8,
  },
  image: {
    flex: 1,
    aspectRatio: 1,
  },
  icon: {
    marginBottom: 16,
  },
  text: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  btn: {
    backgroundColor: theme.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  btnText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
  },
});
