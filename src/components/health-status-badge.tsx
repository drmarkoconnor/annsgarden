import type { PlantHealthStatus } from "@/types/garden";

const healthStyles: Record<PlantHealthStatus, string> = {
  thriving: "border-emerald-200 bg-emerald-50 text-emerald-800",
  okay: "border-sky-200 bg-sky-50 text-sky-800",
  needs_attention: "border-amber-200 bg-amber-50 text-amber-800",
  struggling: "border-rose-200 bg-rose-50 text-rose-800",
  removed_dead: "border-stone-200 bg-stone-100 text-stone-700",
  unknown: "border-stone-200 bg-stone-50 text-stone-600",
};

const healthLabels: Record<PlantHealthStatus, string> = {
  thriving: "Thriving",
  okay: "Okay",
  needs_attention: "Needs attention",
  struggling: "Struggling",
  removed_dead: "Removed",
  unknown: "Unknown",
};

type HealthStatusBadgeProps = {
  status: PlantHealthStatus;
};

export function HealthStatusBadge({ status }: HealthStatusBadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        healthStyles[status],
      ].join(" ")}
    >
      {healthLabels[status]}
    </span>
  );
}
