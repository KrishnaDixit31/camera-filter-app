import { File, Directory, Paths } from "expo-file-system";

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
    console.log(error);
  }
};
