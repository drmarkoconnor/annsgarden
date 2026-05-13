export const targetUploadBytes = 900 * 1024;

const resizeEdges = [1600, 1400, 1200];
const resizeQualities = [0.84, 0.76, 0.68, 0.6];

export async function resizeImageFile(
  file: File,
  options: {
    forceJpeg?: boolean;
    targetBytes?: number;
  } = {},
) {
  const targetBytes = options.targetBytes ?? targetUploadBytes;

  if (
    !options.forceJpeg &&
    (!file.type.startsWith("image/") || file.size <= targetBytes)
  ) {
    return null;
  }

  const image = await loadImage(file);
  let bestBlob: Blob | null = null;

  for (const edge of resizeEdges) {
    const canvas = drawImageToCanvas(image, edge);

    for (const quality of resizeQualities) {
      const blob = await canvasToBlob(canvas, "image/jpeg", quality);

      if (!bestBlob || blob.size < bestBlob.size) {
        bestBlob = blob;
      }

      if (blob.size <= targetBytes) {
        return blobToFile(blob, file);
      }
    }
  }

  return bestBlob && bestBlob.size < file.size ? blobToFile(bestBlob, file) : null;
}

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Image could not be loaded."));
    };
    image.src = url;
  });
}

function drawImageToCanvas(image: HTMLImageElement, maxEdge: number) {
  const scale = Math.min(1, maxEdge / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas is not available.");
  }

  context.drawImage(image, 0, 0, width, height);
  return canvas;
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Image could not be prepared."));
        }
      },
      type,
      quality,
    );
  });
}

function blobToFile(blob: Blob, originalFile: File) {
  const nameWithoutExtension = originalFile.name.replace(/\.[^.]+$/, "") || "garden-photo";
  return new File([blob], `${nameWithoutExtension}.jpg`, {
    lastModified: Date.now(),
    type: "image/jpeg",
  });
}
