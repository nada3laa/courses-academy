import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MoreVertical,
  Eye,
  Ban,
  CheckCircle2,
  Trash2,
  User,
  X,
  Info,
  FileText,
  ExternalLink,
  MessageCircle,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  ChevronDown,
} from "lucide-react";
import { createPortal } from "react-dom";
import { getArabicCountryName } from "../../../utils/countryName";
import { resolveTeacherTeachingSelections } from "../../../utils/teacherTeachingSelections";
import { getTeacherFileUrls } from "../../../utils/teacherCv";
import { teacherLanguageLabel } from "../../../utils/teacherLanguage";
import {
  getAllStudents,
  getAllSubscriptions,
  getClassroomStudents,
  getClassrooms,
  getTeacher,
} from "../../../services/APIService";
const getCurrentMonth = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
};

const USER_TYPE_OPTIONS = [
  "جميع المستخدمين",
  "معلم",
  "طالب",
  "ولي أمر",
  "مشرف",
  "مشرف عام",
];

const formatMonthlyHours = (minutes = 0) => {
  const hours = minutes / 60;
  return `${hours.toFixed(1).replace(".0", "")} ساعة`;
};

const localizedName = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.ar || value.en || value.name?.ar || value.name?.en || "";
};

const listNames = (value) => {
  if (!Array.isArray(value)) return localizedName(value) || "--";
  const names = value
    .map((item) => localizedName(item?.name ?? item))
    .filter(Boolean);
  return [...new Set(names)].join("، ") || "--";
};

const extractApiList = (response, keys = []) => {
  let value = response?.data ?? response;
  for (let depth = 0; depth < 4 && value && !Array.isArray(value); depth += 1) {
    const knownList = keys.map((key) => value?.[key]).find(Array.isArray);
    if (knownList) return knownList;
    value = value?.data;
  }
  return Array.isArray(value) ? value : [];
};

const entityId = (value) =>
  typeof value === "string" ? value : value?.id || value?._id || "";

const studentIds = (student) =>
  new Set(
    [
      entityId(student),
      entityId(student?.student),
      entityId(student?.studentProfile),
      entityId(student?.user),
      student?.studentId,
    ]
      .filter(Boolean)
      .map(String),
  );

const classroomSummary = (classroom) => {
  if (!classroom || typeof classroom !== "object") return null;
  const id = entityId(classroom);
  if (!id) return null;
  return {
    id,
    name: localizedName(classroom.name) || "مجموعة بدون اسم",
    status: classroom.status,
  };
};

const fileUrl = (value) => {
  const raw =
    (typeof value === "string"
      ? value
      : value?.url || value?.secureUrl || value?.path) || "";
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://api.alacademeya.com/api/${raw.replace(/^\/+/, "").replace(/^api\//, "")}`;
};

const whatsappUrl = (phone) => {
  const number = String(phone || "")
    .trim()
    .replace(/[^\d]/g, "")
    .replace(/^00/, "");

  return number ? `https://wa.me/${number}` : "";
};

const teacherData = (profile) => {
  const profileUser =
    profile?.user && typeof profile.user === "object" ? profile.user : {};
  const merged = { ...profileUser, ...profile };
  const cv =
    merged.cv ??
    merged.cvUrl ??
    merged.resume ??
    merged.resumeUrl ??
    merged.documents?.cv;

  return {
    ...merged,
    username: merged.username || profileUser.username,
    phone: merged.phone || profileUser.phone,
    countryName: getArabicCountryName(merged.country),
    curriculaLabel: listNames(merged.curriculums ?? merged.curriculum),
    gradesLabel: listNames(merged.grades ?? merged.grade),
    subjectsLabel: listNames(merged.subjects ?? merged.subject),
    certificatesLabel: listNames(merged.certificates),
    cvUrl: fileUrl(cv),
    fileUrls: getTeacherFileUrls(merged),
  };
};

const Badge = ({ label, type }) => {
  const map = {
    green: "bg-[#00A63E26] text-[#00A63E]",
    blue: "bg-[#EAF4FF] text-[#123C91]",
    orange: "bg-[#FF8A0026] text-[#FF8A00]",
    red: "bg-red-100 text-red-600",
    gray: "bg-gray-100 text-[#8C9198]",
  };

  return (
    <span
      className={`inline-flex min-w-18 items-center justify-center px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
        map[type] ?? map.gray
      }`}
    >
      {label}
    </span>
  );
};

const statusBadge = (status) => {
  if (status === "نشط") return <Badge label={status} type="green" />;
  if (status === "معلق") return <Badge label={status} type="orange" />;
  if (status === "ملف غير مكتمل") return <Badge label={status} type="blue" />;
  if (status === "موقوف") return <Badge label={status} type="red" />;
  return <Badge label={status} type="gray" />;
};

const roleBadge = (role) => {
  if (role === "معلم") return <Badge label={role} type="green" />;
  if (role === "طالب") return <Badge label={role} type="blue" />;
  if (role === "ولي أمر") return <Badge label={role} type="orange" />;
  return <Badge label={role} type="gray" />;
};

const Avatar = ({ name, avatarUrl, size = 8 }) => (
  <div
    className={`w-${size} h-${size} rounded-full overflow-hidden bg-gray-100 flex items-center justify-center shrink-0`}
  >
    {avatarUrl ? (
      <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
    ) : (
      <User size={size === 8 ? 15 : 22} className="text-gray-400" />
    )}
  </div>
);

const UserCell = ({ name, avatarUrl, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex items-center gap-2.5 text-left transition-colors hover:text-[#123C91]"
  >
    <Avatar name={name} avatarUrl={avatarUrl} size={8} />
    <span className="text-sm font-medium text-[#1A1A1A] font-['Tajawal']">
      {name}
    </span>
  </button>
);

const DetailRow = ({ label, value }) => (
  <div className="flex min-h-16 flex-col justify-center gap-1 rounded-xl bg-[#F9FAFA] px-4 py-3">
    <span className="text-[12px] text-[#8C9198]">{label}</span>
    <span className="break-words text-[14px] font-medium text-[#1F2937] font-['Tajawal']">
      {value ?? "--"}
    </span>
  </div>
);

const TeacherTeachingSelections = ({ selections }) => {
  if (!Array.isArray(selections) || !selections.length) return null;

  return (
    <div className="mb-3 rounded-2xl border border-[#D7E2F3] bg-[#F8FAFD] p-4">
      <p className="mb-3 text-sm font-semibold text-[#1F2937]">
        المناهج وبيانات التدريس
      </p>
      <div className="space-y-3">
        {selections.map((selection, curriculumIndex) => (
          <div
            key={entityId(selection.curriculum) || curriculumIndex}
            className="rounded-xl border border-[#CAD8EF] bg-white p-4"
          >
            <div className="mb-3 flex items-center gap-2">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#123C91] text-xs font-bold text-white">
                {curriculumIndex + 1}
              </span>
              <div>
                <p className="text-[11px] text-[#8C9198]">المنهج الدراسي</p>
                <p className="text-sm font-bold text-[#123C91]">
                  {localizedName(selection.curriculum) || "منهج غير محدد"}
                </p>
              </div>
            </div>

            <div className="space-y-3 border-r-2 border-[#D7E2F3] pr-3">
              {(selection.stages || []).map((stage, stageIndex) => (
                <div key={entityId(stage.stage) || stageIndex}>
                  <p className="mb-2 text-xs font-semibold text-[#374151]">
                    المرحلة: {localizedName(stage.stage) || "غير محددة"}
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {(stage.grades || []).map((grade, gradeIndex) => (
                      <div
                        key={entityId(grade.grade) || gradeIndex}
                        className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFA] p-3"
                      >
                        <p className="text-xs font-bold text-[#1F2937]">
                          {localizedName(grade.grade) || "صف غير محدد"}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {(grade.subjects || []).length ? (
                            grade.subjects.map((subject, subjectIndex) => (
                              <span
                                key={entityId(subject) || subjectIndex}
                                className="rounded-lg bg-[#EAF0FB] px-2.5 py-1 text-xs font-medium text-[#123C91]"
                              >
                                {localizedName(subject) || "مادة غير محددة"}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-[#8C9198]">لا توجد مواد</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const legacyTeachingSelections = (teacher) => {
  const curricula = Array.isArray(teacher.curriculums) ? teacher.curriculums : teacher.curriculum ? [teacher.curriculum] : [];
  const grades = Array.isArray(teacher.grades) ? teacher.grades : teacher.grade ? [teacher.grade] : [];
  const subjects = Array.isArray(teacher.subjects) ? teacher.subjects : teacher.subject ? [teacher.subject] : [];
  const parentId = (item, key) => entityId(item?.[key] || item?.[`${key}Id`]);

  return curricula.map((curriculum) => {
    const curriculumId = entityId(curriculum);
    const curriculumGrades = grades.filter((grade) => parentId(grade, "curriculum") === curriculumId);
    const scopedGrades = curriculumGrades.length || curricula.length > 1 ? curriculumGrades : grades;
    const stages = new Map();
    scopedGrades.forEach((grade) => {
      const stage = grade.stage || grade.stageId || { name: "المرحلة" };
      const stageId = entityId(stage) || localizedName(stage);
      if (!stages.has(stageId)) stages.set(stageId, { stage, grades: [] });
      const gradeId = entityId(grade);
      let gradeSubjects = subjects.filter((subject) => parentId(subject, "grade") === gradeId);
      if (!gradeSubjects.length) {
        gradeSubjects = subjects.filter((subject) => {
          const subjectGrades = Array.isArray(subject.grades)
            ? subject.grades
            : subject.grade ? [subject.grade] : subject.gradeId ? [subject.gradeId] : [];
          return subjectGrades.some((item) => String(entityId(item)) === String(gradeId));
        });
      }
      if (!gradeSubjects.length && scopedGrades.length === 1) {
        gradeSubjects = subjects.filter((subject) => {
          const subjectCurriculum = parentId(subject, "curriculum");
          return !subjectCurriculum || subjectCurriculum === curriculumId;
        });
      }
      stages.get(stageId).grades.push({ grade, subjects: gradeSubjects });
    });
    if (scopedGrades.length && ![...stages.values()].some((stage) => stage.grades.some((grade) => grade.subjects.length))) {
      stages.get([...stages.keys()][0]).grades[0].subjects = subjects;
    }
    return { curriculum, stages: [...stages.values()] };
  });
};

export const UserDetailsModal = ({
  open,
  onClose,
  user,
  academicLoading = false,
  reportLoading,
  reportError,
  onOpenChat,
  onApprove,
  onToggleStatus,
  onDelete,
}) => {
  const navigate = useNavigate();

  if (!open || !user) return null;

  const isTeacher = user.role === "معلم";
  const isParent = user.role === "ولي أمر";
  const isStudent = user.role === "طالب";
  const userWhatsappUrl = whatsappUrl(user.phone);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className={`max-h-[92vh] w-full overflow-y-auto rounded-2xl bg-white p-5 shadow-xl ${
          isTeacher ? "max-w-5xl sm:p-7 lg:p-8" : "max-w-2xl sm:p-7"
        }`}
        dir="rtl"
      >
        <div className="flex items-center justify-between mb-4">
          <span className="font-['Tajawal'] font-semibold text-[16px] text-[#1F2937]">
            تفاصيل المستخدم
          </span>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#6B7280] transition-colors"
            aria-label="إغلاق"
          >
            <X size={15} />
          </button>
        </div>

        <div className="flex flex-col items-center gap-2 mb-5">
          <Avatar name={user.name} avatarUrl={user.avatarUrl} size={16} />

          <p className="font-['Tajawal'] font-semibold text-[16px] text-[#1F2937]">
            {user.name}
          </p>

          <p className="text-[13px] text-[#8C9198]" dir="ltr">
            {user.email}
          </p>

          <div className="flex items-center gap-2 mt-1">
            {statusBadge(user.status)}
            {roleBadge(user.role)}
          </div>
        </div>
        <a
          href={userWhatsappUrl || undefined}
          target={userWhatsappUrl ? "_blank" : undefined}
          rel={userWhatsappUrl ? "noopener noreferrer" : undefined}
          aria-disabled={!userWhatsappUrl}
          onClick={(event) => {
            if (!userWhatsappUrl) event.preventDefault();
          }}
          className={`mb-4 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
            userWhatsappUrl
              ? "bg-[#25D366] text-white hover:bg-[#20bd5a]"
              : "cursor-not-allowed bg-gray-100 text-gray-400"
          }`}
        >
          <MessageCircle size={18} />
          تواصل عبر واتساب
        </a>

        <div className="grid gap-3 mb-4 sm:grid-cols-2">
          {onOpenChat && (
            <button
              type="button"
              onClick={() => onOpenChat?.(user)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#EAF4FF] px-4 py-3 text-sm font-semibold text-[#123C91] transition-colors hover:bg-[#dbe7fc]"
            >
              <MessageCircle size={18} />
              فتح محادثة الموقع
            </button>
          )}

          {user.status === "معلق" && onApprove && (
            <button
              type="button"
              onClick={() => onApprove?.(user)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#123C91] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0f3280]"
            >
              <CheckCircle2 size={18} />
              قبول الطلب
            </button>
          )}

          {(user.status === "نشط" || user.status === "موقوف") &&
            onToggleStatus && (
              <button
                type="button"
                onClick={() => onToggleStatus?.(user)}
                className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${user.status === "موقوف" ? "bg-[#00A63E] text-white hover:bg-[#008a33]" : "bg-[#FF8A00] text-white hover:bg-[#dd7000]"}`}
              >
                {user.status === "موقوف" ? (
                  <CheckCircle2 size={18} />
                ) : (
                  <Ban size={18} />
                )}
                {user.status === "موقوف" ? "تفعيل الحساب" : "إيقاف الحساب"}
              </button>
            )}

          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete?.(user)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-600"
            >
              <Trash2 size={18} />
              حذف المستخدم
            </button>
          )}
        </div>

        <div className="mb-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <DetailRow label="تاريخ الانضمام" value={user.joinDate} />
          <DetailRow label="رقم الهاتف" value={user.phone} />
          <DetailRow label="اسم المستخدم" value={user.username} />
        </div>

        {isStudent && (
          <div className="mb-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <DetailRow label="المرحلة" value={user.stage} />
            <DetailRow label="الباقة" value={user.package} />
          </div>
        )}

        {isStudent && (
          <div className="grid grid-cols-2 gap-2 mb-2">
            <DetailRow label="الصف" value={user.grade || "—"} />
          </div>
        )}

        {isStudent && (user.groupsLoading || Array.isArray(user.groups)) && (
          <div className="mb-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFA] p-4">
            <p className="mb-3 text-sm font-semibold text-[#1F2937]">
              مجموعات الطالب
            </p>
            {user.groupsLoading ? (
              <p className="text-sm text-[#8C9198]">جاري تحميل المجموعات...</p>
            ) : user.groups?.length ? (
              <div className="flex flex-wrap gap-2">
                {user.groups.map((group) => (
                  <button
                    type="button"
                    key={group.id}
                    onClick={() => {
                      onClose?.();
                      navigate(`/admin/groups/${group.id}/lessons`);
                    }}
                    className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-[#123C91] transition-colors hover:border-[#123C91] hover:bg-blue-100"
                  >
                    {group.name}
                    {group.status && (
                      <small className="font-medium text-[#6B7280]">
                        ({group.status})
                      </small>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#8C9198]">
                الطالب غير مضاف إلى أي مجموعة حاليًا.
              </p>
            )}
          </div>
        )}

        {isTeacher && (
          <>
            <div className="mb-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              <DetailRow
                label="سنوات الخبرة"
                value={user.experienceYears ?? user.experience}
              />
              <DetailRow label="الدولة" value={user.countryName} />
              <DetailRow
                label="لغة التدريس"
                value={teacherLanguageLabel(user.language)}
              />
              <DetailRow label="التقييم" value={user.rating} />
              <DetailRow
                label="حالة ملف المعلم"
                value={user.teacherStatus ?? user.status}
              />
            </div>

            {academicLoading ? (
              <div className="mb-3 flex items-center justify-center gap-2 rounded-2xl border border-[#D7E2F3] bg-[#F8FAFD] p-6 text-sm font-medium text-[#123C91]">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#123C91] border-t-transparent" />
                جاري تحميل البيانات الأكاديمية للمعلم...
              </div>
            ) : (
              <TeacherTeachingSelections selections={
                Array.isArray(user.teachingSelections) && user.teachingSelections.length
                  ? user.teachingSelections
                  : legacyTeachingSelections(user)
              } />
            )}

            <div className="mb-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              <DetailRow
                label="الساعات الشهرية"
                value={
                  reportLoading
                    ? "جاري التحميل..."
                    : (user.monthlyTeachingHours ?? "--")
                }
              />

              <DetailRow
                label="الجلسات المكتملة"
                value={
                  reportLoading
                    ? "..."
                    : (user.monthlyCompletedSessions ?? "--")
                }
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {(user.fileUrls?.length ? user.fileUrls : user.cvUrl ? [user.cvUrl] : []).map((url, index) => (
                <a key={url} href={url} target="_blank" rel="noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#123C91] px-4 py-3 text-sm font-semibold !text-white transition-colors hover:bg-[#0f327a] [&_svg]:!text-white">
                  <FileText size={17} /> مرفق {index + 1}<ExternalLink size={15} />
                </a>
              ))}
              {!user.fileUrls?.length && !user.cvUrl && <span className="rounded-xl bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-400">لا توجد مرفقات متاحة</span>}
            </div>

            {reportError && (
              <p className="mt-2 text-[12px] text-red-500 text-center">
                {reportError}
              </p>
            )}
          </>
        )}

        {isParent && (
          <div className="grid grid-cols-2 gap-2 mb-2">
            <DetailRow label="اسم الابن" value={user.childName ?? "علي محمد"} />

            <DetailRow label="عدد الأبناء" value={user.childrenCount ?? "1"} />
          </div>
        )}
      </div>
    </div>
  );
};

const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  confirmClass,
  iconColor,
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white w-full max-w-xs rounded-2xl p-6 shadow-xl text-center"
        dir="rtl"
      >
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${iconColor}`}
        >
          <Info size={22} />
        </div>

        <h3 className="font-['Tajawal'] font-semibold text-[16px] text-[#1F2937] mb-2">
          {title}
        </h3>

        <p className="text-[13px] text-[#6B7280] mb-6 font-['IBM_Plex_Sans_Arabic']">
          {message}
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl text-white font-medium text-[14px] transition-opacity hover:opacity-90 ${confirmClass}`}
          >
            {confirmLabel}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 border border-[#E5E5E5] rounded-xl text-[#374151] font-medium text-[14px] hover:border-gray-400"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};

const ActionsMenu = ({
  user,
  onView,
  onApprove,
  onToggleStatus,
  onDelete,
  onOpenChat,
}) => {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
  });

  const wrapperRef = useRef(null);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  const isSuspended = user.status === "موقوف";
  const isPending = user.status === "معلق";

  const items = [
    {
      key: "view",
      label: "عرض",
      Icon: Eye,
      onClick: () => onView?.(user),
    },
    {
      key: "whatsapp",
      label: "واتساب",
      Icon: MessageCircle,
      onClick: () => {
        const url = whatsappUrl(user.phone);
        if (url) window.open(url, "_blank");
      },
      tone: user.phone ? "text-[#25D366]" : "text-gray-400",
      disabled: !user.phone,
    },
    {
      key: "chat",
      label: "محادثة الموقع",
      Icon: MessageCircle,
      onClick: () => onOpenChat?.(user),
      tone: "text-[#123C91]",
    },
  ];

  if (isPending) {
    items.push({
      key: "approve",
      label: "قبول الطلب",
      Icon: CheckCircle2,
      onClick: () => onApprove?.(user),
      tone: "text-[#123C91]",
    });
  } else if (isSuspended) {
    items.push({
      key: "activate",
      label: "تفعيل",
      Icon: CheckCircle2,
      onClick: () => onToggleStatus?.(user),
      tone: "text-green-600",
    });
  } else {
    items.push({
      key: "suspend",
      label: "إيقاف",
      Icon: Ban,
      onClick: () => onToggleStatus?.(user),
      tone: "text-orange-500",
    });
  }

  items.push({
    key: "delete",
    label: "حذف",
    Icon: Trash2,
    onClick: () => onDelete?.(user),
    tone: "text-red-600",
  });

  const handleToggleMenu = () => {
    if (open) {
      setOpen(false);
      return;
    }

    const rect = buttonRef.current?.getBoundingClientRect();

    if (!rect) return;

    const menuWidth = 144;
    const menuHeight = items.length * 42 + 8;
    const screenPadding = 8;
    const gap = 4;

    const availableBelow = window.innerHeight - rect.bottom;
    const shouldOpenAbove =
      availableBelow < menuHeight && rect.top > menuHeight;

    const top = shouldOpenAbove
      ? Math.max(screenPadding, rect.top - menuHeight - gap)
      : Math.min(
          rect.bottom + gap,
          window.innerHeight - menuHeight - screenPadding,
        );

    const left = Math.min(
      Math.max(screenPadding, rect.right - menuWidth),
      window.innerWidth - menuWidth - screenPadding,
    );

    setPosition({ top, left });
    setOpen(true);
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      const clickedWrapper = wrapperRef.current?.contains(event.target);

      const clickedMenu = menuRef.current?.contains(event.target);

      if (!clickedWrapper && !clickedMenu) {
        setOpen(false);
      }
    };

    const closeMenu = () => setOpen(false);

    document.addEventListener("mousedown", handleOutsideClick);

    window.addEventListener("resize", closeMenu);
    window.addEventListener("scroll", closeMenu, true);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);

      window.removeEventListener("resize", closeMenu);
      window.removeEventListener("scroll", closeMenu, true);
    };
  }, []);

  return (
    <div ref={wrapperRef} className="relative inline-block">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggleMenu}
        className="p-2 rounded-lg text-[#575F69] hover:bg-gray-100 hover:text-[#123C91] transition-colors"
        aria-label="إجراءات المستخدم"
        aria-expanded={open}
      >
        <MoreVertical size={18} />
      </button>

      {open &&
        createPortal(
          <ul
            ref={menuRef}
            className="fixed z-[100] w-36 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
            style={{
              top: position.top,
              left: position.left,
            }}
          >
            {items.map((item) => {
              const Icon = item.Icon;

              return (
                <li key={item.key}>
                  <button
                    type="button"
                    onClick={() => {
                      item.onClick();
                      setOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3.5 py-2.5 text-sm text-right hover:bg-gray-50 ${
                      item.tone ?? "text-[#575F69]"
                    }`}
                  >
                    <Icon size={15} />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>,
          document.body,
        )}
    </div>
  );
};

const MobileCard = ({
  u,
  onView,
  onApprove,
  onToggleStatus,
  onDelete,
  onOpenChat,
}) => (
  <div
    className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4"
    dir="rtl"
  >
    <div className="flex items-center justify-between mb-3">
      <UserCell
        name={u.name}
        avatarUrl={u.avatarUrl}
        onClick={() => onView?.(u)}
      />

      <ActionsMenu
        user={u}
        onView={onView}
        onApprove={onApprove}
        onToggleStatus={onToggleStatus}
        onDelete={onDelete}
        onOpenChat={onOpenChat}
      />
    </div>

    <div className="flex items-center gap-2 mb-3">
      {roleBadge(u.role)}
      {statusBadge(u.status)}
    </div>

    <div className="divide-y divide-gray-50">
      <div className="flex items-center justify-between py-2">
        <span className="text-xs text-[#8C9198]">البريد الإلكتروني</span>

        <span
          className="text-[13px] text-[#575F69] truncate max-w-[55%]"
          dir="ltr"
        >
          {u.email}
        </span>
      </div>

      <div className="flex items-center justify-between py-2">
        <span className="text-xs text-[#8C9198]">تاريخ الانضمام</span>

        <span className="text-[13px] text-[#575F69]">{u.joinDate}</span>
      </div>
    </div>
  </div>
);

const UsersTable = ({
  users = [],
  onApprove,
  onToggleStatus,
  onDelete,
  sort,
  onSort,
  typeFilter = "جميع المستخدمين",
  onTypeFilter,
}) => {
  const [detailsUser, setDetailsUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [approveUser, setApproveUser] = useState(null);
  const [suspendUser, setSuspendUser] = useState(null);
  const [activateUser, setActivateUser] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [academicLoading, setAcademicLoading] = useState(false);
  const [reportError, setReportError] = useState("");

  const navigate = useNavigate();

  const handleOpenChat = (user) => {
    navigate("/admin/messages", { state: { openUserId: user.id } });
  };

  const handleView = async (user) => {
    setDetailsUser(
      user.role === "طالب"
        ? { ...user, groups: [], groupsLoading: true }
        : user,
    );
    setReportError("");

    if (user.role === "طالب") {
      try {
        const studentsResponse = await getAllStudents({
          user: user.id,
          page: 1,
          limit: 100,
        });
        const students = extractApiList(studentsResponse, [
          "students",
          "results",
          "items",
        ]);
        const studentProfile =
          students.find((student) =>
            studentIds(student).has(String(user.id)),
          ) || students[0];
        const profileId = entityId(studentProfile) || user.studentId || user.id;
        const identities = studentIds(studentProfile);
        identities.add(String(user.id));
        identities.add(String(profileId));

        const [subscriptionsResult, classroomsResult] =
          await Promise.allSettled([
            getAllSubscriptions({ student: profileId, page: 1, limit: 1000 }),
            getClassrooms({ student: profileId, page: 1, limit: 1000 }),
          ]);
        const subscriptions =
          subscriptionsResult.status === "fulfilled"
            ? extractApiList(subscriptionsResult.value, [
                "subscriptions",
                "results",
                "items",
              ])
            : [];
        const matchingSubscriptions = subscriptions.filter((subscription) => {
          const subscriptionIds = studentIds(subscription.student);
          return (
            subscriptionIds.size === 0 ||
            [...subscriptionIds].some((id) => identities.has(id))
          );
        });
        const subscriptionGroups = matchingSubscriptions.flatMap(
          (subscription) =>
            (subscription.items || [])
              .map((item) => classroomSummary(item.classroom))
              .filter(Boolean),
        );
        const classroomGroups =
          classroomsResult.status === "fulfilled"
            ? extractApiList(classroomsResult.value, [
                "classrooms",
                "results",
                "items",
              ])
                .map(classroomSummary)
                .filter(Boolean)
            : [];
        let groups = [...subscriptionGroups, ...classroomGroups];

        // The classrooms endpoint does not consistently support filtering by
        // student. As a reliable admin fallback, inspect the actual members of
        // each classroom and keep only classrooms containing this student.
        if (groups.length === 0) {
          const allClassroomsResponse = await getClassrooms({
            page: 1,
            limit: 1000,
          });
          const allClassrooms = extractApiList(allClassroomsResponse, [
            "classrooms",
            "results",
            "items",
          ]);
          const membershipResults = await Promise.allSettled(
            allClassrooms.map(async (classroom) => {
              const classroomId = entityId(classroom);
              if (!classroomId) return null;
              const membersResponse = await getClassroomStudents(classroomId, {
                page: 1,
                limit: 1000,
              });
              const members = extractApiList(membersResponse, [
                "students",
                "results",
                "items",
              ]);
              const hasStudent = members.some((member) =>
                [...studentIds(member)].some((id) => identities.has(id)),
              );
              return hasStudent ? classroomSummary(classroom) : null;
            }),
          );
          groups = membershipResults
            .filter((result) => result.status === "fulfilled")
            .map((result) => result.value)
            .filter(Boolean);
        }

        const uniqueGroups = [
          ...new Map(groups.map((group) => [String(group.id), group])).values(),
        ];

        setDetailsUser((current) =>
          current?.id === user.id
            ? { ...current, groups: uniqueGroups, groupsLoading: false }
            : current,
        );
      } catch {
        setDetailsUser((current) =>
          current?.id === user.id
            ? { ...current, groups: [], groupsLoading: false }
            : current,
        );
      }
      return;
    }

    if (user.role !== "معلم") {
      return;
    }

    setAcademicLoading(true);
    setReportLoading(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("برجاء تسجيل الدخول مرة أخرى");
      }

      // الحصول على Teacher Profile باستخدام User ID
      const teacherResponse = await fetch(
        `https://api.alacademeya.com/api/teachers?user=${user.id}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const teacherResult = await teacherResponse.json();

      if (!teacherResponse.ok || !teacherResult.success) {
        throw new Error(teacherResult.message || "تعذر تحميل بيانات المعلم");
      }

      const teacherProfile = Array.isArray(teacherResult.data)
        ? teacherResult.data[0]
        : teacherResult.data;

      if (!teacherProfile) {
        throw new Error("ملف المعلم غير موجود");
      }

      const teacherId = teacherProfile.id ?? teacherProfile._id;

      if (!teacherId) {
        throw new Error("معرف المعلم غير موجود");
      }

      const detailedResponse = await getTeacher(teacherId).catch(() => null);
      const detailedTeacher = detailedResponse?.data?.data?.teacher ?? detailedResponse?.data?.data ?? detailedResponse?.data;
      const mergedTeacher = {
        ...teacherProfile,
        ...(detailedTeacher && typeof detailedTeacher === "object" ? detailedTeacher : {}),
      };
      const teachingSelections = await resolveTeacherTeachingSelections(mergedTeacher);
      const fullTeacherData = teacherData({ ...mergedTeacher, teachingSelections });
      setDetailsUser((currentUser) =>
        currentUser?.id === user.id
          ? {
              ...currentUser,
              ...fullTeacherData,
              id: currentUser.id,
              name:
                fullTeacherData.fullName ||
                fullTeacherData.name ||
                currentUser.name,
              role: currentUser.role,
              status: currentUser.status,
              teacherStatus: fullTeacherData.status,
              teacherId,
            }
          : currentUser,
      );
      setAcademicLoading(false);

      const month = getCurrentMonth();

      // الحصول على التقرير الشهري
      const reportResponse = await fetch(
        `https://api.alacademeya.com/api/teachers/${teacherId}/monthly-report?month=${month}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const reportResult = await reportResponse.json();

      if (!reportResponse.ok || !reportResult.success) {
        throw new Error(reportResult.message || "تعذر تحميل التقرير الشهري");
      }

      const totalMinutes =
        reportResult.data?.summary?.totalTeachingMinutes ?? 0;

      const completedSessions =
        reportResult.data?.summary?.completedSessions ?? 0;

      setDetailsUser((currentUser) => {
        if (!currentUser || currentUser.id !== user.id) {
          return currentUser;
        }

        return {
          ...currentUser,
          teacherId,
          monthlyTeachingHours: formatMonthlyHours(totalMinutes),
          monthlyCompletedSessions: completedSessions,
          monthlyReportMonth: reportResult.data.month,
        };
      });
    } catch (error) {
      setReportError(error.message || "حدث خطأ أثناء تحميل التقرير الشهري");
    } finally {
      setAcademicLoading(false);
      setReportLoading(false);
    }
  };

  const handleApprove = (user) => setApproveUser(user);
  const handleDelete = (user) => setDeleteUser(user);

  const handleToggleStatus = (user) => {
    if (user.status === "موقوف" || user.status === "معلق") {
      setActivateUser(user);
    } else {
      setSuspendUser(user);
    }
  };

  if (users.length === 0) {
    return (
      <div
        dir="rtl"
        className="w-full bg-white rounded-2xl border border-gray-200 shadow-sm py-12 text-center text-sm text-[#575F69]"
      >
        لا يوجد مستخدمون متاحون
      </div>
    );
  }

  return (
    <>
      <div dir="rtl" className="w-full">
        <div className="hidden md:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table
              className="w-full table-fixed text-right"
              style={{ minWidth: "900px" }}
            >
              <colgroup>
                <col className="w-[21%]" />
                <col className="w-[12%]" />
                <col className="w-[25%]" />
                <col className="w-[12%]" />
                <col className="w-[18%]" />
                <col className="w-[12%]" />
              </colgroup>
              <thead className="bg-[#F9FAFA] border-b border-gray-100">
                <tr>
                  {[
                    { label: "المستخدم", sortKey: "name" },
                    { label: "النوع", isTypeFilter: true },
                    { label: "البريد الإلكتروني" },
                    { label: "الحالة", sortKey: "status" },
                    { label: "تاريخ الانضمام", sortKey: "joinDate" },
                    { label: "الإجراءات" },
                  ].map(({ label, sortKey, isTypeFilter }) => {
                    const isActive = sortKey && sort?.key === sortKey;
                    const SortIcon = !isActive
                      ? ArrowUpDown
                      : sort.direction === "asc"
                        ? ArrowUp
                        : ArrowDown;

                    return (
                      <th
                        key={label}
                        className="whitespace-nowrap px-5 py-3.5 text-[13px] font-medium text-[#575F69]"
                        aria-sort={
                          isActive
                            ? sort.direction === "asc"
                              ? "ascending"
                              : "descending"
                            : undefined
                        }
                      >
                        {isTypeFilter ? (
                          <label className="relative inline-flex items-center">
                            <select
                              value={typeFilter}
                              onChange={(event) =>
                                onTypeFilter?.(event.target.value)
                              }
                              aria-label="اختيار نوع المستخدم"
                              className={`h-9 cursor-pointer appearance-none rounded-lg border bg-white py-1 pr-3 pl-8 text-sm font-medium outline-none transition-colors hover:border-[#123C91] ${
                                typeFilter !== "جميع المستخدمين"
                                  ? "border-[#123C91] bg-[#EAF4FF] text-[#123C91]"
                                  : "border-gray-200 text-[#575F69]"
                              }`}
                            >
                              {USER_TYPE_OPTIONS.map((role) => (
                                <option key={role} value={role}>
                                  {role}
                                </option>
                              ))}
                            </select>
                            <ChevronDown
                              size={15}
                              className="pointer-events-none absolute left-2.5 text-[#123C91]"
                            />
                          </label>
                        ) : sortKey ? (
                          <button
                            type="button"
                            onClick={() => onSort?.(sortKey)}
                            className={`flex items-center gap-1.5 font-medium transition-colors hover:text-[#123C91] ${
                              isActive ? "text-[#123C91]" : ""
                            }`}
                          >
                            {label}
                            <SortIcon size={15} />
                          </button>
                        ) : (
                          label
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50/70 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <UserCell
                        name={user.name}
                        avatarUrl={user.avatarUrl}
                        onClick={() => handleView(user)}
                      />
                    </td>

                    <td className="px-5 py-3.5">{roleBadge(user.role)}</td>

                    <td
                      className="px-5 py-3.5 text-[14px] text-[#575F69] whitespace-nowrap"
                      dir="ltr"
                    >
                      {user.email}
                    </td>

                    <td className="px-5 py-3.5">{statusBadge(user.status)}</td>

                    <td className="px-5 py-3.5 text-[14px] text-[#575F69] whitespace-nowrap">
                      {user.joinDate}
                    </td>

                    <td className="px-5 py-3.5">
                      <ActionsMenu
                        user={user}
                        onView={handleView}
                        onApprove={handleApprove}
                        onToggleStatus={handleToggleStatus}
                        onDelete={handleDelete}
                        onOpenChat={handleOpenChat}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="md:hidden space-y-3">
          {users.map((user) => (
            <MobileCard
              key={user.id}
              u={user}
              onView={handleView}
              onApprove={handleApprove}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDelete}
              onOpenChat={handleOpenChat}
            />
          ))}
        </div>
      </div>

      <UserDetailsModal
        open={Boolean(detailsUser)}
        onClose={() => {
          setDetailsUser(null);
          setReportError("");
        }}
        user={detailsUser}
        academicLoading={academicLoading}
        reportLoading={reportLoading}
        reportError={reportError}
        onOpenChat={handleOpenChat}
        onApprove={handleApprove}
        onToggleStatus={handleToggleStatus}
        onDelete={handleDelete}
      />

      <ConfirmDialog
        open={Boolean(approveUser)}
        onClose={() => setApproveUser(null)}
        onConfirm={() => {
          onApprove?.(approveUser);
          setApproveUser(null);
        }}
        title="الموافقة على الطلب"
        message="هل تريد الموافقة على طلب تسجيل هذا المستخدم وتفعيل حسابه؟"
        confirmLabel="موافقة"
        confirmClass="bg-[#123C91] text-white [&_svg]:text-white hover:bg-[#0f3280]"
        iconColor="bg-blue-100 text-blue-500"
      />

      <ConfirmDialog
        open={Boolean(activateUser)}
        onClose={() => setActivateUser(null)}
        onConfirm={() => {
          onToggleStatus?.(activateUser);
          setActivateUser(null);
        }}
        title="تفعيل الحساب"
        message="هل تريد تفعيل حساب هذا المستخدم؟"
        confirmLabel="تفعيل"
        confirmClass="bg-[#123C91] text-white [&_svg]:text-white hover:bg-[#0f3280]"
        iconColor="bg-blue-100 text-blue-500"
      />

      <ConfirmDialog
        open={Boolean(suspendUser)}
        onClose={() => setSuspendUser(null)}
        onConfirm={() => {
          onToggleStatus?.(suspendUser);
          setSuspendUser(null);
        }}
        title="إيقاف المستخدم"
        message="هل تريد إيقاف حساب هذا المستخدم؟"
        confirmLabel="إيقاف"
        confirmClass="bg-orange-500 hover:bg-orange-600"
        iconColor="bg-orange-100 text-orange-500"
      />

      <ConfirmDialog
        open={Boolean(deleteUser)}
        onClose={() => setDeleteUser(null)}
        onConfirm={() => {
          onDelete?.(deleteUser.id);
          setDeleteUser(null);
        }}
        title="حذف المستخدم"
        message="هل أنت متأكد من حذف هذا المستخدم؟ لا يمكن التراجع."
        confirmLabel="حذف"
        confirmClass="bg-red-500 hover:bg-red-600"
        iconColor="bg-red-100 text-red-500"
      />
    </>
  );
};

export default UsersTable;
