export type GardenMapZoneCode =
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G"
  | "H"
  | "I";

export type GardenMapZone = {
  adjacent: GardenMapZoneCode[];
  code: GardenMapZoneCode;
  detailViewBox: string;
  fillClass: string;
  labelPosition: { x: number; y: number };
  path: string;
  provisionalName: string;
  recordFocus: string[];
  surveyCues: string;
};

export const gardenMapZones: GardenMapZone[] = [
  {
    adjacent: ["B"],
    code: "A",
    detailViewBox: "0 250 320 240",
    fillClass: "fill-lime-100 hover:fill-lime-200",
    labelPosition: { x: 130, y: 365 },
    path: "M35 370 L70 344 L128 324 L210 308 L260 334 L250 392 L120 418 L35 398 Z",
    provisionalName: "West End",
    recordFocus: ["boundary trees", "rough grass", "west approach photos"],
    surveyCues:
      "Western end of the survey with the long south boundary, rough grass notation and tree canopies.",
  },
  {
    adjacent: ["A", "C", "E"],
    code: "B",
    detailViewBox: "170 245 270 230",
    fillClass: "fill-sky-100 hover:fill-sky-200",
    labelPosition: { x: 315, y: 350 },
    path: "M230 304 C278 292 324 284 366 292 C378 318 376 348 358 374 C330 392 292 398 250 392 C250 366 254 338 260 334 Z",
    provisionalName: "Soft Fruits",
    recordFocus: ["soft fruit", "tree belt", "west beds"],
    surveyCues:
      "Middle-west garden between the West End and the raised-bed pinch point, with several mature trees.",
  },
  {
    adjacent: ["B", "E", "I"],
    code: "C",
    detailViewBox: "350 255 170 175",
    fillClass: "fill-amber-100 hover:fill-amber-200",
    labelPosition: { x: 458, y: 333 },
    path: "M366 292 C406 286 448 284 474 300 C464 326 436 350 358 374 C376 348 378 318 366 292 Z",
    provisionalName: "Potting Shed Corner",
    recordFocus: ["raised beds", "cross path", "central transition"],
    surveyCues:
      "Central corner around the raised beds and path junction before the garden opens into the main lawn.",
  },
  {
    adjacent: ["E", "G", "I"],
    code: "D",
    detailViewBox: "500 190 230 160",
    fillClass: "fill-rose-100 hover:fill-rose-200",
    labelPosition: { x: 618, y: 275 },
    path: "M535 250 C580 234 636 224 684 224 C704 238 716 260 710 280 C672 294 612 294 575 282 C562 268 548 258 535 250 Z",
    provisionalName: "Kidney Border",
    recordFocus: ["kidney border", "upper beds", "north house-side planting"],
    surveyCues:
      "Curving border north-west of the house, wrapping between the patio, main lawn and Coach House approach.",
  },
  {
    adjacent: ["B", "C", "D", "F", "I"],
    code: "E",
    detailViewBox: "380 295 310 190",
    fillClass: "fill-emerald-100 hover:fill-emerald-200",
    labelPosition: { x: 565, y: 382 },
    path: "M358 374 C430 364 486 332 548 314 C594 300 642 308 668 326 C684 356 680 386 660 405 C620 430 562 436 520 420 C478 405 435 384 392 404 C376 396 364 386 358 374 Z",
    provisionalName: "Main Lawn",
    recordFocus: ["main lawn", "house-side paths", "flower bed edges"],
    surveyCues:
      "Main lawn and swept path/border shapes west and south-west of The Old Rectory.",
  },
  {
    adjacent: ["E", "G", "H"],
    code: "F",
    detailViewBox: "615 285 220 220",
    fillClass: "fill-teal-100 hover:fill-teal-200",
    labelPosition: { x: 740, y: 420 },
    path: "M668 326 L760 320 L820 372 L804 456 L706 464 L678 400 Z",
    provisionalName: "Ericaceous Border",
    recordFocus: ["ericaceous planting", "front flower beds", "path edges"],
    surveyCues:
      "South and south-east house-side beds, lawn edges and the curved path below the house.",
  },
  {
    adjacent: ["D", "F", "H"],
    code: "G",
    detailViewBox: "680 130 265 245",
    fillClass: "fill-violet-100 hover:fill-violet-200",
    labelPosition: { x: 805, y: 270 },
    path: "M710 180 L812 132 L890 190 L920 298 L842 342 L760 320 L710 280 Z",
    provisionalName: "Coach House",
    recordFocus: ["coach house", "hardstanding", "service yard"],
    surveyCues:
      "North-east hardstanding and Coach House zone, including gravel and kennel/store notes from the survey.",
  },
  {
    adjacent: ["F", "G"],
    code: "H",
    detailViewBox: "735 315 230 190",
    fillClass: "fill-orange-100 hover:fill-orange-200",
    labelPosition: { x: 866, y: 410 },
    path: "M820 372 L842 342 L930 360 L960 430 L912 496 L804 456 Z",
    provisionalName: "Oak Drive",
    recordFocus: ["oak drive", "drive entrance", "boundary shade"],
    surveyCues:
      "Dense south-east tree group and approach/boundary zone where the drive meets the wider garden.",
  },
  {
    adjacent: ["C", "D", "E"],
    code: "I",
    detailViewBox: "445 230 155 125",
    fillClass: "fill-stone-100 hover:fill-stone-200",
    labelPosition: { x: 520, y: 288 },
    path: "M470 268 L535 250 L575 282 L526 306 L475 300 Z",
    provisionalName: "Patio",
    recordFocus: ["patio pots", "seating", "house-side photos"],
    surveyCues:
      "Pentagon-shaped patio between Potting Shed Corner and the Kidney Border, immediately west of the house.",
  },
];

export const gardenMapFeatures = [
  {
    label: "The Old Rectory",
    path: "M615 286 L708 286 L708 378 L645 388 L598 346 Z",
  },
  {
    label: "Coach House",
    path: "M802 190 L880 220 L902 284 L818 298 L780 236 Z",
  },
  {
    label: "Raised beds",
    path: "M365 310 L408 310 L408 350 L365 350 Z",
  },
] as const;

export function normaliseGardenMapZone(value?: string): GardenMapZone {
  return (
    gardenMapZones.find((zone) => zone.code === value?.toUpperCase()) ??
    gardenMapZones[0]
  );
}
