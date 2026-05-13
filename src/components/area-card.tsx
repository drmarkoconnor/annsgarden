import type { ReactNode } from "react";
import type { GardenArea } from "@/types/garden";

type AreaCardProps = {
  area: GardenArea;
  children?: ReactNode;
};

export function AreaCard({ area, children }: AreaCardProps) {
  return (
    <article className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-stone-950">{area.name}</h3>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            {area.description}
          </p>
        </div>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800">
          {area.plantCount} plants
        </span>
      </div>
      <dl className="mt-4 grid gap-2 text-sm">
        <div>
          <dt className="font-medium text-stone-700">Light</dt>
          <dd className="text-stone-600">{area.sunlight}</dd>
        </div>
        <div>
          <dt className="font-medium text-stone-700">Soil</dt>
          <dd className="text-stone-600">{area.soil}</dd>
        </div>
      </dl>
      {children ? <div className="mt-4 border-t border-stone-100 pt-4">{children}</div> : null}
    </article>
  );
}
