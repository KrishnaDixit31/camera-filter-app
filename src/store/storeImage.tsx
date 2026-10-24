import { File, Directory, Paths } from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
// import * as Sharing from "expo-sharing";
import { Alert } from "react-native";

const CameraDir = new Directory(Paths.document, "FilterCam");

export const createFile = (uri: string) => {
  const source = new File(uri);

  CameraDir.create({
    idempotent: true,
    intermediates: true,
  });

  const destination = new File(CameraDir, `filtered_${Date.now()}.jpg`);

  source.copy(destination);

  return destination.uri;
};

export const readDir = () => {
  try {
    const fileList = CameraDir.list();
    return fileList;
  } catch (error) {
    alert(`Failed to read Directory: ${error}`);
  }
};

export const saveImageToDevice = async (uri: string) => {
  try {
    const permission = await MediaLibrary.requestPermissionsAsync();

    if (!permission.granted) {
      alert("Gallery permission is required to save the image.");
      return;
    }

    await MediaLibrary.Asset.create(uri);
  } catch (error) {
    alert(`Failed to save image: ${error}`);
  }
};

export const shareImage = async (uri: string) => {
  try {
    if (!uri) {
      Alert.alert("Error", "No image available to share.");
      return;
    }

    const available = await Sharing.isAvailableAsync();

    if (!available) {
      Alert.alert("Not supported", "Sharing is not available on this device.");
      return;
    }

    await Sharing.shareAsync(uri, {
      mimeType: "image/jpeg",
      dialogTitle: "Share your photo",
      UTI: "public.jpeg",
    });
  } catch (error) {
    Alert.alert("Error", `Could not share the image:  ${error}`);
  }
};
