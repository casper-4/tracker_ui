// lib/mock.ts
// =============================================================
// CENTRAL MOCK DATA — single source of truth for this project.
// When ready for real data, replace this file.
// =============================================================

export type QuestStatus = "open" | "planned" | "in_progress" | "completed";

export const MOCK_STATUS_COLORS: Record<QuestStatus, string> = {
  open: "#555555",
  planned: "#f59e0b",
  in_progress: "#38bdf8",
  completed: "#22c55e",
};

export type StatusChangeEntry = {
  status: QuestStatus;
  timestamp: number;
};

export type Attachment = {
  id: string;
  type: "photo" | "video" | "file";
  name: string;
};

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
  actualDuration?: number;
  comment?: string;
  attachments?: Attachment[];
  statusChangelog?: StatusChangeEntry[];
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
      {
        id: "asp/git/1",
        name: "Technika",
        description: "",
        completionPercentage: 70,
      },
      {
        id: "asp/git/2",
        name: "Rytmika",
        description: "",
        completionPercentage: 55,
      },
      {
        id: "asp/git/3",
        name: "Teoria",
        description: "",
        completionPercentage: 60,
      },
      {
        id: "asp/git/4",
        name: "Słuch",
        description: "",
        completionPercentage: 65,
      },
      {
        id: "asp/git/5",
        name: "Artykulacja",
        description: "",
        completionPercentage: 58,
      },
    ],
    subSkills: [
      {
        id: "ss/git/1",
        name: "Hammer-on",
        description: "",
        skill: "skill/guitar",
        aspect: "asp/git/1",
        level: 2,
        quests: [{ id: "q/git/1", percentage: 100 }],
      },
      {
        id: "ss/git/2",
        name: "Sweep picking",
        description: "",
        skill: "skill/guitar",
        aspect: "asp/git/1",
        level: 1,
        quests: [{ id: "q/git/2", percentage: 100 }],
      },
      {
        id: "ss/git/3",
        name: "Strumming",
        description: "",
        skill: "skill/guitar",
        aspect: "asp/git/2",
        level: 3,
        quests: [{ id: "q/git/3", percentage: 100 }],
      },
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
      {
        id: "asp/voc/1",
        name: "Emisja",
        description: "",
        completionPercentage: 50,
      },
      {
        id: "asp/voc/2",
        name: "Intonacja",
        description: "",
        completionPercentage: 40,
      },
      {
        id: "asp/voc/3",
        name: "Oddech",
        description: "",
        completionPercentage: 55,
      },
      {
        id: "asp/voc/4",
        name: "Artykulacja",
        description: "",
        completionPercentage: 35,
      },
      {
        id: "asp/voc/5",
        name: "Scream",
        description: "",
        completionPercentage: 30,
      },
    ],
    subSkills: [
      {
        id: "ss/voc/1",
        name: "Belting",
        description: "",
        skill: "skill/vocals",
        aspect: "asp/voc/1",
        level: 1,
        quests: [{ id: "q/voc/1", percentage: 100 }],
      },
      {
        id: "ss/voc/2",
        name: "Mixed voice",
        description: "",
        skill: "skill/vocals",
        aspect: "asp/voc/1",
        level: 1,
        quests: [{ id: "q/voc/2", percentage: 100 }],
      },
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
      {
        id: "asp/pro/1",
        name: "DAW",
        description: "",
        completionPercentage: 80,
      },
      {
        id: "asp/pro/2",
        name: "Miks",
        description: "",
        completionPercentage: 70,
      },
      {
        id: "asp/pro/3",
        name: "Master",
        description: "",
        completionPercentage: 60,
      },
      {
        id: "asp/pro/4",
        name: "Sound Design",
        description: "",
        completionPercentage: 75,
      },
      {
        id: "asp/pro/5",
        name: "Teoria",
        description: "",
        completionPercentage: 65,
      },
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
      {
        id: "asp/son/1",
        name: "Teksty",
        description: "",
        completionPercentage: 45,
      },
      {
        id: "asp/son/2",
        name: "Storytelling",
        description: "",
        completionPercentage: 35,
      },
      {
        id: "asp/son/3",
        name: "Flow",
        description: "",
        completionPercentage: 40,
      },
      {
        id: "asp/son/4",
        name: "Struktura",
        description: "",
        completionPercentage: 30,
      },
      {
        id: "asp/son/5",
        name: "Melodia",
        description: "",
        completionPercentage: 38,
      },
    ],
    subSkills: [],
  },
  {
    id: "skill/cs2",
    name: "Counter Strike",
    icon: "Crosshair",
    color: "#f97316",
    completionPercentage: 64,
    targetPercentage: 80,
    nextQuest: "Aim training — 1000 fragów",
    description: "Aim, movement, utility",
    aspects: [
      {
        id: "asp/cs/1",
        name: "Aim",
        description: "",
        completionPercentage: 60,
      },
      {
        id: "asp/cs/2",
        name: "Movement",
        description: "",
        completionPercentage: 70,
      },
      {
        id: "asp/cs/3",
        name: "Utility",
        description: "",
        completionPercentage: 50,
      },
      {
        id: "asp/cs/4",
        name: "Gamesense",
        description: "",
        completionPercentage: 65,
      },
      {
        id: "asp/cs/5",
        name: "Komunikacja",
        description: "",
        completionPercentage: 75,
      },
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
  {
    id: "q/git/1",
    name: "Hammer-on practice",
    description: "Legato na 1-2 strunie",
    duration: 15 * 60,
    isRecurring: true,
    status: "in_progress",
    skill: "skill/guitar",
    subSkills: [{ id: "ss/git/1", percentage: 100 }],
    results: [],
    plannedDateTime: dayAt(0, 10),
  },
  {
    id: "q/git/2",
    name: "Sweep picking — arpeggio",
    description: "3-strunowe arpeggio",
    duration: 20 * 60,
    isRecurring: true,
    status: "planned",
    skill: "skill/guitar",
    subSkills: [{ id: "ss/git/2", percentage: 100 }],
    results: [],
    plannedDateTime: dayAt(1, 11),
  },
  {
    id: "q/git/3",
    name: "Strumming pattern #4",
    description: "Synkopy na 16tkach",
    duration: 15 * 60,
    isRecurring: true,
    status: "open",
    skill: "skill/guitar",
    subSkills: [{ id: "ss/git/3", percentage: 100 }],
    results: [],
  },
  {
    id: "q/voc/1",
    name: "Belting warm-up",
    description: "Rozgrzewka przed beltingiem",
    duration: 20 * 60,
    isRecurring: true,
    status: "planned",
    skill: "skill/vocals",
    subSkills: [{ id: "ss/voc/1", percentage: 100 }],
    results: [],
    plannedDateTime: dayAt(0, 14),
  },
  {
    id: "q/voc/2",
    name: "Mixed voice — pasaż",
    description: "Przejście chest→head",
    duration: 25 * 60,
    isRecurring: true,
    status: "open",
    skill: "skill/vocals",
    subSkills: [{ id: "ss/voc/2", percentage: 100 }],
    results: [],
    plannedDateTime: dayAt(2, 9),
  },
  {
    id: "q/cs/1",
    name: "Aim training — aimbotz",
    description: "1000 fragów w aimbotz",
    duration: 30 * 60,
    isRecurring: true,
    status: "in_progress",
    skill: "skill/cs2",
    subSkills: [],
    results: [],
    plannedDateTime: dayAt(0, 20),
  },
  {
    id: "q/pro/1",
    name: "EQ session",
    description: "Nauka EQ na gotowym miksie",
    duration: 45 * 60,
    isRecurring: false,
    status: "completed",
    skill: "skill/production",
    subSkills: [],
    results: [],
    plannedDateTime: dayAt(-1, 16),
    actualDuration: 52 * 60,
    comment:
      "Dobra sesja, skupiłem się na paśmie mid. EQ na kick basie nareszcie ma sens.",
    statusChangelog: [
      { status: "open", timestamp: dayAt(-3, 10) },
      { status: "planned", timestamp: dayAt(-2, 9) },
      { status: "in_progress", timestamp: dayAt(-1, 15) },
      { status: "completed", timestamp: dayAt(-1, 17) },
    ],
  },
];

export const MOCK_WORKOUT_TODAY = {
  name: "Pull B",
  exercises: [
    {
      name: "Pull-ups",
      sets: 4,
      reps: 8,
      lastWeight: "0kg",
      todayWeight: "5kg",
      pr: false,
    },
    {
      name: "T-Bar Row",
      sets: 4,
      reps: 10,
      lastWeight: "80kg",
      todayWeight: "82.5kg",
      pr: false,
    },
    {
      name: "Hammer Curl",
      sets: 3,
      reps: 12,
      lastWeight: "20kg",
      todayWeight: "22kg",
      pr: true,
    },
    {
      name: "Shrugs",
      sets: 3,
      reps: 15,
      lastWeight: "100kg",
      todayWeight: "105kg",
      pr: false,
    },
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
  handle: "@atlas",
  bio: "Musician. Builder. Obsessive learner.",
  joinedAt: 1704067200000, // 2024-01-01
  avatarInitials: "AT",
  level: 12,
  totalXP: 4820,
  streakDays: 23,
};

export type UserSettings = {
  language: "pl" | "en";
  theme: "dark";
  notificationsEnabled: boolean;
  autoAdvanceQuests: boolean;
  showCompletedQuests: boolean;
  weekStartsOn: "monday" | "sunday";
  dailyGoalHours: number;
};

export const MOCK_USER_SETTINGS: UserSettings = {
  language: "pl",
  theme: "dark",
  notificationsEnabled: true,
  autoAdvanceQuests: false,
  showCompletedQuests: true,
  weekStartsOn: "monday",
  dailyGoalHours: 2,
};

// ─── HEALTH ──────────────────────────────────────────────────────────────────

export type SleepEntry = {
  date: string; // "YYYY-MM-DD"
  bedtime: string; // "HH:MM"
  wakeTime: string; // "HH:MM"
  totalHours: number;
  deepSleep: number; // hours
  lightSleep: number; // hours
  rem: number; // hours
  awake: number; // hours
  hrv: number; // ms
  restingHR: number; // bpm
  recoveryScore: number; // 0–100
  qualityRating: 1 | 2 | 3 | 4 | 5;
  notes?: string;
};

export const MOCK_SLEEP_LOG: SleepEntry[] = [
  {
    date: "2026-03-04",
    bedtime: "23:10",
    wakeTime: "07:05",
    totalHours: 7.9,
    deepSleep: 1.6,
    lightSleep: 3.8,
    rem: 2.1,
    awake: 0.4,
    hrv: 68,
    restingHR: 51,
    recoveryScore: 84,
    qualityRating: 4,
    notes: "Spokojny sen, brak przebudzeń",
  },
  {
    date: "2026-03-03",
    bedtime: "00:30",
    wakeTime: "07:45",
    totalHours: 7.2,
    deepSleep: 1.2,
    lightSleep: 3.4,
    rem: 2.0,
    awake: 0.6,
    hrv: 61,
    restingHR: 54,
    recoveryScore: 73,
    qualityRating: 3,
  },
  {
    date: "2026-03-02",
    bedtime: "22:45",
    wakeTime: "06:30",
    totalHours: 7.75,
    deepSleep: 1.8,
    lightSleep: 3.6,
    rem: 2.0,
    awake: 0.35,
    hrv: 74,
    restingHR: 49,
    recoveryScore: 91,
    qualityRating: 5,
    notes: "Najlepsza noc w tym tygodniu",
  },
  {
    date: "2026-03-01",
    bedtime: "01:15",
    wakeTime: "08:00",
    totalHours: 6.75,
    deepSleep: 0.9,
    lightSleep: 3.5,
    rem: 1.8,
    awake: 0.55,
    hrv: 55,
    restingHR: 57,
    recoveryScore: 62,
    qualityRating: 3,
  },
  {
    date: "2026-02-28",
    bedtime: "23:30",
    wakeTime: "06:45",
    totalHours: 7.25,
    deepSleep: 1.4,
    lightSleep: 3.3,
    rem: 2.1,
    awake: 0.45,
    hrv: 64,
    restingHR: 52,
    recoveryScore: 79,
    qualityRating: 4,
  },
  {
    date: "2026-02-27",
    bedtime: "23:00",
    wakeTime: "07:30",
    totalHours: 8.5,
    deepSleep: 2.1,
    lightSleep: 4.0,
    rem: 2.0,
    awake: 0.4,
    hrv: 79,
    restingHR: 48,
    recoveryScore: 95,
    qualityRating: 5,
    notes: "Najdłuższy sen w tygodniu",
  },
  {
    date: "2026-02-26",
    bedtime: "00:00",
    wakeTime: "07:15",
    totalHours: 7.25,
    deepSleep: 1.3,
    lightSleep: 3.5,
    rem: 1.9,
    awake: 0.55,
    hrv: 58,
    restingHR: 55,
    recoveryScore: 70,
    qualityRating: 3,
  },
  {
    date: "2026-02-25",
    bedtime: "22:30",
    wakeTime: "06:00",
    totalHours: 7.5,
    deepSleep: 1.7,
    lightSleep: 3.6,
    rem: 1.8,
    awake: 0.4,
    hrv: 70,
    restingHR: 50,
    recoveryScore: 86,
    qualityRating: 4,
  },
  {
    date: "2026-02-24",
    bedtime: "23:45",
    wakeTime: "07:00",
    totalHours: 7.25,
    deepSleep: 1.5,
    lightSleep: 3.4,
    rem: 1.9,
    awake: 0.45,
    hrv: 63,
    restingHR: 53,
    recoveryScore: 76,
    qualityRating: 4,
  },
  {
    date: "2026-02-23",
    bedtime: "01:00",
    wakeTime: "08:30",
    totalHours: 7.5,
    deepSleep: 1.1,
    lightSleep: 3.8,
    rem: 2.2,
    awake: 0.4,
    hrv: 60,
    restingHR: 56,
    recoveryScore: 68,
    qualityRating: 3,
  },
  {
    date: "2026-02-22",
    bedtime: "22:50",
    wakeTime: "06:50",
    totalHours: 8.0,
    deepSleep: 1.9,
    lightSleep: 3.8,
    rem: 1.9,
    awake: 0.4,
    hrv: 75,
    restingHR: 49,
    recoveryScore: 89,
    qualityRating: 5,
  },
  {
    date: "2026-02-21",
    bedtime: "23:20",
    wakeTime: "07:10",
    totalHours: 7.8,
    deepSleep: 1.6,
    lightSleep: 3.7,
    rem: 2.1,
    awake: 0.4,
    hrv: 67,
    restingHR: 52,
    recoveryScore: 82,
    qualityRating: 4,
  },
  {
    date: "2026-02-20",
    bedtime: "00:15",
    wakeTime: "07:30",
    totalHours: 7.25,
    deepSleep: 1.2,
    lightSleep: 3.4,
    rem: 2.0,
    awake: 0.65,
    hrv: 54,
    restingHR: 58,
    recoveryScore: 61,
    qualityRating: 2,
    notes: "Dużo przebudzeń",
  },
  {
    date: "2026-02-19",
    bedtime: "22:00",
    wakeTime: "06:30",
    totalHours: 8.5,
    deepSleep: 2.0,
    lightSleep: 4.1,
    rem: 2.1,
    awake: 0.3,
    hrv: 81,
    restingHR: 47,
    recoveryScore: 96,
    qualityRating: 5,
    notes: "Najlepszy recovery w miesiącu",
  },
];

export type RecoveryFactor = {
  label: string;
  labelKey: string;
  value: number; // 0–100
  color: string;
};

// ─── TRAINING ────────────────────────────────────────────────────────────────

export type ExerciseSet = {
  setNumber: number;
  reps: number;
  weight: number; // kg, 0 = bodyweight only
};

export type MuscleGroup = "back" | "chest" | "shoulders" | "arms" | "legs" | "core";

export type TrainingExercise = {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  sets: ExerciseSet[];
  pr?: boolean;
  notes?: string;
};

export type TrainingCategory = "push" | "pull" | "legs" | "full";

export type TrainingSession = {
  id: string;
  name: string;
  category: TrainingCategory;
  date: string; // YYYY-MM-DD
  durationMin: number;
  exercises: TrainingExercise[];
  notes?: string;
  status: "planned" | "completed";
};

export const MOCK_TRAINING_HISTORY: TrainingSession[] = [
  // ── 2026-03-04  Pull B (today — planned) ─────────────────────────────────
  {
    id: "tr/1",
    name: "Pull B",
    category: "pull",
    date: "2026-03-04",
    durationMin: 70,
    status: "planned",
    exercises: [
      {
        id: "ex/1/1",
        name: "Pull-ups",
        muscleGroup: "back",
        sets: [
          { setNumber: 1, reps: 8, weight: 5 },
          { setNumber: 2, reps: 8, weight: 5 },
          { setNumber: 3, reps: 7, weight: 5 },
          { setNumber: 4, reps: 6, weight: 5 },
        ],
        pr: true,
      },
      {
        id: "ex/1/2",
        name: "T-Bar Row",
        muscleGroup: "back",
        sets: [
          { setNumber: 1, reps: 10, weight: 82.5 },
          { setNumber: 2, reps: 10, weight: 82.5 },
          { setNumber: 3, reps: 9, weight: 82.5 },
          { setNumber: 4, reps: 8, weight: 82.5 },
        ],
      },
      {
        id: "ex/1/3",
        name: "Hammer Curl",
        muscleGroup: "arms",
        sets: [
          { setNumber: 1, reps: 12, weight: 22 },
          { setNumber: 2, reps: 12, weight: 22 },
          { setNumber: 3, reps: 10, weight: 22 },
        ],
        pr: true,
      },
      {
        id: "ex/1/4",
        name: "Shrugs",
        muscleGroup: "back",
        sets: [
          { setNumber: 1, reps: 15, weight: 105 },
          { setNumber: 2, reps: 15, weight: 105 },
          { setNumber: 3, reps: 12, weight: 105 },
        ],
      },
    ],
    notes: "Zaplanowany — dzisiaj Pull B. Zwiększam obciążenie na Hammer Curl.",
  },
  // ── 2026-03-03  Push B ────────────────────────────────────────────────────
  {
    id: "tr/2",
    name: "Push B",
    category: "push",
    date: "2026-03-03",
    durationMin: 65,
    status: "completed",
    exercises: [
      {
        id: "ex/2/1",
        name: "Incline Bench Press",
        muscleGroup: "chest",
        sets: [
          { setNumber: 1, reps: 10, weight: 75 },
          { setNumber: 2, reps: 9, weight: 75 },
          { setNumber: 3, reps: 8, weight: 75 },
          { setNumber: 4, reps: 8, weight: 75 },
        ],
      },
      {
        id: "ex/2/2",
        name: "DB Overhead Press",
        muscleGroup: "shoulders",
        sets: [
          { setNumber: 1, reps: 12, weight: 28 },
          { setNumber: 2, reps: 12, weight: 28 },
          { setNumber: 3, reps: 10, weight: 28 },
        ],
        pr: true,
      },
      {
        id: "ex/2/3",
        name: "Cable Fly",
        muscleGroup: "chest",
        sets: [
          { setNumber: 1, reps: 15, weight: 20 },
          { setNumber: 2, reps: 15, weight: 20 },
          { setNumber: 3, reps: 12, weight: 20 },
        ],
      },
      {
        id: "ex/2/4",
        name: "Rope Pushdowns",
        muscleGroup: "arms",
        sets: [
          { setNumber: 1, reps: 15, weight: 30 },
          { setNumber: 2, reps: 15, weight: 30 },
          { setNumber: 3, reps: 12, weight: 30 },
        ],
      },
    ],
  },
  // ── 2026-03-01  Legs B ────────────────────────────────────────────────────
  {
    id: "tr/3",
    name: "Legs B",
    category: "legs",
    date: "2026-03-01",
    durationMin: 75,
    status: "completed",
    exercises: [
      {
        id: "ex/3/1",
        name: "Bulgarian Split Squat",
        muscleGroup: "legs",
        sets: [
          { setNumber: 1, reps: 10, weight: 40 },
          { setNumber: 2, reps: 10, weight: 40 },
          { setNumber: 3, reps: 9, weight: 40 },
          { setNumber: 4, reps: 8, weight: 40 },
        ],
        pr: true,
      },
      {
        id: "ex/3/2",
        name: "Hack Squat",
        muscleGroup: "legs",
        sets: [
          { setNumber: 1, reps: 12, weight: 120 },
          { setNumber: 2, reps: 12, weight: 120 },
          { setNumber: 3, reps: 10, weight: 120 },
        ],
      },
      {
        id: "ex/3/3",
        name: "Leg Extension",
        muscleGroup: "legs",
        sets: [
          { setNumber: 1, reps: 15, weight: 65 },
          { setNumber: 2, reps: 15, weight: 65 },
          { setNumber: 3, reps: 12, weight: 65 },
        ],
      },
      {
        id: "ex/3/4",
        name: "Nordic Curl",
        muscleGroup: "legs",
        sets: [
          { setNumber: 1, reps: 8, weight: 0 },
          { setNumber: 2, reps: 7, weight: 0 },
          { setNumber: 3, reps: 6, weight: 0 },
        ],
      },
      {
        id: "ex/3/5",
        name: "Calf Press",
        muscleGroup: "legs",
        sets: [
          { setNumber: 1, reps: 20, weight: 180 },
          { setNumber: 2, reps: 20, weight: 180 },
          { setNumber: 3, reps: 18, weight: 180 },
        ],
      },
    ],
  },
  // ── 2026-02-28  Pull A ────────────────────────────────────────────────────
  {
    id: "tr/4",
    name: "Pull A",
    category: "pull",
    date: "2026-02-28",
    durationMin: 60,
    status: "completed",
    exercises: [
      {
        id: "ex/4/1",
        name: "Pull-ups",
        muscleGroup: "back",
        sets: [
          { setNumber: 1, reps: 8, weight: 0 },
          { setNumber: 2, reps: 8, weight: 0 },
          { setNumber: 3, reps: 7, weight: 0 },
          { setNumber: 4, reps: 6, weight: 0 },
        ],
      },
      {
        id: "ex/4/2",
        name: "Barbell Row",
        muscleGroup: "back",
        sets: [
          { setNumber: 1, reps: 8, weight: 90 },
          { setNumber: 2, reps: 8, weight: 90 },
          { setNumber: 3, reps: 7, weight: 90 },
          { setNumber: 4, reps: 7, weight: 90 },
        ],
        pr: true,
      },
      {
        id: "ex/4/3",
        name: "Straight Bar Curl",
        muscleGroup: "arms",
        sets: [
          { setNumber: 1, reps: 10, weight: 42.5 },
          { setNumber: 2, reps: 10, weight: 42.5 },
          { setNumber: 3, reps: 8, weight: 42.5 },
        ],
      },
      {
        id: "ex/4/4",
        name: "Face Pulls",
        muscleGroup: "shoulders",
        sets: [
          { setNumber: 1, reps: 20, weight: 22.5 },
          { setNumber: 2, reps: 20, weight: 22.5 },
          { setNumber: 3, reps: 18, weight: 22.5 },
        ],
      },
    ],
  },
  // ── 2026-02-26  Push A ────────────────────────────────────────────────────
  {
    id: "tr/5",
    name: "Push A",
    category: "push",
    date: "2026-02-26",
    durationMin: 70,
    status: "completed",
    exercises: [
      {
        id: "ex/5/1",
        name: "Bench Press",
        muscleGroup: "chest",
        sets: [
          { setNumber: 1, reps: 5, weight: 92.5 },
          { setNumber: 2, reps: 5, weight: 92.5 },
          { setNumber: 3, reps: 4, weight: 92.5 },
          { setNumber: 4, reps: 4, weight: 92.5 },
        ],
        pr: true,
      },
      {
        id: "ex/5/2",
        name: "OHP",
        muscleGroup: "shoulders",
        sets: [
          { setNumber: 1, reps: 6, weight: 62.5 },
          { setNumber: 2, reps: 6, weight: 62.5 },
          { setNumber: 3, reps: 5, weight: 62.5 },
        ],
      },
      {
        id: "ex/5/3",
        name: "Incline DB Press",
        muscleGroup: "chest",
        sets: [
          { setNumber: 1, reps: 12, weight: 34 },
          { setNumber: 2, reps: 11, weight: 34 },
          { setNumber: 3, reps: 10, weight: 34 },
        ],
      },
      {
        id: "ex/5/4",
        name: "Lateral Raises",
        muscleGroup: "shoulders",
        sets: [
          { setNumber: 1, reps: 15, weight: 16 },
          { setNumber: 2, reps: 15, weight: 16 },
          { setNumber: 3, reps: 12, weight: 16 },
        ],
      },
      {
        id: "ex/5/5",
        name: "Tricep Pushdowns",
        muscleGroup: "arms",
        sets: [
          { setNumber: 1, reps: 15, weight: 40 },
          { setNumber: 2, reps: 15, weight: 40 },
          { setNumber: 3, reps: 12, weight: 40 },
        ],
      },
    ],
  },
  // ── 2026-02-24  Legs A ────────────────────────────────────────────────────
  {
    id: "tr/6",
    name: "Legs A",
    category: "legs",
    date: "2026-02-24",
    durationMin: 80,
    status: "completed",
    exercises: [
      {
        id: "ex/6/1",
        name: "Squat",
        muscleGroup: "legs",
        sets: [
          { setNumber: 1, reps: 5, weight: 112.5 },
          { setNumber: 2, reps: 5, weight: 112.5 },
          { setNumber: 3, reps: 5, weight: 112.5 },
          { setNumber: 4, reps: 4, weight: 112.5 },
        ],
        pr: true,
      },
      {
        id: "ex/6/2",
        name: "Romanian Deadlift",
        muscleGroup: "legs",
        sets: [
          { setNumber: 1, reps: 10, weight: 100 },
          { setNumber: 2, reps: 10, weight: 100 },
          { setNumber: 3, reps: 9, weight: 100 },
        ],
      },
      {
        id: "ex/6/3",
        name: "Leg Press",
        muscleGroup: "legs",
        sets: [
          { setNumber: 1, reps: 15, weight: 220 },
          { setNumber: 2, reps: 15, weight: 220 },
          { setNumber: 3, reps: 12, weight: 220 },
        ],
      },
      {
        id: "ex/6/4",
        name: "Leg Curl",
        muscleGroup: "legs",
        sets: [
          { setNumber: 1, reps: 12, weight: 50 },
          { setNumber: 2, reps: 12, weight: 50 },
          { setNumber: 3, reps: 10, weight: 50 },
        ],
      },
      {
        id: "ex/6/5",
        name: "Calf Raises",
        muscleGroup: "legs",
        sets: [
          { setNumber: 1, reps: 20, weight: 90 },
          { setNumber: 2, reps: 20, weight: 90 },
          { setNumber: 3, reps: 18, weight: 90 },
        ],
      },
    ],
  },
  // ── 2026-02-22  Pull B ────────────────────────────────────────────────────
  {
    id: "tr/7",
    name: "Pull B",
    category: "pull",
    date: "2026-02-22",
    durationMin: 65,
    status: "completed",
    exercises: [
      {
        id: "ex/7/1",
        name: "Pull-ups",
        muscleGroup: "back",
        sets: [
          { setNumber: 1, reps: 8, weight: 2.5 },
          { setNumber: 2, reps: 7, weight: 2.5 },
          { setNumber: 3, reps: 7, weight: 2.5 },
          { setNumber: 4, reps: 6, weight: 2.5 },
        ],
      },
      {
        id: "ex/7/2",
        name: "T-Bar Row",
        muscleGroup: "back",
        sets: [
          { setNumber: 1, reps: 10, weight: 80 },
          { setNumber: 2, reps: 10, weight: 80 },
          { setNumber: 3, reps: 9, weight: 80 },
          { setNumber: 4, reps: 8, weight: 80 },
        ],
      },
      {
        id: "ex/7/3",
        name: "Hammer Curl",
        muscleGroup: "arms",
        sets: [
          { setNumber: 1, reps: 12, weight: 20 },
          { setNumber: 2, reps: 12, weight: 20 },
          { setNumber: 3, reps: 10, weight: 20 },
        ],
      },
      {
        id: "ex/7/4",
        name: "Shrugs",
        muscleGroup: "back",
        sets: [
          { setNumber: 1, reps: 15, weight: 100 },
          { setNumber: 2, reps: 15, weight: 100 },
          { setNumber: 3, reps: 12, weight: 100 },
        ],
      },
    ],
  },
  // ── 2026-02-20  Push B ────────────────────────────────────────────────────
  {
    id: "tr/8",
    name: "Push B",
    category: "push",
    date: "2026-02-20",
    durationMin: 60,
    status: "completed",
    exercises: [
      {
        id: "ex/8/1",
        name: "Incline Bench Press",
        muscleGroup: "chest",
        sets: [
          { setNumber: 1, reps: 10, weight: 72.5 },
          { setNumber: 2, reps: 9, weight: 72.5 },
          { setNumber: 3, reps: 9, weight: 72.5 },
          { setNumber: 4, reps: 8, weight: 72.5 },
        ],
      },
      {
        id: "ex/8/2",
        name: "DB Overhead Press",
        muscleGroup: "shoulders",
        sets: [
          { setNumber: 1, reps: 12, weight: 26 },
          { setNumber: 2, reps: 11, weight: 26 },
          { setNumber: 3, reps: 10, weight: 26 },
        ],
      },
      {
        id: "ex/8/3",
        name: "Cable Fly",
        muscleGroup: "chest",
        sets: [
          { setNumber: 1, reps: 15, weight: 17.5 },
          { setNumber: 2, reps: 15, weight: 17.5 },
          { setNumber: 3, reps: 12, weight: 17.5 },
        ],
      },
      {
        id: "ex/8/4",
        name: "Rope Pushdowns",
        muscleGroup: "arms",
        sets: [
          { setNumber: 1, reps: 15, weight: 27.5 },
          { setNumber: 2, reps: 15, weight: 27.5 },
          { setNumber: 3, reps: 12, weight: 27.5 },
        ],
      },
    ],
  },
];

export const MOCK_RECOVERY_TODAY: RecoveryFactor[] = [
  { label: "Sen", labelKey: "health_factor_sleep", value: 84, color: "#a855f7" },
  { label: "HRV", labelKey: "health_factor_hrv", value: 72, color: "#38bdf8" },
  { label: "Aktywność", labelKey: "health_factor_activity", value: 61, color: "#22c55e" },
  { label: "Odpoczynek", labelKey: "health_factor_rest", value: 78, color: "#f59e0b" },
  { label: "Stres", labelKey: "health_factor_stress", value: 55, color: "#ec4899" },
];

// ─── DIET ─────────────────────────────────────────────────────────────────────

export type FoodCategory = "protein" | "carbs" | "veggies" | "dairy" | "fats" | "other";

export type FoodItem = {
  id: string;
  name: string;
  kcalPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  category: FoodCategory;
};

export type MealIngredient = {
  foodId: string;
  grams: number;
};

export type MealSlotId = "breakfast" | "lunch" | "snack" | "dinner";

export type MealSlot = {
  slot: MealSlotId;
  time: string; // "HH:MM"
  ingredients: MealIngredient[];
};

export type DietDay = {
  date: string; // "YYYY-MM-DD"
  meals: MealSlot[];
};

export type DietGoals = {
  kcal: number;
  protein: number; // g
  carbs: number;   // g
  fat: number;     // g
};

export type ShoppingItem = {
  id: string;
  name: string;
  amount: number;
  unit: string;
  category: FoodCategory;
  checked: boolean;
};

export const MOCK_DIET_GOALS: DietGoals = {
  kcal: 2600,
  protein: 200,
  carbs: 280,
  fat: 70,
};

export const MOCK_FOOD_DB: FoodItem[] = [
  { id: "food/oats",           name: "Oatmeal",        kcalPer100g: 370, proteinPer100g: 13.0, carbsPer100g: 62.0, fatPer100g:  7.0, category: "carbs" },
  { id: "food/greek_yogurt",   name: "Greek Yogurt",   kcalPer100g:  97, proteinPer100g: 10.0, carbsPer100g:  4.0, fatPer100g:  5.0, category: "dairy" },
  { id: "food/blueberries",    name: "Blueberries",    kcalPer100g:  57, proteinPer100g:  0.7, carbsPer100g: 14.0, fatPer100g:  0.3, category: "veggies" },
  { id: "food/banana",         name: "Banana",         kcalPer100g:  89, proteinPer100g:  1.1, carbsPer100g: 23.0, fatPer100g:  0.3, category: "carbs" },
  { id: "food/whey",           name: "Whey Protein",   kcalPer100g: 380, proteinPer100g: 80.0, carbsPer100g:  6.0, fatPer100g:  5.0, category: "protein" },
  { id: "food/chicken_breast", name: "Chicken Breast", kcalPer100g: 165, proteinPer100g: 31.0, carbsPer100g:  0.0, fatPer100g:  3.6, category: "protein" },
  { id: "food/brown_rice",     name: "Brown Rice",     kcalPer100g: 112, proteinPer100g:  2.6, carbsPer100g: 24.0, fatPer100g:  0.9, category: "carbs" },
  { id: "food/broccoli",       name: "Broccoli",       kcalPer100g:  34, proteinPer100g:  2.8, carbsPer100g:  7.0, fatPer100g:  0.4, category: "veggies" },
  { id: "food/olive_oil",      name: "Olive Oil",      kcalPer100g: 884, proteinPer100g:  0.0, carbsPer100g:  0.0, fatPer100g:100.0, category: "fats" },
  { id: "food/salmon",         name: "Salmon",         kcalPer100g: 208, proteinPer100g: 20.0, carbsPer100g:  0.0, fatPer100g: 13.0, category: "protein" },
  { id: "food/sweet_potato",   name: "Sweet Potato",   kcalPer100g:  86, proteinPer100g:  1.6, carbsPer100g: 20.0, fatPer100g:  0.1, category: "carbs" },
  { id: "food/spinach",        name: "Spinach",        kcalPer100g:  23, proteinPer100g:  2.9, carbsPer100g:  3.6, fatPer100g:  0.4, category: "veggies" },
  { id: "food/almonds",        name: "Almonds",        kcalPer100g: 579, proteinPer100g: 21.0, carbsPer100g: 22.0, fatPer100g: 50.0, category: "fats" },
  { id: "food/apple",          name: "Apple",          kcalPer100g:  52, proteinPer100g:  0.3, carbsPer100g: 14.0, fatPer100g:  0.2, category: "veggies" },
  { id: "food/eggs",           name: "Eggs",           kcalPer100g: 155, proteinPer100g: 13.0, carbsPer100g:  1.1, fatPer100g: 11.0, category: "protein" },
  { id: "food/whole_milk",     name: "Whole Milk",     kcalPer100g:  61, proteinPer100g:  3.2, carbsPer100g:  4.8, fatPer100g:  3.3, category: "dairy" },
  { id: "food/pasta",          name: "Pasta",          kcalPer100g: 371, proteinPer100g: 13.0, carbsPer100g: 74.0, fatPer100g:  1.5, category: "carbs" },
  { id: "food/tuna",           name: "Tuna",           kcalPer100g: 144, proteinPer100g: 30.0, carbsPer100g:  0.0, fatPer100g:  3.0, category: "protein" },
  { id: "food/avocado",        name: "Avocado",        kcalPer100g: 160, proteinPer100g:  2.0, carbsPer100g:  9.0, fatPer100g: 15.0, category: "fats" },
  { id: "food/cottage_cheese", name: "Cottage Cheese", kcalPer100g:  98, proteinPer100g: 11.0, carbsPer100g:  3.4, fatPer100g:  4.3, category: "dairy" },
];

export const MOCK_DIET_WEEK: DietDay[] = [
  {
    date: "2026-03-02",
    meals: [
      { slot: "breakfast", time: "07:30", ingredients: [
        { foodId: "food/oats", grams: 80 }, { foodId: "food/greek_yogurt", grams: 150 },
        { foodId: "food/blueberries", grams: 60 }, { foodId: "food/banana", grams: 100 },
      ]},
      { slot: "lunch", time: "13:00", ingredients: [
        { foodId: "food/chicken_breast", grams: 180 }, { foodId: "food/brown_rice", grams: 150 },
        { foodId: "food/broccoli", grams: 120 }, { foodId: "food/olive_oil", grams: 10 },
      ]},
      { slot: "snack", time: "16:00", ingredients: [
        { foodId: "food/almonds", grams: 30 }, { foodId: "food/apple", grams: 150 },
      ]},
      { slot: "dinner", time: "19:30", ingredients: [
        { foodId: "food/salmon", grams: 200 }, { foodId: "food/sweet_potato", grams: 200 },
        { foodId: "food/spinach", grams: 100 },
      ]},
    ],
  },
  {
    date: "2026-03-03",
    meals: [
      { slot: "breakfast", time: "08:00", ingredients: [
        { foodId: "food/oats", grams: 80 }, { foodId: "food/whey", grams: 30 },
        { foodId: "food/blueberries", grams: 80 },
      ]},
      { slot: "lunch", time: "12:30", ingredients: [
        { foodId: "food/chicken_breast", grams: 200 }, { foodId: "food/pasta", grams: 120 },
        { foodId: "food/broccoli", grams: 100 }, { foodId: "food/olive_oil", grams: 15 },
      ]},
      { slot: "snack", time: "15:30", ingredients: [
        { foodId: "food/greek_yogurt", grams: 200 }, { foodId: "food/banana", grams: 120 },
      ]},
      { slot: "dinner", time: "19:00", ingredients: [
        { foodId: "food/tuna", grams: 180 }, { foodId: "food/sweet_potato", grams: 180 },
        { foodId: "food/spinach", grams: 80 }, { foodId: "food/avocado", grams: 60 },
      ]},
    ],
  },
  {
    date: "2026-03-04",
    meals: [
      { slot: "breakfast", time: "07:30", ingredients: [
        { foodId: "food/oats", grams: 100 }, { foodId: "food/greek_yogurt", grams: 180 },
        { foodId: "food/blueberries", grams: 50 },
      ]},
      { slot: "lunch", time: "13:00", ingredients: [
        { foodId: "food/chicken_breast", grams: 200 }, { foodId: "food/brown_rice", grams: 180 },
        { foodId: "food/broccoli", grams: 100 }, { foodId: "food/olive_oil", grams: 10 },
      ]},
      { slot: "snack", time: "16:00", ingredients: [
        { foodId: "food/almonds", grams: 35 }, { foodId: "food/apple", grams: 130 },
      ]},
      { slot: "dinner", time: "19:30", ingredients: [
        { foodId: "food/salmon", grams: 220 }, { foodId: "food/sweet_potato", grams: 200 },
        { foodId: "food/spinach", grams: 80 },
      ]},
    ],
  },
  {
    date: "2026-03-05",
    meals: [
      { slot: "breakfast", time: "07:30", ingredients: [
        { foodId: "food/eggs", grams: 150 }, { foodId: "food/whole_milk", grams: 200 },
        { foodId: "food/banana", grams: 100 },
      ]},
      { slot: "lunch", time: "12:30", ingredients: [
        { foodId: "food/chicken_breast", grams: 180 }, { foodId: "food/brown_rice", grams: 160 },
        { foodId: "food/broccoli", grams: 120 }, { foodId: "food/olive_oil", grams: 10 },
      ]},
      { slot: "snack", time: "16:00", ingredients: [
        { foodId: "food/cottage_cheese", grams: 200 }, { foodId: "food/blueberries", grams: 80 },
      ]},
      { slot: "dinner", time: "19:00", ingredients: [
        { foodId: "food/salmon", grams: 190 }, { foodId: "food/pasta", grams: 100 },
        { foodId: "food/spinach", grams: 100 }, { foodId: "food/olive_oil", grams: 10 },
      ]},
    ],
  },
  {
    date: "2026-03-06",
    meals: [
      { slot: "breakfast", time: "08:00", ingredients: [
        { foodId: "food/oats", grams: 80 }, { foodId: "food/whey", grams: 30 },
        { foodId: "food/banana", grams: 100 },
      ]},
      { slot: "lunch", time: "13:00", ingredients: [
        { foodId: "food/tuna", grams: 200 }, { foodId: "food/brown_rice", grams: 180 },
        { foodId: "food/broccoli", grams: 100 }, { foodId: "food/avocado", grams: 80 },
      ]},
      { slot: "snack", time: "15:30", ingredients: [
        { foodId: "food/almonds", grams: 30 }, { foodId: "food/apple", grams: 150 },
      ]},
      { slot: "dinner", time: "19:30", ingredients: [
        { foodId: "food/chicken_breast", grams: 200 }, { foodId: "food/sweet_potato", grams: 220 },
        { foodId: "food/spinach", grams: 80 },
      ]},
    ],
  },
  {
    date: "2026-03-07",
    meals: [
      { slot: "breakfast", time: "09:00", ingredients: [
        { foodId: "food/eggs", grams: 200 }, { foodId: "food/whole_milk", grams: 200 },
        { foodId: "food/blueberries", grams: 80 }, { foodId: "food/avocado", grams: 80 },
      ]},
      { slot: "lunch", time: "13:30", ingredients: [
        { foodId: "food/pasta", grams: 150 }, { foodId: "food/tuna", grams: 180 },
        { foodId: "food/spinach", grams: 100 }, { foodId: "food/olive_oil", grams: 15 },
      ]},
      { slot: "snack", time: "17:00", ingredients: [
        { foodId: "food/cottage_cheese", grams: 200 }, { foodId: "food/banana", grams: 120 },
      ]},
      { slot: "dinner", time: "20:00", ingredients: [
        { foodId: "food/salmon", grams: 220 }, { foodId: "food/brown_rice", grams: 150 },
        { foodId: "food/broccoli", grams: 120 },
      ]},
    ],
  },
  {
    date: "2026-03-08",
    meals: [
      { slot: "breakfast", time: "09:00", ingredients: [
        { foodId: "food/oats", grams: 100 }, { foodId: "food/greek_yogurt", grams: 200 },
        { foodId: "food/blueberries", grams: 80 }, { foodId: "food/banana", grams: 100 },
      ]},
      { slot: "lunch", time: "14:00", ingredients: [
        { foodId: "food/chicken_breast", grams: 200 }, { foodId: "food/pasta", grams: 120 },
        { foodId: "food/broccoli", grams: 100 }, { foodId: "food/olive_oil", grams: 10 },
      ]},
      { slot: "snack", time: "17:00", ingredients: [
        { foodId: "food/almonds", grams: 30 }, { foodId: "food/apple", grams: 150 },
        { foodId: "food/cottage_cheese", grams: 150 },
      ]},
      { slot: "dinner", time: "20:00", ingredients: [
        { foodId: "food/salmon", grams: 200 }, { foodId: "food/sweet_potato", grams: 200 },
        { foodId: "food/spinach", grams: 80 },
      ]},
    ],
  },
];

export const MOCK_SHOPPING_LIST: ShoppingItem[] = [
  // protein
  { id: "shop/chicken", name: "Chicken Breast",  amount: 980,  unit: "g",  category: "protein", checked: false },
  { id: "shop/salmon",  name: "Salmon",          amount: 830,  unit: "g",  category: "protein", checked: false },
  { id: "shop/tuna",    name: "Tuna",            amount: 560,  unit: "g",  category: "protein", checked: false },
  { id: "shop/eggs",    name: "Eggs",            amount: 350,  unit: "g",  category: "protein", checked: false },
  { id: "shop/whey",    name: "Whey Protein",    amount: 60,   unit: "g",  category: "protein", checked: false },
  // carbs
  { id: "shop/oats",    name: "Oatmeal",         amount: 440,  unit: "g",  category: "carbs",   checked: false },
  { id: "shop/rice",    name: "Brown Rice",      amount: 820,  unit: "g",  category: "carbs",   checked: false },
  { id: "shop/pasta",   name: "Pasta",           amount: 490,  unit: "g",  category: "carbs",   checked: false },
  { id: "shop/banana",  name: "Banana",          amount: 640,  unit: "g",  category: "carbs",   checked: false },
  { id: "shop/swtpot",  name: "Sweet Potato",    amount: 1000, unit: "g",  category: "carbs",   checked: false },
  // veggies
  { id: "shop/broccol", name: "Broccoli",        amount: 760,  unit: "g",  category: "veggies", checked: false },
  { id: "shop/spinach", name: "Spinach",         amount: 620,  unit: "g",  category: "veggies", checked: false },
  { id: "shop/bluebrr", name: "Blueberries",     amount: 430,  unit: "g",  category: "veggies", checked: false },
  { id: "shop/apple",   name: "Apple",           amount: 580,  unit: "g",  category: "veggies", checked: false },
  // dairy
  { id: "shop/yogurt",  name: "Greek Yogurt",    amount: 730,  unit: "g",  category: "dairy",   checked: false },
  { id: "shop/milk",    name: "Whole Milk",      amount: 400,  unit: "ml", category: "dairy",   checked: false },
  { id: "shop/cottage", name: "Cottage Cheese",  amount: 550,  unit: "g",  category: "dairy",   checked: false },
  // fats
  { id: "shop/almonds", name: "Almonds",         amount: 125,  unit: "g",  category: "fats",    checked: false },
  { id: "shop/avocado", name: "Avocado",         amount: 220,  unit: "g",  category: "fats",    checked: false },
  { id: "shop/ooil",    name: "Olive Oil",       amount: 80,   unit: "ml", category: "fats",    checked: false },
];
