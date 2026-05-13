import type { ReactNode } from "react";
import { HealthStatusBadge } from "@/components/health-status-badge";
import type { Plant } from "@/types/garden";

type PlantCardProps = {
  plant: Plant;
  areaName?: string;
  children?: ReactNode;
};

export function PlantCard({ plant, areaName, children }: PlantCardProps) {
  return (
    <article className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-stone-500">{plant.plantType}</p>
          <h3 className="mt-1 text-base font-semibold text-stone-950">
            {plant.commonName}
          </h3>
          {plant.latinName ? (
            <p className="mt-1 text-sm italic text-stone-500">{plant.latinName}</p>
          ) : null}
        </div>
        <HealthStatusBadge status={plant.healthStatus} />
      </div>

      <p className="mt-3 text-sm leading-6 text-stone-600">{plant.notes}</p>

      <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-stone-600">
        {areaName ? (
          <span className="rounded-full bg-stone-100 px-2.5 py-1">{areaName}</span>
        ) : null}
        {plant.floweringPeriod ? (
          <span className="rounded-full bg-stone-100 px-2.5 py-1">
            Flowers {plant.floweringPeriod}
          </span>
        ) : null}
        {plant.isUnknown ? (
          <span className="rounded-full bg-stone-100 px-2.5 py-1">Unknown ID</span>
        ) : null}
      </div>
      {children ? <div className="mt-4 border-t border-stone-100 pt-4">{children}</div> : null}
    </article>
  );
}
