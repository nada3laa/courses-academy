import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowRight,
  AlertTriangle,
  CalendarClock,
  Loader2,
} from "lucide-react";
import TeacherLayout from "../../layout/TeacherLayout";
import AdminLayout from "../../../admin/layout/AdminLayout";
import Breadcrumbs from "../../../../pages/shared/Breadcrumbs";
import {
  createClassroomSession,
  getClassroom,
  getClassroomSchedule,
  getTeachers,
  updateClassroomSubstituteTeacher,
} from "../../../../services/APIService"; // عدّل المسار حسب مكان ملفك

const DAY_LABELS = {
  saturday: "السبت",
  sunday: "الأحد",
  monday: "الاثنين",
  tuesday: "الثلاثاء",
  wednesday: "الأربعاء",
  thursday: "الخميس",
  friday: "الجمعة",
};

// JS Date.getDay(): 0=Sunday..6=Saturday
const TODAY_KEY_BY_JS_DAY = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

const localDateTimeMin = () => {
  const date = new Date(Date.now() + 60 * 1000);
  const offset = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

const CreateLessonPage = ({ role = "teacher" }) => {
  const navigate = useNavigate();
  const { groupId } = useParams();
  const isAdmin = role === "admin";
  const Layout = isAdmin ? AdminLayout : TeacherLayout;

  const [groupName, setGroupName] = useState("مجموعة");
  const [groupTeacher, setGroupTeacher] = useState("—");
  const [groupTeacherId, setGroupTeacherId] = useState("");
  const [groupSubjectId, setGroupSubjectId] = useState("");
  const [classroomType, setClassroomType] = useState("group");
  const [classroom, setClassroom] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [substituteTeacher, setSubstituteTeacher] = useState("");
  const [lessonTitle, setLessonTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [scheduledToday, setScheduledToday] = useState(true);
  const [checkingSchedule, setCheckingSchedule] = useState(true);
  const [isPostponed, setIsPostponed] = useState(false);
  const [postponedAt, setPostponedAt] = useState("");

  const todayKey = TODAY_KEY_BY_JS_DAY[new Date().getDay()];

  useEffect(() => {
    let active = true;
    getClassroomSchedule(groupId)
      .then((response) => {
        if (!active) return;
        const schedule = response.data?.data?.schedule;
        const hasToday =
          Array.isArray(schedule) && schedule.some((item) => item.day === todayKey);
        setScheduledToday(hasToday);
      })
      .catch((err) => {
        // مفيش جدول للمجموعة أصلاً (404) → يبقى أكيد مفيش حصة النهارده
        if (active) setScheduledToday(err.response?.status !== 404);
      })
      .finally(() => active && setCheckingSchedule(false));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  useEffect(() => {
    let active = true;
    getClassroom(groupId)
      .then((response) => {
        if (!active) return;
        const classroomData = response.data?.data || {};
        const name = classroomData.name;
        const resolvedName =
          typeof name === "string" ? name : name?.ar || name?.en || "مجموعة";
        const teacherName =
          typeof classroomData.teacher === "object"
            ? classroomData.teacher?.user?.fullName || classroomData.teacher?.user?.name || classroomData.teacher?.fullName || classroomData.teacher?.name
            : "";
        const teacherId =
          typeof classroomData.teacher === "string"
            ? classroomData.teacher
            : classroomData.teacher?.id || classroomData.teacher?._id || "";
        const subjectId =
          typeof classroomData.subject === "string"
            ? classroomData.subject
            : classroomData.subject?.id || classroomData.subject?._id || "";
        const type =
          ["private", "group"].includes(classroomData.type)
            ? classroomData.type
            : "group";

        setClassroom(classroomData);
        setGroupName(resolvedName);
        setLessonTitle((current) => current || `حصة ${resolvedName}`);
        setGroupTeacher(teacherName || "—");
        setGroupTeacherId(teacherId);
        setGroupSubjectId(subjectId);
        setClassroomType(type);
      })
      .catch((err) => {
        console.error("getClassroom failed:", err);
      });
    return () => {
      active = false;
    };
  }, [groupId]);

  useEffect(() => {
    if (!isAdmin || !classroom) return;
    let active = true;
    getTeachers({ status: "approved", limit: 100 })
      .then((response) => {
        if (!active) return;
        const subjectId =
          typeof classroom.subject === "string"
            ? classroom.subject
            : classroom.subject?.id || classroom.subject?._id;
        const list = response.data?.data || [];
        setTeachers(
          list.filter((teacher) => {
            const user = teacher.user || {};
            const supportsSubject =
              !subjectId ||
              (teacher.subjects || []).some(
                (subject) =>
                  String(subject?.id || subject?._id || subject) ===
                  String(subjectId),
              );
            return (
              supportsSubject &&
              user.isActive !== false &&
              user.registrationStatus !== "pending"
            );
          }),
        );
      })
      .catch(() => setTeachers([]));
    return () => {
      active = false;
    };
  }, [classroom, isAdmin]);

  const handleSubmit = async () => {
    setError(null);

    if (!isPostponed && checkingSchedule) {
      setError("جاري التحقق من جدول المجموعة، حاول مرة أخرى بعد لحظات");
      return;
    }

    if (!isPostponed && !scheduledToday) {
      setError(
        `لا يمكن إنشاء الحصة؛ اليوم (${DAY_LABELS[todayKey]}) غير موجود في جدول المجموعة`,
      );
      return;
    }

    if (!lessonTitle.trim()) {
      setError("من فضلك اكتب اسم الحصة");
      return;
    }

    let postponedDate = null;
    if (isPostponed) {
      if (!postponedAt) {
        setError("من فضلك اختر تاريخ ووقت الحصة المؤجلة");
        return;
      }
      postponedDate = new Date(postponedAt);
      if (
        Number.isNaN(postponedDate.getTime()) ||
        postponedDate.getTime() <= Date.now()
      ) {
        setError("موعد الحصة المؤجلة يجب أن يكون في المستقبل");
        return;
      }
    }

    setSubmitting(true);

    try {
      if (isAdmin && substituteTeacher) {
        await updateClassroomSubstituteTeacher(groupId, substituteTeacher);
      }
      const payload = new FormData();
      payload.append("classroom", groupId);
      payload.append("title", lessonTitle.trim());
      payload.append("description", "");
      if (postponedDate) {
        payload.append("scheduledDate", postponedDate.toISOString());
        payload.append("isPostponed", "true");
        payload.append("scheduleSource", "manual");
      }

      await createClassroomSession(payload);

      navigate(isAdmin
        ? `/admin/groups/${groupId}/lessons`
        : `/teacher/groups/${groupId}/lessons`, {
        state: {
          showSuccessToast: true,
          groupName,
          groupTeacher,
          groupTeacherId,
          groupSubjectId,
          classroomType,
        },
      });
    } catch (err) {
      console.error("createClassroomSession failed:", err);

      const code = err?.response?.data?.message;
      const KNOWN_ERRORS = {
        INVALID_SCHEDULED_DATE:
          "موعد الحصة المؤجلة غير صالح أو قد مضى، من فضلك اختر موعدًا مستقبليًا",
        SESSION_ALREADY_EXISTS:
          "يوجد حصة أخرى مجدولة لهذه المجموعة في نفس الموعد، من فضلك اختر تاريخًا أو وقتًا مختلفًا",
        "There is no classroom schedule for today":
          "لا يوجد جدول لهذه المجموعة اليوم، من فضلك تأكد إن اليوم من أيام جدول المجموعة أو عدّل الجدول أولاً",
      };

      setError(
        KNOWN_ERRORS[code] ||
          code ||
          "حدث خطأ أثناء إنشاء الحصة، حاول مرة أخرى",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full h-12 border border-[#E5E5E5] rounded-[8px] px-4 py-3 text-sm text-[#1A1A1A] focus:border-[#123C91] focus:ring-1 focus:ring-[#123C91] outline-none transition-all bg-[#F9FAFA] appearance-none placeholder:text-[#8C9198]";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-2";

  return (
    <Layout>
      {isAdmin && <Breadcrumbs homeTo="/admin-dashboard" />}
      <h2 className="font-[IBM_Plex_Sans_Arabic] text-xl sm:text-2xl font-bold text-[#123C91]">
        إنشاء حصة جديدة
      </h2>

      <div
        className="mx-auto p-4 sm:p-6 bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm mt-6 sm:mt-8"
        dir="rtl"
      >
        {!isPostponed && !checkingSchedule && !scheduledToday && (
          <div className="mb-5 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
            <AlertTriangle size={18} className="text-amber-500 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800">
                لا يمكن إنشاء حصة اليوم ({DAY_LABELS[todayKey]})
              </p>
              <p className="text-xs text-amber-700 mt-1">
                اليوم غير موجود ضمن جدول المجموعة. يمكنك تعديل الجدول أولاً ثم إنشاء الحصة.
              </p>
              <button
                type="button"
                onClick={() =>
                  navigate(
                    isAdmin
                      ? `/admin/groups/${groupId}/lessons`
                      : `/teacher/groups/${groupId}/lessons/schedule/new`,
                  )
                }
                className="mt-2 text-xs font-semibold text-[#123C91] underline"
              >
                {isAdmin ? "العودة للمجموعة" : "تعديل جدول المجموعة"}
              </button>
            </div>
          </div>
        )}

        <div className="pb-5 sm:pb-6 border-b border-gray-100">
          <p className="text-sm font-semibold text-[#1A1A1A]">
            بيانات الحصة الأساسية
          </p>
        </div>

        <div className="space-y-5 sm:space-y-6 pt-5 sm:pt-6">
          <div>
            <label className={labelClass}>اسم الحصة عند الإنشاء</label>
            <input
              type="text"
              value={lessonTitle}
              onChange={(event) => setLessonTitle(event.target.value)}
              placeholder={`حصة ${groupName || "مجموعة"}`}
              className={inputClass}
            />
            <p className="mt-2 text-xs text-[#8C9198]">
              {isPostponed
                ? "سيتم إنشاء الحصة في الموعد المؤجل الذي تختاره."
                : "تاريخ ووقت الحصة يُحددان تلقائياً من جدول المجموعة لليوم، وعند الإنهاء ستظهر نافذة إضافة الوصف والمرفقات كالمعتاد."}
            </p>
          </div>

          <div className="rounded-xl border border-[#E5E5E5] bg-[#F9FAFA] p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-[#EAF4FF] p-2 text-[#123C91]">
                  <CalendarClock size={20} />
                </div>
                <div>
                  <label
                    htmlFor="postponed-lesson-toggle"
                    className="block cursor-pointer text-sm font-semibold text-[#1F2937]"
                  >
                    الحصة مؤجلة
                  </label>
                  <p className="mt-1 text-xs text-[#8C9198]">
                    فعّل الاختيار لإنشاء الحصة في تاريخ ووقت مختلف.
                  </p>
                </div>
              </div>

              <button
                id="postponed-lesson-toggle"
                type="button"
                role="switch"
                aria-checked={isPostponed}
                onClick={() => {
                  setIsPostponed((current) => {
                    if (current) setPostponedAt("");
                    return !current;
                  });
                  setError(null);
                }}
                className={`relative h-7 w-13 shrink-0 rounded-full transition-colors ${
                  isPostponed ? "bg-[#123C91]" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${
                    isPostponed ? "right-7" : "right-1"
                  }`}
                />
              </button>
            </div>

            {isPostponed && (
              <div className="mt-4 border-t border-gray-200 pt-4">
                <label className={labelClass} htmlFor="postponed-at">
                  تاريخ ووقت الحصة المؤجلة
                </label>
                <input
                  id="postponed-at"
                  type="datetime-local"
                  min={localDateTimeMin()}
                  value={postponedAt}
                  onChange={(event) => {
                    setPostponedAt(event.target.value);
                    setError(null);
                  }}
                  className={inputClass}
                />
                <p className="mt-2 text-xs text-[#8C9198]">
                  سيتم حفظ الموعد حسب توقيت جهازك.
                </p>
              </div>
            )}
          </div>

          {isAdmin && (
            <div>
              <label className={labelClass}>مدرس الحصة البديل (اختياري)</label>
              <select
                value={substituteTeacher}
                onChange={(event) => setSubstituteTeacher(event.target.value)}
                className={inputClass}
              >
                <option value="">مدرس المجموعة الأساسي</option>
                {teachers.map((teacher) => (
                  <option
                    key={teacher.id || teacher._id}
                    value={teacher.id || teacher._id}
                  >
                    {teacher.user?.fullName || teacher.fullName || "معلم"}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-[#8C9198]">
                عند اختيار مدرس آخر سيتم تعيينه كمدرس بديل للمجموعة قبل إنشاء الحصة.
              </p>
            </div>
          )}
        </div>

        {error && <p className="text-sm text-red-500 mt-4">{error}</p>}

        {/* أزرار التحكم */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 mt-2">
          <button
            onClick={handleSubmit}
            disabled={
              submitting ||
              (!isPostponed && (checkingSchedule || !scheduledToday))
            }
            className="w-full sm:flex-1 h-12 sm:h-12.5 bg-[#123C91] text-white [&_svg]:text-white rounded-lg font-bold text-sm sm:text-[16px] flex items-center justify-center gap-2 shadow-sm order-1 sm:order-1 disabled:opacity-60"
          >
            {submitting
              ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  جاري الإنشاء...
                </>
              )
              : checkingSchedule
                && !isPostponed
                ? "جاري التحقق من الجدول..."
                : "إنشاء حصة"}
            {!submitting && <ArrowRight size={18} />}
          </button>

          <button
            onClick={() => navigate(-1)}
            disabled={submitting}
            className="w-full sm:w-auto sm:px-16 lg:px-40 h-12 sm:h-12.5 text-[#575F69] bg-white border border-[#E5E5E5] font-semibold rounded-lg order-2 sm:order-2"
          >
            إلغاء
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default CreateLessonPage;
