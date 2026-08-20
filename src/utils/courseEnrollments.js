const STORAGE_PREFIX = "novira-course-enrollments";

const userKey = (user) =>
  user?.id || user?._id || user?.email || user?.phone || "guest";

const storageKey = (user) => `${STORAGE_PREFIX}:${userKey(user)}`;

export const getEnrolledCourseSlugs = (user) => {
  if (!user) return [];

  try {
    const saved = JSON.parse(localStorage.getItem(storageKey(user)) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
};

export const isEnrolledInCourse = (user, slug) =>
  getEnrolledCourseSlugs(user).includes(slug);

export const enrollInCourse = (user, slug) => {
  if (!user || !slug) return false;

  const enrolled = getEnrolledCourseSlugs(user);
  if (!enrolled.includes(slug)) {
    localStorage.setItem(storageKey(user), JSON.stringify([...enrolled, slug]));
  }
  return true;
};

export const unenrollFromCourse = (user, slug) => {
  if (!user || !slug) return false;

  const enrolled = getEnrolledCourseSlugs(user);
  localStorage.setItem(
    storageKey(user),
    JSON.stringify(enrolled.filter((courseSlug) => courseSlug !== slug)),
  );
  return true;
};
