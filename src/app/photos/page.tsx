import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import {
  PhotoGallery,
  PhotoGalleryFilters,
  clearComparisonHref,
  getSelectedComparisonPhotos,
  hasSelectedPhotoComparison,
  normalisePhotoFilters,
  photoMatchesFilters,
  type PhotoFilterParams,
} from "@/components/photos/photo-gallery";
import { PhotoForm } from "@/components/photos/photo-form";
import { PhotoPlaceholderCard } from "@/components/photo-placeholder-card";
import { getPhotoData } from "@/lib/photos/data";

export const dynamic = "force-dynamic";

type PhotoSearchParams = PhotoFilterParams & {
  deleted?: string;
  photoError?: string;
  saved?: string;
};

export default async function PhotosPage({
  searchParams,
}: {
  searchParams?: Promise<PhotoSearchParams>;
}) {
  const notices = searchParams ? await searchParams : {};
  const { comparisonPhotos, formOptions, photos } = await getPhotoData();
  const filters = normalisePhotoFilters(notices);
  const filteredPhotos = photos.filter((photo) => photoMatchesFilters(photo, filters));
  const selectedComparisonPhotos = getSelectedComparisonPhotos(photos, filters);
  const isManualComparison = hasSelectedPhotoComparison(filters);
  const comparisonPhotosToShow = isManualComparison
    ? selectedComparisonPhotos
    : comparisonPhotos;
  const singleSelectedComparisonPhoto =
    isManualComparison && selectedComparisonPhotos.length === 1
      ? selectedComparisonPhotos[0]
      : undefined;

  return (
    <AppShell activeItem="photos">
      <div className="space-y-6">
        <section>
          <p className="text-sm font-medium text-emerald-700">Timeline</p>
          <h1 className="mt-2 text-3xl font-semibold text-stone-950">Photos</h1>
          <p className="mt-1 max-w-sm text-base leading-7 text-stone-600">
            Garden photos linked back to areas, plants, tasks and notes.
          </p>
        </section>

        <PhotoNotice notices={notices} />

        <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
          <PhotoForm options={formOptions} />
        </section>

        <PhotoGalleryFilters
          filters={filters}
          options={formOptions}
          shownCount={filteredPhotos.length}
          totalCount={photos.length}
        />

        <section className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-stone-950">Compare</h2>
              <p className="text-sm leading-6 text-stone-600">
                Choose a left and right photo from the gallery.
              </p>
            </div>
            {isManualComparison ? (
              <Link
                className="rounded-md border border-stone-200 bg-white px-3 py-2 text-sm font-semibold text-stone-700"
                href={clearComparisonHref(filters)}
              >
                Clear
              </Link>
            ) : null}
          </div>
          {singleSelectedComparisonPhoto ? (
            <div className="grid grid-cols-2 gap-3">
              <PhotoPlaceholderCard photo={singleSelectedComparisonPhoto} compact />
              <EmptyState text="Choose a second photo." />
            </div>
          ) : comparisonPhotosToShow.length >= 2 ? (
            <div className="grid grid-cols-2 gap-3">
              {comparisonPhotosToShow.slice(0, 2).map((photo) => (
                <PhotoPlaceholderCard key={photo.id} photo={photo} compact />
              ))}
            </div>
          ) : (
            <EmptyState text="Set a left and right photo from the gallery to compare them." />
          )}
        </section>

        <PhotoGallery
          filters={filters}
          options={formOptions}
          photos={filteredPhotos}
        />
      </div>
    </AppShell>
  );
}

function PhotoNotice({ notices }: { notices: PhotoSearchParams }) {
  const messages: Record<string, string> = {
    "file-too-large": "The photo is too large. Please use an image under 10 MB.",
    "delete-failed": "The photo could not be deleted. Please try again.",
    "missing-file": "Choose a photo before saving.",
    "save-failed": "The photo record could not be saved.",
    "unsupported-type": "Use a JPEG, PNG, WebP, HEIC or HEIF image.",
    "upload-failed": "The photo could not be uploaded. Please try again.",
  };

  if (notices.saved === "1") {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
        Photo saved.
      </div>
    );
  }

  if (notices.deleted === "1") {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
        Photo deleted.
      </div>
    );
  }

  if (!notices.photoError) {
    return null;
  }

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
      {messages[notices.photoError] ?? "The photo could not be saved."}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-stone-300 bg-stone-50 p-4 text-sm leading-6 text-stone-600">
      {text}
    </div>
  );
}
