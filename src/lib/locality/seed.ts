import type { School } from "./types";

export const DISTRICT_NAME = "Mountain House Unified School District";

export const SCHOOLS: School[] = [
  { id: "bethany", name: "Bethany School", gradeRange: "K–8" },
  { id: "hansen", name: "Hansen School", gradeRange: "K–8" },
  { id: "costa", name: "Costa School", gradeRange: "K–8" },
  { id: "questa", name: "Questa School", gradeRange: "K–8" },
  { id: "wicklund", name: "Wicklund School", gradeRange: "K–8" },
  { id: "altamont", name: "Altamont School", gradeRange: "K–8" },
  { id: "cordes", name: "Cordes School", gradeRange: "K–8" },
  { id: "lammersville", name: "Lammersville School", gradeRange: "K–8" },
  { id: "mh-high", name: "Mountain House High School", gradeRange: "9–12" },
];

export function circleIdForSchool(schoolId: string): string {
  return `circle-${schoolId}`;
}
