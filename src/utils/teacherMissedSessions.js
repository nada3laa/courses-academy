import {
  getClassrooms,
  getClassroomSchedule,
  getClassroomSessions,
} from "../services/APIService";

const idOf = (value) =>
  value?.id ?? value?._id ?? (typeof value === "string" ? value : null);

const nameOf = (value) => {
  if (!value) return "المجموعة";
  if (typeof value === "string") return value;
  return value.ar || value.en || value.name?.ar || value.name?.en || "المجموعة";
};

const DAY_INDEX = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

const dateKey = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const scheduleSlots = (response, classroom) => {
  const data = response?.data?.data ?? response?.data ?? {};
  const value =
    data.schedule ?? classroom?.schedule?.schedule ?? classroom?.schedule;
  return Array.isArray(value) ? value : [];
};

const firstRelevantDate = (teacher, classroom, scheduleResponse) => {
  const scheduleData =
    scheduleResponse?.data?.data ?? scheduleResponse?.data ?? {};
  const candidates = [
    classroom.teacherAssignedAt,
    classroom.teacherJoinedAt,
    classroom.assignedAt,
    scheduleData.createdAt,
    classroom.createdAt,
    teacher.createdAt,
    teacher.user?.createdAt,
  ]
    .map((value) => new Date(value))
    .filter((date) => !Number.isNaN(date.getTime()));
  return candidates.length
    ? new Date(Math.max(...candidates.map((date) => date.getTime())))
    : new Date();
};

const belongsToTeacher = (classroom, teacherIds) => {
  const classroomTeacherIds = [
    idOf(classroom.teacher),
    idOf(classroom.teacher?.user),
    idOf(classroom.substituteTeacher),
    idOf(classroom.substituteTeacher?.user),
  ].filter(Boolean);

  return classroomTeacherIds.some((id) =>
    teacherIds.some((teacherId) => String(id) === String(teacherId)),
  );
};

export const getTeacherMissedSessions = async (teacher) => {
  const teacherIds = [idOf(teacher), idOf(teacher.user), teacher.userId].filter(
    Boolean,
  );
  if (!teacherIds.length) return [];

  const classroomResults = await Promise.allSettled(
    teacherIds.map((teacherId) =>
      getClassrooms({ teacher: teacherId, limit: 100 }),
    ),
  );
  const returnedClassrooms = [];
  const seenClassrooms = new Set();
  classroomResults.forEach((result) => {
    if (result.status !== "fulfilled") return;
    const body = result.value.data?.data ?? result.value.data ?? [];
    const list = Array.isArray(body) ? body : body.classrooms || [];
    list.forEach((classroom) => {
      const classroomId = idOf(classroom);
      const key = classroomId || classroom;
      if (seenClassrooms.has(key)) return;
      seenClassrooms.add(key);
      returnedClassrooms.push(classroom);
    });
  });
  const matchedClassrooms = returnedClassrooms.filter((classroom) =>
    belongsToTeacher(classroom, teacherIds),
  );
  const responseHasTeacherReferences = returnedClassrooms.some(
    (classroom) => classroom.teacher || classroom.substituteTeacher,
  );
  // بعض نسخ الـ API تطبق فلتر teacher في السيرفر لكنها لا تعيد teacher populated.
  // لو الاستجابة فيها مراجع معلمين بالفعل فلا نستخدم مجموعات غير مطابقة.
  const classrooms = matchedClassrooms.length
    ? matchedClassrooms
    : responseHasTeacherReferences
      ? []
      : returnedClassrooms;

  const [sessionResults, scheduleResults] = await Promise.all([
    Promise.allSettled(
      classrooms.map((classroom) => getClassroomSessions(idOf(classroom))),
    ),
    Promise.allSettled(
      classrooms.map((classroom) => getClassroomSchedule(idOf(classroom))),
    ),
  ]);

  const seen = new Set();
  return scheduleResults
    .flatMap((scheduleResult, index) => {
      const classroom = classrooms[index];
      const sessionResult = sessionResults[index];
      if (sessionResult?.status !== "fulfilled") return [];
      const scheduleResponse =
        scheduleResult.status === "fulfilled" ? scheduleResult.value : null;
      const sessionsBody =
        sessionResult.value.data?.data ?? sessionResult.value.data ?? [];
      const sessions = Array.isArray(sessionsBody)
        ? sessionsBody
        : sessionsBody.sessions || [];
      const createdSessionDays = new Set(
        sessions
          .map((session) =>
            dateKey(
              session.scheduledDate ||
                session.scheduledAt ||
                session.startAt ||
                session.date,
            ),
          )
          .filter(Boolean),
      );
      const start = firstRelevantDate(teacher, classroom, scheduleResponse);
      const now = new Date();

      return scheduleSlots(scheduleResponse, classroom).flatMap((slot) => {
        const weekday = DAY_INDEX[String(slot.day || "").toLowerCase()];
        const [hour, minute] = String(slot.startTime || "")
          .split(":")
          .map(Number);
        if (
          weekday === undefined ||
          !Number.isFinite(hour) ||
          !Number.isFinite(minute)
        )
          return [];

        const occurrence = new Date(start);
        occurrence.setHours(hour, minute, 0, 0);
        occurrence.setDate(
          occurrence.getDate() + ((weekday - occurrence.getDay() + 7) % 7),
        );
        const absences = [];
        while (occurrence < now) {
          const key = dateKey(occurrence);
          const absenceId = `${idOf(classroom)}-${key}-${slot.startTime}`;
          if (!createdSessionDays.has(key) && !seen.has(absenceId)) {
            seen.add(absenceId);
            absences.push({
              id: absenceId,
              title: "لم يتم إنشاء الحصة",
              classroomId: idOf(classroom),
              classroomName: nameOf(classroom.name),
              scheduledAt: occurrence.toISOString(),
            });
          }
          occurrence.setDate(occurrence.getDate() + 7);
        }
        return absences;
      });
    })
    .sort(
      (a, b) =>
        new Date(b.scheduledAt || 0).getTime() -
        new Date(a.scheduledAt || 0).getTime(),
    );
};
