import { useEffect, useState } from "react";
import {
  CheckCircle2,
  FileText,
  GraduationCap,
  Loader2,
  UserRound,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { getTeacherFileUrls } from "../../../utils/teacherCv";
import { teacherLanguageLabel } from "../../../utils/teacherLanguage";
import { approveRegistrationRequest } from "../../../utils/approveRegistrationRequest";
import { UserDetailsModal } from "./Userstable";
import {
  getAllSubscriptions,
  getClassroomStudents,
  getClassrooms,
  getTeacher,
} from "../../../services/APIService";

const text = (value) => {
  if (!value) return "—";
  if (["string", "number"].includes(typeof value)) return value;
  return value.ar || value.en || value.name?.ar || value.name?.en || "—";
};
const extractList = (response, keys = []) => {
  const payload = response?.data?.data ?? response?.data ?? [];
  if (Array.isArray(payload)) return payload;
  for (const key of keys) {
    if (Array.isArray(payload?.[key])) return payload[key];
  }
  return [];
};
const classroomGroup = (classroom) => {
  if (!classroom || typeof classroom !== "object") return null;
  const id = classroom.id || classroom._id;
  if (!id) return null;
  return {
    id,
    name: text(classroom.name),
    status: classroom.status,
  };
};
const Detail = ({ label, value }) => (
  <div className="rounded-xl bg-[#F9FAFA] px-4 py-3">
    <p className="text-xs text-[#8C9198]">{label}</p>
    <p className="mt-1 break-words text-sm font-medium text-[#1F2937]">
      {value || "—"}
    </p>
  </div>
);

const entityId = (value) =>
  String(typeof value === "object" ? value?._id || value?.id || "" : value || "");
const belongsTo = (item, parent, keys) => {
  const parentId = entityId(parent);
  return keys.some((key) => entityId(item?.[key]) === parentId);
};

const TeacherAcademicBoxes = ({ teacher }) => {
  const teachingSelections = Array.isArray(teacher.teachingSelections)
    ? teacher.teachingSelections
    : [];

  if (teachingSelections.length) {
    return <div className="mt-4 space-y-3">
      <p className="text-sm font-semibold text-[#1F2937]">المناهج وبيانات التدريس</p>
      {teachingSelections.map((selection, index) => <div key={entityId(selection.curriculum) || index} className="rounded-2xl border border-[#D7E2F3] bg-[#F8FAFD] p-4">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#123C91] text-xs font-bold text-white">{index + 1}</span>
          <div>
            <p className="text-[11px] text-gray-500">المنهج الدراسي</p>
            <p className="text-sm font-bold text-[#123C91]">{text(selection.curriculum)}</p>
          </div>
        </div>
        <div className="space-y-3 border-r-2 border-[#CAD8EF] pr-3">
          {selection.stages?.map((stage, stageIndex) => <div key={entityId(stage.stage) || stageIndex}>
            <p className="mb-2 text-xs font-semibold text-gray-700">المرحلة: {text(stage.stage)}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {stage.grades?.map((grade, gradeIndex) => <div key={entityId(grade.grade) || gradeIndex} className="rounded-xl border border-gray-200 bg-white p-3">
                <p className="text-xs font-semibold text-gray-800">{text(grade.grade)}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {grade.subjects?.length ? grade.subjects.map((subject, subjectIndex) => <span key={entityId(subject) || subjectIndex} className="rounded-lg bg-[#EAF0FB] px-2.5 py-1 text-xs text-[#123C91]">
                    {text(subject)}
                  </span>) : <span className="text-xs text-gray-400">لا توجد مواد</span>}
                </div>
              </div>)}
            </div>
          </div>)}
        </div>
      </div>)}
    </div>;
  }

  const curricula = Array.isArray(teacher.curriculums)
    ? teacher.curriculums
    : teacher.curriculum ? [teacher.curriculum] : [];
  const grades = Array.isArray(teacher.grades)
    ? teacher.grades
    : teacher.grade ? [teacher.grade] : [];
  const subjects = Array.isArray(teacher.subjects)
    ? teacher.subjects
    : teacher.subject ? [teacher.subject] : [];

  if (!curricula.length) return null;

  return <div className="mt-4 space-y-3">
    <p className="text-sm font-semibold text-[#1F2937]">المناهج والصفوف والمواد</p>
    {curricula.map((curriculum, index) => {
      const curriculumGrades = grades.filter((grade) =>
        belongsTo(grade, curriculum, ["curriculum", "curriculumId"]));
      const visibleGrades = curriculumGrades.length || curricula.length > 1
        ? curriculumGrades
        : grades;
      const curriculumSubjects = subjects.filter((subject) =>
        belongsTo(subject, curriculum, ["curriculum", "curriculumId"]));

      return <div key={entityId(curriculum) || index} className="rounded-2xl border border-[#D7E2F3] bg-[#F8FAFD] p-4">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#123C91] text-xs font-bold text-white">{index + 1}</span>
          <div>
            <p className="text-[11px] text-gray-500">المنهج الدراسي</p>
            <p className="text-sm font-bold text-[#123C91]">{text(curriculum)}</p>
          </div>
        </div>
        <div className="space-y-2 border-r-2 border-[#CAD8EF] pr-3">
          {visibleGrades.length ? visibleGrades.map((grade) => {
            const gradeSubjects = subjects.filter((subject) =>
              belongsTo(subject, grade, ["grade", "gradeId"]));
            const visibleSubjects = gradeSubjects.length
              ? gradeSubjects
              : visibleGrades.length === 1
                ? curriculumSubjects
                : [];
            return <div key={entityId(grade)} className="rounded-xl border border-gray-200 bg-white p-3">
              <p className="text-xs font-semibold text-gray-800">{text(grade)}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {visibleSubjects.length ? visibleSubjects.map((subject) => <span key={entityId(subject)} className="rounded-lg bg-[#EAF0FB] px-2.5 py-1 text-xs text-[#123C91]">
                  {text(subject)}
                </span>) : <span className="text-xs text-gray-400">لا توجد مواد مرتبطة بهذا الصف</span>}
              </div>
            </div>;
          }) : <p className="text-xs text-gray-400">لا توجد صفوف مسجلة لهذا المنهج</p>}
        </div>
      </div>;
    })}
  </div>;
};

const EntityProfileModal = ({ entity, role = "student", onClose }) => {
  const [approving, setApproving] = useState(false);
  const [approvedUserId, setApprovedUserId] = useState("");
  const [studentGroups, setStudentGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [teacherDetails, setTeacherDetails] = useState(null);
  const [teacherDetailsLoading, setTeacherDetailsLoading] = useState(false);
  const isTeacher = role === "teacher";
  const studentProfileId = entity?.id || entity?._id;

  useEffect(() => {
    if (!entity || !isTeacher) return undefined;
    const teacherId = entity?.profileId || entity?.id || entity?._id;
    if (!teacherId) return undefined;
    let active = true;
    setTeacherDetailsLoading(true);
    getTeacher(teacherId)
      .then((response) => {
        if (!active) return;
        const details = response?.data?.data?.teacher ?? response?.data?.data ?? response?.data;
        setTeacherDetails(details && typeof details === "object" ? details : null);
      })
      .catch(() => active && setTeacherDetails(null))
      .finally(() => active && setTeacherDetailsLoading(false));
    return () => { active = false; };
  }, [entity, isTeacher]);

  useEffect(() => {
    if (!entity || isTeacher || !studentProfileId) return undefined;

    let active = true;
    const timer = window.setTimeout(() => {
      setGroupsLoading(true);
      setStudentGroups([]);
      Promise.allSettled([
        getAllSubscriptions({ student: studentProfileId, limit: 1000 }),
        getClassrooms({ student: studentProfileId, limit: 1000 }),
      ])
        .then(async ([subscriptionsResult, classroomsResult]) => {
          if (!active) return;

          const subscriptions =
            subscriptionsResult.status === "fulfilled"
              ? extractList(subscriptionsResult.value, [
                  "subscriptions",
                  "results",
                  "items",
                ])
              : [];
          const subscribedClassrooms = subscriptions.flatMap((subscription) =>
            (subscription.items || [])
              .map((item) => classroomGroup(item.classroom))
              .filter(Boolean),
          );
          const filteredClassrooms =
            classroomsResult.status === "fulfilled"
              ? extractList(classroomsResult.value, [
                  "classrooms",
                  "results",
                  "items",
                ])
                  .map(classroomGroup)
                  .filter(Boolean)
              : [];
          let groups = [...subscribedClassrooms, ...filteredClassrooms];

          if (groups.length === 0) {
            const identityIds = new Set(
              [
                studentProfileId,
                entity?.user?.id,
                entity?.user?._id,
                entity?.user,
              ]
                .filter(
                  (id) => typeof id === "string" || typeof id === "number",
                )
                .map(String),
            );
            const allClassroomsResponse = await getClassrooms({ limit: 1000 });
            const allClassrooms = extractList(allClassroomsResponse, [
              "classrooms",
              "results",
              "items",
            ]);
            const membershipResults = await Promise.allSettled(
              allClassrooms.map(async (classroom) => {
                const classroomId = classroom.id || classroom._id;
                if (!classroomId) return null;
                const membersResponse = await getClassroomStudents(
                  classroomId,
                  {
                    limit: 1000,
                  },
                );
                const members = extractList(membersResponse, [
                  "students",
                  "results",
                  "items",
                ]);
                const hasStudent = members.some((member) =>
                  [
                    member?.id,
                    member?._id,
                    member?.student?.id,
                    member?.student?._id,
                    member?.user?.id,
                    member?.user?._id,
                    member?.user,
                  ]
                    .filter(Boolean)
                    .map(String)
                    .some((id) => identityIds.has(id)),
                );
                return hasStudent ? classroomGroup(classroom) : null;
              }),
            );
            groups = membershipResults
              .filter((result) => result.status === "fulfilled")
              .map((result) => result.value)
              .filter(Boolean);
          }

          setStudentGroups([
            ...new Map(
              groups.map((group) => [String(group.id), group]),
            ).values(),
          ]);
        })
        .catch(() => active && setStudentGroups([]))
        .finally(() => active && setGroupsLoading(false));
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [entity, isTeacher, studentProfileId]);

  if (!entity) return null;
  const user =
    entity.user && typeof entity.user === "object" ? entity.user : entity;
  const name =
    user.fullName || entity.fullName || text(user.name || entity.name);
  const teacherFileUrls = isTeacher ? getTeacherFileUrls(entity) : [];
  const currentUserId = user.id || user._id;
  const registrationStatus = String(
    user.registrationStatus || user.registration_status || "",
  ).toLowerCase();
  const canApprove =
    !isTeacher &&
    String(approvedUserId) !== String(currentUserId) &&
    (user.isActive === false ||
      [
        "pending",
        "pending-review",
        "pending-approval",
        "under-review",
      ].includes(registrationStatus.replaceAll("_", "-")));

  const approveStudent = async () => {
    if (!window.confirm("هل تريد قبول طلب الطالب وتفعيل حسابه؟")) return;
    const userId = user.id || user._id;
    if (!userId) return toast.error("معرّف المستخدم غير متاح");
    setApproving(true);
    try {
      await approveRegistrationRequest({
        userId,
        role: "student",
      });
      setApprovedUserId(userId);
      toast.success("تم قبول طلب الطالب وتفعيل الحساب");
    } catch (error) {
      toast.error(error.response?.data?.message || "تعذر تفعيل حساب الطالب");
    } finally {
      setApproving(false);
    }
  };

  if (!isTeacher) {
    const studentStatus = canApprove
      ? "معلق"
      : approvedUserId === currentUserId || registrationStatus === "active"
        ? "نشط"
        : user.isActive === false
          ? "موقوف"
          : "نشط";
    return (
      <UserDetailsModal
        open
        onClose={onClose}
        user={{
          id: currentUserId,
          name,
          email: user.email,
          phone: user.phone,
          username: user.username,
          role: "طالب",
          status: studentStatus,
          joinDate: user.createdAt
            ? new Date(user.createdAt).toLocaleDateString("ar-EG")
            : "—",
          stage: text(entity.stage ?? entity.academicLevel),
          grade: text(entity.grade),
          package: text(entity.package),
          groups: studentGroups,
          groupsLoading,
        }}
        onApprove={canApprove && !approving ? approveStudent : undefined}
      />
    );
  }

  return (
    <div
      className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/40 px-4"
      dir="rtl"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <section className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#1F2937]">
            {isTeacher ? "تفاصيل المعلم" : "تفاصيل الطالب"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200"
          >
            <X size={17} />
          </button>
        </div>
        <div className="mb-5 flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-[#123C91]">
            {isTeacher ? <GraduationCap size={30} /> : <UserRound size={29} />}
          </div>
          <h3 className="mt-3 text-lg font-semibold text-[#1F2937]">{name}</h3>
          <p className="mt-1 text-sm text-[#8C9198]" dir="ltr">
            {user.email || "—"}
          </p>
        </div>
        {canApprove && (
          <button
            type="button"
            onClick={approveStudent}
            disabled={approving}
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold !text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {approving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <CheckCircle2 size={18} />
            )}
            {approving ? "جارٍ تفعيل الحساب..." : "قبول الطلب وتفعيل الحساب"}
          </button>
        )}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Detail label="رقم الهاتف" value={user.phone} />
          <Detail label="اسم المستخدم" value={user.username} />
          {isTeacher ? (
            <>
              <Detail label="حالة المعلم" value={entity.status} />
              <Detail
                label="سنوات الخبرة"
                value={entity.experienceYears ?? entity.experience}
              />
              <Detail
                label="لغة التدريس"
                value={teacherLanguageLabel(entity.language)}
              />
            </>
          ) : (
            <>
              <Detail
                label="المرحلة"
                value={text(entity.stage ?? entity.academicLevel)}
              />
              <Detail label="الصف" value={text(entity.grade)} />
              <Detail label="المنهج" value={text(entity.curriculum)} />
              <Detail
                label="الدولة"
                value={text(user.country ?? entity.country)}
              />
            </>
          )}
        </div>
        {isTeacher && (teacherDetailsLoading
          ? <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-gray-50 p-5 text-sm text-[#123C91]"><Loader2 size={18} className="animate-spin" /> جاري تحميل البيانات الأكاديمية للمعلم...</div>
          : <TeacherAcademicBoxes teacher={{ ...entity, ...teacherDetails }} />)}
        {isTeacher && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {teacherFileUrls.length ? (
              teacherFileUrls.map((url, index) => (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#123C91] px-4 py-2.5 text-sm font-semibold text-[#123C91] hover:bg-blue-50"
                >
                  <FileText size={16} />
                  ملف {index + 1}
                </a>
              ))
            ) : (
              <span className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-400">
                لا توجد ملفات متاحة
              </span>
            )}
          </div>
        )}
      </section>
    </div>
  );
};
export default EntityProfileModal;
