import {
  getAssetUrl,
  getPublicCourses,
  getPublicCourse,
  getMyTeacherCourses,
  getMyTeacherCourse,
  getMyCourseEnrollments,
  getPendingAdminCourses,
  approveMarketplaceCourse,
  rejectMarketplaceCourse,
  archiveCourse,
  getCourseCategories,
  createCourseCategory,
  createMarketplaceCourse,
  updateMarketplaceCourse,
  uploadCourseCover,
  uploadCoursePromoVideo,
  createCourseSection,
  createCourseLesson,
  updateCourseSection,
  updateCourseLesson,
  uploadCourseLessonMedia,
  submitMarketplaceCourse,
  getTeachers,
  getTeacher,
  getUser,
  getMyInstructorProfile,
  getMyProfile,
  getPublicInstructor,
  enrollInMarketplaceCourse,
  getCourseAccess,
  getCourseLearningView,
  getAdminCourse,
  getAdminCourseEnrollments,
  getAdminCourseCategories,
} from "../../../services/APIService";

const valueOf = (value, fallback = "") => {
  if (value == null) return fallback;
  if (typeof value === "string" || typeof value === "number") return value;
  if (Array.isArray(value)) return value.map((item) => valueOf(item)).filter(Boolean).join("، ");
  const nested = value.ar ?? value.en ?? value.name ?? value.fullName ?? value.title ?? value.user;
  return nested == null ? fallback : valueOf(nested, fallback);
};

const textOf = (value, fallback = "") => String(valueOf(value, fallback));

const listOf = (payload) => {
  const data = payload?.data?.data ?? payload?.data ?? payload;
  if (Array.isArray(data)) return data;
  return data?.courses || data?.enrollments || data?.items || data?.docs || [];
};

const statusLabels = {
  published: "منشور",
  pending: "قيد المراجعة",
  pending_review: "قيد المراجعة",
  under_review: "قيد المراجعة",
  draft: "مسودة",
  rejected: "مرفوض",
  archived: "مؤرشف",
};

const levelLabels = {
  beginner: "مبتدئ",
  intermediate: "متوسط",
  advanced: "متقدم",
  all: "جميع المستويات",
  all_levels: "جميع المستويات",
};

const languageLabels = { ar: "العربية", en: "الإنجليزية" };
const arrayOfText = (value) => Array.isArray(value)
  ? value.map((item) => textOf(item)).filter(Boolean)
  : value ? [textOf(value)] : [];

const normalizeInstructor = (profile = {}, account = null) => {
  const user = account || (typeof profile.user === "object" ? profile.user : {});
  const name = textOf(user.fullName || user.name || profile.fullName || profile.name, "المحاضر");
  return {
    ...profile,
    id: profile.id || profile._id,
    profileSlug: profile.profileSlug || profile.slug || user.username || "",
    name,
    fullName: name,
    headline: textOf(profile.headline),
    bio: textOf(profile.bio),
    status: profile.status || "active",
    avatar: getAssetUrl(user.profileImage || user.avatar || profile.profileImage || profile.avatar),
    profileImage: getAssetUrl(user.profileImage || user.avatar || profile.profileImage || profile.avatar),
    user: { ...user, id: user.id || user._id || (typeof profile.user === "string" ? profile.user : undefined) },
  };
};

export const normalizeCourse = (source = {}) => {
  const enrollment = source.enrollment || source;
  const course = source.course || source.courseId || enrollment.course || source;
  const sections = (Array.isArray(course.sections) && course.sections.length ? course.sections : null)
    || (Array.isArray(course.curriculum) ? course.curriculum : null)
    || (Array.isArray(course.curriculum_sections) ? course.curriculum_sections : null)
    || (Array.isArray(source.sections) ? source.sections : []);
  const lessonCount = course.lessonsCount ?? course.lessonCount ?? sections.reduce(
    (total, section) => total + (section.lessons?.length || 0),
    0,
  );
  const completedLessons = source.completedLessonsCount ?? source.progress?.completedLessons ?? 0;
  const progress = Number(source.progressPercentage ?? source.progress?.percentage ?? source.progress ?? 0);
  const instructor = course.instructor || course.teacher || course.createdBy || {};
  const normalizedInstructor = typeof instructor === "object" && instructor !== null
    ? normalizeInstructor(instructor)
    : null;
  const rejectionReview = [...(course.reviewHistory || [])]
    .reverse()
    .find((entry) => entry.action === "rejected");
  const category = course.category || {};
  const price = Number(course.price?.amount ?? course.price ?? 0);
  const studentsData = Array.isArray(course.enrollments) ? course.enrollments
    : Array.isArray(course.students) ? course.students
      : Array.isArray(source.enrollments) ? source.enrollments : [];
  const reviewsData = Array.isArray(course.reviews) ? course.reviews
    : Array.isArray(course.ratings) ? course.ratings
      : Array.isArray(source.reviews) ? source.reviews : [];
  const transactions = Array.isArray(course.transactions) ? course.transactions
    : Array.isArray(course.payments) ? course.payments
      : Array.isArray(source.transactions) ? source.transactions : [];
  const entityId = (value) => value?._id || value?.id || (typeof value === "string" ? value : "");
  const academicCurriculum =
  course.curriculumRef ||
  course.academicCurriculum ||
  course.curriculumId ||
  (typeof course.curriculum === "object" && !Array.isArray(course.curriculum)
    ? course.curriculum
    : null);

  const academicStage = course.stage || course.academicStage;
  const academicGrade = course.grade || course.academicGrade;
  const academicSubject = course.subject;

  return {
    ...course,
    id: course._id || course.id,
    slug: course.slug || course._id || course.id,
    title: String(valueOf(course.title, "دورة تعليمية")),
    titleEn: textOf(course.title?.en || course.titleEn || course.titleEnglish),
    description: String(valueOf(course.description)),
    category: String(valueOf(category, "عام")),
    categoryId: category._id || category.id || (typeof course.category === "string" ? course.category : ""),
    classification: String(valueOf(course.courseType, valueOf(category, "عام"))),
    level: levelLabels[course.level] || valueOf(course.level, "جميع المستويات"),
    language: languageLabels[course.language] || valueOf(course.language, "العربية"),
    instructor: normalizedInstructor?.name || String(valueOf(instructor, "الأكاديمية")),
    instructorDetails: normalizedInstructor
      ? normalizedInstructor
      : { name: textOf(instructor, "الأكاديمية") },
    instructorId: instructor._id || instructor.id || (typeof course.instructor === "string" ? course.instructor : ""),
    instructorSlug: normalizedInstructor?.profileSlug || "",
    academicCurriculumId: entityId(academicCurriculum),
    academicStageId: entityId(academicStage),
    academicGradeId: entityId(academicGrade),
    subjectId: entityId(academicSubject),
    // academicCurriculumName: textOf(academicCurriculum),
    academicCurriculumName:
  textOf(
    academicCurriculum ||
    course.curriculumName ||
    course.curriculumTitle ||
    course.curriculum
  ),
    academicStage: textOf(academicStage),
    academicGrade: textOf(academicGrade),
    subject: textOf(academicSubject),
    shortDescription: textOf(course.shortDescription),
    requirements: arrayOfText(course.requirements),
    targetAudience: arrayOfText(course.targetAudience),
    outcomes: course.outcomes || course.learningOutcomes || course.whatYouWillLearn || [],
    tags: course.tags || [],
    pricingType: course.pricingType || (price > 0 ? "paid" : "free"),
    discountPercent: Number(course.discountPercentage ?? course.discountPercent ?? course.discount ?? 0),
    effectivePrice: Number(course.effectivePrice ?? price),
    promoVideoUrl: getAssetUrl(course.promoVideo?.url || course.promoVideo || course.previewVideo),
    price: course.pricingType === "free" ? 0 : price,
    duration: Number(course.durationHours ?? course.totalDurationHours ?? course.duration ?? 0),
    lessons: Number(lessonCount),
    rating: Number(course.averageRating ?? course.rating ?? 0),
    students: Number(Array.isArray(course.enrollments)
      ? course.enrollments.filter((item) => !item?.status || item.status === 'active').length
      : course.enrollmentsCount ?? course.studentsCount ?? (Array.isArray(course.students) ? course.students.length : course.students) ?? studentsData.length),
    revenue: Number(course.revenue ?? 0),
    createdAt: course.createdAt || source.createdAt,
    updatedAt: course.updatedAt || source.updatedAt,
    studentsData,
    reviewsData,
    transactions,
    status: statusLabels[course.status] || valueOf(course.status, "مسودة"),
    rejectionReason: course.rejectionReason || rejectionReview?.notes || "",
    rejectedReason: course.rejectedReason || course.rejectionReason || rejectionReview?.notes || "",
    rawStatus: course.status ?? null,
    featured: Boolean(course.featured ?? course.isFeatured),
    coverImage: getAssetUrl(course.coverImage?.url || course.coverImage || course.thumbnail),
    sections,
    quizzes: Array.isArray(course.quizzes) ? course.quizzes : [],
    curriculum: sections.map((section) => ({
      ...section,
      id: section._id || section.id,
      title: valueOf(section.title),
      lessons: (section.lessons || []).map((lesson) => ({
        ...lesson,
        id: lesson._id || lesson.id,
        title: valueOf(lesson.title),
        type: ({ video: "فيديو", document: "ملف", file: "ملف", audio: "صوت", quiz: "اختبار", exam: "اختبار" })[lesson.type || lesson.contentType] || lesson.type || lesson.contentType || "فيديو",
        duration: Number(lesson.durationMinutes ?? lesson.duration ?? (lesson.durationSeconds != null ? lesson.durationSeconds / 60 : 0)),
        preview: Boolean(lesson.isPreview),
        legacyMedia: lesson.media?.url || lesson.mediaUrl || lesson.videoUrl || lesson.fileUrl || lesson.primaryContent
          ? { name: lesson.media?.name || lesson.fileName || "محتوى الدرس", url: getAssetUrl(lesson.media?.url || lesson.mediaUrl || lesson.videoUrl || lesson.fileUrl) }
          : null,
        media: lesson.media?.url || lesson.mediaUrl || lesson.videoUrl || lesson.fileUrl || lesson.primaryContent
          ? {
              ...lesson.primaryContent,
              name: lesson.primaryContent?.originalName || lesson.media?.name || lesson.fileName || 'محتوى الدرس',
              originalName: lesson.primaryContent?.originalName,
              url: getAssetUrl(lesson.media?.url || lesson.mediaUrl || lesson.videoUrl || lesson.fileUrl || lesson.primaryContent?.url || lesson.primaryContent?.path || lesson.primaryContent?.secureUrl) || (lesson.primaryContent ? '#stored' : null),
              previewUrl: getAssetUrl(lesson.media?.url || lesson.mediaUrl || lesson.videoUrl || lesson.fileUrl || lesson.primaryContent?.url || lesson.primaryContent?.path || lesson.primaryContent?.secureUrl),
              persisted: Boolean(lesson.primaryContent || lesson.mediaUrl || lesson.videoUrl || lesson.fileUrl),
            }
          : null,
        attachments: (lesson.attachments || []).map((file) => ({
          ...file,
          name: file.name || file.fileName || "مرفق",
          url: getAssetUrl(file.url || file.path),
        })),
        quiz: lesson.quiz?.questions || lesson.questions || lesson.quiz || [],
      })),
    })),
    progressData: {
      percentage: Number.isFinite(progress) ? progress : 0,
      completedLessons: Number(completedLessons),
      totalLessons: Number(lessonCount),
      completedTests: Number(source.completedQuizzesCount ?? 0),
      lastCompletedTitle: valueOf(source.lastLesson?.title),
    },
    enrollmentId: source._id || source.id,
  };
};

const uniqueCourses = (courses) => Array.from(
  new Map(courses.filter((course) => course.id).map((course) => [String(course.id), course])).values(),
);

const enrichCourseInstructor = async (course) => {
  const current = course.instructorDetails || {};
  if (current.profileSlug && typeof current.user === "object" && current.user?.fullName) return course;
  const instructorId = course.instructorId || current._id || current.id;
  if (!instructorId) return course;

  try {
    let teacher;
    try {
      const response = await getTeacher(instructorId);
      const data = response?.data?.data ?? response?.data ?? response;
      teacher = data?.teacher || data?.instructor || data;
    } catch {
      try {
        const response = await getMyInstructorProfile();
        const data = response?.data?.data ?? response?.data ?? response;
        teacher = data?.instructor || data?.teacher || data?.profile || data;
      } catch {
        const response = await getTeachers();
        teacher = listOf(response).find((item) => {
          const account = item.user || item;
          return [item._id, item.id, account._id, account.id].some((id) => String(id || "") === String(instructorId));
        });
      }
    }
    if (!teacher) return course;
    let account = teacher?.user && typeof teacher.user === "object" ? teacher.user : teacher;
    const userId = typeof teacher?.user === "string"
      ? teacher.user
      : teacher?.userId || teacher?.user?._id || teacher?.user?.id || instructorId;
    if (userId && (!account?.email || !account?.phone)) {
      try {
        const userResponse = await getUser(userId);
        const userData = userResponse?.data?.data ?? userResponse?.data ?? userResponse;
        account = userData?.user || userData;
      } catch {
        try {
          const userResponse = await getMyProfile();
          const userData = userResponse?.data?.data ?? userResponse?.data ?? userResponse;
          account = userData?.user || userData;
        } catch {
          // The teacher profile can still be displayed when account details are restricted.
        }
      }
    }
    const firstSelection = teacher.teachingSelections?.[0];
    const firstStage = firstSelection?.stages?.[0];
    const firstGrade = firstStage?.grades?.[0];
    const firstSubject = firstGrade?.subjects?.[0];
    const name = textOf(
      account?.fullName || account?.name || teacher?.fullName || teacher?.name,
      course.instructor,
    );
    return {
      ...course,
      instructor: name,
      instructorId: teacher?._id || teacher?.id || account?._id || account?.id || instructorId,
      instructorDetails: {
        ...teacher,
        name,
        fullName: name,
        email: account?.email || teacher?.email,
        phone: account?.phone || account?.phoneNumber || teacher?.phone || teacher?.phoneNumber,
        avatar: getAssetUrl(account?.avatar || account?.profileImage || teacher?.avatar || teacher?.profileImage),
        createdAt: account?.createdAt || teacher?.createdAt,
        experience: teacher?.experienceYears ?? teacher?.yearsOfExperience ?? teacher?.experience,
        yearsOfExperience: teacher?.experienceYears ?? teacher?.yearsOfExperience ?? teacher?.experience,
        curriculum: textOf(firstSelection?.curriculum || teacher?.curriculum || teacher?.curriculums?.[0] || course.academicCurriculumName),
        educationSystem: textOf(firstSelection?.curriculum || teacher?.educationSystem || course.academicCurriculumName),
        stage: textOf(firstStage?.stage || firstStage || teacher?.stage || course.academicStage),
        subject: textOf(firstSubject || teacher?.subject || teacher?.subjects?.[0] || course.subject),
        user: account,
      },
    };
  } catch {
    return course;
  }
};

const enrichWithMyInstructorProfile = async (course) => {
  try {
    const [profileResponse, accountResponse] = await Promise.all([
      getMyInstructorProfile(),
      getMyProfile().catch(() => null),
    ]);
    const profileData = profileResponse?.data?.data ?? profileResponse?.data ?? profileResponse;
    const accountData = accountResponse?.data?.data ?? accountResponse?.data ?? accountResponse;
    const profile = profileData?.instructor || profileData;
    const account = accountData?.user || accountData || null;
    const instructor = normalizeInstructor(profile, account);
    return {
      ...course,
      instructor: instructor.name,
      instructorId: instructor.id || course.instructorId,
      instructorSlug: instructor.profileSlug,
      instructorDetails: instructor,
    };
  } catch {
    return enrichCourseInstructor(course);
  }
};

export const fetchPublicCourses = async (params) =>
  listOf(await getPublicCourses(params)).map(normalizeCourse);

export const fetchPublicCourse = async (slug) =>
  normalizeCourse(responseCourse(await getPublicCourse(slug)));

export const fetchPublicInstructor = async (slug) => {
  const response = await getPublicInstructor(slug);
  const data = response?.data?.data ?? response?.data ?? response;
  return normalizeInstructor(data?.instructor || data);
};

export const enrollFreeCourse = async (courseId) => {
  const response = await enrollInMarketplaceCourse(courseId);
  return response?.data?.data ?? response?.data ?? response;
};

export const fetchCourseAccess = async (courseId) => {
  const response = await getCourseAccess(courseId);
  return response?.data?.data ?? response?.data ?? response;
};

export const fetchCourseLearningView = async (courseId) => {
  const response = await getCourseLearningView(courseId);
  return response?.data?.data ?? response?.data ?? response;
};

export const fetchTeacherCourses = async (params) =>
  listOf(await getMyTeacherCourses(params)).map(normalizeCourse);

export const fetchTeacherCourse = async (id) =>
  enrichWithMyInstructorProfile(normalizeCourse(responseCourse(await getMyTeacherCourse(id))));

export const fetchStudentCourses = async (params) =>
  listOf(await getMyCourseEnrollments(params)).map(normalizeCourse);

export const fetchAdminCourses = async (params) => {
  const responses = await Promise.allSettled([
    getPublicCourses(params),
    getPendingAdminCourses(params),
    getMyTeacherCourses(params),
  ]);
  const courses = uniqueCourses(
    responses.flatMap((result) => result.status === "fulfilled" ? listOf(result.value) : []).map(normalizeCourse),
  );
  return Promise.all(courses.map(async (course) => {
    if (!course.id) return course;
    try {
      const enrollmentResponse = await getAdminCourseEnrollments(course.id);
      const enrollments = listOf(enrollmentResponse);
      const activeEnrollments = enrollments.filter((enrollment) =>
        !enrollment.status || enrollment.status === 'active');
      return { ...course, students: activeEnrollments.length, studentsData: activeEnrollments };
    } catch {
      return course;
    }
  }));
};

// The API lifecycle archives courses and does not expose DELETE /courses/:id.
export const removeTeacherCourse = (courseId) => archiveCourse(courseId);

export const approveCourse = async (courseId, notes = "") =>
  normalizeCourse(responseCourse(await approveMarketplaceCourse(
    courseId,
    notes.trim() ? { notes: notes.trim() } : {},
  )));

export const rejectCourse = async (courseId, reason, details = "") =>
  normalizeCourse(responseCourse(await rejectMarketplaceCourse(courseId, {
    notes: [reason, details].map((value) => value?.trim()).filter(Boolean).join(" — "),
  })));

export const fetchCourseCategories = async () => listOf(await getCourseCategories());
export const fetchCourseInstructors = async () => listOf(await getTeachers());
export const addCourseCategory = async (name) => {
  const response = await createCourseCategory({ name: { ar: name.trim(), en: name.trim() } });
  const data = response?.data?.data ?? response?.data ?? response;
  return data?.category || data;
};

const splitValues = (value) => Array.isArray(value)
  ? value.filter(Boolean)
  : String(value || "").split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean);

const levelValues = {
  "مبتدئ": "beginner",
  "متوسط": "intermediate",
  "متقدم": "advanced",
  "جميع المستويات": "beginner",
};
const languageValues = { "عربي": "ar", "العربية": "ar", "إنجليزي": "en", "الإنجليزية": "en" };

const isMongoId = (value) => /^[a-f\d]{24}$/i.test(String(value || ""));

const coursePayload = (course) => {
  const academicIds = {
    curriculum: course.academicCurriculum,
    stage: course.academicStage,
    grade: course.academicGrade,
    subject: course.subject,
  };
  const isAcademic = Object.values(academicIds).every(isMongoId);

  return {
    title: { ar: course.title.trim(), en: course.titleEn.trim() },
    description: course.description || course.shortDescription || course.title,
    requirements: splitValues(course.requirements),
    targetAudience: splitValues(course.targetAudience),
    category: course.categoryId || course.category,
    courseType: isAcademic ? "academic" : "general",
    ...(isAcademic ? academicIds : {}),
    level: levelValues[course.level] || course.level || "beginner",
    language: languageValues[course.language] || course.language || "ar",
    pricingType: course.pricingType || "free",
    ...(course.pricingType === "paid" ? { price: Number(course.price), discountPercent: Number(course.discountPercent || 0) } : {}),
  };
};

const responseCourse = (response) => {
  const data = response?.data?.data ?? response?.data ?? response;
  return data?.course || data;
};

export const fetchAdminCourse = async (id) => {
  try {
    const [courseResponse, enrollmentsResponse, categoriesResponse] = await Promise.all([
      getAdminCourse(id),
      getAdminCourseEnrollments(id).catch(() => null),
      getAdminCourseCategories().catch(() => null),
    ]);
    const course = responseCourse(courseResponse);
    const enrollments = enrollmentsResponse ? listOf(enrollmentsResponse) : (course.enrollments || []);
    const categoryId = course.category?._id || course.category?.id || course.category;
    const category = categoriesResponse
      ? listOf(categoriesResponse).find((item) => String(item._id || item.id) === String(categoryId))
      : null;
    return enrichCourseInstructor(normalizeCourse({
      ...course,
      category: category || course.category,
      enrollments,
    }));
  } catch (adminError) {
    if (![401, 403, 404].includes(adminError?.response?.status)) throw adminError;
  }
  const responses = await Promise.allSettled([
    getMyTeacherCourse(id),
    getPublicCourse(id),
    getPendingAdminCourses(),
    getPublicCourses(),
  ]);
  for (const result of responses) {
    if (result.status !== "fulfilled") continue;
    const direct = responseCourse(result.value);
    if (direct?._id || direct?.id) return enrichCourseInstructor(normalizeCourse(direct));
    const match = listOf(result.value).find((item) => String(item._id || item.id) === String(id));
    if (match) return enrichCourseInstructor(normalizeCourse(match));
  }
  throw new Error("لم يتم العثور على الدورة");
};

export const saveCourseToApi = async ({ course, courseId, admin = false, submit = false, onProgress = () => {} }) => {
  onProgress({ label: "جاري حفظ بيانات الدورة", percent: 0 });
  const payload = coursePayload(course);
  if (payload.discountPercent !== undefined) {
    payload.discountPercentage = payload.discountPercent;
    delete payload.discountPercent;
  }
  let response;
  let id = courseId;
  if (courseId) {
    response = await updateMarketplaceCourse(courseId, payload);
  } else {
    response = await createMarketplaceCourse({
      title: payload.title,
      category: payload.category,
      courseType: payload.courseType,
      pricingType: payload.pricingType,
    });
    const created = responseCourse(response);
    id = created?._id || created?.id;
    if (id) response = await updateMarketplaceCourse(id, payload);
  }
  let saved = responseCourse(response);
  id = saved?._id || saved?.id || id;
  if (!id) throw new Error("لم يُرجع الخادم معرّف الدورة");

  const progressHandler = (label) => (event) => {
    const percent = event.total ? Math.round((event.loaded * 100) / event.total) : 0;
    onProgress({ label, percent });
  };
  if (course.cover?.file) await uploadCourseCover(id, course.cover.file, progressHandler("جاري رفع صورة الغلاف"));
  if (course.promoVideo?.file) await uploadCoursePromoVideo(id, course.promoVideo.file, progressHandler("جاري رفع الفيديو الترويجي"));

  let storedSections = [];
  if (courseId) {
    try {
      const detail = responseCourse(await (admin ? getAdminCourse(id) : getMyTeacherCourse(id)));
      storedSections = detail?.sections
        || detail?.curriculum_sections
        || (Array.isArray(detail?.curriculum) ? detail.curriculum : []);
    } catch {
      storedSections = [];
    }
  }

  for (let sectionIndex = 0; sectionIndex < course.curriculum.length; sectionIndex += 1) {
      const section = course.curriculum[sectionIndex];
      let savedSection = storedSections.find(
        (item) => String(item._id || item.id) === String(section._id || section.id),
      );
      const existingSectionId = savedSection?._id || savedSection?.id;
      if (existingSectionId) {
        await updateCourseSection(id, existingSectionId, {
          title: section.title,
          description: section.description || '',
        });
      }
      if (!savedSection) {
        const sectionResponse = await createCourseSection(id, {
          title: section.title,
          description: section.description || "",
        });
        savedSection = responseCourse(sectionResponse)?.section || responseCourse(sectionResponse);
      }
      const sectionId = savedSection?._id || savedSection?.id;
      if (!sectionId) continue;
      const storedLessons = savedSection.lessons || [];
      for (let lessonIndex = 0; lessonIndex < section.lessons.length; lessonIndex += 1) {
        const lesson = section.lessons[lessonIndex];
        let savedLesson = storedLessons.find(
          (item) => String(item._id || item.id) === String(lesson._id || lesson.id),
        );
        const lessonContentType = ({ 'فيديو': 'video', 'ملف': 'document', 'صوت': 'audio', 'مستند': 'document' })[lesson.type]
          || String(lesson.type || 'video').toLowerCase();
        const existingLessonId = savedLesson?._id || savedLesson?.id;
        if (existingLessonId) {
          await updateCourseLesson(id, existingLessonId, {
            title: lesson.title,
            description: lesson.description || '',
            contentType: lessonContentType,
            isPreview: Boolean(lesson.preview),
          });
        }
        if (!savedLesson) {
          const lessonResponse = await createCourseLesson(id, sectionId, {
            title: lesson.title,
            description: lesson.description || "",
            contentType: lessonContentType,
            isPreview: Boolean(lesson.preview),
          });
          savedLesson = responseCourse(lessonResponse)?.lesson || responseCourse(lessonResponse);
        }
        const lessonId = savedLesson?._id || savedLesson?.id;
        if (lessonId && lesson.media?.file) {
          const contentType = lesson.media.file.type?.startsWith("video/") ? "video" : "document";
          await uploadCourseLessonMedia(
            id,
            lessonId,
            lesson.media.file,
            contentType,
            progressHandler(`جاري رفع محتوى الدرس: ${lesson.title}`),
          );
        }
      }
  }
  if (submit) {
    onProgress({ label: "جاري إرسال الدورة للمراجعة", percent: 100 });
    try {
      const submitResponse = await submitMarketplaceCourse(id);
      saved = responseCourse(submitResponse) || saved;
    } catch (error) {
      error.savedCourseId = id;
      throw error;
    }
  }
  return normalizeCourse(saved || { ...course, _id: id });
};
