import axios from "axios";

const API = axios.create({
  baseURL: "https://api.alacademeya.com/api",
});

const ROOT_API = axios.create({
  baseURL: "https://api.alacademeya.com/api",
});

const attachToken = (config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

const firstValidationMessage = (value) => {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (Array.isArray(value)) {
    for (const item of value) {
      const message = firstValidationMessage(item);
      if (message) return message;
    }
  }
  if (value && typeof value === "object") {
    for (const item of Object.values(value)) {
      const message = firstValidationMessage(item);
      if (message) return message;
    }
  }
  return "";
};

const exposeValidationMessage = (error) => {
  const body = error?.response?.data;
  const validationMessage = firstValidationMessage(body?.errors);

  // Most screens already display response.data.message. Replace the generic
  // wrapper with the useful field-level validation message in one place.
  if (body && validationMessage) body.message = validationMessage;
  return Promise.reject(error);
};

API.interceptors.request.use(attachToken);
ROOT_API.interceptors.request.use(attachToken);
API.interceptors.response.use((response) => response, exposeValidationMessage);
ROOT_API.interceptors.response.use(
  (response) => response,
  exposeValidationMessage,
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const login = (credentials) => API.post("/auth/login", credentials);
export const register = (userData) => API.post("/auth/register", userData);
export const resendOtp = (email) =>
  API.post("/auth/resendVerificationCode", { email });
export const verifyAccount = (data) => API.post("/auth/verifyAccount", data);

export const updatePassword = async ({ currentPassword, updatedPassword }) => {
  const response = await API.patch("/auth/updatePassword", {
    currentPassword,
    updatedPassword,
  });
  const replacementToken = response.data?.token;
  if (replacementToken) localStorage.setItem("token", replacementToken);
  return response;
};

export const forgotPassword = (email) =>
  API.post("/auth/forgotPassword", { email });

export const verifyPasswordResetCode = (resetCode) =>
  API.post("/auth/verifyResetCode", {
    resetCode,
  });

export const resetPassword = ({ email, newPassword }) =>
  API.post("/auth/resetPassword", {
    email,

    newPassword,
  });

export const completeStudentProfile = (payload) =>
  API.post("/auth/completeStudentProfile", payload);

export const completeTeacherProfile = (payload) =>
  // Do not set Content-Type for FormData: the browser must add its boundary.
  API.patch("/auth/completeTeacherProfile", payload, { headers: { lang: "ar" } });

export const getMyTeachingSelections = () =>
  API.get("/teachers/me/teaching-selections", { headers: { lang: "ar" } });
export const updateMyTeachingSelections = ({ teachingSelections }) =>
  API.patch(
    "/teachers/me/teaching-selections",
    { teachingSelections },
    { headers: { lang: "ar" } },
  );

export const saveStudentInterests = (payload) =>
  API.post("/auth/student/interests", payload);

export const saveTeacherDetails = (payload) =>
  API.post("/auth/teacher/details", payload);

export const getAccountState = () => API.get("/auth/account-state");

export const getCountries = () => API.get("/countries");

// Instructor marketplace profile (a separate profile linked to role=user)
const isInstructorAgreementVersionError = (error) => {
  const message = String(error?.response?.data?.message || "").toLowerCase();
  return error?.response?.status === 400
    && message.includes("agreement")
    && message.includes("version");
};

const agreementVersionFromError = (error) => {
  const body = error?.response?.data || {};
  return body.currentAgreementVersion
    || body.expectedAgreementVersion
    || body.expectedVersion
    || body.errors?.agreementVersion?.current
    || body.errors?.agreementVersion?.expected
    || "";
};

export const createInstructorProfile = async (payload) => {
  const configuredVersion = payload?.agreementVersion;
  const fallbackVersions = ["2026-08", "2025-01", "2024-01", "1.0"];
  const versions = [...new Set([configuredVersion, ...fallbackVersions].filter(Boolean))];
  let lastError;

  for (let index = 0; index < versions.length; index += 1) {
    try {
      return await API.post("/instructors", {
        ...payload,
        agreementVersion: versions[index],
      });
    } catch (error) {
      lastError = error;
      if (!isInstructorAgreementVersionError(error)) throw error;

      const expectedVersion = agreementVersionFromError(error);
      if (expectedVersion && !versions.includes(expectedVersion)) {
        versions.splice(index + 1, 0, expectedVersion);
      }
    }
  }

  throw lastError;
};
export const getMyInstructorProfile = () => API.get("/instructors/me");
export const updateMyInstructorProfile = (payload) =>
  API.patch("/instructors/me", payload);
export const getPublicInstructor = (slug) =>
  API.get(`/instructors/${encodeURIComponent(slug)}`);
export const updateInstructorStatus = (id, payload) =>
  API.patch(`/instructors/${id}/status`, payload);

// Course marketplace
export const getPublicCourses = (params) => API.get("/courses", { params });
export const getPublicCourse = (slug) =>
  API.get(`/courses/${encodeURIComponent(slug)}`);
export const getCourseCategories = (params) =>
  API.get("/course-categories", { params });
export const createCourseCategory = (payload) =>
  API.post("/course-categories", payload);
export const createMarketplaceCourse = (payload) => API.post("/courses", payload);
export const updateMarketplaceCourse = (id, payload) =>
  API.patch(`/courses/${id}`, payload);
export const uploadCourseCover = (id, file, onUploadProgress) => {
  const formData = new FormData();
  formData.append("coverImage", file);
  return API.patch(`/courses/${id}/cover`, formData, { onUploadProgress, timeout: 10 * 60 * 1000 });
};
export const uploadCoursePromoVideo = (id, file, onUploadProgress) => {
  const formData = new FormData();
  formData.append("promoVideo", file);
  return API.patch(`/courses/${id}/promo-video`, formData, { onUploadProgress, timeout: 10 * 60 * 1000 });
};
export const createCourseSection = (id, payload) =>
  API.post(`/courses/${id}/sections`, payload);
export const createCourseLesson = (courseId, sectionId, payload) =>
  API.post(`/courses/${courseId}/sections/${sectionId}/lessons`, payload);
export const uploadCourseLessonMedia = (courseId, lessonId, file, contentType = "video", onUploadProgress) => {
  const formData = new FormData();
  formData.append("media", file);
  formData.append("type", contentType);
  return API.patch(`/courses/${courseId}/lessons/${lessonId}/media`, formData, { onUploadProgress, timeout: 10 * 60 * 1000 });
};
export const submitMarketplaceCourse = (id) => API.post(`/courses/${id}/submit`);
export const getMyTeacherCourses = (params) => API.get("/courses/me", { params });
export const getMyTeacherCourse = (id) => API.get(`/courses/me/${id}`);
export const getMyCourseEnrollments = (params) =>
  API.get("/course-enrollments/me", { params });
export const enrollInMarketplaceCourse = (courseId) =>
  API.post(`/courses/${courseId}/enroll`);
export const getCourseAccess = (courseId) =>
  API.get(`/courses/${courseId}/access`);
export const getCourseLearningView = (courseId) =>
  API.get(`/courses/${courseId}/learn`);
export const requestLessonMediaAccess = (courseId, lessonId) =>
  API.post(`/courses/${courseId}/lessons/${lessonId}/media-access`);
export const getProtectedMediaUrl = (ticket) =>
  API.defaults.baseURL + '/protected-media/' + encodeURIComponent(ticket);
export const getCourseProgress = (courseId) =>
  API.get(`/courses/${courseId}/progress`);
export const updateCourseLessonProgress = (courseId, lessonId, payload) =>
  API.patch(`/courses/${courseId}/lessons/${lessonId}/progress`, payload);
export const completeCourseLesson = (courseId, lessonId) =>
  API.post(`/courses/${courseId}/lessons/${lessonId}/complete`);
export const startCoursePurchase = (courseId) =>
  API.post(`/courses/${courseId}/purchase`);
export const getCoursePurchase = (courseId) =>
  API.get(`/courses/${courseId}/purchase`);
export const getCourseCertificateState = (courseId) =>
  API.get(`/courses/${courseId}/certificate`);
export const claimCourseCertificate = (courseId) =>
  API.post(`/courses/${courseId}/certificate/claim`);
export const getMyCoursePurchases = (params) =>
  API.get(`/course-purchases/my`, { params });
export const getMyCourseCertificates = () => API.get(`/certificates/my`);
export const getAdminCourseCategories = (params) =>
  API.get('/course-categories/admin', { params });
export const updateCourseCategory = (id, payload) =>
  API.patch(`/course-categories/${id}`, payload);
export const updateCourseSection = (courseId, sectionId, payload) =>
  API.patch(`/courses/${courseId}/sections/${sectionId}`, payload);
export const deleteCourseSection = (courseId, sectionId) =>
  API.delete(`/courses/${courseId}/sections/${sectionId}`);
export const reorderCourseSections = (courseId, sectionIds) =>
  API.patch(`/courses/${courseId}/sections/reorder`, { sectionIds });
export const updateCourseLesson = (courseId, lessonId, payload) =>
  API.patch(`/courses/${courseId}/lessons/${lessonId}`, payload);
export const deleteCourseLesson = (courseId, lessonId) =>
  API.delete(`/courses/${courseId}/lessons/${lessonId}`);
export const moveCourseLesson = (courseId, lessonId, sectionId) =>
  API.patch(`/courses/${courseId}/lessons/${lessonId}/move`, { sectionId });
export const reorderCourseLessons = (courseId, sectionId, lessonIds) =>
  API.patch(`/courses/${courseId}/sections/${sectionId}/lessons/reorder`, { lessonIds });
export const uploadCourseLessonAttachments = (courseId, lessonId, files, onUploadProgress) => {
  const formData = new FormData();
  Array.from(files || []).forEach((file) => formData.append('attachments', file));
  return API.post(`/courses/${courseId}/lessons/${lessonId}/attachments`, formData, {
    onUploadProgress,
    timeout: 10 * 60 * 1000,
  });
};
export const deleteCourseLessonAttachment = (courseId, lessonId, attachmentId) =>
  API.delete(`/courses/${courseId}/lessons/${lessonId}/attachments/${attachmentId}`);
export const requestLessonAttachmentAccess = (courseId, lessonId, attachmentId) =>
  API.post(`/courses/${courseId}/lessons/${lessonId}/attachments/${attachmentId}/access`);
export const cancelCoursePurchase = (courseId) => API.post(`/courses/${courseId}/purchase/cancel`);
export const getAdminCoursePurchases = (params) => API.get('/admin/course-purchases', { params });
export const getAdminCoursePurchase = (id) => API.get(`/admin/course-purchases/${id}`);
export const getAdminCourseEnrollments = (courseId) =>
  API.get(`/courses/admin/${courseId}/enrollments`);
export const grantAdminCourseEnrollment = (courseId, userId) =>
  API.post(`/courses/admin/${courseId}/enrollments`, { userId });
export const revokeAdminCourseEnrollment = (courseId, enrollmentId, reason) =>
  API.post(`/courses/admin/${courseId}/enrollments/${enrollmentId}/revoke`, { reason });
export const createCourseQuiz = (courseId, payload) => API.post(`/courses/${courseId}/quizzes`, payload);
export const getCourseQuiz = (courseId, quizId) => API.get(`/courses/${courseId}/quizzes/${quizId}`);
export const updateCourseQuiz = (courseId, quizId, payload) => API.patch(`/courses/${courseId}/quizzes/${quizId}`, payload);
export const deleteCourseQuiz = (courseId, quizId) => API.delete(`/courses/${courseId}/quizzes/${quizId}`);
export const reorderCourseQuizzes = (courseId, quizIds) => API.patch(`/courses/${courseId}/quizzes/reorder`, { quizIds });
export const addCourseQuizQuestion = (courseId, quizId, payload) => API.post(`/courses/${courseId}/quizzes/${quizId}/questions`, payload);
export const updateCourseQuizQuestion = (courseId, quizId, questionId, payload) => API.patch(`/courses/${courseId}/quizzes/${quizId}/questions/${questionId}`, payload);
export const deleteCourseQuizQuestion = (courseId, quizId, questionId) => API.delete(`/courses/${courseId}/quizzes/${quizId}/questions/${questionId}`);
export const reorderCourseQuizQuestions = (courseId, quizId, questionIds) => API.patch(`/courses/${courseId}/quizzes/${quizId}/questions/reorder`, { questionIds });
export const submitCourseQuizAttempt = (courseId, quizId, payload) => API.post(`/courses/${courseId}/quizzes/${quizId}/attempts`, payload);
export const getMyCourseQuizAttempts = (courseId, quizId) => API.get(`/courses/${courseId}/quizzes/${quizId}/attempts`);
export const verifyCourseCertificate = (verificationCode) => API.get(`/certificates/verify/${encodeURIComponent(verificationCode)}`);
export const getCourseCertificate = (id) => API.get(`/certificates/${id}`);
export const getAdminCourseCertificates = (params) => API.get('/admin/certificates', { params });
export const getAdminCourseCertificate = (id) => API.get(`/admin/certificates/${id}`);
export const revokeCourseCertificate = (id, payload) => API.post(`/admin/certificates/${id}/revoke`, payload);
export const getPendingAdminCourses = (params) =>
  API.get("/courses/admin/pending", { params });
export const getAdminCourse = (id) => API.get(`/courses/admin/${id}`);
export const approveMarketplaceCourse = (id, payload = {}) =>
  API.post(`/courses/admin/${id}/approve`, payload);
export const rejectMarketplaceCourse = (id, payload) =>
  API.post(`/courses/admin/${id}/reject`, payload);
export const archiveCourse = (id) => API.post(`/courses/${id}/archive`);
export const deleteMarketplaceCourse = (id) => API.delete(`/courses/${id}`);

// ─── Contact Settings ────────────────────────────────────────────────────────
export const getContactSettings = () => API.get("/contact-settings");
export const updateContactSettings = (payload) =>
  API.patch("/contact-settings", payload);

// ─── Exchange rates ─────────────────────────────────────────────────────────
export const getExchangeRates = () => API.get("/exchange-rates");
export const createExchangeRate = (payload) =>
  API.post("/exchange-rates", payload);
export const updateExchangeRate = (currency, payload) =>
  API.patch(`/exchange-rates/${currency}`, payload);

// ──────────────────────────────────────────────────────────────────────────────
// Curriculums
// ──────────────────────────────────────────────────────────────────────────────
export const getCurriculums = () => API.get("/curriculums/");
export const getCurriculum = (id) => API.get(`/curriculums/${id}`);
export const createCurriculum = (payload) => API.post("/curriculums/", payload);
export const updateCurriculum = (id, payload) =>
  API.patch(`/curriculums/${id}`, payload);
export const deleteCurriculum = (id) => API.delete(`/curriculums/${id}`);

// ──────────────────────────────────────────────────────────────────────────────
// Stages
// ──────────────────────────────────────────────────────────────────────────────
export const getCurriculumStages = (curriculumId) =>
  API.get(`/stages/curriculum/${curriculumId}`);
export const getStage = (stageId) => API.get(`/stages/${stageId}`);
export const createStage = (payload) => API.post("/stages", payload);
export const updateStage = (stageId, payload) =>
  API.patch(`/stages/${stageId}`, payload);
export const deleteStage = (stageId) => API.delete(`/stages/${stageId}`);

// ──────────────────────────────────────────────────────────────────────────────
// Grades
// ──────────────────────────────────────────────────────────────────────────────
export const getStageGrades = (stageId) =>
  API.get("/grades", { params: { stage: stageId } });
export const getAllGrades = (params) => API.get("/grades", { params });
export const getGrade = (gradeId) => API.get(`/grades/${gradeId}`);
export const createGrade = (payload) => API.post("/grades", payload);
export const updateGrade = (gradeId, payload) =>
  API.patch(`/grades/${gradeId}`, payload);
export const deleteGrade = (gradeId) => API.delete(`/grades/${gradeId}`);

// ──────────────────────────────────────────────────────────────────────────────
// Subjects
// ──────────────────────────────────────────────────────────────────────────────
export const getSubjects = (params) => API.get("/subjects", { params });
export const getAllSubjects = (params) => API.get("/subjects", { params });
export const getSubject = (id) => API.get(`/subjects/${id}`);
export const createSubject = (payload) => API.post("/subjects", payload);
export const updateSubject = (id, payload) =>
  API.patch(`/subjects/${id}`, payload);
export const deleteSubject = (id) => API.delete(`/subjects/${id}`);

// ─── Parent / Students ────────────────────────────────────────────────────────
export const removeStudent = (studentId) =>
  API.delete(`/parents/students/${studentId}`);
export const addStudent = (payload) =>
  API.post("/parents/students", payload, { headers: { lang: "ar" } });
export const getMyStudents = () => API.get("/parents/students");
export const getStudentsStatistics = () =>
  API.get("/parents/students/statistics");
export const updateStudent = (studentId, payload) =>
  API.patch(`/parents/students/${studentId}`, payload);

// ─── User Profile ─────────────────────────────────────────────────────────────
export const getMyProfile = () => API.get("/users/me");
export const updateMyProfile = (payload = {}) => {
  // Account and approval state is controlled by the backend/admin only. Some
  // profile responses contain these fields, so never echo them back when a
  // caller builds an update payload from an existing profile object.
  const editablePayload = { ...payload };
  [
    "status",
    "registrationStatus",
    "registration_status",
    "isActive",
    "isVerified",
    "profileStatus",
  ].forEach((field) => delete editablePayload[field]);

  return API.patch("/users/me", editablePayload);
};
export const getUserTimezones = () => API.get("/users/timezones");
export const updateMyTimezone = (payload) =>
  API.patch("/users/me/timezone", payload);

// ──────────────────────────────────────────────────────────────────────────────
// Subscriptions
// ──────────────────────────────────────────────────────────────────────────────
export const createSubscription = (payload) =>
  API.post("/subscriptions", payload);
export const getAllSubscriptions = (params) =>
  API.get("/subscriptions/", { params });
export const getSubscription = (id) => API.get(`/subscriptions/${id}`);
export const getStudentSubscriptionOptions = (studentId) =>
  API.get(`/students/${studentId}/subscription-options`);
export const getPendingSubscriptionRequests = () =>
  API.get("/subscriptions/students/pending");
export const getMyStudentsSubscriptions = () =>
  API.get("/parents/students/subscriptions");
export const getMySubscriptions = (params) =>
  API.get("/subscriptions/my", { params });
export const getSubscriptionRenewOptions = (id) =>
  API.get(`/subscriptions/${id}/renew-options`);

// ─── Student subscription orders ─────────────────────────────────────────────
// Prices and totals are intentionally never accepted here. The backend is the
// authoritative source for all monetary values.
export const createSubscriptionOrder = (items, studentId, currency) =>
  API.post("/subscription-orders", {
    items,
    ...(studentId ? { student: studentId } : {}),
    ...(currency ? { currency } : {}),
  });
export const createRenewalSubscriptionOrder = (
  sourceSubscription,
  items,
  currency,
) =>
  API.post("/subscription-orders", {
    orderType: "renewal",
    sourceSubscription,
    items,
    ...(currency ? { currency } : {}),
  });
export const createAddSubjectSubscriptionOrder = (
  sourceSubscription,
  items,
  currency,
) =>
  API.post("/subscription-orders", {
    orderType: "add_subject",
    sourceSubscription,
    items,
    ...(currency ? { currency } : {}),
  });
export const getSubscriptionOrder = (id) =>
  API.get(`/subscription-orders/${id}`);
export const getMySubscriptionOrders = () => API.get("/subscription-orders/my");
export const startSubscriptionOrderCheckout = (id) =>
  API.post(`/subscription-orders/${id}/checkout`);
export const cancelSubscriptionOrder = (id) =>
  API.post(`/subscription-orders/${id}/cancel`);
export const getPendingSubscriptionOrders = (params) =>
  API.get("/subscription-orders/admin/pending", { params });
export const getAdminSubscriptionOrder = (id) =>
  API.get(`/subscription-orders/admin/${id}`);
export const approveSubscriptionOrder = (id, items) =>
  API.post(`/subscription-orders/admin/${id}/approve`, { items });

// ─── Admin payments ──────────────────────────────────────────────────────────
export const getAdminPayments = (params) =>
  API.get("/admin/payments", { params });
export const getAdminPaymentDetails = (id) => API.get(`/admin/payments/${id}`);

// ─── Admin teacher salaries ─────────────────────────────────────────────────
export const getTeacherSalariesSummary = (params) =>
  API.get("/admin/teacher-salaries/summary", { params });
export const previewTeacherSalary = (payload) =>
  API.post("/admin/teacher-salaries/preview", payload);
export const payTeacherSalary = (payload) =>
  API.post("/admin/teacher-salaries", payload);
export const getTeacherSalaries = (params) =>
  API.get("/admin/teacher-salaries", { params });
export const getTeacherSalary = (id) =>
  API.get(`/admin/teacher-salaries/${id}`);
export const cancelTeacherSalary = (id, cancellationReason) =>
  API.patch(`/admin/teacher-salaries/${id}/cancel`, { cancellationReason });

// ──────────────────────────────────────────────────────────────────────────────
// Discounts  (NEW)
// ──────────────────────────────────────────────────────────────────────────────
// Response item shape (confirmed from Postman):
// { name, code, type: "percentage" | "fixed", value, usedCount, isActive, createdAt, updatedAt, id }
export const getAllDiscounts = (params) => API.get("/discounts/", { params });
export const getDiscount = (id) => API.get(`/discounts/${id}`);
export const createDiscount = (payload) => API.post("/discounts/", payload);
export const updateDiscount = (id, payload) =>
  API.patch(`/discounts/${id}`, payload);
export const deleteDiscount = (id) => API.delete(`/discounts/${id}`);
// body shape TBD — assumed { code } or { code, subjectId } for cart-style validation
export const validateDiscount = (payload) =>
  API.post("/discounts/validate", payload);

// ─── Notifications ────────────────────────────────────────────────────────────
export const getNotifications = () => API.get("/notifications");
export const markNotificationRead = (id) =>
  API.patch(`/notifications/${id}/read`);
export const markAllNotificationsRead = () =>
  API.patch("/notifications/read-all");
export const deleteNotification = (id) => API.delete(`/notifications/${id}`);

// ──────────────────────────────────────────────────────────────────────────────
// Users (Admin)
// ──────────────────────────────────────────────────────────────────────────────
export const getUsers = (params) => API.get("/users/", { params });
export const getUser = (id) => API.get(`/users/${id}`);
export const createUser = (payload) => API.post("/users/", payload); // ← جديد
export const updateUser = (id, payload) => API.patch(`/users/${id}`, payload);
export const deleteUser = (id) => API.delete(`/users/${id}`);

// ──────────────────────────────────────────────────────────────────────────────
// Classrooms (Groups)
// ──────────────────────────────────────────────────────────────────────────────
export const getClassrooms = (params) => API.get("/classrooms/", { params });
export const getMyClassrooms = (params) =>
  API.get("/classrooms/my", { params });
export const getClassroom = (id) => API.get(`/classrooms/${id}`);
export const createClassroom = (payload) => API.post("/classrooms/", payload);
export const updateClassroom = (id, payload) =>
  API.patch(`/classrooms/${id}`, payload);
export const updateClassroomSubstituteTeacher = (id, substituteTeacher) =>
  API.patch(`/classrooms/${id}/substitute-teacher`, { substituteTeacher });
export const deleteClassroom = (id) => API.delete(`/classrooms/${id}`);
export const getAvailableClassrooms = (params) =>
  // params: { teacher, subject, type }
  API.get("/classrooms/available", { params });
export const getClassroomSessions = (classroomId, params) =>
  API.get(`/classrooms/${classroomId}/sessions/`, { params });
export const getClassroomStudents = (classroomId, params) =>
  API.get(`/classrooms/${classroomId}/students/`, { params });

// ─── Classroom Schedule ────────────────────────────────────────────────────────
export const getMonthlySchedule = ({ year, month } = {}) =>
  API.get("/schedule", {
    params: { year, month },
    headers: { lang: "ar" },
  });

// ✅ اتأكد من الـ Postman collection: الـ route مش /classrooms/:id/schedule
// الـ route الصح هو /schedule/:classroomId على طول (مش تحت /classrooms)
// PUT {{BASE_URL}}/schedule/:classroomId  body: { days: string[], time: "HH:mm" }
export const getClassroomSchedule = (classroomId) =>
  API.get(`/schedule/${classroomId}`, { headers: { lang: "ar" } });

export const createOrUpdateClassroomSchedule = (classroomId, payload) =>
  API.put(`/schedule/${classroomId}`, payload, { headers: { lang: "ar" } });
export const deleteClassroomSchedule = (classroomId) =>
  API.delete(`/schedule/${classroomId}`, { headers: { lang: "ar" } });

// ──────────────────────────────────────────────────────────────────────────────
// Students (Global / Admin)
// ──────────────────────────────────────────────────────────────────────────────
export const getAllStudents = (params) => API.get("/students", { params });
export const getStudent = (studentId) => API.get(`/students/${studentId}`);
export const updateStudentProfile = (studentId, payload) =>
  API.patch(`/students/${studentId}`, payload);

// ──────────────────────────────────────────────────────────────────────────────
// Teachers
// ──────────────────────────────────────────────────────────────────────────────
export const getAvailableTeachers = (params) =>
  API.get("/teachers/available", { params });
export const getTeachers = (params) => API.get("/teachers", { params });
export const getTeacher = (teacherId) => API.get(`/teachers/${teacherId}`);
export const getTeacherMonthlyReport = (teacherId, month) =>
  API.get(`/teachers/${teacherId}/monthly-report`, { params: { month } });
export const updateTeacherProfile = (teacherId, payload) =>
  API.patch(`/teachers/${teacherId}`, payload);

// ──────────────────────────────────────────────────────────────────────────────
// Sessions — Attendance
// ──────────────────────────────────────────────────────────────────────────────
export const getSessionAttendance = (sessionId) =>
  API.get(`/sessions/${sessionId}/attendance`);
export const saveSessionAttendance = (sessionId, payload) =>
  API.patch(`/sessions/${sessionId}/attendance`, payload);

export const createClassroomSession = (formData) =>
  API.post("/sessions/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const updateClassroomSession = (sessionId, formData) =>
  API.patch(`/sessions/${sessionId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const startSession = (sessionId) =>
  API.patch(`/sessions/${sessionId}/start`);
export const endSession = (sessionId) =>
  API.patch(`/sessions/${sessionId}/end`);
export const getNextSessions = () => API.get("/sessions/next");

export const getAllPackages = (params) => API.get("/packages", { params });
export const getPackage = (id) => API.get(`/packages/${id}`);
export const createPackage = (payload) => API.post("/packages", payload);
export const updatePackage = (id, payload) =>
  API.patch(`/packages/${id}`, payload);
export const deletePackage = (id) => API.delete(`/packages/${id}`);

// ──────────────────────────────────────────────────────────────────────────────
// Assignments (NEW)
// ──────────────────────────────────────────────────────────────────────────────
// GET /assignments/classroom/:classroomId → { success, results, data: [...] }
export const getAssignmentsByClassroom = (classroomId, params) =>
  API.get(`/assignments/classroom/${classroomId}`, { params });

// GET /assignments/:assignmentId → { success, data: {...} }
export const getAssignment = (assignmentId) =>
  API.get(`/assignments/${assignmentId}`);

// POST /assignments/ — expects multipart/form-data (attachments field for files)
// build the FormData in the caller, same pattern as createClassroomSession
export const createAssignment = (formData) =>
  API.post("/assignments/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateAssignment = (assignmentId, payload) =>
  API.patch(`/assignments/${assignmentId}`, payload);

export const deleteAssignment = (assignmentId) =>
  API.delete(`/assignments/${assignmentId}`);

// ─── Recordings ──────────────────────────────────────────────────────────────
export const createRecording = (formData) =>
  API.post("/recordings", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const getSessionRecording = (sessionId) =>
  API.get(`/recordings/session/${sessionId}`);

// GET /assignments/:assignmentId/submissions → { success, results, data: [...] }
// كل عنصر: { assignment, student: {...}, attachments, score, feedback, status, submittedAt, id }
export const getAssignmentSubmissions = (assignmentId) =>
  API.get(`/assignments/${assignmentId}/submissions`);

export const gradeSubmission = (submissionId, payload) =>
  API.patch(`/assignments/submissions/${submissionId}/grade`, payload);

// ================= Student Assignments =================

export const getMyAssignments = () => API.get("/assignments/my");

export const getMySubmission = (assignmentId) =>
  API.get(`/assignments/${assignmentId}/my-submission`);

export const submitAssignment = (assignmentId, formData) =>
  API.post(`/assignments/${assignmentId}/submit`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const getBlogCategories = () => API.get("/blog-categories/");
export const createBlogCategory = (payload) =>
  API.post("/blog-categories/", payload); // body: { name }

export const getBlogPosts = (params) => API.get("/blog-posts/", { params });
export const getBlogPost = (id) => API.get(`/blog-posts/${id}`);

export const createBlogPost = (formData) =>
  API.post("/blog-posts/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const updateBlogPost = (id, formData) =>
  API.patch(`/blog-posts/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const deleteBlogPost = (id) => API.delete(`/blog-posts/${id}`);

// ════════════════════════════════════════════════════════════════════════════
// Public blog endpoints (no auth required) — published posts only
// ════════════════════════════════════════════════════════════════════════════

// GET /blog-posts/public              → { success, results, data: [ ...posts ] }
export const getPublicBlogPosts = (params) =>
  API.get("/blog-posts/public", { params });

// GET /blog-posts/public/:slug        → { success, data: { blogPost: {...} } }
export const getPublicBlogPostBySlug = (slug) =>
  API.get(`/blog-posts/public/${encodeURIComponent(slug)}`);

// GET /blog-posts/public/category/:categorySlug
//                                     → { success, results, data: { category, blogPosts: [...] } }
export const getPublicBlogPostsByCategory = (categorySlug, params) =>
  API.get(`/blog-posts/public/category/${encodeURIComponent(categorySlug)}`, {
    params,
  });

export const ASSET_BASE_URL = "https://api.alacademeya.com/api";

export const getAssetUrl = (path) => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path; // لو خلاص لينك كامل

  const cleanPath = String(path)
    .replace(/^\/+/, "")
    .replace(/^api\//, "");

  return `${ASSET_BASE_URL}/${cleanPath}`;
};
