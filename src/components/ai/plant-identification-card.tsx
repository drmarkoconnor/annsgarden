import Image from "next/image";
import Link from "next/link";
import type { PlantIdentificationRecord } from "@/lib/ai/plant-identification/data";

type PlantIdentificationCardProps = {
  identification: PlantIdentificationRecord;
};

export function PlantIdentificationCard({
  identification,
}: PlantIdentificationCardProps) {
  return (
    <Link
      className="block overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm transition-colors hover:border-emerald-200 hover:bg-emerald-50/40"
      href={`/garden/identify/${identification.id}`}
    >
      {identification.imageUrl ? (
        <div className="relative h-40 w-full">
          <Image
            alt={identification.commonName}
            className="object-cover"
            fill
            sizes="100vw"
            src={identification.imageUrl}
            unoptimized
          />
        </div>
      ) : null}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-stone-500">
              {identification.createdAt}
            </p>
            <h3 className="mt-1 text-base font-semibold text-stone-950">
              {identification.commonName}
            </h3>
            {identification.latinName ? (
              <p className="mt-1 text-sm italic text-stone-500">
                {identification.latinName}
              </p>
            ) : null}
          </div>
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800">
            {statusLabel(identification.status)}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-stone-600">
          <span className="rounded-full bg-stone-100 px-2.5 py-1">
            {confidenceLabel(identification.confidence)}
          </span>
          {identification.areaName ? (
            <span className="rounded-full bg-stone-100 px-2.5 py-1">
              {identification.areaName}
            </span>
          ) : null}
          {identification.plantName ? (
            <span className="rounded-full bg-stone-100 px-2.5 py-1">
              {identification.plantName}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

function statusLabel(status: PlantIdentificationRecord["status"]) {
  const labels: Record<PlantIdentificationRecord["status"], string> = {
    applied: "Applied",
    discarded: "Discarded",
    suggested: "Review",
  };

  return labels[status];
}

function confidenceLabel(confidence: PlantIdentificationRecord["confidence"]) {
  const labels: Record<PlantIdentificationRecord["confidence"], string> = {
    high: "High confidence",
    low: "Low confidence",
    medium: "Medium confidence",
    unknown: "Unknown confidence",
  };

  return labels[confidence];
}
