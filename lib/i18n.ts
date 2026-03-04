// lib/i18n.ts

export type Language = "pl" | "en";

export const translations = {
  pl: {
    // Navigation
    nav_dashboard: "Dashboard",
    nav_skills: "Umiejętności",
    nav_quests: "Questy",
    nav_calendar: "Kalendarz",
    nav_training: "Trening",
    nav_diet: "Dieta",
    nav_preferences: "Preferencje",

    // Dashboard
    dashboard_plan: "Plan dnia",
    dashboard_neural_map: "Neural Map",
    dashboard_today: "Plan na dzisiaj",
    dashboard_training: "Dzisiejszy trening",
    dashboard_diet: "Jadłospis",
    dashboard_skills: "// Umiejętności",

    // Skills
    skill_next_quest: "Next Quest",
    skill_progress: "Progress",
    skill_aspects: "Aspekty",
    skill_structure: "Struktura",
    skill_neural_map: "Neural Map & Aspects",

    // Quests
    quests_title: "Questy",
    quests_description: "Wszystkie questy pogrupowane według statusu. Kliknij, aby edytować.",
    quests_planned: "Zaplanowane",
    quests_in_progress: "W toku",
    quests_completed: "Ukończone",
    quests_empty: "Brak questów",

    // Quest detail
    quest_detail_title: "Szczegóły questu",
    quest_name: "Nazwa",
    quest_description: "Opis",
    quest_status: "Status",
    quest_duration: "Czas trwania",
    quest_recurring: "Cykliczne",
    quest_save: "Zapisz",
    quest_cancel: "Anuluj",
    quest_close: "Zamknij",

    // Status labels
    status_open: "Otwarte",
    status_planned: "Zaplanowane",
    status_in_progress: "W toku",
    status_completed: "Ukończone",

    // Calendar
    calendar_title: "Kalendarz",
    calendar_description: "Widok dzień / tydzień / miesiąc.",
    calendar_pinned: "Przypięte questy",
    calendar_pinned_empty: "Brak przypiętych questów.",
    calendar_day: "Dzień",
    calendar_week: "Tydzień",
    calendar_month: "Miesiąc",
    calendar_today: "Dziś",

    // Training
    training_title: "// TRENING — do zaprojektowania",

    // Diet
    diet_title: "// DIETA — do zaprojektowania",

    // Common
    logged_in: "Zalogowany",
    module_in_progress: "Moduł w budowie...",
    no_skills: "Brak umiejętności.",
    pin: "Przypnij",
    unpin: "Odpnij",
    edit: "Edytuj",
  },
  en: {
    // Navigation
    nav_dashboard: "Dashboard",
    nav_skills: "Skills",
    nav_quests: "Quests",
    nav_calendar: "Calendar",
    nav_training: "Training",
    nav_diet: "Diet",
    nav_preferences: "Preferences",

    // Dashboard
    dashboard_plan: "Daily Plan",
    dashboard_neural_map: "Neural Map",
    dashboard_today: "Today's Plan",
    dashboard_training: "Today's Training",
    dashboard_diet: "Meal Plan",
    dashboard_skills: "// Skills",

    // Skills
    skill_next_quest: "Next Quest",
    skill_progress: "Progress",
    skill_aspects: "Aspects",
    skill_structure: "Structure",
    skill_neural_map: "Neural Map & Aspects",

    // Quests
    quests_title: "Quests",
    quests_description: "All quests grouped by status. Click to edit.",
    quests_planned: "Planned",
    quests_in_progress: "In Progress",
    quests_completed: "Completed",
    quests_empty: "No quests",

    // Quest detail
    quest_detail_title: "Quest Details",
    quest_name: "Name",
    quest_description: "Description",
    quest_status: "Status",
    quest_duration: "Duration",
    quest_recurring: "Recurring",
    quest_save: "Save",
    quest_cancel: "Cancel",
    quest_close: "Close",

    // Status labels
    status_open: "Open",
    status_planned: "Planned",
    status_in_progress: "In Progress",
    status_completed: "Completed",

    // Calendar
    calendar_title: "Calendar",
    calendar_description: "Day / week / month view.",
    calendar_pinned: "Pinned quests",
    calendar_pinned_empty: "No pinned quests.",
    calendar_day: "Day",
    calendar_week: "Week",
    calendar_month: "Month",
    calendar_today: "Today",

    // Training
    training_title: "// TRAINING — to be designed",

    // Diet
    diet_title: "// DIET — to be designed",

    // Common
    logged_in: "Logged in",
    module_in_progress: "Module in progress...",
    no_skills: "No skills found.",
    pin: "Pin",
    unpin: "Unpin",
    edit: "Edit",
  },
} as const;

export type TranslationKey = keyof typeof translations.pl;

export function t(lang: Language, key: TranslationKey): string {
  return translations[lang][key];
}
