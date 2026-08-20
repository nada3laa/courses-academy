export const LANDING_STATS_STORAGE_KEY = "alacademeya_landing_stats";
export const LANDING_STATS_EVENT = "alacademeya-landing-stats-updated";

export const DEFAULT_LANDING_STATS = {
  teachers: 40,
  students: 12000,
  courses: 1000,
  satisfaction: 97,
};

export const getLandingStats = () => {
  try {
    const saved = JSON.parse(
      localStorage.getItem(LANDING_STATS_STORAGE_KEY) || "null",
    );
    return saved && typeof saved === "object"
      ? { ...DEFAULT_LANDING_STATS, ...saved }
      : DEFAULT_LANDING_STATS;
  } catch {
    return DEFAULT_LANDING_STATS;
  }
};

export const saveLandingStats = (stats) => {
  localStorage.setItem(LANDING_STATS_STORAGE_KEY, JSON.stringify(stats));
  window.dispatchEvent(new CustomEvent(LANDING_STATS_EVENT));
};
