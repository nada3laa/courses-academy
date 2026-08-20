import { getCourseContent } from "../data/courseContent";

const STORAGE_PREFIX = "courses-academy:progress";

const getStudentKey = (user) =>
  user?.id || user?._id || user?.email || user?.phone || "guest";

const getStorageKey = (user, slug) =>
  `${STORAGE_PREFIX}:${getStudentKey(user)}:${slug}`;

const emptyProgress = () => ({
  completedItemIds: [],
  examResults: {},
  currentItemId: null,
});

export function getCourseProgress(user, slug) {
  if (typeof window === "undefined") return emptyProgress();

  try {
    const stored = JSON.parse(localStorage.getItem(getStorageKey(user, slug)));
    return {
      ...emptyProgress(),
      ...stored,
      completedItemIds: Array.isArray(stored?.completedItemIds)
        ? stored.completedItemIds
        : [],
      examResults: stored?.examResults || {},
    };
  } catch {
    return emptyProgress();
  }
}

export function saveCourseProgress(user, slug, progress) {
  if (typeof window === "undefined") return progress;
  localStorage.setItem(getStorageKey(user, slug), JSON.stringify(progress));
  return progress;
}

export function updateCourseProgress(user, slug, updater) {
  const next = updater(getCourseProgress(user, slug));
  return saveCourseProgress(user, slug, next);
}

export function completeCourseItem(user, slug, itemId, nextItemId = null) {
  return updateCourseProgress(user, slug, (progress) => ({
    ...progress,
    completedItemIds: [...new Set([...progress.completedItemIds, itemId])],
    currentItemId: nextItemId,
  }));
}

export function saveExamAttempt(user, slug, examId, result, nextItemId = null) {
  return updateCourseProgress(user, slug, (progress) => {
    const completedItemIds = result.passed
      ? [...new Set([...progress.completedItemIds, examId])]
      : progress.completedItemIds;

    return {
      ...progress,
      completedItemIds,
      currentItemId: result.passed ? nextItemId : examId,
      examResults: {
        ...progress.examResults,
        [examId]: result,
      },
    };
  });
}

export function isCourseItemUnlocked(items, completedItemIds, index) {
  if (index <= 0) return true;
  return completedItemIds.includes(items[index - 1]?.id);
}

export function getCourseProgressSummary(user, course) {
  const progress = getCourseProgress(user, course.slug);
  const content = getCourseContent(course.id);
  const items = [];

  content.chapters.forEach((chapter) => {
    chapter.lessons
      .filter((lesson) => lesson.type !== "quiz")
      .forEach((lesson, lessonIndex) => items.push({
        id: `lesson-${chapter.id}-${lesson.id ?? lessonIndex}`,
        title: lesson.title || lesson,
        type: "lesson",
      }));
    items.push({ id: `exam-${chapter.id}`, title: `اختبار ${chapter.title}`, type: "exam" });
  });

  const completed = new Set(progress.completedItemIds);
  const completedCount = items.filter((item) => completed.has(item.id)).length;
  const lessonItems = items.filter((item) => item.type === "lesson");
  const completedLessons = lessonItems.filter((item) => completed.has(item.id)).length;
  const completedTests = items.filter((item) => item.type === "exam" && completed.has(item.id)).length;
  const lastCompletedItem = [...items].reverse().find((item) => completed.has(item.id));

  return {
    percentage: items.length ? Math.round((completedCount / items.length) * 100) : 0,
    completedCount,
    completedLessons,
    completedTests,
    totalItems: items.length,
    totalLessons: lessonItems.length,
    lastCompletedTitle: lastCompletedItem?.title || null,
    currentItemId: progress.currentItemId,
  };
}
