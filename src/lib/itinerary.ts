import type { ActivityType } from "@/types";

/** How each kind of step is named, for screen readers and the icon's tooltip. */
export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  ARRIVAL: "Arrival",
  TRANSFER: "Transfer",
  CHECK_IN: "Check-in",
  SIGHTSEEING: "Sightseeing",
  ACTIVITY: "Activity",
  MEAL: "Meal",
  FREE_TIME: "Free time",
  CHECK_OUT: "Check-out",
  DEPARTURE: "Departure",
  OTHER: "Other",
};
