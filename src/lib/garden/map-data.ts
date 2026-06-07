export type GardenMapZoneCode = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H";

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
    provisionalName: "Area A",
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
    path: "M230 304 L330 282 L404 292 L430 342 L392 404 L250 392 L260 334 Z",
    provisionalName: "Area B",
    recordFocus: ["middle lawn", "tree belt", "west beds"],
    surveyCues:
      "Middle-west garden between the rough grass and the potting-shed pinch point, with several mature trees.",
  },
  {
    adjacent: ["B", "D", "E"],
    code: "C",
    detailViewBox: "340 225 190 230",
    fillClass: "fill-amber-100 hover:fill-amber-200",
    labelPosition: { x: 458, y: 333 },
    path: "M404 292 L456 258 L510 260 L530 320 L492 398 L392 404 L430 342 Z",
    provisionalName: "Area C",
    recordFocus: ["potting shed", "cross path", "central transition"],
    surveyCues:
      "Narrow central section around the potting shed, path junction and gateway-like transition.",
  },
  {
    adjacent: ["C", "E", "G"],
    code: "D",
    detailViewBox: "470 175 230 180",
    fillClass: "fill-rose-100 hover:fill-rose-200",
    labelPosition: { x: 610, y: 275 },
    path: "M510 250 L598 232 L684 224 L710 280 L668 326 L530 320 Z",
    provisionalName: "Area D",
    recordFocus: ["patio", "upper beds", "north house-side planting"],
    surveyCues:
      "Patio and bed line north-west of the house, immediately before the garden opens around the building.",
  },
  {
    adjacent: ["B", "C", "D", "F"],
    code: "E",
    detailViewBox: "390 300 290 190",
    fillClass: "fill-emerald-100 hover:fill-emerald-200",
    labelPosition: { x: 565, y: 382 },
    path: "M530 320 L668 326 L678 400 L574 436 L492 398 Z",
    provisionalName: "Area E",
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
    provisionalName: "Area F",
    recordFocus: ["south lawn", "front flower beds", "path edges"],
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
    provisionalName: "Area G",
    recordFocus: ["drive court", "garage", "service yard"],
    surveyCues:
      "North-east hardstanding and outbuilding zone marked with garage, gravel and kennel/store notes.",
  },
  {
    adjacent: ["F", "G"],
    code: "H",
    detailViewBox: "735 315 230 190",
    fillClass: "fill-orange-100 hover:fill-orange-200",
    labelPosition: { x: 866, y: 410 },
    path: "M820 372 L842 342 L930 360 L960 430 L912 496 L804 456 Z",
    provisionalName: "Area H",
    recordFocus: ["south-east trees", "drive entrance", "boundary shade"],
    surveyCues:
      "Dense south-east tree group and approach/boundary zone where the drive meets the wider garden.",
  },
];

export const gardenMapFeatures = [
  {
    label: "The Old Rectory",
    path: "M615 286 L708 286 L708 378 L645 388 L598 346 Z",
  },
  {
    label: "Garage",
    path: "M802 190 L880 220 L902 284 L818 298 L780 236 Z",
  },
  {
    label: "Potting shed",
    path: "M365 310 L408 310 L408 350 L365 350 Z",
  },
  {
    label: "Patio",
    path: "M470 268 L535 250 L575 282 L526 306 L475 300 Z",
  },
] as const;

export function normaliseGardenMapZone(value?: string): GardenMapZone {
  return (
    gardenMapZones.find((zone) => zone.code === value?.toUpperCase()) ??
    gardenMapZones[0]
  );
}
