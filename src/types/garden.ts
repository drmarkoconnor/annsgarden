export type TaskStatus =
  | "not_started"
  | "done"
  | "partial"
  | "postponed"
  | "skipped"
  | "not_applicable"
  | "overdue";

export type TaskSection = "this_month" | "overdue" | "upcoming" | "history";

export type TaskPriority = "low" | "medium" | "high";

export type TimingWindow =
  | "early_month"
  | "mid_month"
  | "late_month"
  | "all_month"
  | "specific_date";

export type PlantHealthStatus =
  | "thriving"
  | "okay"
  | "needs_attention"
  | "struggling"
  | "removed_dead"
  | "unknown";

export type GardenArea = {
  id: string;
  name: string;
  description: string;
  sunlight: string;
  soil: string;
  drainage: string;
  microclimate: string;
  plantCount: number;
  activeTaskCount: number;
};

export type Plant = {
  id: string;
  commonName: string;
  latinName?: string;
  cultivar?: string;
  plantType: string;
  areaId?: string;
  datePlanted?: string;
  expectedHeight?: string;
  expectedSpread?: string;
  pruningNotes?: string;
  wateringNotes?: string;
  feedingNotes?: string;
  soilPreference?: string;
  sunPreference?: string;
  pestDiseaseRisks?: string;
  floweringPeriod?: string;
  fruitingPeriod?: string;
  healthStatus: PlantHealthStatus;
  notes: string;
  isUnknown?: boolean;
  status?: "active" | "removed" | "dead" | "unknown";
  archivedAt?: string | null;
};

export type GardenTask = {
  id: string;
  instanceId?: string;
  taskId?: string;
  title: string;
  description: string;
  whyItMatters: string;
  category: string;
  priority: TaskPriority;
  status: TaskStatus;
  storedStatus?: TaskStatus;
  section: TaskSection;
  month: string;
  timingWindow: TimingWindow;
  dueLabel: string;
  areaId?: string;
  plantId?: string;
  assignedTo?: string;
  assignedToId?: string;
  estimatedMinutes?: number;
  toolsNeeded?: string[];
  weatherWarning?: string;
  safetyWarning?: string;
  wildlifeWarning?: string;
  notes?: string;
  completedBy?: string;
  completedById?: string;
  completedDate?: string;
  dueStartDate?: string;
  dueEndDate?: string;
  postponedUntil?: string;
};

export type DiaryEntry = {
  id: string;
  title: string;
  quickNote: string;
  entryDate: string;
  createdBy: "Ann" | "Mark" | "Alicia";
  areaId?: string;
  plantId?: string;
  taskId?: string;
  tags: string[];
  whatWentWell?: string;
  whatToTryNext?: string;
};

export type GardenPhoto = {
  id: string;
  caption: string;
  takenAt: string;
  uploadedBy: "Ann" | "Mark" | "Alicia";
  areaId?: string;
  plantId?: string;
  taskId?: string;
  diaryEntryId?: string;
  tags: string[];
  samePositionNote?: string;
  comparisonGroupId?: string;
  placeholderTone: "leaf" | "rose" | "shade" | "orchard" | "soil";
};
