import imageCompression from "browser-image-compression";

export async function reduzirFoto(arquivo: File): Promise<Blob> {
  return imageCompression(arquivo, {
    maxWidthOrHeight: 1600,
    initialQuality: 0.8,
    fileType: "image/jpeg",
    useWebWorker: true,
  });
}
