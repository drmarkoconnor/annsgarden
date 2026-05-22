import "server-only";
import { PHOTO_BUCKET } from "@/lib/photos/constants";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type PhotoImageSource = {
  storage_path: string | null;
  thumbnail_path: string | null;
};

const signedUrlSeconds = 60 * 60;
const fallbackTransform = {
  quality: 62,
  resize: "contain" as const,
  width: 640,
};

export function photoImagePath(photo: PhotoImageSource) {
  return photo.thumbnail_path ?? photo.storage_path;
}

export async function signedPhotoImageUrls(photos: PhotoImageSource[]) {
  const thumbnailPaths = photos
    .map((photo) => photo.thumbnail_path)
    .filter(Boolean) as string[];
  const imageUrlByPath = await signedUrlsByPath(thumbnailPaths);
  const fallbackPhotos = photos.filter(
    (photo) => !photo.thumbnail_path && photo.storage_path,
  );

  await Promise.all(
    fallbackPhotos.map(async (photo) => {
      if (!photo.storage_path) {
        return;
      }

      const signedUrl = await signedTransformedUrl(photo.storage_path);

      if (signedUrl) {
        imageUrlByPath.set(photo.storage_path, signedUrl);
      }
    }),
  );

  return imageUrlByPath;
}

async function signedUrlsByPath(paths: string[]) {
  const uniquePaths = Array.from(new Set(paths));

  if (!uniquePaths.length) {
    return new Map<string, string>();
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.storage
    .from(PHOTO_BUCKET)
    .createSignedUrls(uniquePaths, signedUrlSeconds);

  if (error) {
    return new Map<string, string>();
  }

  return new Map(
    data
      .filter((item) => item.path && item.signedUrl)
      .map((item) => [item.path as string, item.signedUrl as string]),
  );
}

async function signedTransformedUrl(storagePath: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.storage
    .from(PHOTO_BUCKET)
    .createSignedUrl(storagePath, signedUrlSeconds, {
      transform: fallbackTransform,
    });

  if (error) {
    return undefined;
  }

  return data.signedUrl;
}
