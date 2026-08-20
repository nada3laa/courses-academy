import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Bell,
  BellRing,
  GraduationCap,
  Loader2,
  MessageCircle,
  MessagesSquare,
  MessageSquare,
  User,
  UserPlus,
  CheckCircle2,
  ExternalLink,
  X,
} from "lucide-react";
import NotificationCard from "./NotificationCard";
import {
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  getTeachers,
  getAllStudents,
  getUsers,
} from "../../../services/APIService";
import { approveRegistrationRequest } from "../../../utils/approveRegistrationRequest";
import {
  markAdminLocalNotificationRead,
  markAllAdminLocalNotificationsRead,
  deleteAdminLocalNotification,
} from "../../../utils/adminLocalNotifications";
import {
  getNotificationChatState,
  getNotificationTarget,
} from "../../../utils/notificationTarget";
import { getTeacherFileUrls } from "../../../utils/teacherCv";

// ─── Helpers ────────────────────────────────────────────────────────────────

// تصنيف كل إشعار كـ "academic" أو "system" حسب نوعه
// زوّد هنا أي key/type جديد يوصل من الباك إند
const ACADEMIC_TYPES = ["lesson", "absence", "attendance", "academic"];
const categoryOf = (n) => {
  if (ACADEMIC_TYPES.includes(n.type) || ACADEMIC_TYPES.includes(n.key)) {
    return "academic";
  }
  return "system";
};

// تحويل الـ key لعنوان عربي مفهوم
const KEY_TITLES = {
  SUBSCRIPTION_APPROVED: "تمت الموافقة على الاشتراك",
  SUBSCRIPTION_REJECTED: "تم رفض طلب الاشتراك",
  SUBSCRIPTION_PENDING: "طلب اشتراك جديد",
};

const localizedText = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    return value.ar || value.en || value.text || value.message || "";
  }
  return String(value);
};

const titleOf = (n) =>
  KEY_TITLES[n.key] || n.title || n.key?.replaceAll("_", " ") || "إشعار جديد";

const descOf = (n) => {
  const content = [
    n.description,
    n.desc,
    n.body,
    n.content,
    n.message,
    n.text,
    n.data?.description,
    n.data?.body,
    n.data?.message,
  ]
    .map(localizedText)
    .find(Boolean);

  if (content) return content;
  if (n.data?.studentName) {
    return `بخصوص الطالب: ${n.data.studentName}`;
  }
  if (n.data?.classroomName) {
    return `بخصوص المجموعة: ${n.data.classroomName}`;
  }
  return "اضغط على الإشعار لعرض التفاصيل المرتبطة به.";
};

const idOf = (value) =>
  value?.id ?? value?._id ?? (typeof value === "string" ? value : null);

const notificationTeacherId = (notification) => {
  const sources = [notification, notification.data, notification.metadata];
  for (const source of sources) {
    if (!source) continue;
    const id =
      idOf(source.teacherId) ||
      idOf(source.teacher) ||
      idOf(source.userId) ||
      idOf(source.user) ||
      idOf(source.actorId) ||
      idOf(source.actor);
    if (id) return id;
  }
  return null;
};

const notificationTeacherName = (notification) => {
  const explicit =
    notification.teacherName ??
    notification.data?.teacherName ??
    notification.metadata?.teacherName;
  if (explicit) return explicit;

  const content = descOf(notification);
  return content.match(/لم يبدأ\s+(.+?)\s+حصة/)?.[1]?.trim() || "";
};

const isNewUserNotification = (notification) => {
  const searchable = [
    notification.key,
    notification.type,
    localizedText(notification.title),
    descOf(notification),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return (
    searchable.includes("new_user") ||
    searchable.includes("user_registered") ||
    searchable.includes("مستخدم جديد انضم")
  );
};

const JOIN_ROLE_OPTIONS = [
  { value: "all", label: "كل الأنواع" },
  { value: "teacher", label: "معلم" },
  { value: "student", label: "طالب" },
  { value: "parent", label: "ولي أمر" },
  { value: "admin", label: "مشرف" },
];

const notificationUserRole = (notification) => {
  const sources = [notification, notification.data, notification.metadata];
  for (const source of sources) {
    if (!source) continue;
    const role =
      source.role ||
      source.userRole ||
      source.accountType ||
      source.user?.role ||
      source.actor?.role;
    if (role) {
      const normalized = String(role).trim().toLowerCase();
      if (["super-admin", "super_admin"].includes(normalized)) return "admin";
      if (["معلم", "teacher"].includes(normalized)) return "teacher";
      if (["طالب", "student"].includes(normalized)) return "student";
      if (["ولي أمر", "ولي امر", "parent"].includes(normalized))
        return "parent";
      if (["مشرف", "admin"].includes(normalized)) return "admin";
      return normalized;
    }
  }

  const searchable = [localizedText(notification.title), descOf(notification)]
    .join(" ")
    .toLowerCase();
  if (searchable.includes("معلم") || searchable.includes("teacher"))
    return "teacher";
  if (searchable.includes("طالب") || searchable.includes("student"))
    return "student";
  if (
    searchable.includes("ولي أمر") ||
    searchable.includes("ولي امر") ||
    searchable.includes("parent")
  )
    return "parent";
  if (searchable.includes("مشرف") || searchable.includes("admin"))
    return "admin";
  return "";
};

const notificationUserId = (notification) => {
  const sources = [notification, notification.data, notification.metadata];
  for (const source of sources) {
    if (!source) continue;
    const id =
      idOf(source.userId) ||
      idOf(source.user) ||
      idOf(source.actorId) ||
      idOf(source.actor);
    if (id) return id;
  }
  return null;
};

const notificationUserName = (notification) => {
  const explicit =
    notification.fullName ??
    notification.userName ??
    notification.data?.fullName ??
    notification.data?.userName ??
    notification.data?.name ??
    notification.metadata?.fullName ??
    notification.metadata?.userName;
  if (explicit) return localizedText(explicit);

  const content = descOf(notification);
  return (
    content
      .match(
        /(?:المستخدم|اسم المستخدم|انضم)\s*[:：-]?\s*(.+?)(?:\s+إلى|\s+للمنصة|$)/,
      )?.[1]
      ?.trim() || ""
  );
};

const isUserDetailsNotification = (notification) =>
  isTeacherAbsenceNotification(notification) ||
  isNewUserNotification(notification);

const notificationPersonName = (notification) =>
  isTeacherAbsenceNotification(notification)
    ? notificationTeacherName(notification)
    : notificationUserName(notification);

const isMessageNotification = (notification) => {
  const searchable = [
    notification.key,
    notification.type,
    localizedText(notification.title),
    descOf(notification),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return (
    ["chat", "message", "new_message"].includes(
      String(notification.type || "").toLowerCase(),
    ) ||
    searchable.includes("new_message") ||
    searchable.includes("رسالة جديدة") ||
    searchable.includes("محادثة")
  );
};

const isTeacherNotification = (notification) => {
  const searchable = [
    notification.key,
    notification.type,
    localizedText(notification.title),
    descOf(notification),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return (
    isTeacherAbsenceNotification(notification) ||
    searchable.includes("teacher") ||
    searchable.includes("المعلم")
  );
};

const isTeacherAbsenceNotification = (notification) => {
  const searchable = [
    notification.key,
    notification.type,
    localizedText(notification.title),
    descOf(notification),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return (
    searchable.includes("teacher_absence") ||
    searchable.includes("teacher-missed") ||
    searchable.includes("غياب المعلم") ||
    (searchable.includes("لم يبدأ") && searchable.includes("حصة"))
  );
};

const listLabel = (value) => {
  const list = Array.isArray(value) ? value : value ? [value] : [];
  const names = list
    .map((item) => localizedText(item?.name ?? item))
    .filter(Boolean);
  return [...new Set(names)].join("، ") || "—";
};

const DetailItem = ({ label, value }) => (
  <div className="rounded-xl bg-[#F9FAFA] px-4 py-3">
    <p className="text-xs text-[#8C9198]">{label}</p>
    <p className="mt-1 break-words text-sm font-medium text-[#1F2937]">
      {value || "—"}
    </p>
  </div>
);

const whatsappUrl = (phone) => {
  const number = String(phone || "")
    .replace(/[^\d]/g, "")
    .replace(/^00/, "");
  return number ? `https://wa.me/${number}` : "";
};

const timeAgo = (dateStr) => {
  if (!dateStr) return "";
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "الآن";
  if (mins < 60) return `منذ ${mins} دقيقة`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  const days = Math.floor(hours / 24);
  return `منذ ${days} يوم`;
};

const tabs = [
  { key: "all", label: "الكل", icon: Bell },
  { key: "unread", label: "غير مقروءة", icon: BellRing },
  { key: "joined", label: "انضمام للمنصة", icon: UserPlus },
  { key: "teachers", label: "المعلمين", icon: GraduationCap },
  { key: "messages", label: "الرسائل", icon: MessageSquare },
];

/**
 * notifications: المصفوفة الراجعة من GET /notifications
 * loading / loadError: حالة التحميل (تتولّد من الصفحة الأب)
 * onChange: callback يستقبل المصفوفة الجديدة بعد أي تحديث محلي (علشان StatsCards يتحدث برضه)
 */
const NotificationsSection = ({
  notifications = [],
  loading = false,
  loadError = "",
  onChange,
  compact = false,
  maxItems,
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [joinRole, setJoinRole] = useState("all");
  const [markingAll, setMarkingAll] = useState(false);
  const [teacherDetails, setTeacherDetails] = useState(null);
  const [teacherDetailsLoading, setTeacherDetailsLoading] = useState(false);
  const [approvingTeacher, setApprovingTeacher] = useState(false);

  const filtered = notifications.filter((n) => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !n.isRead;
    if (activeTab === "joined") {
      return (
        isNewUserNotification(n) &&
        (joinRole === "all" || notificationUserRole(n) === joinRole)
      );
    }
    if (activeTab === "teachers") return isTeacherNotification(n);
    if (activeTab === "messages") return isMessageNotification(n);
    return true;
  });
  const visibleNotifications = compact
    ? filtered.filter((notification) => !notification.isRead)
    : filtered;
  const displayedNotifications = maxItems
    ? visibleNotifications.slice(0, maxItems)
    : visibleNotifications;

  const toggleRead = async (n) => {
    const id = n._id || n.id;
    const prevState = notifications;

    if (n.isRead) {
      // السيرفر مفيهوش endpoint لإلغاء القراءة، فده تحديث محلي بس
      onChange?.(
        notifications.map((x) =>
          (x._id || x.id) === id ? { ...x, isRead: false } : x,
        ),
      );
      return;
    }

    onChange?.(
      notifications.map((x) =>
        (x._id || x.id) === id ? { ...x, isRead: true } : x,
      ),
    );

    if (n._local) {
      markAdminLocalNotificationRead(id);
      return;
    }

    try {
      await markNotificationRead(id);
    } catch (err) {
      onChange?.(prevState); // rollback
      toast.error(err.response?.data?.message || "تعذر تحديث حالة الإشعار");
    }
  };

  const handleMarkAllRead = async () => {
    if (markingAll) return;
    setMarkingAll(true);
    const prevState = notifications;
    onChange?.(notifications.map((n) => ({ ...n, isRead: true })));
    markAllAdminLocalNotificationsRead();
    try {
      await markAllNotificationsRead();
      toast.success("تم تحديد جميع الإشعارات كمقروءة");
    } catch (err) {
      onChange?.(prevState);
      toast.error(err.response?.data?.message || "تعذر تحديث الإشعارات");
    } finally {
      setMarkingAll(false);
    }
  };

  const handleTeacherDetails = async (notification) => {
    if (!notification.isRead) await toggleRead(notification);
    setTeacherDetailsLoading(true);
    try {
      if (isNewUserNotification(notification)) {
        const response = await getUsers({ limit: 100 });
        const body = response.data ?? {};
        const users =
          body.data || body.users || (Array.isArray(body) ? body : []);
        const wantedId = notificationUserId(notification);
        const wantedName = notificationUserName(notification);
        const user = users.find(
          (item) =>
            (wantedId && String(item.id || item._id) === String(wantedId)) ||
            (wantedName && (item.fullName || item.name) === wantedName),
        );

        if (!user) {
          toast.error("تعذر العثور على بيانات المستخدم المرتبط بالإشعار");
          return;
        }

        let teacherProfile = null;
        let studentProfile = null;
        if (user.role === "teacher") {
          const teachersResponse = await getTeachers({
            user: user.id || user._id,
          });
          const teachersBody =
            teachersResponse.data?.data ?? teachersResponse.data ?? [];
          const teacherProfiles = Array.isArray(teachersBody)
            ? teachersBody
            : teachersBody.teachers || [];
          const userId = user.id || user._id;
          teacherProfile =
            teacherProfiles.find((profile) => {
              const profileUserId =
                profile.user?.id || profile.user?._id || profile.user;
              return profileUserId && String(profileUserId) === String(userId);
            }) || null;
        }
        if (user.role === "student") {
          const studentsResponse = await getAllStudents({
            user: user.id || user._id,
          });
          const studentsBody =
            studentsResponse.data?.data ?? studentsResponse.data ?? [];
          const studentProfiles = Array.isArray(studentsBody)
            ? studentsBody
            : studentsBody.students || [];
          studentProfile = studentProfiles[0] || null;
        }

        const registrationStatus = String(
          user.registrationStatus || "",
        ).toLowerCase();

        setTeacherDetails({
          userId: user.id || user._id,
          teacherId: teacherProfile?.id || teacherProfile?._id,
          studentId: studentProfile?.id || studentProfile?._id,
          name: user.fullName || user.name,
          email: user.email,
          phone: user.phone,
          username: user.username,
          role:
            {
              teacher: "معلم",
              student: "طالب",
              parent: "ولي أمر",
              admin: "مشرف",
              "super-admin": "مشرف عام",
            }[user.role] || user.role,
          rawRole: user.role,
          status:
            teacherProfile?.status === "approved"
              ? "معتمد"
              : registrationStatus !== "active"
                ? "معلق"
                : user.isActive === false
                  ? "موقوف"
                  : teacherProfile?.status || "نشط",
          isApproved: teacherProfile?.status === "approved",
          canApproveAccount:
            registrationStatus !== "active" || user.isActive === false,
          experience:
            teacherProfile?.experienceYears ?? teacherProfile?.experience,
          subjects: listLabel(
            teacherProfile?.subjects ?? teacherProfile?.subject,
          ),
          grades: listLabel(teacherProfile?.grades ?? teacherProfile?.grade),
          curricula: listLabel(
            teacherProfile?.curriculums ?? teacherProfile?.curriculum,
          ),
          fileUrls: getTeacherFileUrls(teacherProfile),
          isTeacher: user.role === "teacher",
        });
        return;
      }

      const response = await getTeachers({ limit: 100 });
      const body = response.data?.data ?? response.data ?? [];
      const teachers = Array.isArray(body) ? body : body.teachers || [];
      const wantedId = notificationTeacherId(notification);
      const wantedName = notificationTeacherName(notification);
      const teacher = teachers.find((item) => {
        const profileId = item.id || item._id;
        const userId = item.user?.id || item.user?._id || item.user;
        const fullName = item.user?.fullName || item.fullName || item.name;
        return (
          (wantedId &&
            [profileId, userId].some(
              (id) => id && String(id) === String(wantedId),
            )) ||
          (wantedName && fullName === wantedName)
        );
      });

      if (!teacher) {
        toast.error("تعذر العثور على بيانات المعلم المرتبط بالإشعار");
        return;
      }

      setTeacherDetails({
        teacherId: teacher.id || teacher._id,
        userId:
          teacher.user?.id ||
          teacher.user?._id ||
          (typeof teacher.user === "string" ? teacher.user : null) ||
          teacher.userId,
        name: teacher.user?.fullName || teacher.fullName || teacher.name,
        email: teacher.user?.email || teacher.email,
        phone: teacher.user?.phone || teacher.phone,
        username: teacher.user?.username || teacher.username,
        status: teacher.status === "approved" ? "معتمد" : teacher.status,
        isApproved: teacher.status === "approved",
        experience: teacher.experienceYears ?? teacher.experience,
        subjects: listLabel(teacher.subjects ?? teacher.subject),
        grades: listLabel(teacher.grades ?? teacher.grade),
        curricula: listLabel(teacher.curriculums ?? teacher.curriculum),
        fileUrls: getTeacherFileUrls(teacher),
        role: "معلم",
        isTeacher: true,
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "تعذر تحميل تفاصيل المعلم");
    } finally {
      setTeacherDetailsLoading(false);
    }
  };

  const handleApproveTeacher = async () => {
    if (!teacherDetails?.userId) return;
    const needsTeacherApproval =
      teacherDetails.isTeacher &&
      teacherDetails.teacherId &&
      !teacherDetails.isApproved;
    if (!teacherDetails.canApproveAccount && !needsTeacherApproval) return;

    setApprovingTeacher(true);
    try {
      await approveRegistrationRequest({
        userId: teacherDetails.userId,
        role:
          teacherDetails.rawRole || (teacherDetails.isTeacher ? "teacher" : ""),
      });
      setTeacherDetails((current) => ({
        ...current,
        status: current.isTeacher ? "معتمد" : "نشط",
        isApproved: true,
        canApproveAccount: false,
      }));
      toast.success("تم قبول الطلب وتفعيل الحساب");
    } catch (err) {
      toast.error(err.response?.data?.message || "تعذر تفعيل الحساب");
    } finally {
      setApprovingTeacher(false);
    }
  };

  const handleOpen = async (notification) => {
    if (!notification.isRead) await toggleRead(notification);

    // إشعار غياب المعلم: الضغط على الكارت يحدد الإشعار كمقروء فقط.
    // فتح التفاصيل مخصص للضغط على اسم المعلم داخل المحتوى.
    if (isUserDetailsNotification(notification)) {
      return;
    }

    const target = getNotificationTarget(notification, "admin");
    if (target) {
      navigate(target, { state: getNotificationChatState(notification) });
    }
  };

  const handleDelete = async (notification) => {
    const id = notification._id || notification.id;
    try {
      if (notification._local) {
        deleteAdminLocalNotification(id);
      } else {
        await deleteNotification(id);
      }
      onChange?.(notifications.filter((n) => (n._id || n.id) !== id));
      toast.success("تم حذف الإشعار");
    } catch (err) {
      toast.error(err.response?.data?.message || "تعذر حذف الإشعار");
    }
  };

  return (
    <div
      dir="rtl"
      className="
        w-full
        bg-white
        p-4
        sm:p-6
        rounded-2xl
        border
        border-[#E5E5E5]
      "
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <h2 className="text-[16px] font-medium text-[#1F2937]">
            {compact ? "الإشعارات الأخيرة" : "جميع الإشعارات"}
          </h2>
          {!compact && (
            <p className="text-[14px] sm:text-[16px] text-[#6B7280]">
              تصفية وإدارة الإشعارات حسب النوع
            </p>
          )}
        </div>

        {compact ? (
          <button
            type="button"
            onClick={() => navigate("/admin/notifications")}
            className="shrink-0 text-[14px] font-medium text-[#123C91] hover:underline"
          >
            عرض الكل
          </button>
        ) : (
          notifications.some((n) => !n.isRead) && (
            <button
              onClick={handleMarkAllRead}
              disabled={markingAll}
              className="shrink-0 flex items-center gap-1.5 text-[13px] text-[#123C91] hover:underline disabled:opacity-60"
            >
              {markingAll && <Loader2 size={14} className="animate-spin" />}
              تحديد الكل كمقروء
            </button>
          )
        )}
      </div>

      {!compact && (
        <div
          className="
          w-full
          bg-[#EAF4FF]
          rounded-full
          p-1
          mb-5
          mt-4
          grid
          grid-cols-2
          sm:grid-cols-5
          gap-1
        "
        >
          {tabs.map(({ icon: Icon, key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`
              flex
              items-center
              justify-center
              gap-1
              py-2
              px-2
              rounded-full
              text-[12px]
              sm:text-[14px]
              font-medium
              transition-all
              ${
                activeTab === key
                  ? "bg-white text-[#123C91] shadow-sm"
                  : "text-[#1F2937]"
              }
            `}
            >
              <Icon size={15} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      )}

      {!compact && activeTab === "joined" && (
        <div className="mb-5 flex flex-wrap items-center gap-2 rounded-xl border border-gray-100 bg-[#F9FAFA] p-3">
          <span className="ml-1 text-sm font-medium text-[#575F69]">
            نوع الحساب:
          </span>
          {JOIN_ROLE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setJoinRole(option.value)}
              className={`h-9 rounded-lg px-4 text-sm font-semibold transition-colors ${
                joinRole === option.value
                  ? "bg-[#123C91] text-white shadow-sm"
                  : "border border-gray-200 bg-white text-[#575F69] hover:border-[#123C91] hover:text-[#123C91]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={22} className="animate-spin text-[#123C91]" />
        </div>
      )}

      {!loading && loadError && (
        <div className="py-10 text-center">
          <p className="text-[14px] text-red-500">{loadError}</p>
        </div>
      )}

      {!loading && !loadError && (
        <div className={compact ? "mt-4 space-y-2" : "space-y-3"}>
          {displayedNotifications.map((n) => {
            const id = n._id || n.id;
            return (
              <NotificationCard
                key={id}
                title={titleOf(n)}
                description={descOf(n)}
                time={timeAgo(n.createdAt)}
                type={categoryOf(n)}
                isRead={n.isRead}
                onToggleRead={() => toggleRead(n)}
                onOpen={
                  isUserDetailsNotification(n) ||
                  getNotificationTarget(n, "admin")
                    ? () => handleOpen(n)
                    : undefined
                }
                personName={
                  isUserDetailsNotification(n)
                    ? notificationPersonName(n)
                    : undefined
                }
                onPersonClick={
                  isUserDetailsNotification(n)
                    ? () => handleTeacherDetails(n)
                    : undefined
                }
                onDelete={() => handleDelete(n)}
                compact={compact}
              />
            );
          })}

          {displayedNotifications.length === 0 && (
            <p className="text-center text-[14px] text-[#8C9198] py-10">
              لا توجد إشعارات لعرضها.
            </p>
          )}
        </div>
      )}

      {teacherDetailsLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="flex items-center gap-2 rounded-xl bg-white px-6 py-5 text-sm text-[#575F69] shadow-xl">
            <Loader2 size={18} className="animate-spin" />
            جاري تحميل تفاصيل المعلم...
          </div>
        </div>
      )}

      {teacherDetails && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) setTeacherDetails(null);
          }}
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#1F2937]">
                تفاصيل المستخدم
              </h3>
              <button
                type="button"
                onClick={() => setTeacherDetails(null)}
                aria-label="إغلاق"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200"
              >
                <X size={17} />
              </button>
            </div>

            <div className="mb-5 flex flex-col items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-[#123C91]">
                <User size={28} />
              </div>
              <h4 className="mt-3 text-lg font-semibold text-[#1F2937]">
                {teacherDetails.name}
              </h4>
              <p className="mt-1 text-sm text-[#8C9198]" dir="ltr">
                {teacherDetails.email}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <DetailItem label="رقم الهاتف" value={teacherDetails.phone} />
              <DetailItem
                label="اسم المستخدم"
                value={teacherDetails.username}
              />
              <DetailItem label="نوع الحساب" value={teacherDetails.role} />
              <DetailItem label="حالة الحساب" value={teacherDetails.status} />
              {teacherDetails.isTeacher && (
                <>
                  <DetailItem
                    label="سنوات الخبرة"
                    value={teacherDetails.experience}
                  />
                  <DetailItem label="المواد" value={teacherDetails.subjects} />
                  <DetailItem label="الصفوف" value={teacherDetails.grades} />
                  <DetailItem
                    label="المناهج"
                    value={teacherDetails.curricula}
                  />
                </>
              )}
            </div>

            {teacherDetails.isTeacher && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {teacherDetails.fileUrls?.length ? (
                  teacherDetails.fileUrls.map((url, index) => (
                    <a
                      key={url}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(event) => event.stopPropagation()}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#123C91] px-4 py-2.5 text-sm font-semibold text-[#123C91] hover:bg-blue-50"
                    >
                      ملف {index + 1}
                      <ExternalLink size={15} />
                    </a>
                  ))
                ) : (
                  <span className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-400">
                    لا توجد ملفات متاحة
                  </span>
                )}
              </div>
            )}

            <div
              className={`mt-5 grid grid-cols-1 gap-3 ${
                teacherDetails.isTeacher &&
                !teacherDetails.isApproved &&
                teacherDetails.teacherId
                  ? "sm:grid-cols-3"
                  : teacherDetails.canApproveAccount
                    ? "sm:grid-cols-3"
                    : "sm:grid-cols-2"
              }`}
            >
              {(teacherDetails.canApproveAccount ||
                (teacherDetails.isTeacher &&
                  !teacherDetails.isApproved &&
                  teacherDetails.teacherId)) && (
                <button
                  type="button"
                  disabled={approvingTeacher}
                  onClick={handleApproveTeacher}
                  className="flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {approvingTeacher ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={18} />
                  )}
                  {teacherDetails.isTeacher
                    ? "اعتماد المعلم وتفعيل الحساب"
                    : "قبول الطلب وتفعيل الحساب"}
                </button>
              )}
              <a
                href={whatsappUrl(teacherDetails.phone) || undefined}
                target={
                  whatsappUrl(teacherDetails.phone) ? "_blank" : undefined
                }
                rel="noopener noreferrer"
                aria-disabled={!whatsappUrl(teacherDetails.phone)}
                onClick={(event) => {
                  event.stopPropagation();
                  if (!whatsappUrl(teacherDetails.phone))
                    event.preventDefault();
                }}
                className={`flex h-12 items-center justify-center gap-2 rounded-xl text-sm font-semibold !text-white ${
                  whatsappUrl(teacherDetails.phone)
                    ? "bg-[#25D366] hover:bg-[#20bd5a]"
                    : "cursor-not-allowed bg-gray-300"
                }`}
              >
                <MessageCircle size={18} />
                تواصل عبر واتساب
              </a>
              <button
                type="button"
                disabled={!teacherDetails.userId}
                onClick={() =>
                  navigate("/admin/messages", {
                    state: { openUserId: teacherDetails.userId },
                  })
                }
                className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#123C91] text-sm font-semibold text-white hover:bg-[#0f327a] disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                <MessagesSquare size={18} />
                محادثة على الموقع
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsSection;
