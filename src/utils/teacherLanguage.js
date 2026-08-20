const LANGUAGE_ALIASES = {
  arabic: "arabic",
  ar: "arabic",
  "عربي": "arabic",
  "العربية": "arabic",
  languages: "languages",
  "لغات": "languages",
  "اللغات": "languages",
};

const LANGUAGE_LABELS = {
  arabic: "العربية",
  languages: "اللغات",
};

export const normalizeTeacherLanguages = (value) => [
  ...new Set(
    (Array.isArray(value) ? value : value ? [value] : [])
      .map((item) => LANGUAGE_ALIASES[String(item).trim().toLowerCase()])
      .filter(Boolean),
  ),
];

export const teacherLanguageLabel = (value) =>
  normalizeTeacherLanguages(value)
    .map((language) => LANGUAGE_LABELS[language])
    .join("، ") || "—";
