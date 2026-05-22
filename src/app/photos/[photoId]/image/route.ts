import { NextResponse, type NextRequest } from "next/server";
import { getSignedInClaims } from "@/lib/auth/guards";
import { ANN_GARDEN_ID } from "@/lib/garden/constants";
import { PHOTO_BUCKET } from "@/lib/photos/constants";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const signedUrlSeconds = 60 * 60;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ photoId: string }> },
) {
  const claims = await getSignedInClaims();

  if (!claims) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const { photoId } = await params;
  const supabase = createSupabaseAdminClient();
  const { data: photo, error: photoError } = await supabase
    .from("photos")
    .select("storage_path")
    .eq("id", photoId)
    .eq("garden_id", ANN_GARDEN_ID)
    .maybeSingle();

  if (photoError || !photo?.storage_path) {
    return NextResponse.redirect(new URL("/photos?photoError=not-found", request.url));
  }

  const { data, error } = await supabase.storage
    .from(PHOTO_BUCKET)
    .createSignedUrl(photo.storage_path, signedUrlSeconds);

  if (error) {
    return NextResponse.redirect(new URL("/photos?photoError=image-failed", request.url));
  }

  return NextResponse.redirect(data.signedUrl);
}
