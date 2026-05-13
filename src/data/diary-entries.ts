import type { DiaryEntry } from "@/types/garden";

export const diaryEntries: DiaryEntry[] = [
  {
    id: "diary-south-border-gaps",
    title: "South-facing border has a quiet patch",
    quickNote:
      "Gap after the tulips near the wall. Add something light and upright for late May.",
    entryDate: "2026-05-12",
    createdBy: "Ann",
    areaId: "south-facing-borders",
    taskId: "record-flowering-gaps",
    tags: ["flowering", "lesson learned", "planting"],
    whatToTryNext: "Consider alliums or early summer perennials for this position.",
  },
  {
    id: "diary-box-check",
    title: "Box needs another look",
    quickNote:
      "Alicia saw a few chewed leaves by the driveway. No obvious webbing yet.",
    entryDate: "2026-05-10",
    createdBy: "Alicia",
    areaId: "driveway-borders",
    plantId: "box-driveway",
    taskId: "check-box-caterpillar",
    tags: ["pest", "inspection"],
  },
  {
    id: "diary-ericaceous-mulch",
    title: "Mulch started",
    quickNote:
      "Rhododendron side has been mulched. Need one more bag for the front edge.",
    entryDate: "2026-05-08",
    createdBy: "Mark",
    areaId: "ericaceous-border-south",
    plantId: "rhododendron-south",
    taskId: "mulch-ericaceous-border",
    tags: ["soil", "mulching"],
    whatWentWell: "Soil underneath was still cool and damp.",
  },
];
