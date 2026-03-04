// lib/mock.ts
// =============================================================
// CENTRAL MOCK DATA — single source of truth for this project.
// When ready for real data, replace this file.
// =============================================================

export type QuestStatus = "open" | "planned" | "in_progress" | "completed";

export type Result = {
  id: string;
  name: string;
  rating: number | string;
  description: string;
  comment: string;
  createdAt: number;
};

export type Quest = {
  id: string;
  name: string;
  description: string;
  duration: number;
  isRecurring: boolean;
  status: QuestStatus;
  skill: string;
  subSkills: { id: string; percentage: number }[];
  results: Result[];
  plannedDateTime?: number;
  pinned?: boolean;
};

export type SubSkill = {
  id: string;
  name: string;
  description: string;
  skill: string;
  aspect: string;
  level: number;
  quests: { id: string; percentage: number }[];
};

export type Aspect = {
  id: string;
  name: string;
  description: string;
  completionPercentage: number;
};

export type Skill = {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  completionPercentage: number;
  targetPercentage: number;
  aspects: Aspect[];
  subSkills: SubSkill[];
  nextQuest: string;
};

export const MOCK_SKILLS: Skill[] = [
  {
    id: "skill/guitar",
    name: "Gitara",
    icon: "Music",
    color: "#a855f7",
    completionPercentage: 62,
    targetPercentage: 80,
    nextQuest: "Hammer-on practice — 15 min",
    description: "Technika, rytmika, teoria",
    aspects: [
      { id: "asp/git/1", name: "Technika", description: "", completionPercentage: 70 },
      { id: "asp/git/2", name: "Rytmika", description: "", completionPercentage: 55 },
      { id: "asp/git/3", name: "Teoria", description: "", completionPercentage: 60 },
      { id: "asp/git/4", name: "Słuch", description: "", completionPercentage: 65 },
      { id: "asp/git/5", name: "Artykulacja", description: "", completionPercentage: 58 },
    ],
    subSkills: [
      { id: "ss/git/1", name: "Hammer-on", description: "", skill: "skill/guitar", aspect: "asp/git/1", level: 2, quests: [{ id: "q/git/1", percentage: 100 }] },
      { id: "ss/git/2", name: "Sweep picking", description: "", skill: "skill/guitar", aspect: "asp/git/1", level: 1, quests: [{ id: "q/git/2", percentage: 100 }] },
      { id: "ss/git/3", name: "Strumming", description: "", skill: "skill/guitar", aspect: "asp/git/2", level: 3, quests: [{ id: "q/git/3", percentage: 100 }] },
    ],
  },
  {
    id: "skill/vocals",
    name: "Wokal",
    icon: "Mic",
    color: "#ec4899",
    completionPercentage: 45,
    targetPercentage: 75,
    nextQuest: "Belting — 20 min warm-up",
    description: "Emisja, intonacja, scream",
    aspects: [
      { id: "asp/voc/1", name: "Emisja", description: "", completionPercentage: 50 },
      { id: "asp/voc/2", name: "Intonacja", description: "", completionPercentage: 40 },
      { id: "asp/voc/3", name: "Oddech", description: "", completionPercentage: 55 },
      { id: "asp/voc/4", name: "Artykulacja", description: "", completionPercentage: 35 },
      { id: "asp/voc/5", name: "Scream", description: "", completionPercentage: 30 },
    ],
    subSkills: [
      { id: "ss/voc/1", name: "Belting", description: "", skill: "skill/vocals", aspect: "asp/voc/1", level: 1, quests: [{ id: "q/voc/1", percentage: 100 }] },
      { id: "ss/voc/2", name: "Mixed voice", description: "", skill: "skill/vocals", aspect: "asp/voc/1", level: 1, quests: [{ id: "q/voc/2", percentage: 100 }] },
    ],
  },
  {
    id: "skill/production",
    name: "Produkcja",
    icon: "Disc",
    color: "#06b6d4",
    completionPercentage: 71,
    targetPercentage: 85,
    nextQuest: "EQ session — Ableton",
    description: "DAW, miks, mastering",
    aspects: [
      { id: "asp/pro/1", name: "DAW", description: "", completionPercentage: 80 },
      { id: "asp/pro/2", name: "Miks", description: "", completionPercentage: 70 },
      { id: "asp/pro/3", name: "Master", description: "", completionPercentage: 60 },
      { id: "asp/pro/4", name: "Sound Design", description: "", completionPercentage: 75 },
      { id: "asp/pro/5", name: "Teoria", description: "", completionPercentage: 65 },
    ],
    subSkills: [],
  },
  {
    id: "skill/songwriting",
    name: "Songwriting",
    icon: "PenTool",
    color: "#f59e0b",
    completionPercentage: 38,
    targetPercentage: 70,
    nextQuest: "Hook writing — 30 min",
    description: "Teksty, flow, melodia",
    aspects: [
      { id: "asp/son/1", name: "Teksty", description: "", completionPercentage: 45 },
      { id: "asp/son/2", name: "Storytelling", description: "", completionPercentage: 35 },
      { id: "asp/son/3", name: "Flow", description: "", completionPercentage: 40 },
      { id: "asp/son/4", name: "Struktura", description: "", completionPercentage: 30 },
      { id: "asp/son/5", name: "Melodia", description: "", completionPercentage: 38 },
    ],
    subSkills: [],
  },
  {
    id: "skill/cs2",
    name: "Counter-Strike",
    icon: "Crosshair",
    color: "#f97316",
    completionPercentage: 64,
    targetPercentage: 80,
    nextQuest: "Aim training — 1000 fragów",
    description: "Aim, movement, utility",
    aspects: [
      { id: "asp/cs/1", name: "Aim", description: "", completionPercentage: 60 },
      { id: "asp/cs/2", name: "Movement", description: "", completionPercentage: 70 },
      { id: "asp/cs/3", name: "Utility", description: "", completionPercentage: 50 },
      { id: "asp/cs/4", name: "Gamesense", description: "", completionPercentage: 65 },
      { id: "asp/cs/5", name: "Komunikacja", description: "", completionPercentage: 75 },
    ],
    subSkills: [],
  },
];

/** Helper: timestamp for today/yesterday/tomorrow at a given hour */
function dayAt(offsetDays: number, hour: number): number {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  d.setHours(hour, 0, 0, 0);
  return d.getTime();
}

export const MOCK_QUESTS: Quest[] = [
  { id: "q/git/1", name: "Hammer-on practice", description: "Legato na 1-2 strunie", duration: 15 * 60, isRecurring: true, status: "in_progress", skill: "skill/guitar", subSkills: [{ id: "ss/git/1", percentage: 100 }], results: [], plannedDateTime: dayAt(0, 10) },
  { id: "q/git/2", name: "Sweep picking — arpeggio", description: "3-strunowe arpeggio", duration: 20 * 60, isRecurring: true, status: "planned", skill: "skill/guitar", subSkills: [{ id: "ss/git/2", percentage: 100 }], results: [], plannedDateTime: dayAt(1, 11) },
  { id: "q/git/3", name: "Strumming pattern #4", description: "Synkopy na 16tkach", duration: 15 * 60, isRecurring: true, status: "open", skill: "skill/guitar", subSkills: [{ id: "ss/git/3", percentage: 100 }], results: [] },
  { id: "q/voc/1", name: "Belting warm-up", description: "Rozgrzewka przed beltingiem", duration: 20 * 60, isRecurring: true, status: "planned", skill: "skill/vocals", subSkills: [{ id: "ss/voc/1", percentage: 100 }], results: [], plannedDateTime: dayAt(0, 14) },
  { id: "q/voc/2", name: "Mixed voice — pasaż", description: "Przejście chest→head", duration: 25 * 60, isRecurring: true, status: "open", skill: "skill/vocals", subSkills: [{ id: "ss/voc/2", percentage: 100 }], results: [], plannedDateTime: dayAt(2, 9) },
  { id: "q/cs/1", name: "Aim training — aimbotz", description: "1000 fragów w aimbotz", duration: 30 * 60, isRecurring: true, status: "in_progress", skill: "skill/cs2", subSkills: [], results: [], plannedDateTime: dayAt(0, 20) },
  { id: "q/pro/1", name: "EQ session", description: "Nauka EQ na gotowym miksie", duration: 45 * 60, isRecurring: false, status: "completed", skill: "skill/production", subSkills: [], results: [], plannedDateTime: dayAt(-1, 16) },
];

export const MOCK_WORKOUT_TODAY = {
  name: "Pull B",
  exercises: [
    { name: "Pull-ups", sets: 4, reps: 8, lastWeight: "0kg", todayWeight: "5kg", pr: false },
    { name: "T-Bar Row", sets: 4, reps: 10, lastWeight: "80kg", todayWeight: "82.5kg", pr: false },
    { name: "Hammer Curl", sets: 3, reps: 12, lastWeight: "20kg", todayWeight: "22kg", pr: true },
    { name: "Shrugs", sets: 3, reps: 15, lastWeight: "100kg", todayWeight: "105kg", pr: false },
  ],
};

export const MOCK_MEALS_TODAY = [
  { name: "Breakfast Power Bowl", protein: 45, carbs: 60, kcal: 555 },
  { name: "Chicken & Rice", protein: 50, carbs: 80, kcal: 592 },
  { name: "Evening Salmon", protein: 40, carbs: 30, kcal: 505 },
];

export const MOCK_USER = {
  id: "user/atlas",
  name: "Atlas",
};
