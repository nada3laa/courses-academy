import { courses as sourceCourses } from "../../../data/staticData";

const STORAGE_KEY = "academy_teacher_courses";
const STATUSES = ["قيد المراجعة", "منشور", "منشور", "قيد المراجعة", "مسودة", "مرفوض"];

const initialCourses = sourceCourses.map((course, index) => ({
  ...course,
  status: STATUSES[index % STATUSES.length],
  revenue: course.price * Math.max(1, Math.round(course.students * 0.1)),
  titleEn: "",
  shortDescription: course.description,
  requirements: "",
  tags: [course.category],
  curriculum: [{ id: crypto.randomUUID(), title: "مقدمة", lessons: [] }],
  pricingType: course.price > 0 ? "paid" : "free",
}));

export const getTeacherCourses = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved)) return saved;
  } catch {
    // Fall back to the seed data when storage is unavailable or malformed.
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialCourses));
  return initialCourses;
};

export const getTeacherCourse = (id) =>
  getTeacherCourses().find((course) => String(course.id) === String(id));

export const saveTeacherCourse = (course) => {
  const courses = getTeacherCourses();
  const index = courses.findIndex((item) => String(item.id) === String(course.id));
  const nextCourse = {
    students: 0,
    revenue: 0,
    status: "قيد المراجعة",
    ...course,
    id: course.id || crypto.randomUUID(),
  };

  if (index === -1) courses.unshift(nextCourse);
  else courses[index] = nextCourse;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
  return nextCourse;
};

export const deleteTeacherCourse = (id) => {
  const courses = getTeacherCourses().filter(
    (course) => String(course.id) !== String(id),
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
};
