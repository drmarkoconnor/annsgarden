import Link from "next/link";
import type { ReactNode } from "react";
import {
  gardenMapFeatures,
  gardenMapZones,
  type GardenMapZone,
} from "@/lib/garden/map-data";

type GardenMapExplorerProps = {
  selectedZone: GardenMapZone;
};

export function GardenMapExplorer({ selectedZone }: GardenMapExplorerProps) {
  return (
    <div className="space-y-5">
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-stone-950">Survey map</h2>
          <span className="text-sm font-medium text-stone-500">
            {gardenMapZones.length} zones
          </span>
        </div>
        <MapFrame>
          <GardenMapSvg selectedZone={selectedZone} />
        </MapFrame>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {gardenMapZones.map((zone) => (
            <Link
              key={zone.code}
              aria-label={`${zone.name} map area`}
              aria-current={zone.code === selectedZone.code ? "page" : undefined}
              className={[
                "flex min-h-12 items-center justify-center rounded-md border px-2 py-2 text-center text-xs font-semibold leading-tight sm:text-sm",
                zone.code === selectedZone.code
                  ? "border-emerald-700 bg-emerald-700 text-white"
                  : "border-stone-200 bg-white text-stone-700",
              ].join(" ")}
              href={zoneHref(zone)}
            >
              {zone.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <p className="text-sm font-medium text-emerald-700">Selected area</p>
          <h2 className="mt-1 text-2xl font-semibold text-stone-950">
            {selectedZone.name}
          </h2>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            {selectedZone.surveyCues}
          </p>
        </div>

        <MapFrame compact>
          <GardenMapSvg selectedZone={selectedZone} viewBox={selectedZone.detailViewBox} />
        </MapFrame>

        <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
          <h3 className="text-base font-semibold text-stone-950">Good records here</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedZone.recordFocus.map((item) => (
              <span
                key={item}
                className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-700"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        {selectedZone.adjacent.length ? (
          <div className="space-y-2">
            <h3 className="text-base font-semibold text-stone-950">Next areas</h3>
            <div className="flex flex-wrap gap-2">
              {selectedZone.adjacent.map((code) => {
                const zone = gardenMapZones.find((item) => item.code === code);

                return zone ? (
                  <Link
                    key={code}
                    className="rounded-md border border-stone-200 bg-white px-3 py-2 text-sm font-semibold text-stone-700"
                    href={zoneHref(zone)}
                  >
                    {zone.name}
                  </Link>
                ) : null;
              })}
            </div>
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-2">
          <Link
            className="rounded-md bg-emerald-700 px-3 py-2 text-center text-sm font-semibold text-white"
            href="/garden"
          >
            Garden records
          </Link>
          <Link
            className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-center text-sm font-semibold text-emerald-800"
            href="/photos"
          >
            Photos
          </Link>
        </div>
      </section>
    </div>
  );
}

function MapFrame({
  children,
  compact = false,
}: {
  children: ReactNode;
  compact?: boolean;
}) {
  return (
    <div
      className={[
        "overflow-x-auto overflow-y-hidden rounded-lg border border-stone-200 bg-[#fbfaf5] shadow-sm",
      ].join(" ")}
    >
      <div
        className={[
          "w-full",
          compact ? "aspect-[1.65/1] min-w-[420px]" : "aspect-[1.9/1] min-w-[660px]",
        ].join(" ")}
      >
        {children}
      </div>
    </div>
  );
}

function GardenMapSvg({
  selectedZone,
  viewBox = "0 110 1000 430",
}: {
  selectedZone: GardenMapZone;
  viewBox?: string;
}) {
  return (
    <svg
      aria-label="The Old Rectory garden survey map"
      className="h-full w-full"
      role="img"
      viewBox={viewBox}
    >
      <rect fill="#fbfaf5" height="540" width="1000" x="0" y="0" />
      <SurveyGrid />
      <path
        d="M25 374 L78 338 L140 318 L238 302 L342 284 L466 256 L590 228 L684 222 L720 178 L816 132 L892 190 L925 304 L964 430 L914 500 L706 466 L552 438 L392 404 L244 394 L100 420 L30 400 Z"
        fill="#f8f7ef"
        stroke="#78716c"
        strokeLinejoin="round"
        strokeWidth="3"
      />
      <path
        d="M30 404 C180 385 316 390 436 408 C550 426 706 480 920 500"
        fill="none"
        stroke="#a8a29e"
        strokeDasharray="8 8"
        strokeWidth="3"
      />
      <path
        d="M365 320 C428 290 498 318 580 300 C660 282 734 294 830 320"
        fill="none"
        stroke="#a8a29e"
        strokeWidth="2"
      />
      {gardenMapZones.map((zone) => (
        <a key={zone.code} href={zoneHref(zone)}>
          <path
            aria-label={zone.name}
            className={[
              zone.fillClass,
              "cursor-pointer stroke-stone-600 transition-colors",
              zone.code === selectedZone.code ? "stroke-[4]" : "stroke-2",
            ].join(" ")}
            d={zone.path}
            opacity={zone.code === selectedZone.code ? 0.88 : 0.66}
          />
        </a>
      ))}
      {gardenMapFeatures.map((feature) => (
        <path
          key={feature.label}
          d={feature.path}
          fill="#f5f5f4"
          stroke="#57534e"
          strokeWidth="2"
        >
          <title>{feature.label}</title>
        </path>
      ))}
      {gardenMapZones.map((zone) => (
        <a key={zone.code} href={zoneHref(zone)}>
          <MapLabel selected={zone.code === selectedZone.code} zone={zone} />
        </a>
      ))}
      <text fill="#44403c" fontSize="18" fontWeight="700" x="622" y="340">
        House
      </text>
      <text fill="#57534e" fontSize="11" fontWeight="700" textAnchor="middle" x="386" y="304">
        Raised beds
      </text>
      <NorthArrow />
    </svg>
  );
}

function MapLabel({
  selected,
  zone,
}: {
  selected: boolean;
  zone: GardenMapZone;
}) {
  const lineHeight = 14;
  const height = zone.mapLabel.lines.length * lineHeight + 10;

  return (
    <g>
      <rect
        fill={selected ? "#047857" : "#ffffff"}
        height={height}
        opacity={selected ? 0.96 : 0.92}
        rx="7"
        stroke={selected ? "#064e3b" : "#57534e"}
        strokeWidth="2"
        width={zone.mapLabel.width}
        x={zone.labelPosition.x - zone.mapLabel.width / 2}
        y={zone.labelPosition.y - height / 2}
      />
      <text
        dominantBaseline="middle"
        fill={selected ? "#ffffff" : "#1c1917"}
        fontSize="12"
        fontWeight="800"
        textAnchor="middle"
        x={zone.labelPosition.x}
      >
        {zone.mapLabel.lines.map((line, index) => (
          <tspan
            key={line}
            x={zone.labelPosition.x}
            y={
              zone.labelPosition.y +
              (index - (zone.mapLabel.lines.length - 1) / 2) * lineHeight
            }
          >
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
}

function SurveyGrid() {
  return (
    <g stroke="#d6d3d1" strokeWidth="1">
      {[120, 240, 360, 480, 600, 720, 840, 960].map((x) => (
        <line key={`x-${x}`} x1={x} x2={x} y1="110" y2="540" />
      ))}
      {[180, 260, 340, 420, 500].map((y) => (
        <line key={`y-${y}`} x1="0" x2="1000" y1={y} y2={y} />
      ))}
    </g>
  );
}

function NorthArrow() {
  return (
    <g transform="translate(940 150)">
      <path d="M0 -38 L15 35 L0 24 L-15 35 Z" fill="#44403c" />
      <circle cx="0" cy="0" fill="none" r="27" stroke="#78716c" strokeWidth="2" />
      <text
        dominantBaseline="middle"
        fill="#ffffff"
        fontSize="18"
        fontWeight="800"
        textAnchor="middle"
        x="0"
        y="4"
      >
        N
      </text>
    </g>
  );
}

function zoneHref(zone: GardenMapZone) {
  return `/garden/map?zone=${zone.code}`;
}
