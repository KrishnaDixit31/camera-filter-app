import { ImageFormat, Skia } from "@shopify/react-native-skia";
import { File, Paths } from "expo-file-system";

const ApplyFilter = async (path: string, matrix: readonly number[] | null) => {
  const uri = path.startsWith("file://") ? path : `file://${path}`;

  if (!matrix) return uri;

  const data = await Skia.Data.fromURI(uri);
  const image = Skia.Image.MakeImageFromEncoded(data);
  if (!image) throw new Error("Could not decode photo");

  const width = image.width();
  const height = image.height();

  const surface = Skia.Surface.MakeOffscreen(width, height);
  if (!surface) throw new Error("Could not create Skia surface");

  const canvas = surface.getCanvas();
  const paint = Skia.Paint();
  paint.setColorFilter(Skia.ColorFilter.MakeMatrix([...matrix]));
  canvas.drawImage(image, 0, 0, paint);
  surface.flush();

  const snapShot = surface.makeImageSnapshot();
  const base64 = snapShot.encodeToBase64(ImageFormat.JPEG, 92);

  const file = new File(Paths.cache, `filtered_${Date.now()}.jpg`);
  file.create();
  file.write(base64, { encoding: "base64" });
  return file.uri;
};
export default ApplyFilter;
