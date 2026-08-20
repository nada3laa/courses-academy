import {
  getAllStudents,
  getTeachers,
  updateStudentProfile,
  updateTeacherProfile,
  updateUser,
} from "../services/APIService";

const profileFromResponse = (response, role) => {
  const data = response.data?.data ?? response.data;
  const profiles = Array.isArray(data)
    ? data
    : data?.[role === "student" ? "students" : "teachers"] || [data];
  return profiles.find(Boolean);
};

// المسار الوحيد لقبول طلبات التسجيل؛ تستخدمه الجداول وكل الـ popups حتى
// ينفذ الباك نفس hooks والإيميل بغض النظر عن مكان ضغط الأدمن.
export const approveRegistrationRequest = async ({ userId, role }) => {
  if (!userId) throw new Error("معرّف المستخدم غير موجود");

  if (role === "student" || role === "teacher") {
    const response =
      role === "student"
        ? await getAllStudents({ user: userId })
        : await getTeachers({ user: userId });
    const profile = profileFromResponse(response, role);
    const profileId = profile?.id || profile?._id;
    if (!profileId) {
      throw new Error(
        role === "teacher" ? "ملف المعلم غير موجود" : "ملف الطالب غير موجود",
      );
    }

    if (role === "teacher") {
      await updateTeacherProfile(profileId, { status: "approved" });
    } else {
      await updateStudentProfile(profileId, { status: "approved" });
    }
  }

  return updateUser(userId, {
    ...(role === "teacher" ? { status: "active" } : {}),
    registrationStatus: "active",
    isActive: true,
  });
};
