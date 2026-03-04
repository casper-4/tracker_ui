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
    quests_description:
      "Wszystkie questy pogrupowane według statusu. Kliknij, aby edytować.",
    quests_planned: "Zaplanowane",
    quests_in_progress: "W toku",
    quests_completed: "Ukończone",
    quests_empty: "Brak questów",
    drop_here: "Upuść tutaj",
    chart_today: "Dzisiaj",
    chart_yesterday: "Wczoraj",
    chart_days_ago: "dni temu",
    chart_days: "dni",
    chart_range_custom: "Własny",

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
    quest_actual_duration: "Realny czas",
    quest_status_history: "Historia statusu",
    quest_history: "Historia",
    quest_history_empty: "—",
    quest_comment: "Komentarz",
    quest_attachments: "Załączniki",
    quest_attach_photo: "Zdjęcie",
    quest_attach_video: "Wideo",
    quest_attach_file: "Plik",
    quest_gallery: "Galeria",
    quest_recurring_label: "Cykliczne",

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

    // Preferences
    prefs_profile: "Profil",
    prefs_language: "Język",
    prefs_language_desc: "Język interfejsu aplikacji",
    prefs_settings: "Ustawienia",
    prefs_notifications: "Powiadomienia",
    prefs_auto_advance: "Auto-progresja questów",
    prefs_show_completed: "Pokaż ukończone questy",
    prefs_week_start: "Tydzień zaczyna się w",
    prefs_week_start_monday: "Pn",
    prefs_week_start_sunday: "Nd",
    prefs_daily_goal: "Dzienny cel",
    prefs_joined: "Dołączył/a",
    prefs_streak: "Seria",

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
    drop_here: "Drop here",
    chart_today: "Today",
    chart_yesterday: "Yesterday",
    chart_days_ago: "days ago",
    chart_days: "days",
    chart_range_custom: "Custom",

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
    quest_actual_duration: "Actual duration",
    quest_status_history: "Status history",
    quest_history: "History",
    quest_history_empty: "—",
    quest_comment: "Comment",
    quest_attachments: "Attachments",
    quest_attach_photo: "Photo",
    quest_attach_video: "Video",
    quest_attach_file: "File",
    quest_gallery: "Gallery",
    quest_recurring_label: "Recurring",

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

    // Preferences
    prefs_profile: "Profile",
    prefs_language: "Language",
    prefs_language_desc: "Interface language",
    prefs_settings: "Settings",
    prefs_notifications: "Notifications",
    prefs_auto_advance: "Auto-advance quests",
    prefs_show_completed: "Show completed quests",
    prefs_week_start: "Week starts on",
    prefs_week_start_monday: "Mon",
    prefs_week_start_sunday: "Sun",
    prefs_daily_goal: "Daily goal",
    prefs_joined: "Joined",
    prefs_streak: "Streak",

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
